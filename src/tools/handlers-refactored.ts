import type { CallToolRequest } from "@modelcontextprotocol/sdk/types.js"
import { type ToolResponse, toolRegistry } from "./handler-registry.js"
import { chainHandlers } from "./handlers/chain-handlers.js"
import { contractHandlers } from "./handlers/contract-handlers.js"
import { miscHandlers } from "./handlers/misc-handlers.js"
import { signingHandlers } from "./handlers/signing-handlers.js"
import { tokenHandlers } from "./handlers/token-handlers.js"
import { transactionHandlers } from "./handlers/transaction-handlers.js"
// Import all handler groups
import { walletHandlers } from "./handlers/wallet-handlers.js"
import { walletManagementHandlers } from "./handlers/wallet-management-handlers.js"
import { handleHyperliquidTool } from "./hyperliquid-handlers.js"

// Register all handlers when this module is loaded
function registerAllHandlers() {
  toolRegistry.registerAll([
    ...walletHandlers,
    ...signingHandlers,
    ...transactionHandlers,
    ...chainHandlers,
    ...walletManagementHandlers,
    ...contractHandlers,
    ...tokenHandlers,
    ...miscHandlers,
  ])
}

// Initialize handlers on module load
registerAllHandlers()

/**
 * Main entry point for handling tool calls
 * Now delegates to the registry for clean, maintainable handling
 */
export async function handleToolCall(request: CallToolRequest): Promise<ToolResponse> {
  const { name } = request.params

  // Special case for Hyperliquid tools (until we refactor those too)
  if (name.startsWith("hyperliquid_")) {
    return handleHyperliquidTool(request)
  }

  // Use the registry for all other tools
  return toolRegistry.execute(request)
}

/**
 * Get list of all available tool names
 * Useful for documentation and discovery
 */
export function getAvailableTools(): string[] {
  const registryTools = toolRegistry.getNames()
  const hyperliquidTools = [
    "hyperliquid_get_account_info",
    "hyperliquid_place_order",
    "hyperliquid_cancel_order",
    "hyperliquid_get_open_orders",
    "hyperliquid_get_all_mids",
    "hyperliquid_get_user_fills",
    "hyperliquid_get_open_positions",
    "hyperliquid_get_user_balance",
    "hyperliquid_transfer_spot",
  ]

  return [...registryTools, ...hyperliquidTools].sort()
}
