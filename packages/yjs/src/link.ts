import type { AnyRouter } from "@trpc/server"
import { Doc, YMapEvent, Map } from "yjs"
import { TRPCClientError, TRPCLink } from "@trpc/client"
import { observable } from "@trpc/server/observable"

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
// state: string // `WAITING` | `DONE` | `ERROR`
// createdAt: string
// clientId: string
// response: any
// }

interface InputWithCallId {
  callId?: string
  [key: string]: any
}

export const link = <TRouter extends AnyRouter>({
  doc,
}: {
  doc: Doc
}): TRPCLink<TRouter> => {
  return () =>
    ({ op }) =>
      observable((observer) => {
        const calls = doc.getArray(`trpc-calls`)
        const callId = uuidv4()
        const callMap = new Map()

        // The observe function to listen to the response
        // from the server.
        function observe(event: YMapEvent<any>) {
          const state = event.target
          if (state.get(`state`) !== `WAITING` && state.get(`id`) === callId) {
            callMap.unobserve(observe)
            callMap.set(
              `elapsedMs`,
              new Date().getTime() -
                new Date((callMap.get(`createdAt`) as number) || 0).getTime()
            )
            if (state.get(`state`) === `ERROR`) {
              observer.error(TRPCClientError.from(state.get(`response`)))
            } else if (state.get(`state`) === `DONE`) {
              observer.next({
                result: {
                  type: `data`,
                  data: state.get(`response`),
                },
              })
            }
            observer.complete()
          }
        }

        // Create the call map on the trpc-calls Y.js Array.
        // This will get replicated to the server.
        const { path, input, type } = op

        doc.transact(() => {
          callMap.set(`path`, path)
          callMap.set(`input`, input)
          callMap.set(`type`, type)
          callMap.set(`id`, callId)
          callMap.set(`state`, `WAITING`)
          callMap.set(`createdAt`, new Date().toJSON())
          callMap.set(`clientId`, doc.clientID)
          callMap.set(`response`, new Map())
          callMap.observe(observe)
          calls.push([callMap])
        })
      })
}
