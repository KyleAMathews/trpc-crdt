import type { AnyRouter } from "@trpc/server"
import { DocHandle, Repo } from "@automerge/automerge-repo"
import { TRPCClientError, TRPCLink } from "@trpc/client"
import { observable } from "@trpc/server/observable"
import { Call, CallQueue } from "./adapter"

export const link = <TRouter extends AnyRouter>({
  repo,
  queueHandle,
}: {
  repo: Repo
  queueHandle: DocHandle<CallQueue>
}): TRPCLink<TRouter> => {
  return () =>
    ({ op }) =>
      observable((observer) => {
        // Create a job and populate it with some metadata
        const callHandle = repo.create<Call>()
        callHandle.change((d: Call) =>
          Object.assign(d, {
            ...op,
            response: {},
            createdAt: new Date().toJSON(),
            state: `WAITING`,
          })
        )

        queueHandle.change((d: CallQueue) => {
          d.queue.push(callHandle.url)
        })

        callHandle.on(`change`, ({ doc }: { doc: Call }) => {
          const { state, response } = doc
          if (state === `WAITING`) {
            // no action required here
            return
          }

          // Not waiting, so we must be DONE or ERROR
          callHandle.change((d: Call) => {
            d.elapsedMs = new Date().getTime() - new Date(d.createdAt).getTime()
          })

          if (state === `ERROR`) {
            observer.error(TRPCClientError.from(response.error))
          } else {
            observer.next({
              result: {
                type: `data`,
                data: response,
              },
            })
            observer.complete()
          }
        })
      })
}
