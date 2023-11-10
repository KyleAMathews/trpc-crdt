# trpc-yjs

[tRPC](https://trpc.io/) integration for [Yjs](https://yjs.dev/): Yjs-native RPC calls

For when you're building with Yjs but you want to run code on a server.

See the [monorepo README for a longer writeup on why this library exists](https://github.com/KyleAMathews/trpc-crdt).

## Install

`npm install trpc-yjs`

## Example app

https://trpc-yjs.fly.dev/

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
await trpc.userCreate.mutate({id: `1`, name: `Kyle Mathews`})

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
        ctx: { users },
      } = opts
      const user = { ..input }

      // Set new user on the Y.Map users.
      users.set(user.id, user)

      return `ok`
    })
})

// Get replicated Yjs doc to listen for new tRPC calls.
const doc = getYDoc(`doc`)

// Setup trpc-yjs adapter.
adapter({ appRouter, context: { doc, users: doc.getMap(`users`) } })
```

## Considerations

This library serializes RPC calls between clients and server through `trpc-call` objects in a Yjs array.

So to use, you need a Node.js tRPC server that's listening for updates to the shared doc to respond to users. If using y-websocket, this can be the same Node.js process running websockets. If you're using a hosted Yjs service, the Node.js process can run on any Node.js host and connect to the shared server.

There's a variety of ways you can configure trpc-yjs. You can use a shared doc for all users, a doc / user. If your app has a high volume of server calls, you might want to rotate docs e.g. daily or even hourly to avoid too much data accumulating.

This package is new so feel free to open issues if you have questions or encounter bugs.
