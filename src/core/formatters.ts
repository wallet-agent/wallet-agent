import { formatEther } from "viem"

/**
 * Format wei value to human-readable ether string
 */
export function formatBalance(balanceWei: bigint, decimals: number = 4): string {
  const etherValue = formatEther(balanceWei)
  const numberValue = Number.parseFloat(etherValue)
  return numberValue.toFixed(decimals).replace(/\.?0+$/, "")
}

/**
 * Shorten an address for display
 */
export function shortenAddress(address: string, chars = 4): string {
  if (!address || address.length < 10) return address
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

/**
 * Format chain name for display
 */
export function formatChainName(name: string): string {
  return name
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

/**
 * Format error message for user display
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === "string") {
    return error
  }
  return "An unknown error occurred"
}
