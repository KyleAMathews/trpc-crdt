import { describe, it, expect } from "vitest"
import { initTRPC, TRPCError } from "@trpc/server"
import { z } from "zod"
import * as Y from "yjs"
import { adapter } from "./src/adapter"
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

const appRouter = router({
  userCreate: publicProcedure
    .input(z.object({ name: z.string(), optionalDelay: z.number().optional() }))
    .mutation(async (opts) => {
      const {
        input,
        ctx: { users },
      } = opts
      const user = { id: String(users.length + 1), ...input }

      if (input.optionalDelay) {
        await new Promise((resolve) => setTimeout(resolve, input.optionalDelay))
      }

      if (input.name === `BAD_NAME`) {
        throw new TRPCError({
          code: `CONFLICT`,
          message: `This name isn't one I like to allow`,
        })
      }

      return {
        transact: () => {
          users.push([user])
        },
        response: user,
      }
    }),
  userUpdateName: publicProcedure
    .input(z.object({ id: z.string(), name: z.string() }))
    .mutation(async (opts) => {
      const {
        input,
        ctx: { users },
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
      return {
        mutations: () => {
          users.delete(id, 1)
          users.insert(id, [newUser])
        },
        response: newUser,
      }
    }),
})

type AppRouter = typeof appRouter

function initClient() {
  const serverDoc = new Y.Doc()
  const clientDoc = new Y.Doc()

  serverDoc.on(`update`, (update) => {
    Y.applyUpdate(clientDoc, update)
  })

  clientDoc.on(`update`, (update) => {
    Y.applyUpdate(serverDoc, update)
  })

  // YJS database
  const serverUsers = serverDoc.getArray(`users`)

  // Start adapter
  adapter({ doc: serverDoc, appRouter, context: { users: serverUsers } })

  // Create client.
  const trpc = createTRPCProxyClient<AppRouter>({
    links: [
      link({
        doc: clientDoc,
      }),
    ],
  })

  return { doc: clientDoc, trpc }
}

describe(`yjs`, () => {
  describe(`basic calls`, () => {
    const { trpc } = initClient()
    it(`create a user`, async () => {
      const newUser = await trpc.userCreate.mutate({ name: `foo` })
      expect(newUser.name).toEqual(`foo`)
    })
    it(`updateName`, async () => {
      const user = await trpc.userUpdateName.mutate({ id: `1`, name: `foo2` })
      expect(user.name).toEqual(`foo2`)
    })
  })
  describe(`batched calls`, () => {
    const { doc, trpc } = initClient()
    it(`handles batched calls`, async () => {
      let promise1
      let promise2
      doc.transact(() => {
        promise1 = trpc.userCreate.mutate({ name: `foo1` })
        promise2 = trpc.userCreate.mutate({ name: `foo2` })
      })

      await Promise.all([promise1, promise2])

      let promise3
      let promise4

      doc.transact(() => {
        promise3 = trpc.userCreate.mutate({ name: `foo3` })
        promise4 = trpc.userCreate.mutate({ name: `foo4` })
      })

      await Promise.all([promise3, promise4])

      await trpc.userCreate.mutate({ name: `foo5` })

      const users = doc.getArray(`users`).toJSON()

      expect(users).toHaveLength(5)
    })
  })
  describe(`out-of-order calls`, () => {
    const { trpc } = initClient()
    it(`handles out-of-order calls`, async () => {
      const user1Promise = trpc.userCreate.mutate({
        name: `foo1`,
        optionalDelay: 10,
      })
      const user2Promise = trpc.userCreate.mutate({ name: `foo2` })

      const [user1, user2] = await Promise.all([user1Promise, user2Promise])

      expect(user1.name).toEqual(`foo1`)
      expect(user2.name).toEqual(`foo2`)
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
