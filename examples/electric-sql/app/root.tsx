import type { MetaFunction } from "@remix-run/node"
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react"
import React, { useEffect, useState, useRef } from "react"
import { ElectricalProvider } from "~/context"
import styles from "./globals.css"
import { cssBundleHref } from "@remix-run/css-bundle"
import type { LinksFunction } from "@remix-run/node"
import { uniqueTabId } from "electric-sql/util"
import { ElectricDatabase, electrify } from "electric-sql/wa-sqlite"
import { Electric, schema } from "../src/generated/client"
import { electricRef } from "./trpc"

import { authToken } from "../auth"
// import { DEBUG_MODE, ELECTRIC_URL } from "../config"

export const links: LinksFunction = () => [
  { rel: `stylesheet`, href: styles },
  ...(cssBundleHref ? [{ rel: `stylesheet`, href: cssBundleHref }] : []),
]

export const meta: MetaFunction = () => ({
  charset: `utf-8`,
  title: `New Remix App`,
  viewport: `width=device-width,initial-scale=1`,
})

export default function App() {
  const [electric, setElectric] = useState<Electric>()
  const firstUpdate = useRef(true)

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false
      return
    }

    const init = async () => {
      const token = authToken()
      const config = {
        auth: {
          token: token,
        },
        debug: true, //DEBUG_MODE,
        // url: ELECTRIC_URL,
      }

      console.time(`sync`)
      const { tabId } = uniqueTabId()
      const tabScopedDbName = `electric-${tabId}.db`

      const conn = await ElectricDatabase.init(tabScopedDbName, ``)
      const electric = await electrify(conn, schema, config)

      const [shape, usersShape] = await Promise.all([
        electric.db.trpc_calls.sync(),
        electric.db.users.sync(),
      ])
      await Promise.all([shape.synced, usersShape.synced])

      console.timeEnd(`sync`)

      electricRef.value = electric
      setElectric(electric)
    }

    init()

    return () => {
      electric?.satellite.stop()
    }
  }, [])

  if (electric === undefined) {
    return (
      <html lang="en">
        <head>
          <Meta />
          <Links />
        </head>
        <body>
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </body>
      </html>
    )
  }

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <ElectricalProvider db={electric}>
          <Outlet />
        </ElectricalProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
