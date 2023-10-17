import { describe, it, expect, afterAll } from "vitest"
import { initTRPC, TRPCError } from "@trpc/server"
import { z } from "zod"
import shelljs from "shelljs"
import { genUUID } from "electric-sql/util"
import { adapter } from "./src/adapter"
import { link } from "./src/link"

import Database from "better-sqlite3"
import { electrify } from "electric-sql/node"
import { authToken } from "./auth"
import { schema } from "./src/generated/client"
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

  console.log(
    `created client db sqliteDbs/${dbName}-${isServer ? `server` : `client`}.db`
  )

  return electric
}

async function initClient(dbName) {
  console.log(`initClient`, dbName)
  // console.trace()
  //
  const [serverElectric, clientElectric] = await Promise.all([
    makeClientTable(dbName, true),
    makeClientTable(dbName, false),
  ])

  const pgClient = new Client({ connectionString: DATABASE_URL })
  await pgClient.connect()

  // Start adapter
  const appRouter = router({
    userCreate: publicProcedure
      .input(
        z.object({ name: z.string(), optionalDelay: z.number().optional() })
      )
      .mutation(async (opts) => {
        const {
          input,
          ctx: {
            transact,
            electric: { db },
          },
        } = opts
        const users = await db.users.findMany()
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
        transact(() =>
          db.users.create({
            data: {
              id: user.id.toString(),
              name: user.name,
            },
          })
        )

        return user
      }),
    userUpdateName: publicProcedure
      .input(z.object({ id: z.string(), name: z.string() }))
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

        return `ok`
      }),
  })

  let trpc
  if (dbName !== `cleanup`) {
    type AppRouter = typeof appRouter
    adapter({ electric: serverElectric, appRouter })

    // Create client.
    trpc = createTRPCProxyClient<AppRouter>({
      links: [
        link({
          electric: clientElectric,
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

describe(`electric-sql`, () => {
  describe(`basic db connectivity`, () => {
    it(`can connect to server sqlite and create a trpc call`, async () => {
      const {
        clientElectric: { db },
      } = await initClient(`basic-connectivity`)
      expect(true).toBeTruthy()
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
    const {
      trpc,
      clientElectric: { db },
    } = await initClient(`basic-calls`)
    it(`create a user`, async () => {
      const newUser = await trpc.userCreate.mutate({ name: `foo` })
      expect(newUser.name).toEqual(`foo`)
      const user = await db.users.findUnique({ where: { id: `2` } })
      expect(user).toMatchSnapshot()
      expect(user.name).toEqual(`foo`)
    })
    it(`updateName`, async () => {
      await trpc.userUpdateName.mutate({ id: `2`, name: `foo2` })
      const user = await db.users.findUnique({ where: { id: `2` } })
      expect(user.name).toEqual(`foo2`)
    })
  })
  // describe(`batched calls`, async () => {
  // const { doc, trpc } = await initClient(`batched-calls`)
  // it(`handles batched calls`, async () => {
  // const promise1 = trpc.userCreate.mutate({ name: `foo1` })
  // const promise2 = trpc.userCreate.mutate({ name: `foo2` })

  // await Promise.all([promise1, promise2])

  // const promise3 = trpc.userCreate.mutate({ name: `foo3` })
  // const promise4 = trpc.userCreate.mutate({ name: `foo4` })

  // await Promise.all([promise3, promise4])

  // await trpc.userCreate.mutate({ name: `foo5` })

  // const users = await db.users.findMany()
  // // const users = doc.getArray(`users`).toJSON()

  // expect(users).toHaveLength(7)
  // })
  // })
  // describe(`out-of-order calls`, async () => {
  // const { trpc, doc } = initClient(`out-of-order`)
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
  // const { trpc } = initClient(`handle-errors`)
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
