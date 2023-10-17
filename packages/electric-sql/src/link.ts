import type { AnyRouter } from "@trpc/server"
import { TRPCClientError, TRPCLink } from "@trpc/client"
import { observable } from "@trpc/server/observable"
import { genUUID } from "electric-sql/util"

export const link = <TRouter extends AnyRouter>({
  electric,
  clientId,
}): TRPCLink<TRouter> => {
  const { db } = electric
  const live = db.trpc_calls.liveMany({
    where: { clientid: clientId, done: 1 },
  })

  const requestMap = new Map()
  async function observe() {
    const res = await live()
    if (res.result.length > 0) {
      res.result.forEach((callRes) => {
        if (requestMap.has(callRes.id)) {
          requestMap.get(callRes.id)(callRes)
          requestMap.delete(callRes.id)
        }
      })
    }
  }

  electric.notifier.subscribeToDataChanges(observe)

  return () =>
    ({ op }) =>
      observable(async (observer) => {
        const requestId = genUUID()

        requestMap.set(requestId, (callRes) => {
          const elapsedMs =
            new Date().getTime() -
            new Date((callRes.createdat as number) || 0).getTime()

          observer.next({
            result: {
              type: `data`,
              data: JSON.parse(callRes.response),
            },
          })
          db.trpc_calls.update({
            data: {
              elapsedms: elapsedMs,
            },
            where: {
              id: requestId,
            },
          })
        })

        // TODO stop listening
        // handle errors

        // The observe function to listen to the response
        // from the server.
        // function observe(event: YMapEvent<any>) {
        // const state = event.target
        // if (state.get(`done`) && state.get(`id`) === requestId) {
        // requestMap.unobserve(observe)
        // requestMap.set(
        // `elapsedMs`,
        // new Date().getTime() -
        // new Date((requestMap.get(`createdAt`) as number) || 0).getTime()
        // )
        // if (state.get(`error`)) {
        // observer.error(TRPCClientError.from(state.get(`response`)))
        // } else {
        // observer.next({
        // result: {
        // type: `data`,
        // data: state.get(`response`),
        // },
        // })
        // }
        // observer.complete()
        // }
        // }

        // Create the request map on the trpc-calls Y.js Array.
        // This will get replicated to the server.
        const { path, input, type } = op

        await db.trpc_calls.create({
          data: {
            id: requestId,
            path,
            input: JSON.stringify(input),
            type,
            done: 0,
            error: 0,
            createdat: new Date().toJSON(),
            clientid: clientId,
          },
        })
      })
}
