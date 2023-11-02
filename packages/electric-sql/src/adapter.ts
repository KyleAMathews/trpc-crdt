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
  console.log(`adapter-1`)
  const { electric } = context
  const { db } = electric
  const requestSet = new Set()
  console.log(`adapter-2`)

  // Handle new tRPC calls.
  async function handleCall(callObj: CallObj) {
    console.log({ callObj })
    if (requestSet.has(callObj.id)) {
      return
    } else {
      requestSet.add(callObj.id)
    }
    const transactionFns: any[] = []
    const transact = (fn: () => void) => {
      transactionFns.push(fn)
    }

    async function setResponse(responseObj: any) {
      return db.trpc_calls.update({
        data: {
          response: JSON.stringify(responseObj),
        },
        where: {
          id: callObj.id,
        },
      })
    }

    try {
      await callProcedure({
        procedures: appRouter._def.procedures,
        path: callObj.path,
        rawInput: JSON.parse(callObj.input),
        type: callObj.type,
        ctx: { ...context, transact, setResponse },
      })

      const transactionPromises = transactionFns.map((fn) => fn())

      // This won't happen in the same transaction but because they run
      // simultaneously, they should be synced back to postgres at the same time (I think).
      await Promise.all([
        ...transactionPromises,
        db.trpc_calls.update({
          data: {
            done: true,
          },
          where: {
            id: callObj.id,
          },
        }),
      ])

      await electric.notifier.potentiallyChanged()
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

      try {
        await db.trpc_calls.update({
          data: {
            done: true,
            error: true,
            response: JSON.stringify({ error: errorShape }),
          },
          where: {
            id: callObj.id,
          },
        })
      } catch (e) {
        console.log(`error update failed`, e)
      }
    }
  }

  console.log(`adapter-3`)
  const live = db.trpc_calls.liveMany({ where: { done: false } })
  console.log(`adapter-4`)

  const initialRes = await live()
  console.log(`adapter-5`)
  initialRes.result.forEach((callObj: CallObj) => handleCall(callObj))
  console.log(`adapter-6`)

  electric.notifier.subscribeToDataChanges(async () => {
    console.log(`adapter-7`)
    const res = await live()
    console.log(`adapter-8`)
    if (res.result.length > 0) {
      res.result.forEach((callObj: CallObj) => handleCall(callObj))
    }
  })
}
