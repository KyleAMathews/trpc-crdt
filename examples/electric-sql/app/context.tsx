import React, { createContext, useContext } from "react"
import { makeElectricContext } from "electric-sql/react"
import { Electric, schema } from "../src/generated/client"

export const { ElectricProvider, useElectric } = makeElectricContext<Electric>()
const TrpcContext = createContext(undefined)
export function useTrpc() {
  return useContext(TrpcContext)
}

export function ElectricalProvider({ children, db, trpc }) {
  return (
    <TrpcContext.Provider value={trpc.current}>
      <ElectricProvider db={db}>{children}</ElectricProvider>
    </TrpcContext.Provider>
  )
}