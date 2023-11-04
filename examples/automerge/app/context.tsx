import type { ReactNode } from "react"
import { createContext, useContext } from "react"
import type { WebsocketProvider } from "y-websocket"
import * as Y from "yjs"

type ProviderProps = {
  provider: WebsocketProvider | undefined
  doc: Y.Doc
  trpc: any
}

const context = createContext(undefined)

export function useYjs() {
  return useContext(context)
}

export function YjsProvider({ children, provider, doc, trpc }: ProviderProps) {
  return (
    <context.Provider value={{ provider, doc, trpc }}>{children}</context.Provider>
  )
}
