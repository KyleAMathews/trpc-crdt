import { AnyRouter, callProcedure, getTRPCErrorFromUnknown } from "@trpc/server"
import { getErrorShape } from "@trpc/server/shared"
import { autoSub } from "jazz-autosub"

interface OnErrorParams {
  error: Error
  path: string
  type: string
  ctx: any
  input: any
}

// Define the expected types for the arguments
interface AdapterArgs {
  doc: Y.Doc
  appRouter: AnyRouter
  // eslint-disable-next-line
  context: any
  onError?: (params: OnErrorParams) => void
}

export function adapter({ appRouter, context, onError }: AdapterArgs) {
  const inFlightCalls = new Set()
  const { client, trpcCallsId } = context
  // Setup server AutoSub
  autoSub(trpcCallsId, client.localNode, (allTrpcCalls) => {
    // Add new call ids to inFlightCalls
    for (const [_session, sessionCalls] of allTrpcCalls?.perSession || []) {
      for (const { value: call } of sessionCalls.all || []) {
        if (call && !inFlightCalls.has(call.id)) {
          inFlightCalls.add(call.id)

          console.log(`Got call in adapter.js`, call)

          // do something in response to the call

          // usersMap.set(`someUserId`, { name: `foo` })
          call.set(`state`, `DONE`)
        }
      }
    }
  })
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
