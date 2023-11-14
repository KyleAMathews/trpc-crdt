import { initTRPC, TRPCError } from "@trpc/server"
import { z } from "zod"
import { UsersDoc } from "./types"
import { Repo, DocHandle } from "@automerge/automerge-repo"

export type Context = {
  repo: Repo
  usersHandle: DocHandle<UsersDoc>
}

const t = initTRPC.context<Context>().create()

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
        ctx: { usersHandle },
      } = opts
      const users = await usersHandle.doc()

      const user = { id: String(Object.keys(users).length + 1), ...input }

      if (input.optionalDelay) {
        await new Promise((resolve) => setTimeout(resolve, input.optionalDelay))
      }

      if (input.name === `BAD_NAME`) {
        throw new TRPCError({
          code: `CONFLICT`,
          message: `This name isn't one I like to allow`,
        })
      }

      users.push([user])

      return user
    }),
  userUpdateName: publicProcedure
    .input(z.object({ id: z.string(), name: z.string() }))
    .mutation(async (opts) => {
      const {
        input,
        ctx: { usersHandle },
      } = opts

      usersHandle.change((d: UsersDoc) => {
        d.users[input.id].name = input.name
      })

      return usersHandle.docSync().users[input.id]
    }),
})

export type AppRouter = typeof appRouter
