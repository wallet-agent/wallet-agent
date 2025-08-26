import type { Address } from "viem"
import { parseEther } from "viem"
import { getContainer } from "./container.js"

export async function sendWalletTransaction(params: {
  to: Address
  value: string
  data?: `0x${string}`
}) {
  // Convert ETH value to wei
  const value = parseEther(params.value)
  return getContainer().walletEffects.sendTransaction({
    to: params.to,
    value,
    ...(params.data && { data: params.data }),
  })
}

export async function switchToChain(chainId: number) {
  return getContainer().walletEffects.switchChain(chainId)
}
