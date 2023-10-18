import type { AnyRouter } from "@trpc/server"
import { TRPCClientError, TRPCLink } from "@trpc/client"
import { observable } from "@trpc/server/observable"
import { genUUID } from "electric-sql/util"

enum RequestType {
  Query = `query`,
  Mutation = `mutation`,
  Subscription = `subscription`,
}

// TODO Can you get types out of ElectricSQL?
interface CallObj {
  type: RequestType
  path: string
  response: string
  done: number
  error: number
  input: string
  createdat: string
  id: string
}

export const link = <TRouter extends AnyRouter>({
  electric,
  clientId,
}: {
  // TODO find the actual type for this.
  electric: any
  clientId: string
}): TRPCLink<TRouter> => {
  const { db } = electric
  const live = db.trpc_calls.liveMany({
    where: { clientid: clientId, done: 1 },
  })

  const requestMap = new Map()
  async function observe() {
    const res = await live()
    if (res.result.length > 0) {
      res.result.forEach((callRes: CallObj) => {
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
      observable((observer) => {
        const requestId = genUUID()

        requestMap.set(requestId, (callRes: CallObj) => {
          const elapsedMs =
            new Date().getTime() - new Date(callRes.createdat || 0).getTime()

          if (callRes.error === 1) {
            observer.error(TRPCClientError.from(JSON.parse(callRes.response)))
          } else {
            observer.next({
              result: {
                type: `data`,
                data: JSON.parse(callRes.response),
              },
            })
          }
          observer.complete()
          db.trpc_calls.update({
            data: {
              elapsedms: elapsedMs,
            },
            where: {
              id: requestId,
            },
          })
        })

        const { path, input, type } = op

        // Create trpc_call row — this will get replicated to the server
        // instance to respond.
        db.trpc_calls.create({
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
