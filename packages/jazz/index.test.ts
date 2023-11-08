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
type ResponseMap = CoMap<{
  [key: string]: any
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
  response?: ResponseMap[`id`]
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

async function initClients(name) {
  let usersMapId!: UsersMap[`id`]
  // eslint-disable-next-line
  let trpcCallsId!: AllTrpcCalls['id']

  console.log(1)
  const serverClient = await createOrResumeWorker({
    workerName: `server-${name}`,
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
  // console.log({ serverClient })
  console.log(2)

  let clientMyRequestsGroup!: Group

  // await new Promise((resolve) => setTimeout(resolve, 1000))

  // console.log({ serverClient })
  console.log(3)

  const clientClient = await createOrResumeWorker({
    workerName: `client-${name}`,
    migration: async (account, _profile, localNode) => {
      console.log(4)
      clientMyRequestsGroup = account.createGroup()
      const serverAccount = await localNode.load(serverClient.worker.id)
      console.log(5)
      clientMyRequestsGroup.addMember(serverAccount, `writer`)
    },
  })
  // TODO move this to link & autoSub
  const allTrpcCallsAsClient = await clientClient.localNode.load(trpcCallsId)
  if (allTrpcCallsAsClient === `unavailable`)
    throw new Error(`trpcCalls unavailable`)
  console.log(6)

  // console.log({ serverClient, clientClient })
  console.log(7)

  // load usersMap
  const usersMap = await serverClient.localNode.load(usersMapId)
  if (usersMap === `unavailable`) throw new Error(`usersMap unavailable`)

  // Setup client AutoSub
  autoSub(usersMapId, clientClient.localNode, (usersMap) => {
    console.log(`Got usersMap update on client`, usersMap)
  })

  // Create tRPC Router.
  const appRouter = router({
    userCreate: publicProcedure
      .input(
        z.object({ name: z.string(), optionalDelay: z.number().optional() })
      )
      .mutation(async (opts) => {
        const {
          input,
          ctx: { users, transact, call },
        } = opts
        // const user = { id: String(users.length + 1), ...input }
        const user = { ...input }

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
        // users.push([user])
        call.set(`response`, call.meta.group.createMap({ user }).id)
        console.log(`server call`, call)
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
  adapter({ appRouter, context: { client: serverClient, trpcCallsId } })

  // Create client.
  const trpc = createTRPCProxyClient<AppRouter>({
    links: [
      link({
        client: clientClient,
        clientMyRequestsGroup,
        allTrpcCallsAsClient,
        trpcCallsId,
      }),
    ],
  })

  return { trpc }
}

describe(`jazz`, () => {
  beforeEach(async (context) => {
    const { trpc } = await initClients(context.meta.name + Math.random())
    context.trpc = trpc
  })
  describe(`basic calls`, () => {
    it(`create a user`, async ({ trpc }) => {
      console.log(`in test`)
      const newUser = await trpc.userCreate.mutate({ id: 1, name: `foo` })
      console.log({ newUser })
      // expect(newUser.name).toEqual(`foo`)
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
