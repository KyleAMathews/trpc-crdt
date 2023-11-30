import { existsSync } from "fs"
import { createServer } from "http"
import { join } from "path"
import { WebSocketServer } from "ws"

import { createRequestHandler } from "@remix-run/express"
import compression from "compression"
import express from "express"
import morgan from "morgan"

import { Repo } from "@automerge/automerge-repo"
import { NodeWSServerAdapter } from "@automerge/automerge-repo-network-websocket"
import { adapter } from "trpc-automerge/adapter"
import { appRouter } from "./trpc"

const MODE = process.env.NODE_ENV
const BUILD_DIR = join(process.cwd(), `server/build`)

if (!existsSync(BUILD_DIR)) {
  console.warn(
    `Build directory doesn't exist, please run \`npm run dev\` or \`npm run build\` before starting the server.`
  )
}

const app = express()

// You need to create the HTTP server from the Express app
const httpServer = createServer(app)

// And then attach the socket.io server to the HTTP server
// const io = new Server(httpServer)

// // Then you can use `io` to listen the `connection` event and get a socket
// // from a client
// io.on(`connection`, (socket) => {
// // from this point you are on the WS connection with a specific client
// console.log(socket.id, `connected`)

// socket.emit(`confirmation`, `connected!`)

// socket.on(`event`, (data) => {
// console.log(socket.id, data)
// socket.emit(`event`, `pong`)
// })
// })

app.use(compression())

// You may want to be more aggressive with this caching
app.use(express.static(`public`, { maxAge: `1h` }))

// Remix fingerprints its assets so we can cache forever
app.use(express.static(`public/build`, { immutable: true, maxAge: `1y` }))

app.use(morgan(`tiny`))
app.all(
  `*`,
  MODE === `production`
    ? createRequestHandler({ build: require(`./build`) })
    : (req, res, next) => {
        purgeRequireCache()
        return createRequestHandler({ build: require(`./build`), mode: MODE })(
          req,
          res,
          next
        )
      }
)

const port = process.env.PORT || 3000

// instead of running listen on the Express app, do it on the HTTP server
const server = httpServer.listen(port, () => {
  console.log(`Express server listening on port ${port}`)
})

const wsServer = new WebSocketServer({ noServer: true })
const repo = new Repo({ network: [new NodeWSServerAdapter(wsServer)] })

const queueDoc = await repo.create()
queueDoc.change((d) => {
  d.queue = []
})
console.log(`QUEUE DOC:`, queueDoc.url)

adapter({
  appRouter,
  context: { repo, queueDoc },
})

server.on(`upgrade`, (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, (socket) => {
    wsServer.emit(`connection`, socket, request)
  })
})

////////////////////////////////////////////////////////////////////////////////
function purgeRequireCache() {
  // purge require cache on requests for "server side HMR" this won't let
  // you have in-memory objects between requests in development,
  // alternatively you can set up nodemon/pm2-dev to restart the server on
  // file changes, we prefer the DX of this though, so we've included it
  // for you by default
  for (const key in require.cache) {
    if (key.startsWith(BUILD_DIR)) {
      delete require.cache[key]
    }
  }
}
