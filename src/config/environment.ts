/**
 * Environment configuration for wallet-agent
 * Reads from environment variables to configure optional features
 */

export interface WalletAgentConfig {
  // API configuration for pro features
  apiKey?: string
  apiUrl: string
  hasProFeatures: boolean

  // Hyperliquid configuration
  hyperliquidEndpoint?: string
  hyperliquidNetwork?: "mainnet" | "testnet"
}

/**
 * Configuration loaded from environment variables
 */
export const config: WalletAgentConfig = {
  // Pro API configuration
  apiKey: process.env.WALLET_AGENT_API_KEY,
  apiUrl: process.env.WALLET_AGENT_API_URL || "https://api.wallet-agent.ai",
  hasProFeatures: !!process.env.WALLET_AGENT_API_KEY,

  // Hyperliquid configuration
  hyperliquidEndpoint: process.env.HYPERLIQUID_ENDPOINT,
  hyperliquidNetwork: (process.env.HYPERLIQUID_NETWORK as "mainnet" | "testnet") || "mainnet",
}

/**
 * Get the appropriate Hyperliquid endpoint
 */
export function getHyperliquidEndpoint(): string {
  if (config.hyperliquidEndpoint) {
    return config.hyperliquidEndpoint
  }

  return config.hyperliquidNetwork === "mainnet"
    ? "https://api.hyperliquid.xyz"
    : "https://api.hyperliquid-testnet.xyz"
}
