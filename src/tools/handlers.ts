import type { CallToolRequest } from "@modelcontextprotocol/sdk/types.js"
import { toolRegistry } from "./handler-registry.js"
import { chainHandlers } from "./handlers/chain-handlers.js"
import { contractHandlers } from "./handlers/contract-handlers.js"
import { contractTestingHandlers } from "./handlers/contract-testing-handlers.js"
import { encryptedKeyHandlers } from "./handlers/encrypted-key-handlers.js"
import { hyperliquidHandlers } from "./handlers/hyperliquid-wrapper.js"
import { miscHandlers } from "./handlers/misc-handlers.js"
import { signingHandlers } from "./handlers/signing-handlers.js"
import { tokenHandlers } from "./handlers/token-handlers.js"
import { transactionHandlers } from "./handlers/transaction-handlers.js"
import { transactionSimulationHandlers } from "./handlers/transaction-simulation.js"
import { wagmiAbiHandlers } from "./handlers/wagmi-abi-handlers.js"
// Import all handler groups
import { walletHandlers } from "./handlers/wallet-handlers.js"
import { walletManagementHandlers } from "./handlers/wallet-management-handlers.js"

// Register all handlers when this module is loaded
function registerAllHandlers() {
  toolRegistry.registerAll([
    ...walletHandlers,
    ...signingHandlers,
    ...transactionHandlers,
    ...transactionSimulationHandlers,
    ...chainHandlers,
    ...walletManagementHandlers,
    ...contractHandlers,
    ...tokenHandlers,
    ...encryptedKeyHandlers,
    ...wagmiAbiHandlers,
    ...contractTestingHandlers,
    ...miscHandlers,
    ...hyperliquidHandlers,
  ])
}

// Initialize handlers on module load
registerAllHandlers()

/**
 * Main entry point for handling tool calls
 * Now delegates to the registry for clean, maintainable handling
 */
export async function handleToolCall(request: CallToolRequest) {
  // All tools now use the registry
  return toolRegistry.execute(request)
}

/**
 * Get list of all available tool names
 * Useful for documentation and discovery
 */
export function getAvailableTools(): string[] {
  return toolRegistry.getNames().sort()
}
