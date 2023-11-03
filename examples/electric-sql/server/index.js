const fs = require(`fs`)
const { createServer } = require(`http`)
const path = require(`path`)
const Database = require(`better-sqlite3`)
const { electrify } = require(`electric-sql/node`)
const { authToken } = require(`../auth`)
const { schema } = require(`../src/generated/client`)

const { createRequestHandler } = require(`@remix-run/express`)
const compression = require(`compression`)
const express = require(`express`)
const morgan = require(`morgan`)

const { adapter } = require(`trpc-electric-sql/adapter`)
const { appRouter } = require(`./trpc`)

const MODE = process.env.NODE_ENV
const BUILD_DIR = path.join(process.cwd(), `server/build`)

if (!fs.existsSync(BUILD_DIR)) {
  console.warn(
    `Build directory doesn't exist, please run \`npm run dev\` or \`npm run build\` before starting the server.`
  )
}

const app = express()
const httpServer = createServer(app)
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
httpServer.listen(port, () => {
  console.log(`Express server listening on port ${port}`)
})

const { DEBUG_MODE, ELECTRIC_URL } = {
  DEBUG_MODE: true, //true, //process.env.DEBUG_MODE === "true",
  ELECTRIC_URL: process.env.ELECTRIC_URL ?? `ws://localhost:5133`,
}

// Setup trpc
async function setupTRPC() {
  const config = {
    auth: {
      token: authToken(),
    },
    debug: DEBUG_MODE,
    url: ELECTRIC_URL,
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
    context: { electric, instanceName: `remix-server` },
    appRouter,
  })
}

setupTRPC()

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
