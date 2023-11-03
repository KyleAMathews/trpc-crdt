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
  appRouter: AnyRouter
  // eslint-disable-next-line
  // TODO fix type so other keys are allowed.
  context: { doc: Y.Doc }
  onError?: (params: OnErrorParams) => void
}

export function adapter({ appRouter, context, onError }: AdapterArgs) {
  const { doc } = context
  const requests = doc.getArray(`trpc-calls`)
  requests.observe(async (event: Y.YArrayEvent<any>) => {
    const { insert } = (event?.changes?.delta as any[]).find((item) => {
      return `insert` in item
    }) || { insert: [] }
    insert.forEach(async (state: any) => {
      // Backwards compatability for older calls that were plain objects.
      if (!state.get) {
        return
      }
      if (state.get(`state`) === `WAITING`) {
        const transactionFns: any[] = []
        const transact = (fn: () => void) => {
          transactionFns.push(fn)
        }
        try {
          await callProcedure({
            procedures: appRouter._def.procedures,
            path: state.get(`path`),
            rawInput: state.get(`input`),
            type: state.get(`type`),
            ctx: { ...context, transact, response: state.get(`response`) },
          })
          doc.transact(() => {
            transactionFns.forEach((fn) => {
              fn()
            })
            state.set(`state`, `DONE`)
          })
        } catch (cause) {
          const error = getTRPCErrorFromUnknown(cause)
          const errorShape = getErrorShape({
            config: appRouter._def._config,
            error,
            type: state.get(`type`),
            path: state.get(`path`),
            input: state.get(`input`),
            ctx: context,
          })

          onError?.({
            error,
            path: state.get(`path`),
            type: state.get(`type`),
            ctx: context,
            input: state.get(`input`),
          })

          doc.transact(() => {
            state.set(`state`, `ERROR`)
            state.get(`response`).set(`error`, { error: errorShape })
          })
        }
      }
    })
  })
}
