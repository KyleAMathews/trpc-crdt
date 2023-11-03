# trpc-electric-sql

[tRPC](https://trpc.io/) integration for [ElectricSQL](https://electric-sql.com/): ElectricSQL-native RPC calls

For when you're building with ElectricSQL but you want to run code on a server.

See the [monorepo README for a longer writeup on why this library exists](https://github.com/KyleAMathews/trpc-crdt).

## Install

`npm install trpc-electric-sql`

## Example app

https://github.com/KyleAMathews/trpc-crdt/tree/main/examples/electric-sql

## Usage

This integration with ElectricSQL serializes tRPC calls via an electrified `trpc_calls` table.

Add this table definition to your Postgres instance:

```sql
CREATE TABLE IF NOT EXISTS trpc_calls (
    id UUID PRIMARY KEY NOT NULL,
    createdAt TIMESTAMPTZ NOT NULL,
    elapsedMs INTEGER,
    path TEXT NOT NULL,
    input TEXT,
    type TEXT NOT NULL,
    state TEXT NOT NULL,
    clientId TEXT NOT NULL,
    response TEXT
);

ALTER TABLE trpc_calls ENABLE ELECTRIC;
```

Once [DDLX support lands](https://electric-sql.com/docs/api/ddlx), we'll be
able to restrict updates to trpc_calls rows to the server and the original
creator.

You can then setup your browser/server code similar to the following.

#### Browser

```ts
import { createTRPCProxyClient } from "@trpc/client"
import { link, createElectricRef } from "trpc-electric-sql/link"
import { Electric, schema } from "../src/generated/client"
import { ElectricDatabase, electrify } from "electric-sql/wa-sqlite"
import { genUUID, uniqueTabId } from "electric-sql/util"
import { authToken } from "../auth"

const electricRef = createElectricRef<Electric>()
const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    link({
      electricRef,
      clientId: genUUID(),
    }),
  ],
})

const init = async () => {
  const token = authToken()
  const config = {
    auth: {
      token: token,
    },
  }

  const { tabId } = uniqueTabId()
  const tabScopedDbName = `electric-${tabId}.db`

  const conn = await ElectricDatabase.init(tabScopedDbName, ``)
  const electric = await electrify(conn, schema, config)

  const [shape, usersShape] = await Promise.all([
    electric.db.trpc_calls.sync(),
    electric.db.users.sync(),
  ])
  await Promise.all([shape.synced, usersShape.synced])

  electricRef.value = electric
  setElectric(electric)

  // Tell server to create a new user.
  await trpc.userCreate.mutation({id: `1`, name: `Kyle Mathews`})

  // The new user, written by the server, is now available in the local sqlite db:
  const user = await electric.db.users.findUnique({where: { id: `1` }})
}

init()

```

#### Server

```typescript
import { adapter } from "trpc-electric-sql/adapter"
import { initTRPC, TRPCError } from "@trpc/server"
import { z } from "zod"

const t = initTRPC.create()
const router = t.router
const publicProcedure = t.procedure

const appRouter = router({
  userCreate: publicProcedure
    .input(z.object({ name: z.string(), id: z.string() }))
    .mutation(async (opts) => {
      const {
        input,
        ctx: {
          transact,
          electric: { db },
        },
      } = opts
      const user = { ..input }

      // Writes in the transact function gets applied at same time the trpc call
      // is finished.
      transact(() => {
        db.users.create({
          data: user,
        })
      })
    })
})

async function setupTRPC() {
  const config = {
    auth: {
      token: authToken(),
    },
    url: process.env.ELECTRIC_URL,
  }

  // Create the better-sqlite3 database connection.
  const conn = new Database(`local-data.db`)
  conn.pragma(`journal_mode = WAL`)

  // Instantiate your electric client.
  const electric = await electrify(conn, schema, config)
  const { db } = electric
  const [shape, usersShape] = await Promise.all([
    electric.db.trpc_calls.sync(),
    electric.db.users.sync(),
  ])
  await Promise.all([shape.synced, usersShape.synced])

  adapter({
    context: { electric },
    appRouter,
  })
}

setupTRPC()
```
