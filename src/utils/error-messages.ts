/**
 * Standardized error messages for better user experience
 */

export const ErrorMessages = {
  // Wallet connection errors
  WALLET_NOT_CONNECTED:
    "No wallet is currently connected. Please connect a wallet first using connect_wallet.",
  WALLET_ALREADY_CONNECTED:
    "A wallet is already connected. Disconnect first if you want to connect a different wallet.",
  INVALID_WALLET_ADDRESS:
    "Invalid wallet address format. Please provide a valid Ethereum address starting with '0x'.",
  PRIVATE_KEY_NOT_FOUND:
    "The specified address is not in your imported private keys. Import it first using import_private_key.",
  MOCK_ACCOUNT_NOT_FOUND: "The specified address is not in the list of available mock accounts.",

  // Chain errors
  CHAIN_NOT_FOUND: (chainId: number) =>
    `Chain ${chainId} not found. Add it using add_custom_chain or switch to an available chain.`,
  CHAIN_ALREADY_EXISTS: (chainId: number) =>
    `Chain ${chainId} already exists. Use update_custom_chain to modify it or choose a different chain ID.`,
  INVALID_CHAIN_CONFIG:
    "Invalid chain configuration. Please check the chain ID, name, RPC URL, and native currency.",
  BUILTIN_CHAIN_REMOVAL: "Cannot remove built-in chains. Only custom chains can be removed.",

  // Contract errors
  CONTRACT_NOT_FOUND: (contract: string) =>
    `Contract '${contract}' not found. Please provide a contract address or load the contract ABI first using load_wagmi_config.`,
  CONTRACT_FUNCTION_NOT_FOUND: (contract: string, func: string) =>
    `Function '${func}' not found in contract '${contract}'. Check the contract ABI for available functions.`,
  CONTRACT_ADDRESS_REQUIRED: (contract: string) =>
    `Built-in contract '${contract}' requires an explicit address parameter.`,
  INVALID_CONTRACT_ADDRESS:
    "Invalid contract address format. Please provide a valid Ethereum address.",

  // Transaction errors
  INSUFFICIENT_BALANCE: (required: string, available: string, symbol: string) =>
    `Insufficient balance. Required: ${required} ${symbol}, Available: ${available} ${symbol}`,
  TRANSACTION_SIMULATION_FAILED: (reason: string) =>
    `Transaction simulation failed: ${reason}. The transaction would likely fail if executed.`,
  GAS_ESTIMATION_FAILED:
    "Failed to estimate gas for the transaction. Please check the transaction parameters.",
  TRANSACTION_NOT_FOUND: (hash: string) =>
    `Transaction ${hash} not found on the current chain. It may not exist or may be on a different network.`,

  // Token errors
  TOKEN_NOT_FOUND: (token: string) =>
    `Token '${token}' not found. Please provide a token contract address or use a recognized token symbol.`,
  INVALID_TOKEN_AMOUNT: "Invalid token amount. Please provide a valid number greater than 0.",
  TOKEN_TRANSFER_FAILED: (reason: string) =>
    `Token transfer failed: ${reason}. Check your balance and allowances.`,

  // General validation errors
  INVALID_ARGUMENTS: (details: string) =>
    `Invalid arguments provided: ${details}. Please check the parameter format and try again.`,
  REQUIRED_PARAMETER_MISSING: (param: string) =>
    `Required parameter '${param}' is missing. Please provide this parameter and try again.`,

  // RPC and network errors
  RPC_CONNECTION_FAILED: (url: string) =>
    `Failed to connect to RPC endpoint: ${url}. Please check the URL and network connectivity.`,
  NETWORK_ERROR: "Network error occurred. Please check your internet connection and try again.",

  // ENS errors
  ENS_MAINNET_ONLY:
    "ENS name resolution only works on Ethereum mainnet. Please switch to mainnet first.",
  ENS_RESOLUTION_FAILED: (name: string) =>
    `Failed to resolve ENS name '${name}'. The name may not exist or the resolver may be unavailable.`,

  // File and configuration errors
  WAGMI_CONFIG_NOT_LOADED:
    "Wagmi configuration not loaded. Use load_wagmi_config to load contract ABIs first.",
  INVALID_WAGMI_CONFIG: (path: string) =>
    `Invalid Wagmi configuration file at '${path}'. Please check the file format and content.`,

  // Private key errors
  INVALID_PRIVATE_KEY:
    "Invalid private key format. Please provide a valid hex string starting with '0x'.",
  PRIVATE_KEY_ALREADY_IMPORTED: (address: string) =>
    `Private key for address ${address} is already imported.`,
} as const

/**
 * Helper function to create user-friendly error messages for common scenarios
 */
export function createUserFriendlyError(error: unknown, context?: string): string {
  const baseMessage = error instanceof Error ? error.message : String(error)

  // Add context if provided
  const contextPrefix = context ? `[${context}] ` : ""

  // Check for common error patterns and provide helpful suggestions
  if (baseMessage.includes("insufficient funds")) {
    return `${contextPrefix}Insufficient funds to complete the transaction. Please check your balance and ensure you have enough tokens to cover the amount plus gas fees.`
  }

  if (baseMessage.includes("execution reverted")) {
    return `${contextPrefix}Transaction would be reverted by the smart contract. This usually means the contract rejected the transaction due to business logic (e.g., insufficient allowance, invalid parameters, or contract-specific conditions).`
  }

  if (baseMessage.includes("nonce too low")) {
    return `${contextPrefix}Transaction nonce is too low. This usually happens when transactions are sent out of order. Please try again.`
  }

  if (baseMessage.includes("gas limit")) {
    return `${contextPrefix}Gas limit too low for the transaction. Try increasing the gas limit or simplifying the transaction.`
  }

  if (baseMessage.includes("network") || baseMessage.includes("connection")) {
    return `${contextPrefix}Network connection issue. Please check your internet connection and RPC endpoint configuration.`
  }

  // Return the original message with context
  return `${contextPrefix}${baseMessage}`
}
