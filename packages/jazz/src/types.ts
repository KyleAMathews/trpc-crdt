import { CoMap, CoStream } from "cojson"

export type TRPCCall = CoMap<{
  requestId: string
  createdAt: string
  elapsedMs: string
  path: string
  input: any
  type: string
  error: boolean
  done: boolean
  clientId: string
  response: any
}>

// eslint-disable-next-line
export type AllTrpcCalls = CoStream<TRPCCall['id']>
