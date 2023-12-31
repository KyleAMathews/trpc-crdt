# trpc-crdt

[tRPC](https://trpc.io/) integrations for CRDTs: CRDT-native RPC calls

For when you're building with CRDTs but you want to run code on a server.

## Install

NPM packages are available for the following CRDT systems:

- [Yjs](https://yjs.dev/)
  - `npm install trpc-yjs`
  - [example app](https://trpc-yjs.fly.dev/)
- [ElectricSQL](https://electric-sql.com/)
  - `npm install trpc-electric-sql`
  - [example app](https://github.com/KyleAMathews/trpc-crdt/tree/main/examples/electric-sql)

In progress
- [Jazz](https://jazz.tools/)
- [Automerge](https://automerge.org/)

Please PR additional integrations — the goal is to support all CRDT implementations.

## How to use

Run server functions from the client that write to replicated data structures.

```ts
// Run a job
await trpc.aiSummarizationJob.mutate({ id })
console.log(jobResults.get(id))

// Schedule an event
const eventId = await trpc.scheduleRoom.mutate({
  date: `2023-11-04`,
  startTime: 12,
  endTime: 13
})
console.log(events.get(eventId))
```

A simple Yjs implementation (see the [examples directory](https://github.com/KyleAMathews/trpc-crdt/tree/main/examples) for full examples for each integration).

#### Browser

```ts
import * as Y from "yjs"
import { createTRPCProxyClient } from "@trpc/client"
import { link } from "trpc-yjs/link"

// Doc needs replicated via a server e.g. with y-websocket.
const doc = new Y.Doc()
const trpc = createTRPCProxyClient<AppRouter>({
  links: [
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

## Why Build with CRDTs?

CRDTs enable local-first style development — local-first is a software architecture which shifts reads/writes to an embedded database in each client. Local writes are replicated between clients by a Sync Engine.

The benefits are multiple:

- Simplified state management for developers
- Built-in support for real-time sync, offline usage, and multiplayer collaborative features
- Faster (60 FPS) CRUD
- More robust applications for end-users

Read my longer write-up on why I think local-first is the future of app development: https://bricolage.io/some-notes-on-local-first-development/

## Why trpc-crdt?

But not everything is cute puppies and warm bread and butter in CRDT-land.

CRDTs (and local writes) are amazing until... you need a server (it happens).

### Common reasons for needing a server when building with CRDTs:

#### Only a server can run the code:

- the code requires specialized hardware not available in the client
- the code is written in a non-javascript language (it happens)
- the code needs to talk to 3rd party API with restricted access
- the code needs more resources to run than are available on the client (common with mobile)
- the code needs data that's not available on the client (data doesn't fit or too expensive to load)

#### An optimistic client mutation isn't safe:

CRDTs make optimistic client mutations _far_ safer than normal but an authoritative server is still often needed:

- mutations that need complex or secure validation (e.g. money transfer)
- mutations that include writes to external systems that must be completed in the same transaction e.g. writes to a 3rd party API
- mutations to complex data that's not easily expressed in CRDTs
- mutations against limited resources e.g. reserving a ticket to a show

For each of these, the good ol' request/response RPC pattern is a lot easier
and safer than optimistic client writes.

## Why do server authoritative mutations over a CRDT?

You might be wandering: why not just write normal tRPC (or REST/GraphQL) API calls?

This is possible but there are some potent advantages to keeping everything in CRDT-land:

- No need for client-side state invalidation/refetching after server writes. Writes by the server during a tRPC mutations are pushed to all clients by the sync engine. Data across your component tree will be updated simultaneously along with your UI — a major pain point for normal API mutations!
- RPC calls get all the benefits of of CRDTs:
  - server calls over CRDTs are resilient to network glitches with guaranteed exactly-once delivery. No need to add retry logic to your calls.
  - RPC calls are now replicated (if you choose) in real-time to other users of the application
- Simplify your architecture. If you're using CRDTs extensively in your applications, tRPC over CRDT helps keep your architecture simple and consistent.
- A free audit log! Which may or may not be useful but it can be  handy or even essential to see a log of all mutations.
- Easy real-time updates for long-running requests e.g. the server can simply update a progress percentage or what step the request is on. If some requests are of interest to a wider audience e.g. in group collaboration, running requests over CRDT means you get free real-time job notifications.

## Get involved!
This library and local-first in general is very early so there's lots of ideas to explore and code to write.
