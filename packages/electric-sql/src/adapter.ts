import { AnyRouter, callProcedure, getTRPCErrorFromUnknown } from "@trpc/server"
import { getErrorShape } from "@trpc/server/shared"

interface OnErrorParams {
  error: Error
  path: string
  type: string
  ctx: any
  input: any
}

// Define the expected types for the arguments
interface AdapterArgs {
  db: any
  appRouter: AnyRouter
  // eslint-disable-next-line
  context: any
  onError?: (params: OnErrorParams) => void
}

enum RequestType {
  Query = `query`,
  Mutation = `mutation`,
  Subscription = `subscription`,
}

// TODO Can you get types out of ElectricSQL?
interface CallObj {
  type: RequestType
  path: string
  response: string
  done: number
  error: number
  input: string
  createdat: string
  id: string
}

export async function adapter({ appRouter, context, onError }: AdapterArgs) {
  const { electric } = context
  const { db } = electric
  const requestSet = new Set()

  // Handle new tRPC calls.
  async function handleCall(callObj: CallObj) {
    if (requestSet.has(callObj.id)) {
      return
    } else {
      requestSet.add(callObj.id)
    }
    const transactionFns: any[] = []
    const transact = (fn: () => void) => {
      transactionFns.push(fn)
    }

    try {
      const response = await callProcedure({
        procedures: appRouter._def.procedures,
        path: callObj.path,
        rawInput: JSON.parse(callObj.input),
        type: callObj.type,
        ctx: { ...context, transact },
      })

      const transactionPromises = transactionFns.map((fn) => fn())

      // This won't happen in the same transaction but because they run
      // simultaneously, they should be synced back to postgres at the same time (I think).
      await Promise.all([
        ...transactionPromises,
        db.trpc_calls.update({
          data: {
            done: 1,
            response: JSON.stringify(response),
          },
          where: {
            id: callObj.id,
          },
        }),
      ])
    } catch (cause) {
      const error = getTRPCErrorFromUnknown(cause)
      const errorShape = getErrorShape({
        config: appRouter._def._config,
        error,
        type: callObj.type,
        path: callObj.path,
        input: JSON.parse(callObj.input),
        ctx: context,
      })

      onError?.({
        error,
        type: callObj.type,
        path: callObj.path,
        input: JSON.parse(callObj.input),
        ctx: context,
      })

      await db.trpc_calls.update({
        data: {
          done: 1,
          error: 1,
          response: JSON.stringify({ error: errorShape }),
        },
        where: {
          id: callObj.id,
        },
      })
    }
  }

  const live = db.trpc_calls.liveMany({ where: { done: 0 } })

  const initialRes = await live()
  initialRes.result.forEach((callObj: CallObj) => handleCall(callObj))

  electric.notifier.subscribeToDataChanges(async () => {
    const res = await live()
    if (res.result.length > 0) {
      res.result.forEach((callObj: CallObj) => handleCall(callObj))
    }
  })
}
