import type { AppRouter } from "../server/trpc"
import { link, createElectricRef } from "trpc-electric-sql/link"
import { createTRPCProxyClient, loggerLink } from "@trpc/client"
import { Electric } from "../src/generated/client"
import { genUUID } from "electric-sql/util"

export const electricRef = createElectricRef<Electric>()

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    loggerLink(),
    link({
      electricRef,
      clientId: genUUID(),
    }),
  ],
})
