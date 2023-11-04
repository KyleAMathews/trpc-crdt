import { AnyRouter } from "@trpc/server"
import { DocHandle } from "@automerge/automerge-repo"
import { CallQueue } from "./src/adapter"

export interface User {
  id: number
  name: string
}

export interface Users {
  users: User[]
}

export interface OnErrorParams {
  error: Error
  path: string
  type: string
  ctx: unknown
  input: unknown
}

export interface AdapterContext {
  users: DocHandle<Users>
}

export interface AdapterArgs {
  queueHandle: DocHandle<CallQueue>
  appRouter: AnyRouter
  context: AdapterContext
  onError?: (params: OnErrorParams) => void
}

declare function adapter({
  queueHandle,
  appRouter,
  context,
  onError,
}: AdapterArgs): void

export { adapter }
