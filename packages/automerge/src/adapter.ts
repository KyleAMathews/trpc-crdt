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

export interface AdapterArgs<T> {
  repo: Repo
  queueHandle: DocHandle<CallQueue>

  appRouter: AnyRouter
  ctx: T
  onError?: (params: OnErrorParams) => void
}

export function adapter<T>({
  repo,
  queueHandle,
  appRouter,
  ctx,
  onError,
}: AdapterArgs<T>) {
  queueHandle.on(`change`, ({ handle }) => {
    handle.change(async (doc: CallQueue) => {
      let nextCall
      while ((nextCall = doc.queue.pop())) {
        const callHandle = repo.find(nextCall)
        const { state, path, input, type } = await callHandle.doc()

        if (state == `WAITING`) {
          try {
            const result = await callProcedure({
              procedures: appRouter._def.procedures,
              path,
              rawInput: input,
              type,
              ctx,
            })

            callHandle.change((d: Call) => {
              d.state = `DONE`
              d.response = result
            })
          } catch (cause) {
            const error = getTRPCErrorFromUnknown(cause)

            onError?.({
              error,
              type,
              path,
              input,
              ctx,
            })

            const errorShape = getErrorShape({
              config: appRouter._def._config,
              error,
              type,
              path,
              input,
              ctx,
            })

            console.log({ error, errorShape })

            callHandle.change((d: Call) => {
              d.state = `ERROR`
              d.response = { error: errorShape }
            })
          }
        }
      }
    })
  })
}
