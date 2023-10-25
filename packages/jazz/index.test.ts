import { describe, it, expect, beforeEach } from "vitest"
import { initTRPC, TRPCError } from "@trpc/server"
import { any, boolean, string, z } from "zod"
import { CoMap, CoStream, Group } from "cojson"
import { createOrResumeWorker } from "jazz-nodejs"
import { autoSub } from "jazz-autosub"
import { adapter } from "./src/adapter"
import { link } from "./src/link"
import { createTRPCProxyClient, loggerLink, httpBatchLink } from "@trpc/client"

// Jazz types
type UsersMap = CoMap<{
  [id: string]: { name: string }
}>

type TRPCCall = CoMap<{
  requestId: string
  createdAt: string
  elapsedMs: string
  path: string
  input: any
  type: string
  error: boolean
  done: boolean
  clientId: string
  response: any
}>

// eslint-disable-next-line
type AllTrpcCalls = CoStream<TRPCCall['id']>

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.create()
/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
const router = t.router
const publicProcedure = t.procedure

async function initClients() {
  let usersMapId!: UsersMap[`id`]
  // eslint-disable-next-line
  let trpcCallsId!: AllTrpcCalls['id']

  const serverClient = await createOrResumeWorker({
    workerName: `server`,
    migration: (account) => {
      const usersMapGroup = account.createGroup()
      usersMapGroup.addMember(`everyone`, `reader`)
      const usersMap = usersMapGroup.createMap<UsersMap>()
      usersMapId = usersMap.id

      const trpcCallsGroup = account.createGroup()
      trpcCallsGroup.addMember(`everyone`, `writer`)
      const allTrpcCalls = trpcCallsGroup.createStream<AllTrpcCalls>()
      trpcCallsId = allTrpcCalls.id
    },
  })

  let clientMyRequestsGroup!: Group

  const clientClient = await createOrResumeWorker({
    workerName: `client`,
    migration: (account) => {
      clientMyRequestsGroup = account.createGroup()
      clientMyRequestsGroup.addMember(serverClient.worker.id, `writer`)
    },
  })

  const inFlightCalls = new Set()

  // load usersMap
  const usersMap = await serverClient.localNode.load(usersMapId)
  if (usersMap === `unavailable`) throw new Error(`usersMap unavailable`)

  // Setup server AutoSub
  autoSub(trpcCallsId, serverClient.localNode, (allTrpcCalls) => {
    // Add new call ids to inFlightCalls
    for (const [_session, sessionCalls] of allTrpcCalls?.perSession || []) {
      for (const { value: call } of sessionCalls.all || []) {
        if (call && !inFlightCalls.has(call.id)) {
          inFlightCalls.add(call.id)

          console.log(`Got call`, call)

          // do something in response to the call

          usersMap.set(`someUserId`, { name: `foo` })
          call.set(`done`, true)
        }
      }
    }
  })

  // Setup client AutoSub
  autoSub(usersMapId, clientClient.localNode, (usersMap) => {
    console.log(`Got usersMap update on client`, usersMap)
  })

  const allTrpcCallsAsClient = await clientClient.localNode.load(trpcCallsId)
  if (allTrpcCallsAsClient === `unavailable`)
    throw new Error(`trpcCalls unavailable`)

  // const exampleCall = clientMyRequestsGroup.createMap<TRPCCall>({
  // type: `bla`,
  // requestId: `123`,
  // // ...
  // })

  // allTrpcCallsAsClient.push(exampleCall.id)

  // Create tRPC Router.
  const appRouter = router({
    userCreate: publicProcedure
      .input(
        z.object({ name: z.string(), optionalDelay: z.number().optional() })
      )
      .mutation(async (opts) => {
        const {
          input,
          ctx: { users, transact },
        } = opts
        const user = { id: String(users.length + 1), ...input }

        if (input.optionalDelay) {
          await new Promise((resolve) =>
            setTimeout(resolve, input.optionalDelay)
          )
        }

        if (input.name === `BAD_NAME`) {
          throw new TRPCError({
            code: `CONFLICT`,
            message: `This name isn't one I like to allow`,
          })
        }

        // Run in transaction along with setting response on the request
        // object.
        transact(() => {
          users.push([user])
        })

        return user
      }),
    userUpdateName: publicProcedure
      .input(z.object({ id: z.string(), name: z.string() }))
      .mutation(async (opts) => {
        const {
          input,
          ctx: { users, transact },
        } = opts
        let user
        let id
        users.forEach((u, i) => {
          if (u.id === input.id) {
            user = u
            id = i
          }
        })
        const newUser = { ...user, name: input.name }

        // Run in transaction along with setting response on the request
        // object.
        transact(() => {
          users.delete(id, 1)
          users.insert(id, [newUser])
        })

        return newUser
      }),
  })

  type AppRouter = typeof appRouter
  adapter({ appRouter, context: { client: serverClient } })

  // Create client.
  const trpc = createTRPCProxyClient<AppRouter>({
    links: [
      link({
        client: clientClient,
      }),
    ],
  })

  return { trpc }
}

describe(`jazz`, () => {
  beforeEach(async (context) => {
    const { trpc } = await initClients()
    context.trpc = trpc
  })
  describe(`basic calls`, ({ trpc }) => {
    it(`create a user`, async () => {
      const newUser = await trpc.userCreate.mutate({ name: `foo` })
      expect(newUser.name).toEqual(`foo`)
      // const users = doc.getArray(`users`)
      // expect(users).toMatchSnapshot()
      // expect(users.get(0).name).toEqual(`foo`)
    })
    // it(`updateName`, async () => {
    // const user = await trpc.userUpdateName.mutate({ id: `1`, name: `foo2` })
    // console.log({ user })
    // expect(user.name).toEqual(`foo2`)
    // const users = doc.getArray(`users`)
    // expect(users).toMatchSnapshot()
    // expect(users.get(0).name).toEqual(`foo2`)
    // })
  })
  // describe(`batched calls`, () => {
  // const { doc, trpc } = initClient()
  // it(`handles batched calls`, async () => {
  // let promise1
  // let promise2
  // doc.transact(() => {
  // promise1 = trpc.userCreate.mutate({ name: `foo1` })
  // promise2 = trpc.userCreate.mutate({ name: `foo2` })
  // })

  // await Promise.all([promise1, promise2])

  // let promise3
  // let promise4

  // doc.transact(() => {
  // promise3 = trpc.userCreate.mutate({ name: `foo3` })
  // promise4 = trpc.userCreate.mutate({ name: `foo4` })
  // })

  // await Promise.all([promise3, promise4])

  // await trpc.userCreate.mutate({ name: `foo5` })

  // const users = doc.getArray(`users`).toJSON()

  // expect(users).toHaveLength(5)
  // })
  // })
  // describe(`out-of-order calls`, async () => {
  // const { trpc, doc } = initClient()
  // it(`handles out-of-order calls`, async () => {
  // const user1Promise = trpc.userCreate.mutate({
  // name: `foo1`,
  // optionalDelay: 10,
  // })
  // const user2Promise = trpc.userCreate.mutate({ name: `foo2` })
  // const [user1, user2] = await Promise.all([user1Promise, user2Promise])
  // expect(user1.name).toEqual(`foo1`)
  // expect(user2.name).toEqual(`foo2`)
  // })
  // })
  // describe(`handle errors`, () => {
  // const { trpc } = initClient()
  // it(`input errors`, async () => {
  // await expect(() =>
  // trpc.userCreate.mutate({ name: 1 })
  // ).rejects.toThrowError(`invalid_type`)
  // })
  // it(`router thrown errors`, async () => {
  // await expect(() =>
  // trpc.userCreate.mutate({ name: `BAD_NAME` })
  // ).rejects.toThrowError(`This name isn't one I like to allow`)
  // })
  // })
})
