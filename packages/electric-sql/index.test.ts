import { describe, it, expect, afterAll, beforeEach, afterEach } from "vitest"
import { initTRPC, TRPCError } from "@trpc/server"
import { z } from "zod"
import shelljs from "shelljs"
import { genUUID } from "electric-sql/util"
import { adapter } from "./src/adapter"
import { link, createElectricRef } from "./src/link"

import Database from "better-sqlite3"
import { electrify } from "electric-sql/node"
import { authToken } from "./auth"
import { Electric, schema } from "./src/generated/client"
import { DATABASE_URL } from "./db/util"
import { Client } from "pg"

const { DEBUG_MODE, ELECTRIC_URL } = {
  DEBUG_MODE: false, //true, //process.env.DEBUG_MODE === "true",
  ELECTRIC_URL: process.env.ELECTRIC_URL ?? `ws://localhost:5133`,
}

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

async function makeClientTable(dbName: string, isServer = true) {
  const electricRef = createElectricRef<Electric>()
  const config = {
    auth: {
      token: authToken(),
    },
    debug: DEBUG_MODE,
    url: ELECTRIC_URL,
  }

  // Create the better-sqlite3 database connection. The first
  // argument is your database name. Changing this will
  // create/use a new local database file.
  const conn = new Database(
    `sqliteDbs/${dbName}-${isServer ? `server` : `client`}.db`
  )

  // Follow the library recommendation to enable WAL mode to
  // increase performance. As per:
  // https://github.com/WiseLibs/better-sqlite3/blob/master/docs/performance.md
  conn.pragma(`journal_mode = WAL`)

  // Instantiate your electric client.
  const electric = await electrify(conn, schema, config)
  const { db } = electric
  const shape = await db.trpc_calls.sync()
  const usersShape = await db.users.sync()
  await shape.synced
  await usersShape.synced
  electricRef.value = electric

  // console.log(
  // `created client db sqliteDbs/${dbName}-${isServer ? `server` : `client`}.db`
  // )

  return [electric, electricRef]
}

async function initClient(dbName) {
  // console.log(`initClient`, dbName)
  const [
    [serverElectric, serverElectricRef],
    [clientElectric, clientElectricRef],
  ] = await Promise.all([
    makeClientTable(dbName, true),
    makeClientTable(dbName, false),
  ])

  const pgClient = new Client({ connectionString: DATABASE_URL })
  await pgClient.connect()

  // Start adapter
  const appRouter = router({
    userCreate: publicProcedure
      .input(
        z.object({
          id: z.string().uuid(),
          name: z.string(),
          optionalDelay: z.number().optional(),
        })
      )
      .mutation(async (opts) => {
        const {
          input,
          ctx: {
            electric: { db },
            transact,
          },
        } = opts
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

        const user = {
          id: input.id.toString(),
          name: input.name,
        }

        // Run in transaction along with setting response on the request
        // object.
        transact(() => {
          db.users.create({
            data: user,
          })
        })

        return user
      }),
    userUpdateName: publicProcedure
      .input(z.object({ id: z.string().uuid(), name: z.string() }))
      .mutation(async (opts) => {
        const {
          input,
          ctx: {
            electric: { db },
            transact,
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

        return `ok`
      }),
  })

  let trpc
  if (dbName !== `cleanup`) {
    type AppRouter = typeof appRouter
    adapter({
      context: { electric: serverElectric, instanceName: dbName },
      appRouter,
    })

    // Create client.
    trpc = createTRPCProxyClient<AppRouter>({
      links: [
        link({
          electricRef: clientElectricRef,
          clientId: genUUID(),
        }),
      ],
    })
  }

  // return { doc: clientDoc, trpc }
  return { clientElectric, serverElectric, pgClient, trpc }
}

afterAll(async () => {
  const { pgClient } = await initClient(`cleanup`)
  await Promise.all([
    pgClient.query(`DELETE from trpc_calls`),
    pgClient.query(`DELETE from users`),
    shelljs.rm(`./sqliteDbs/*`),
  ])
})

// TODO shutdown satellites when describe block is done.
describe(`electric-sql`, () => {
  beforeEach(async (context) => {
    const { trpc, clientElectric, serverElectric } = await initClient(
      context.meta.name
    )
    const { db } = clientElectric
    context.clientElectric = clientElectric
    context.serverElectric = serverElectric
    context.db = db
    context.trpc = trpc
  })
  afterEach(async (context) => {
    await Promise.all([
      context.clientElectric.satellite.stop(),
      context.serverElectric.satellite.stop(),
    ])
  })
  describe(`basic db connectivity`, () => {
    it(`can connect to server sqlite and create a trpc call`, async ({
      db,
    }) => {
      const id = genUUID()
      await db.users.create({
        data: {
          id,
          name: `foo`,
        },
      })
      const res = await db.users.findMany()
      expect(res).toHaveLength(1)
      expect(res[0].id).toEqual(id)
    })
  })
  describe(`basic calls`, async () => {
    const id = genUUID()
    it(`create a user`, async ({ trpc, db }) => {
      const userRes = await trpc.userCreate.mutate({ id, name: `foo` })
      const user = await db.users.findUnique({ where: { id } })
      expect(user.name).toEqual(`foo`)
      expect(userRes.name).toEqual(`foo`)
    })
    it(`updateName`, async ({ trpc, db }) => {
      await trpc.userUpdateName.mutate({ id, name: `foo2` })
      const user = await db.users.findUnique({ where: { id } })
      expect(user.name).toEqual(`foo2`)
    })
  })
  describe(`batched calls`, async () => {
    it(`handles batched calls`, async ({ trpc, db }) => {
      const promise1 = trpc.userCreate.mutate({ id: genUUID(), name: `foo1` })
      const promise2 = trpc.userCreate.mutate({ id: genUUID(), name: `foo2` })

      await Promise.all([promise1, promise2])

      const promise3 = trpc.userCreate.mutate({ id: genUUID(), name: `foo3` })
      const promise4 = trpc.userCreate.mutate({ id: genUUID(), name: `foo4` })

      await Promise.all([promise3, promise4])

      await trpc.userCreate.mutate({ id: genUUID(), name: `foo5` })

      const users = await db.users.findMany()

      expect(users).toHaveLength(7)
    })
  })
  describe(`out-of-order calls`, async () => {
    it(`handles out-of-order calls`, async ({ trpc }) => {
      const user1Promise = trpc.userCreate.mutate({
        id: genUUID(),
        name: `foo1`,
        optionalDelay: 10,
      })
      const user2Promise = trpc.userCreate.mutate({
        id: genUUID(),
        name: `foo2`,
      })
      const [user1, user2] = await Promise.all([user1Promise, user2Promise])
      expect(user1.name).toEqual(`foo1`)
      expect(user2.name).toEqual(`foo2`)
    })
  })
  describe(`handle errors`, () => {
    it(`input errors`, async ({ trpc }) => {
      await expect(() =>
        trpc.userCreate.mutate({ id: genUUID(), name: 1 })
      ).rejects.toThrowError(`invalid_type`)
    })
    it(`router thrown errors`, async ({ trpc }) => {
      await expect(() =>
        trpc.userCreate.mutate({ id: genUUID(), name: `BAD_NAME` })
      ).rejects.toThrowError(`This name isn't one I like to allow`)
    })
  })
})
