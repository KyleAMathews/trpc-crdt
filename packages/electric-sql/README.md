# trpc-electric-sql

[tRPC](https://trpc.io/) integration for [ElectricSQL](https://electric-sql.com/): ElectricSQL-native RPC calls

For when you're building with ElectricSQL but you want to run code on a server.

See the [monorepo README for a longer writeup on why this library exists](https://github.com/KyleAMathews/trpc-crdt).

## Install

`npm install trpc-electric-sql`

## Example app

https://github.com/KyleAMathews/trpc-crdt/tree/main/examples/electric-sql

## Usage

#### Browser

```ts
import * as Y from "yjs"
import { createTRPCProxyClient } from "@trpc/client"
import { link } from "trpc-yjs/link"

// Doc needs replicated via a server e.g. with y-websocket.
const doc = new Y.Doc()
const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    loggerLink(),
    link({
      doc,
    }),
  ],
})

// Tell server to create a new user.
await trpc.userCreate.mutation({id: `1`, name: `Kyle Mathews`})

// The new user, written by the server, is now available at
doc.getMap(`users`).get(`1`)
```

#### Server

```ts
import { adapter } from "trpc-yjs/adapter"
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
        ctx: { users, transact, response },
      } = opts
      const user = { ..input }

      // Writes in the transact function gets applied at same time the trpc call
      // is finished.
      transact(() => {
        // Set new user on the Y.Map users.
        users.set(user.id, user)
        // "response" is a Y.Map that you can write to at any point in the call.
        // Perfect for sending progress updates on long running jobs, etc.
        response.set(`ok`, true)
      })
    })
})

// Get replicated Yjs doc to listen for new tRPC calls.
const doc = getYDoc(`doc`)

// Setup trpc-yjs adapter.
adapter({ appRouter, context: { doc, users: doc.getMap(`users`) } })
```

## Considerations

This library serializes RPC calls between clients and server through writes to a replicated `trpc_calls` table.

Something about adding table def.

In the future, we'll be able to lock down writes to trpc_calls + server-only tables.
