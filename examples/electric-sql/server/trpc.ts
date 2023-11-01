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
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string(),
        created_at: z.string(),
        optionalDelay: z.number().optional(),
      })
    )
    .mutation(async (opts) => {
      const {
        input,
        ctx: {
          transact,
          electric: { db },
        },
      } = opts
      console.log({ input })
      if (input.optionalDelay) {
        await new Promise((resolve) => setTimeout(resolve, input.optionalDelay))
      }

      if (input.name === `BAD_NAME`) {
        throw new TRPCError({
          code: `CONFLICT`,
          message: `This name isn't one I like to allow`,
        })
      }

      const user = {
        id: input.id.toString(),
        created_at: input.created_at,
        name: input.name,
      }

      // Run in transaction along with setting response on the request
      // object.
      transact(() =>
        db.users.create({
          data: user,
        })
      )
    }),
  userUpdateName: publicProcedure
    .input(z.object({ id: z.string().uuid(), name: z.string() }))
    .mutation(async (opts) => {
      const {
        input,
        ctx: {
          transact,
          electric: { db },
        },
      } = opts
      // Run in transaction along with setting response on the request
      // object.
      transact(() => {
        return db.users.update({
          data: {
            name: input.name,
          },
          where: {
            id: input.id,
          },
        })
      })
    }),
})

export type AppRouter = typeof appRouter
