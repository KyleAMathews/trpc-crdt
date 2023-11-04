import type { AnyRouter } from "@trpc/server"
import { DocHandle, Repo } from "@automerge/automerge-repo"
import { TRPCClientError, TRPCLink } from "@trpc/client"
import { observable } from "@trpc/server/observable"
import { Call, CallQueue } from "./adapter"

function uuidv4() {
  return `10000000-1000-4000-8000-100000000000`.replace(
    /[018]/g,
    (c: any): string =>
      (
        c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
  )
}

// interface call {
// path: string
// input: any
// type: string
// id: string
// done: boolean
// createdAt: string
// error: boolean
// clientId: string
// response: any
// }

interface InputWithCallId {
  callId?: string
  [key: string]: any
}

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
        // This is doing a thing we might not need to do?
        let callId: string
        if (
          typeof op.input === `object` &&
          !Array.isArray(op.input) &&
          op.input !== null &&
          (op.input as InputWithCallId).callId !== undefined &&
          Object.prototype.hasOwnProperty.call(op.input, `callId`)
        ) {
          callId = (op.input as InputWithCallId).callId || ``
          delete (op.input as InputWithCallId).callId
        } else {
          callId = uuidv4()
        }

        // Create a job and populate it with some metadata
        const callHandle = repo.create<Call>()
        callHandle.change((d: Call) =>
          Object.assign(d, {
            ...op,
            id: callId,
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
            d.elapsedMs =
              new Date().getTime() -
              new Date((d.createdAt as number) || 0).getTime()
          })

          if (state === `ERROR`) {
            console.log(`ERROR`, response)

            const err = (response as { error: Error }).error
            observer.error(TRPCClientError.from(err))
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
