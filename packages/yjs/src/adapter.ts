import * as Y from "yjs"
import { AnyRouter, callProcedure, getTRPCErrorFromUnknown } from "@trpc/server"

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
interface ProcedureResponse {
  response: any
  transact?: () => void
}

export function adapter({ doc, appRouter, context, onError }: AdapterArgs) {
  const requests = doc.getArray(`trpc-calls`)
  requests.observe(async (event: Y.YArrayEvent<any>) => {
    const { insert } = (event?.changes?.delta as any[]).find((item) => {
      return `insert` in item
    }) || { insert: [] }
    const retain = event.changes.delta.find(
      (item) => Object.keys(item)[0] === `retain`
    )
    const lastCallIndex = retain?.retain || 0
    insert.forEach(async (state: any, i: number) => {
      // console.log({ state })
      if (state.done !== true) {
        try {
          const { response, transact }: ProcedureResponse =
            (await callProcedure({
              procedures: appRouter._def.procedures,
              path: state.path,
              rawInput: state.input,
              type: state.type,
              ctx: context,
            })) as ProcedureResponse
          doc.transact(() => {
            if (transact) {
              transact()
            }
            state.response = response
            state.done = true
            state.respondedAt = new Date().toJSON()
            requests.delete(lastCallIndex + i, 1)
            requests.insert(lastCallIndex + i, [state])
          })
        } catch (cause) {
          const error = getTRPCErrorFromUnknown(cause)
          onError?.({
            error,
            path: state.path,
            type: state.type,
            ctx: context,
            input: state.input,
          })
          doc.transact(() => {
            state.done = true
            state.error = true
            state.response = error
            state.respondedAt = new Date().toJSON()
            requests.delete(lastCallIndex + i, 1)
            requests.insert(lastCallIndex + i, [state])
          })
        }
      }
    })
  })
}
