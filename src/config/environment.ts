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
  hyperliquidNetwork: "mainnet" | "testnet"
}

/**
 * Configuration loaded from environment variables
 * Uses getters to always return fresh values from process.env
 */
export const config: WalletAgentConfig = {
  // Pro API configuration
  get apiKey() {
    return process.env.WALLET_AGENT_API_KEY
  },
  get apiUrl() {
    return process.env.WALLET_AGENT_API_URL || "https://api.wallet-agent.ai"
  },
  get hasProFeatures() {
    return !!process.env.WALLET_AGENT_API_KEY
  },

  // Hyperliquid configuration
  get hyperliquidEndpoint() {
    return process.env.HYPERLIQUID_ENDPOINT
  },
  get hyperliquidNetwork() {
    return (process.env.HYPERLIQUID_NETWORK as "mainnet" | "testnet") || "mainnet"
  },
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
