import type { AnyRouter } from "@trpc/server"
import { Doc, YMapEvent, Map } from "yjs"
import { v4 as uuidv4 } from "uuid"
import { TRPCClientError, TRPCLink } from "@trpc/client"
import { observable } from "@trpc/server/observable"

export const link = <TRouter extends AnyRouter>({
  doc,
}: {
  doc: Doc
}): TRPCLink<TRouter> => {
  return () =>
    ({ op }) =>
      observable((observer) => {
        const calls = doc.getArray(`trpc-calls`)
        const requestId = uuidv4()
        const requestMap = new Map()

        // The observe function to listen to the response
        // from the server.
        function observe(event: YMapEvent<any>) {
          const state = event.target
          if (state.get(`done`) && state.get(`id`) === requestId) {
            requestMap.unobserve(observe)
            requestMap.set(
              `elapsedMs`,
              new Date().getTime() -
                new Date(requestMap.get(`createdAt`)).getTime()
            )
            if (state.get(`error`)) {
              observer.error(TRPCClientError.from(state.get(`response`)))
            } else {
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

        // Create the request map on the trpc-calls Y.js Array.
        // This will get replicated to the server.
        const { path, input, type } = op
        console.log({ path, input, type })

        doc.transact(() => {
          requestMap.set(`path`, path)
          requestMap.set(`input`, input)
          requestMap.set(`type`, type)
          requestMap.set(`id`, requestId)
          requestMap.set(`done`, false)
          requestMap.set(`createdAt`, new Date().toJSON())
          requestMap.set(`clientId`, doc.clientID)
          requestMap.observe(observe)
          calls.push([requestMap])
        })
      })
}
