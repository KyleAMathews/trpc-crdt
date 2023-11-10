import { describe, it, expect } from "vitest"
import { initTRPC, TRPCError } from "@trpc/server"
import { z } from "zod"
import { Repo } from "@automerge/automerge-repo"
import { BroadcastChannelNetworkAdapter } from "@automerge/automerge-repo-network-broadcastchannel"

import { Call, CallQueue, adapter } from "./src/adapter"
import { link } from "./src/link"
import { createTRPCProxyClient, loggerLink, httpBatchLink } from "@trpc/client"
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

interface User {
  name: string
  id: number
}

interface Users {
  users: { [id: number]: User }
}

function initClient() {
  const serverRepo = new Repo({
    network: [new BroadcastChannelNetworkAdapter({ channelName: `trpc-test` })],
  })
  const clientRepo = new Repo({
    network: [new BroadcastChannelNetworkAdapter({ channelName: `trpc-test` })],
  })

  const queueServerHandle = serverRepo.create<CallQueue>()
  queueServerHandle.change((d) => (d.queue = []))
  const queueClientHandle = clientRepo.find<CallQueue>(queueServerHandle.url)

  const serverUsersHandle = serverRepo.create<Users>()
  serverUsersHandle.change((d) => (d.users = {}))

  // Start adapter
  const appRouter = router({
    userCreate: publicProcedure
      .input(
        z.object({ name: z.string(), optionalDelay: z.number().optional() })
      )
      .mutation(async (opts) => {
        const {
          input,
          ctx: { usersHandle },
        } = opts
        const doc = usersHandle.docSync()
        const user = { id: String(Object.keys(doc.users).length + 1), ...input }

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
        usersHandle.change((d: Users) => {
          d.users[user.id] = user
        })

        return user
      }),

    userUpdateName: publicProcedure
      .input(z.object({ id: z.string(), name: z.string() }))
      .mutation(async (opts) => {
        const {
          input,
          ctx: { usersHandle },
        } = opts
        const { id, name } = input
        usersHandle.change((d: Users) => {
          d.users[id].name = name
        })

        return usersHandle.docSync().users[id]
      }),
  })

  type AppRouter = typeof appRouter
  adapter({
    repo: serverRepo,
    queueHandle: queueServerHandle,
    appRouter,
    ctx: { usersHandle: serverUsersHandle },
  })

  // Create client.
  const trpc = createTRPCProxyClient<AppRouter>({
    links: [
      link({
        repo: clientRepo,
        queueHandle: queueClientHandle,
      }),
    ],
  })

  return {
    trpc,
    queueClientHandle,
    serverUsersHandle,
  }
}

describe(`automerge`, () => {
  describe(`basic calls`, () => {
    const { trpc, serverUsersHandle } = initClient()
    it(`create a user`, async () => {
      const res = await trpc.userCreate.mutate({ name: `foo` })
      expect(res.name).toEqual(`foo`)
      const users = serverUsersHandle.docSync().users
      console.log({ users })
      expect(users).toMatchSnapshot()
      expect(users[res.id].name).toEqual(`foo`)
    })
    it(`updateName`, async () => {
      const res = await trpc.userUpdateName.mutate({ id: `1`, name: `foo2` })
      expect(res.name).toEqual(`foo2`)
      const users = serverUsersHandle.docSync().users
      expect(users).toMatchSnapshot()
      expect(users[res.id].name).toEqual(`foo2`)
    })
  })
  describe(`batched calls`, () => {
    const { trpc, serverUsersHandle } = initClient()
    it(`handles batched calls`, async () => {
      const promise1 = trpc.userCreate.mutate({ name: `foo1` })
      const promise2 = trpc.userCreate.mutate({ name: `foo2` })
      await Promise.all([promise1, promise2])

      const promise3 = trpc.userCreate.mutate({ name: `foo3` })
      const promise4 = trpc.userCreate.mutate({ name: `foo4` })
      await Promise.all([promise3, promise4])

      await trpc.userCreate.mutate({ name: `foo5` })

      const users = serverUsersHandle.docSync().users
      expect(Object.keys(users)).toHaveLength(5)
    })
  })
  describe(`out-of-order calls`, async () => {
    const { trpc } = initClient()
    it(`handles out-of-order calls`, async () => {
      const user1Promise = trpc.userCreate.mutate({
        name: `foo1`,
        optionalDelay: 10,
      })
      const user2Promise = trpc.userCreate.mutate({ name: `foo2` })
      const [res1, res2] = await Promise.all([user1Promise, user2Promise])
      expect(res1.name).toEqual(`foo1`)
      expect(res2.name).toEqual(`foo2`)
    })
  })

  describe(`handle errors`, () => {
    const { trpc } = initClient()
    it(`input errors`, async () => {
      await expect(() =>
        trpc.userCreate.mutate({ name: 1 })
      ).rejects.toThrowError(`invalid_type`)
    })
    it(`router thrown errors`, async () => {
      await expect(() =>
        trpc.userCreate.mutate({ name: `BAD_NAME` })
      ).rejects.toThrowError(`This name isn't one I like to allow`)
    })
  })
})