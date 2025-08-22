import type { Address } from "viem"
import { getContainer } from "./container.js"

export async function sendWalletTransaction(params: {
  to: Address
  value: string
  data?: `0x${string}`
}) {
  // Value is already in wei (as a string)
  const value = BigInt(params.value)
  return getContainer().walletEffects.sendTransaction({
    to: params.to,
    value,
    ...(params.data && { data: params.data }),
  })
}

export async function switchToChain(chainId: number) {
  return getContainer().walletEffects.switchChain(chainId)
}
