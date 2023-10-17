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

export async function adapter({
  electric,
  appRouter,
  context,
  onError,
}: AdapterArgs) {
  const { db } = electric
  // Handle new tRPC calls.
  async function handleCall(callObj) {
    const transactionFns: any[] = []
    const transact = (fn: () => void) => {
      transactionFns.push(fn)
    }
    const response = await callProcedure({
      procedures: appRouter._def.procedures,
      path: callObj.path,
      rawInput: JSON.parse(callObj.input),
      type: callObj.type,
      ctx: { ...context, electric, transact },
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
  }

  const live = db.trpc_calls.liveMany({ where: { done: 0 } })

  const initialRes = await live()
  initialRes.result.forEach((callObj) => handleCall(callObj))

  electric.notifier.subscribeToDataChanges(async (event) => {
    const res = await live()
    if (res.result.length > 0) {
      res.result.forEach((callObj) => handleCall(callObj))
    }
  })

  // const requests = doc.getArray(`trpc-calls`)
  // requests.observe(async (event: Y.YArrayEvent<any>) => {
  // const { insert } = (event?.changes?.delta as any[]).find((item) => {
  // return `insert` in item
  // }) || { insert: [] }
  // insert.forEach(async (state: any) => {
  // // Backwards compatability for older calls that were plain objects.
  // if (!state.get) {
  // return
  // }
  // if (state.get(`done`) !== true) {
  // const transactionFns: any[] = []
  // const transact = (fn: () => void) => {
  // transactionFns.push(fn)
  // }
  // try {
  // const response = await callProcedure({
  // procedures: appRouter._def.procedures,
  // path: state.get(`path`),
  // rawInput: state.get(`input`),
  // type: state.get(`type`),
  // ctx: { ...context, transact },
  // })
  // doc.transact(() => {
  // transactionFns.forEach((fn) => {
  // fn()
  // })
  // state.set(`response`, response)
  // state.set(`done`, true)
  // })
  // } catch (cause) {
  // const error = getTRPCErrorFromUnknown(cause)
  // const errorShape = getErrorShape({
  // config: appRouter._def._config,
  // error,
  // type: state.get(`type`),
  // path: state.get(`path`),
  // input: state.get(`input`),
  // ctx: context,
  // })

  // onError?.({
  // error,
  // path: state.get(`path`),
  // type: state.get(`type`),
  // ctx: context,
  // input: state.get(`input`),
  // })

  // doc.transact(() => {
  // state.set(`done`, true)
  // state.set(`error`, true)
  // state.set(`response`, { error: errorShape })
  // })
  // }
  // }
  // })
  // })
}
