import type { MetaFunction } from "@remix-run/node"
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react"
import { useEffect, useState } from "react"
// import type { Socket } from "socket.io-client"
// import io from "socket.io-client"
import * as Y from "yjs"
import { WebsocketProvider } from "y-websocket"
import { YjsProvider } from "~/context"
import styles from "./globals.css"
import { cssBundleHref } from "@remix-run/css-bundle"
import type { LinksFunction } from "@remix-run/node"
import { createTRPCProxyClient, loggerLink, httpBatchLink } from "@trpc/client"
import { link } from "trpc-yjs/link"
import type { AppRouter } from "~/server/trpc"

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
]

export const meta: MetaFunction = () => ({
  charset: `utf-8`,
  title: `New Remix App`,
  viewport: `width=device-width,initial-scale=1`,
})

function Loading({ doc, children }) {
  if (doc) {
    return children
  } else {
    return <div></div>
  }
}
const doc = new Y.Doc()
const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    loggerLink(),
    link({
      doc,
    }),
  ],
})

export default function App() {
  const [provider, setProvider] = useState<WebsocketProvider>()
  const [syncedDoc, setDoc] = useState<Y.Doc>()

  useEffect(() => {
    console.log(`CREATING PROVIDER`)
    const href = new URL(
      `${location.protocol === `https:` ? `wss:` : `ws:`}//${
        location.hostname
      }:${location.port}`
    ).href
    const wsProvider = new WebsocketProvider(href, "my-roomname", doc)
    window.wsProvider = wsProvider

    wsProvider.on("status", (event) => {
      console.log(event.status) // logs "connected" or "disconnected"
    })
    wsProvider.on("synced", (event) => {
      console.log(`yjs synced`)
      setProvider(wsProvider)
      setDoc(doc)
    })

    return () => {
      console.log(`DESTROY PROVIDER`)
      wsProvider.destroy()
    }
  }, [])

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Loading doc={syncedDoc}>
          <YjsProvider trpc={trpc} provider={provider} doc={syncedDoc}>
            <Outlet  />
          </YjsProvider>
        </Loading>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
