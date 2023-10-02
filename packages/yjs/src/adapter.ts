import * as Y from "yjs"
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
    insert.forEach(async (state: any) => {
      if (state.get(`done`) !== true) {
        try {
          const { response, transact }: ProcedureResponse =
            (await callProcedure({
              procedures: appRouter._def.procedures,
              path: state.get(`path`),
              rawInput: state.get(`input`),
              type: state.get(`type`),
              ctx: context,
            })) as ProcedureResponse
          doc.transact(() => {
            if (transact) {
              transact()
            }
            state.set(`response`, response)
            state.set(`done`, true)
            state.set(`respondedAt`, new Date().toJSON())
          })
        } catch (cause) {
          const error = getTRPCErrorFromUnknown(cause)
          const errorShape = getErrorShape({
            config: appRouter._def._config,
            error,
            type: state.get(`type`),
            path: state.get(`path`),
            input: state.get(`input`),
          })

          onError?.({
            error,
            path: state.get(`path`),
            type: state.get(`type`),
            ctx: context,
            input: state.get(`input`),
          })

          doc.transact(() => {
            state.set(`done`, true)
            state.set(`error`, true)
            state.set(`response`, { error: errorShape })
          })
        }
      }
    })
  })
}
