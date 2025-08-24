/**
 * Wrapper for Hyperliquid handlers using the registry pattern
 * This delegates to the original implementation while fitting into the new architecture
 */

import type { CallToolRequest } from "@modelcontextprotocol/sdk/types.js"
import { BaseToolHandler } from "../handler-registry.js"
import { handleHyperliquidTool } from "../hyperliquid-handlers.js"

/**
 * Generic Hyperliquid handler that wraps the original implementation
 */
class HyperliquidHandler extends BaseToolHandler {
  async execute(args: unknown) {
    // Create a request object that matches what the original handler expects
    const request: CallToolRequest = {
      params: {
        name: this.name,
        arguments: args as Record<string, unknown>,
      },
      method: "tools/call",
    }

    // Delegate to the original implementation
    return handleHyperliquidTool(request)
  }
}

// Create handlers for all Hyperliquid tools
export const hyperliquidHandlers = [
  new HyperliquidHandler("hl_import_wallet", "Import a wallet for Hyperliquid trading"),
  new HyperliquidHandler("hl_get_account_info", "Get Hyperliquid account information"),
  new HyperliquidHandler("hl_place_order", "Place an order on Hyperliquid"),
  new HyperliquidHandler("hl_cancel_order", "Cancel an order on Hyperliquid"),
  new HyperliquidHandler("hl_get_open_orders", "Get open orders on Hyperliquid"),
  new HyperliquidHandler("hl_get_positions", "Get current positions on Hyperliquid"),
  new HyperliquidHandler("hl_transfer", "Transfer funds on Hyperliquid"),
  new HyperliquidHandler("hl_get_all_mids", "Get mid prices for all coins on Hyperliquid"),
  new HyperliquidHandler("hl_get_user_fills", "Get recent fills for a user on Hyperliquid"),
]
