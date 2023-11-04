import { AnyRouter } from "@trpc/server"
import { AutomergeUrl, DocHandle } from "@automerge/automerge-repo"

export type JobState = `WAITING` | `DONE` | `ERROR`

export interface Job {
  path: string
  input: unknown
  type: string
  state: JobState
  started: string
  clientId: string
  response: unknown
}

export interface JobQueue {
  jobs: AutomergeUrl[]
  clientIds: { [jobId: string]: AutomergeUrl }
}

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
  queue: DocHandle<JobQueue>
  users: DocHandle<Users>
}

export interface AdapterArgs {
  jobQueue: DocHandle<JobQueue>
  appRouter: AnyRouter
  context: AdapterContext
  onError?: (params: OnErrorParams) => void
}

declare function adapter({
  jobQueue,
  appRouter,
  context,
  onError,
}: AdapterArgs): void

export { adapter }
