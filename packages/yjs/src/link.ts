import type { AnyRouter } from "@trpc/server"
import { Doc, YArrayEvent } from "yjs"
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

        function observe(event: YArrayEvent<any>) {
          const { insert } = (event?.changes?.delta as any[]).find((item) => {
            return `insert` in item
          }) || { insert: [] }

          insert.forEach((state: any) => {
            // TODO only do this in case of user-directed timeout or network
            // disconnect errors e.g. normally we're fine just waiting to go online
            // but the app might want to error immediately if we disconnect or are offline.
            // if (state.error) {
            // requests.unobserve(observe)
            // return rejectFunc(state)
            // }
            if (state.done && state.id === requestId) {
              calls.unobserve(observe)
              if (state.error) {
                observer.error(TRPCClientError.from(state.response))
              } else {
                observer.next({
                  result: {
                    type: `data`,
                    data: state.response,
                  },
                })
              }
              observer.complete()
            }
          })
        }

        const { path, input, type } = op
        console.log({ path, input, type })

        calls.observe(observe)
        calls.push([
          {
            path,
            input,
            type,
            id: requestId,
            done: false,
            createdAt: new Date().toJSON(),
            response: {},
            clientId: doc.clientID,
          },
        ])

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
