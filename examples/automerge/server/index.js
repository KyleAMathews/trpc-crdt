const fs = require(`fs`)
const { createServer } = require(`http`)
const path = require(`path`)
const { WebSocketServer } = require(`ws`)

const { createRequestHandler } = require(`@remix-run/express`)
const compression = require(`compression`)
const express = require(`express`)
const morgan = require(`morgan`)

const { adapter } = require(`trpc-automerge/adapter`)
const { appRouter } = require(`./trpc`)

const MODE = process.env.NODE_ENV
const BUILD_DIR = path.join(process.cwd(), `server/build`)

if (!fs.existsSync(BUILD_DIR)) {
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
        const build = require(`./build`)
        return createRequestHandler({ build, mode: MODE })(req, res, next)
      }
)

const port = process.env.PORT || 3000

// instead of running listen on the Express app, do it on the HTTP server
const server = httpServer.listen(port, () => {
  console.log(`Express server listening on port ${port}`)
})

const doc = getYDoc(`doc`)
adapter({ appRouter, context: { doc, users: doc.getArray(`users`) } })

const wsServer = new WebSocketServer({ noServer: true })
wsServer.on(`connection`, (ws, req) => {
  console.log(`connection`)
  setupWSConnection(ws, req, { docName: `doc` })
})

server.on(`upgrade`, (request, socket, head) => {
  console.log(`upgrade`)
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
