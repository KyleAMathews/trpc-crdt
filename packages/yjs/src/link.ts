import type { AnyRouter } from "@trpc/server"
import { Doc, YMapEvent, Map } from "yjs"
import { v4 as uuidv4 } from "uuid"
import { TRPCClientError, TRPCLink } from "@trpc/client"
import { transformResult } from "@trpc/client/shared"
import { observable } from "@trpc/server/observable"

export const link = <TRouter extends AnyRouter>({
  doc,
}: {
  doc: Doc
}): TRPCLink<TRouter> => {
  return (runtime) =>
    ({ op }) =>
      observable((observer) => {
        const calls = doc.getArray(`trpc-calls`)
        const requestId = uuidv4()
        let requestMap

        function observe(event: YMapEvent<any>) {
          // const { insert } = (event?.changes?.delta as any[]).find((item) => {
          // return `insert` in item
          // }) || { insert: [] }
          // observer.complete()
          const state = event.target

          // insert.forEach((state: any) => {
          // TODO only do this in case of user-directed timeout or network
          // disconnect errors e.g. normally we're fine just waiting to go online
          // but the app might want to error immediately if we disconnect or are offline.
          // if (state.error) {
          // return rejectFunc(state)
          // }
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
          // })
        }

        const { path, input, type } = op
        console.log({ path, input, type })

        // calls.observe(observe)
        doc.transact(() => {
          requestMap = new Map()
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

        // TODO add clientId & generate UUID or whatever like
        // other thing
        //
        // something is listening for changes to the array with
        // responses & then broadcasts it — each call here
        // just listens for its request id to be broadcasted
        // as having been responded to.
        //
        // const promise = customUiBridgeRequest({
        // runtime,
        // type,
        // input,
        // path,
        // resolverFunctionKey: opts.resolverFunctionKey,
        // });

        // TODO catch errors
        // handle timeouts
        //
        //
        // promise
        // .then((res) => {
        // // const transformed = transformResult(res, runtime);
        // if (!transformed.ok) {
        // observer.error(TRPCClientError.from(transformed.error));
        // return;
        // }
        // observer.next({
        // result: transformed.result,
        // });
        // observer.complete();
        // })
        // .catch((cause) => observer.error(TRPCClientError.from(cause)));
      })
}
