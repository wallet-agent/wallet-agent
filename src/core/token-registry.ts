import type { Address } from "viem"

/**
 * Well-known token information
 */
export interface TokenInfo {
  symbol: string
  name: string
  decimals: number
  addresses: Record<number, Address> // chainId -> address
}

/**
 * Registry of well-known ERC-20 tokens
 */
export const WELL_KNOWN_TOKENS: Record<string, TokenInfo> = {
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    addresses: {
      1: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // Mainnet
      10: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", // Optimism
      137: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // Polygon
      8453: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base
      42161: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // Arbitrum
      11155111: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // Sepolia
    },
  },
  USDT: {
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    addresses: {
      1: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // Mainnet
      10: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", // Optimism
      137: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", // Polygon
      8453: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2", // Base
      42161: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", // Arbitrum
    },
  },
  DAI: {
    symbol: "DAI",
    name: "Dai Stablecoin",
    decimals: 18,
    addresses: {
      1: "0x6B175474E89094C44Da98b954EedeAC495271d0F", // Mainnet
      10: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", // Optimism
      137: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", // Polygon
      8453: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb", // Base
      42161: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", // Arbitrum
      11155111: "0x68194a729C2450ad26072b3D33ADaCbcef39D574", // Sepolia
    },
  },
  WETH: {
    symbol: "WETH",
    name: "Wrapped Ether",
    decimals: 18,
    addresses: {
      1: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // Mainnet
      10: "0x4200000000000000000000000000000000000006", // Optimism
      137: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", // Polygon
      8453: "0x4200000000000000000000000000000000000006", // Base
      42161: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", // Arbitrum
      11155111: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9", // Sepolia
    },
  },
  LINK: {
    symbol: "LINK",
    name: "ChainLink Token",
    decimals: 18,
    addresses: {
      1: "0x514910771AF9Ca656af840dff83E8264EcF986CA", // Mainnet
      10: "0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6", // Optimism
      137: "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39", // Polygon
      8453: "0x88Fb150BDc53A65fe94Dea0c9BA0a6dAf8C6e196", // Base
      42161: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4", // Arbitrum
      11155111: "0x779877A7B0D9E8603169DdbD7836e478b4624789", // Sepolia
    },
  },
}

/**
 * Resolve a token identifier to an address
 * @param tokenOrAddress - Token symbol (e.g., "USDC") or address
 * @param chainId - Chain ID to resolve for
 * @returns The token address, or undefined if not found
 */
export function resolveTokenAddress(tokenOrAddress: string, chainId: number): Address | undefined {
  // Only resolve known token symbols, not raw addresses
  const tokenInfo = WELL_KNOWN_TOKENS[tokenOrAddress.toUpperCase()]
  if (tokenInfo) {
    return tokenInfo.addresses[chainId]
  }

  return undefined
}

/**
 * Get token info by address and chain
 */
export function getTokenInfoByAddress(address: Address, chainId: number): TokenInfo | undefined {
  for (const tokenInfo of Object.values(WELL_KNOWN_TOKENS)) {
    if (tokenInfo.addresses[chainId]?.toLowerCase() === address.toLowerCase()) {
      return tokenInfo
    }
  }
  return undefined
}

/**
 * Format token amount considering decimals
 * @param amount - Amount in smallest unit (wei for 18 decimals)
 * @param decimals - Number of decimals
 * @returns Formatted string
 */
export function formatTokenAmount(amount: bigint, decimals: number): string {
  const divisor = 10n ** BigInt(decimals)
  const whole = amount / divisor
  const remainder = amount % divisor

  if (remainder === 0n) {
    return whole.toString()
  }

  // Format with decimals
  const remainderStr = remainder.toString().padStart(decimals, "0")
  // Remove trailing zeros
  const trimmed = remainderStr.replace(/0+$/, "")

  return trimmed ? `${whole}.${trimmed}` : whole.toString()
}

/**
 * Get token info by symbol and chain ID
 * @param symbol - Token symbol (e.g., "USDC")
 * @param chainId - Chain ID
 * @returns Token info or undefined
 */
export function getTokenInfoBySymbol(symbol: string, chainId: number): TokenInfo | undefined {
  const upperSymbol = symbol.toUpperCase()
  const tokenInfo = WELL_KNOWN_TOKENS[upperSymbol]
  if (!tokenInfo) return undefined

  const chainInfo = tokenInfo.addresses[chainId]
  if (!chainInfo) return undefined

  return {
    ...tokenInfo,
    addresses: { [chainId]: chainInfo },
  }
}

/**
 * Parse token amount to smallest unit
 * @param amount - Human-readable amount (e.g., "100.5")
 * @param decimals - Number of decimals
 * @returns Amount in smallest unit
 */
export function parseTokenAmount(amount: string, decimals: number): bigint {
  // Handle negative amounts
  if (amount.startsWith("-")) {
    throw new Error("Negative amounts are not supported")
  }

  // Convert scientific notation to decimal
  let normalizedAmount = amount
  if (amount.includes("e") || amount.includes("E")) {
    const num = Number.parseFloat(amount)
    // If the number is an integer after parsing, convert it directly
    if (Number.isInteger(num)) {
      normalizedAmount = num.toString()
    } else {
      // For decimals, use appropriate precision
      const integerDigits = Math.floor(Math.abs(num)).toString().length
      const precision = Math.max(decimals, integerDigits + decimals)
      normalizedAmount = num.toFixed(precision)
    }
  }

  const [whole, fraction = ""] = normalizedAmount.split(".")
  const paddedFraction = fraction.padEnd(decimals, "0").slice(0, decimals)
  const combined = whole + paddedFraction
  return BigInt(combined)
}
