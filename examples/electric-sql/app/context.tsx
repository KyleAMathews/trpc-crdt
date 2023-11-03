import React, { createContext, useContext } from "react"
import { makeElectricContext } from "electric-sql/react"
import { Electric, schema } from "../src/generated/client"

export const { ElectricProvider, useElectric } = makeElectricContext<Electric>()

export function ElectricalProvider({ children, db }) {
  return <ElectricProvider db={db}>{children}</ElectricProvider>
}
