/**
 * Standardized error messages for better user experience
 */

export const ErrorMessages = {
  // Wallet connection errors
  WALLET_NOT_CONNECTED:
    "No wallet connected. Connect with: 'Connect to [address]' or check available accounts with 'Show available accounts'",
  WALLET_ALREADY_CONNECTED: (address: string) =>
    `Wallet ${address} already connected. Use 'Disconnect wallet' first to connect a different wallet.`,
  INVALID_WALLET_ADDRESS:
    "Invalid wallet address format. Provide a valid Ethereum address starting with '0x' (42 characters total).",
  PRIVATE_KEY_NOT_FOUND: (availableCount: number) =>
    availableCount === 0
      ? "No private keys imported. Import one with 'Import private key [0x...]' or switch to mock wallet mode."
      : `Address not in imported private keys. Import this key or use one of ${availableCount} available keys with 'List imported wallets'.`,
  MOCK_ACCOUNT_NOT_FOUND:
    "Address not in mock accounts. Use 'Show available accounts' to see options.",

  // Chain errors
  CHAIN_NOT_FOUND: (chainId: number, currentChain?: string) =>
    `Chain ${chainId} not found${currentChain ? ` (currently on ${currentChain})` : ""}. Add custom chain with 'Add custom chain' or try: mainnet (1), Polygon (137), Arbitrum (42161).`,
  CHAIN_ALREADY_EXISTS: (chainId: number) =>
    `Chain ${chainId} already exists. Update it with 'Update custom chain ${chainId}' or use a different chain ID.`,
  INVALID_CHAIN_CONFIG:
    "Invalid chain configuration. Required: chainId (number), name (string), rpcUrl (https://...), nativeCurrency (name, symbol, decimals).",
  BUILTIN_CHAIN_REMOVAL: (chainName: string) =>
    `Cannot remove built-in chain '${chainName}'. Only custom chains can be removed. Use 'List custom chains' to see removable chains.`,

  // Contract errors
  CONTRACT_NOT_FOUND: (contract: string, hasWagmiConfig: boolean) =>
    `Contract '${contract}' not found. ${
      hasWagmiConfig
        ? `Check contract name with 'List contracts' or provide contract address directly.`
        : `Load contract config with 'Load my contract configuration' or provide contract address.`
    }`,
  CONTRACT_FUNCTION_NOT_FOUND: (contract: string, func: string, availableFunctions?: string[]) =>
    `Function '${func}' not found in contract '${contract}'. ${
      availableFunctions?.length
        ? `Available: ${availableFunctions.join(", ")}`
        : `Use 'List contracts' to see available functions.`
    }`,
  CONTRACT_ADDRESS_REQUIRED: (contract: string) =>
    `Built-in contract '${contract}' requires address parameter. Example: address: '0x...' or use 'Load my contract configuration'.`,
  INVALID_CONTRACT_ADDRESS:
    "Invalid contract address format. Provide valid Ethereum address: 42 characters starting with '0x'.",

  // Transaction errors
  INSUFFICIENT_BALANCE: (required: string, available: string, symbol: string, address?: string) =>
    `Insufficient ${symbol}. Need ${required}, have ${available}${
      address ? ` in ${address}` : ""
    }. Check balance with 'Get balance' or switch to funded account.`,
  TRANSACTION_SIMULATION_FAILED: (reason: string) =>
    `Transaction would fail: ${reason}. Check parameters, balances, and contract state before sending.`,
  GAS_ESTIMATION_FAILED: (details?: string) =>
    `Gas estimation failed${details ? `: ${details}` : ""}. Check transaction parameters or try with manual gas limit.`,
  TRANSACTION_NOT_FOUND: (hash: string, currentChain?: string) =>
    `Transaction ${hash} not found${
      currentChain ? ` on ${currentChain}` : ""
    }. Check transaction hash or switch to correct chain.`,

  // Token errors
  TOKEN_NOT_FOUND: (token: string, currentChain?: string) =>
    `Token '${token}' not found${
      currentChain ? ` on ${currentChain}` : ""
    }. Use contract address or check available tokens with 'What tokens are available?'`,
  INVALID_TOKEN_AMOUNT:
    "Invalid token amount. Provide positive number (e.g., '100', '0.5'). Use 'Get token balance' to check available amount.",
  TOKEN_TRANSFER_FAILED: (reason: string, token?: string) =>
    `${token ? `${token} ` : "Token "}transfer failed: ${reason}. Check balance with 'Get token balance' and allowances.`,

  // General validation errors
  INVALID_ARGUMENTS: (details: string, examples?: string) =>
    `Invalid arguments: ${details}.${examples ? ` Examples: ${examples}` : ""} Check parameter format and try again.`,
  REQUIRED_PARAMETER_MISSING: (param: string, example?: string) =>
    `Missing required parameter '${param}'.${example ? ` Example: ${example}` : ""} Add this parameter and retry.`,

  // RPC and network errors
  RPC_CONNECTION_FAILED: (url: string) =>
    `RPC connection failed: ${url}. Check URL format, network connectivity, or try different RPC endpoint.`,
  NETWORK_ERROR: "Network error. Check internet connection, RPC endpoints, or try again later.",

  // ENS errors
  ENS_MAINNET_ONLY: (currentChain?: string) =>
    `ENS only works on Ethereum mainnet${
      currentChain ? ` (currently on ${currentChain})` : ""
    }. Switch to mainnet with 'Switch to mainnet'.`,
  ENS_RESOLUTION_FAILED: (name: string) =>
    `ENS '${name}' resolution failed. Verify name exists at app.ens.domains or use direct address.`,

  // File and configuration errors
  WAGMI_CONFIG_NOT_LOADED:
    "No contract configuration loaded. Load with 'Load my contract configuration [path]' or provide contract addresses directly.",
  INVALID_WAGMI_CONFIG: (path: string) =>
    `Invalid Wagmi config at '${path}'. Check file exists and contains valid TypeScript contract exports.`,

  // Private key errors
  INVALID_PRIVATE_KEY:
    "Invalid private key format. Provide 64-character hex string starting with '0x' (66 characters total).",
  PRIVATE_KEY_ALREADY_IMPORTED: (address: string) =>
    `Private key for ${address} already imported. Use 'List imported wallets' to see all keys or connect to this address.`,

  // Context-aware error messages with current state
  CONTEXT_WALLET_STATE: (isConnected: boolean, address?: string, chainName?: string) =>
    isConnected
      ? `Current wallet: ${address} on ${chainName || "unknown chain"}`
      : "No wallet connected",
  CONTEXT_CHAIN_STATE: (chainName: string, chainId: number) =>
    `Current chain: ${chainName} (${chainId})`,
  CONTEXT_BALANCE_STATE: (balance: string, symbol: string) =>
    `Current balance: ${balance} ${symbol}`,
} as const

/**
 * Helper function to create user-friendly error messages for common scenarios
 * with enhanced context and actionable guidance
 */
export function createUserFriendlyError(
  error: unknown,
  context?: string,
  walletContext?: {
    isConnected: boolean
    address?: string
    chainName?: string
    balance?: string
    symbol?: string
  },
): string {
  const baseMessage = error instanceof Error ? error.message : String(error)
  const contextPrefix = context ? `[${context}] ` : ""

  // Add wallet context for better error messages
  const walletState = walletContext
    ? `\n${ErrorMessages.CONTEXT_WALLET_STATE(walletContext.isConnected, walletContext.address, walletContext.chainName)}`
    : ""

  // Check for common error patterns and provide helpful suggestions
  if (baseMessage.includes("insufficient funds")) {
    const balanceInfo = walletContext?.balance
      ? ` Current balance: ${walletContext.balance} ${walletContext.symbol || "ETH"}.`
      : ""
    return `${contextPrefix}Insufficient funds.${balanceInfo} Check balance with 'Get balance' or switch to funded account.${walletState}`
  }

  if (baseMessage.includes("execution reverted")) {
    return `${contextPrefix}Contract rejected transaction. Check parameters, balances, allowances, or contract conditions. Try 'Simulate transaction' first.${walletState}`
  }

  if (baseMessage.includes("nonce too low")) {
    return `${contextPrefix}Transaction nonce too low (sent out of order). Wait for pending transactions or try again.${walletState}`
  }

  if (baseMessage.includes("gas limit") || baseMessage.includes("out of gas")) {
    return `${contextPrefix}Insufficient gas. Estimate gas with 'Estimate gas' or increase gas limit manually.${walletState}`
  }

  if (baseMessage.includes("network") || baseMessage.includes("connection")) {
    return `${contextPrefix}Network connection failed. Check internet, RPC endpoints, or switch chain.${walletState}`
  }

  if (baseMessage.includes("unauthorized") || baseMessage.includes("not allowed")) {
    return `${contextPrefix}Unauthorized operation. Check wallet permissions, token allowances, or contract ownership.${walletState}`
  }

  if (baseMessage.includes("contract") && baseMessage.includes("not found")) {
    return `${contextPrefix}Contract not found. Verify address, switch to correct chain, or load contract configuration.${walletState}`
  }

  // Return enhanced message with context and wallet state
  return `${contextPrefix}${baseMessage}${walletState ? `\n${walletState.trim()}` : ""}`
}

/**
 * Create wallet context for enhanced error messages
 */
export function createWalletContext(walletEffects: {
  getCurrentAccount(): { isConnected: boolean; address?: string; chainId?: number }
  getBalance?(address?: string): Promise<{ balance: bigint; symbol: string }>
}): {
  isConnected: boolean
  address?: string
  chainName?: string
  chainId?: number
} {
  const account = walletEffects.getCurrentAccount()
  return {
    isConnected: account.isConnected,
    address: account.address,
    chainId: account.chainId,
    // We could add chain name resolution here if needed
  }
}

/**
 * Enhanced error message creator with automatic context gathering
 * Use this in tool handlers for better error messages
 */
export function createContextualError(
  error: unknown,
  context: string,
  walletEffects?: {
    getCurrentAccount(): { isConnected: boolean; address?: string; chainId?: number }
  },
): string {
  const walletContext = walletEffects ? createWalletContext(walletEffects) : undefined
  return createUserFriendlyError(error, context, walletContext)
}
