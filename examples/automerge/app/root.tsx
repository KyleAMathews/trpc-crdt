import type { MetaFunction } from "@remix-run/node"
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react"
import styles from "./globals.css"
import { cssBundleHref } from "@remix-run/css-bundle"
import type { LinksFunction } from "@remix-run/node"
import { createTRPCProxyClient, loggerLink, httpBatchLink } from "@trpc/client"
import { link } from "trpc-automerge/link"
import type { AppRouter } from "~/server/trpc"

import { Repo } from "@automerge/automerge-repo"
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket"
import { useDocument } from "@automerge/automerge-repo-react-hooks"


export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
]

export const meta: MetaFunction = () => ({
  charset: `utf-8`,
  title: `New Remix App`,
  viewport: `width=device-width,initial-scale=1`,
})

function Loading({ doc, children }: { doc: boolean, children: unknown }) {
  if (doc) {
    return children
  } else {
    return <div>Loading...</div>
  }
}

const repo = new Repo({network: [new BrowserWebSocketClientAdapter("wss://localhost:3030")]})
const queueHandle = repo.create()

const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    loggerLink(),
    link({
      repo, 
      queueHandle,
    }),
  ],
})

export default function App() {
  const [document, changeDocument] = useDocument(queueHandle.url)

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Loading doc={document}>
            <Outlet  />
        </Loading>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
