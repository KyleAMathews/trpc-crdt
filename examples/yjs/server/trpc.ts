import { initTRPC, TRPCError } from "@trpc/server"
import { z } from "zod"

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

export const appRouter = router({
  userCreate: publicProcedure
    .input(z.object({ name: z.string(), optionalDelay: z.number().optional() }))
    .mutation(async (opts) => {
      const {
        input,
        ctx: { users, transact },
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

      // Run in transaction along with setting response on the request
      // object.
      transact(() => {
        users.push([user])
      })
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
    }),
})

export type AppRouter = typeof appRouter
