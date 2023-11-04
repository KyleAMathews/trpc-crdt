import { AnyRouter, callProcedure, getTRPCErrorFromUnknown } from "@trpc/server"
import { getErrorShape } from "@trpc/server/shared"
import { AutomergeUrl, DocHandle, Repo } from "@automerge/automerge-repo"

export type CallState = `WAITING` | `DONE` | `ERROR`

export interface Call {
  path: string
  input: unknown
  type: string
  state: CallState
  started: string
  clientId: string
  elapsedMs: number
  createdAt: string
  response: unknown
}

export interface CallQueue {
  queue: AutomergeUrl[]
}

export interface User {
  id: number
  name: string
}

export interface Users {
  users: User[]
}

export interface OnErrorParams {
  error: Error
  path: string
  type: string
  ctx: unknown
  input: unknown
}

export interface AdapterArgs {
  repo: Repo
  queueHandle: DocHandle<CallQueue>

  appRouter: AnyRouter
  ctx: any
  onError?: (params: OnErrorParams) => void
}

export function adapter({
  repo,
  queueHandle,
  appRouter,
  ctx,
  onError,
}: AdapterArgs) {
  queueHandle.on(`change`, ({ handle }) => {
    handle.change(async (doc: CallQueue) => {
      let nextCall
      while ((nextCall = doc.queue.pop())) {
        console.log("NEXTCALL", nextCall)

        const callHandle = repo.find(nextCall)

        const { state, path, rawInput: input, type } = await callHandle.doc()

        console.log("NEXTCALL", callHandle.docSync())

        if (state == `WAITING`) {
          const transactionFns: any[] = []
          const transact = (fn: () => void) => {
            transactionFns.push(fn)
          }

          try {
            await callProcedure({
              procedures: appRouter._def.procedures,
              path,
              input: input,
              type,
              ctx: { ...ctx, transact, callHandle },
            })

            transactionFns.forEach((fn) => {
              fn()
            })

            callHandle.change((d: Call) => (d.state = `DONE`))
          } catch (cause) {
            console.log(`ERROR`, cause)
            const error = getTRPCErrorFromUnknown(cause)

            onError?.({
              error,
              type,
              path,
              input,
              ctx,
            })

            callHandle.change((d: Call) => {
              d.state = `ERROR`
              d.response = {
                error: getErrorShape({
                  config: appRouter._def._config,
                  error,
                  type,
                  path,
                  input,
                  ctx,
                }),
              }
            })
          }
        }
      }
    })
  })
}
