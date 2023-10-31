# trpc-crdt

[tRPC](https://trpc.io/) integrations for CRDTs: CRDT-native RPC calls

tRPC is awesome! It really lives up to its tagline: "end-to-end typesafe APIs made easy".

CRDTs are phenomenal! They help make local-first practical by ensuring client first writes merge nicely with other clients without needing latency-heavy server API calls. This helps enable real-time, multiplayer applications.

But not everything is cute puppies and warm bread and butter in CRDT-land.

Let's grade CRDTs on their support for reads and writes.

Reads: for shared/private data it's great. Can get weird if you need to exclude some data from some users or morph the schema between the db and the client.
Writes:

- simple shared data ✅
- private data ✅
- complex or secure validation ❌
- mutations with side-effects only a server can do (talk to external systems, use server hardware, etc).
- mutations to 3rd-party APIs ❌
- complex data ❌

But missing support for bread and butter of APIs, server authoritative mutations.

Why server authoritative?

Many writes are perfectly safe to make optimisitic. CRDTs extend that by making many types of merges automatic. But many writes can't be done optimisitically on the client (or isn't really practical). These include:

- writes that most validate against external systems e.g. scheduling a calendar event through Google Calendar's API
- Anything that needs complex/secure validation e.g. sending money
- mutations to complex data that won't easily converge — it's often easier to just do the mutation on the server vs. trying to do it optimistically on the client.

Use CRDTs for what CRDTs are great at and for ill-fitting writes, use traditional server authoritative writes.

Why keep it in CRDT-land?

- Get benefits of of CRDTs, server calls over CRDTs are resiliant to network glitches with guerenteed delivery. No need to add retry logic to your calls.
- Simplify your architecture. If you're using CRDTs extensively in your applications, tRPC over CRDT helps keep your architecture simple and consistent.
- A free audit log! Which may or may not be useful but it can be  handy or even essential to see a log of all mutations.
- No need for client-side state invalidation/refetching. As writes by the server as a result of trpc mutations are directly pushed to the client, all updates as a result of a tRPC mutation arrive simultaneously in all clients no matter where in your component tree.
- Easy real-time updates for long-running requests e.g. the server can simply update the a progress percentage or what step the request is on. If some requests are of interest to a wider audience e.g. in group collaboration, running requests over CRDT means you get free real-time job updates.

Very simple example code.

### Integrations:
- yjs (working)
- electric-sql (working)
- jazz (in progress)

If you'd like to add support for more projects, open an issue and let's discuss!

Warning: these libraries haven't yet been run in actual production systems so if you're adopting a trpc-crdt library, expect to be helping doing some finishiing touches on the experience.
