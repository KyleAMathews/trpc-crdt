import type { AnyRouter } from "@trpc/server"
import { TRPCClientError, TRPCLink } from "@trpc/client"
import { observable } from "@trpc/server/observable"
import { genUUID } from "electric-sql/util"

enum CallType {
  Query = `query`,
  Mutation = `mutation`,
  Subscription = `subscription`,
}

enum StateType {
  Waiting = `WAITING`,
  Done = `DONE`,
  Error = `ERROR`,
}
// TODO Can you get types out of ElectricSQL?
interface CallObj {
  type: CallType
  path: string
  response: string
  state: StateType
  input: string
  createdat: Date
  id: string
}

interface InputWithCallId {
  callId?: string
  [key: string]: any
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
    where: { clientid: clientId, state: { not: `WAITING` } },
  })

  const callMap = new Map()
  async function observe() {
    const res = await live()
    if (res.result.length > 0) {
      res.result.forEach((callRes: CallObj) => {
        if (callMap.has(callRes.id)) {
          callMap.get(callRes.id)(callRes)
          callMap.delete(callRes.id)
        }
      })
    }
  }

  electric.notifier.subscribeToDataChanges(observe)

  return () =>
    ({ op }) =>
      observable((observer) => {
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
          callId = genUUID()
        }

        callMap.set(callId, (callRes: CallObj) => {
          const elapsedMs = new Date().getTime() - callRes.createdat.getTime()

          if (callRes.state === `ERROR`) {
            observer.error(TRPCClientError.from(JSON.parse(callRes.response)))
          } else if (callRes.state === `DONE`) {
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
              id: callId,
            },
          })
        })

        const { path, input, type } = op

        // Create trpc_call row — this will get replicated to the server
        // instance to respond.
        async function call() {
          await db.trpc_calls.create({
            data: {
              id: callId,
              path,
              input: JSON.stringify(input),
              type,
              state: `WAITING`,
              createdat: new Date(),
              clientid: clientId,
            },
          })
        }
        call()
      })
}
