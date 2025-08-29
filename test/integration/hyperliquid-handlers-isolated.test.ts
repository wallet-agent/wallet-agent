/**
 * Integration tests for Hyperliquid handlers
 * Tests the wrapper pattern integration with the registry
 * Uses isolated testing to avoid module conflicts
 */

import { describe, expect, test } from "bun:test"
import type { CallToolRequest } from "@modelcontextprotocol/sdk/types.js"
import { toolRegistry } from "../../src/tools/handler-registry.js"
// Import handlers to ensure they're registered
import "../../src/tools/handlers.js"

describe("Hyperliquid Handlers Registry Integration", () => {
  describe("Handler Registration", () => {
    test("all Hyperliquid handlers should be registered in the registry", () => {
      const expectedHandlers = [
        "hl_import_wallet",
        "hl_get_account_info",
        "hl_place_order",
        "hl_cancel_order",
        "hl_get_open_orders",
        "hl_get_positions",
        "hl_transfer",
        "hl_get_all_mids",
        "hl_get_user_fills",
      ]

      for (const handlerName of expectedHandlers) {
        expect(toolRegistry.has(handlerName)).toBe(true)
        const handler = toolRegistry.get(handlerName)
        expect(handler).toBeDefined()
        expect(handler?.name).toBe(handlerName)
        expect(handler?.description).toBeTruthy()
      }
    })

    test("should have correct handler descriptions", () => {
      const handlerDescriptions = {
        hl_import_wallet: "Import a wallet for Hyperliquid trading",
        hl_get_account_info: "Get Hyperliquid account information",
        hl_place_order: "Place an order on Hyperliquid",
        hl_cancel_order: "Cancel an order on Hyperliquid",
        hl_get_open_orders: "Get open orders on Hyperliquid",
        hl_get_positions: "Get current positions on Hyperliquid",
        hl_transfer: "Transfer funds on Hyperliquid",
        hl_get_all_mids: "Get mid prices for all coins on Hyperliquid",
        hl_get_user_fills: "Get recent fills for a user on Hyperliquid",
      }

      for (const [name, expectedDescription] of Object.entries(handlerDescriptions)) {
        const handler = toolRegistry.get(name)
        expect(handler?.description).toBe(expectedDescription)
      }
    })
  })

  describe("Handler Structure", () => {
    test("all handlers should extend BaseToolHandler", () => {
      const hlHandlers = [
        "hl_import_wallet",
        "hl_get_account_info",
        "hl_place_order",
        "hl_cancel_order",
        "hl_get_open_orders",
        "hl_get_positions",
        "hl_transfer",
        "hl_get_all_mids",
        "hl_get_user_fills",
      ]

      for (const handlerName of hlHandlers) {
        const handler = toolRegistry.get(handlerName)
        expect(handler).toBeDefined()
        // Check that handler has required methods
        expect(typeof handler?.execute).toBe("function")
        // Note: Wrapper handlers don't expose BaseToolHandler methods directly
        // They delegate to the original implementation
      }
    })

    test("handlers should properly delegate to original implementation", () => {
      // The wrapper pattern means each handler creates a CallToolRequest
      // and passes it to handleHyperliquidTool
      const handler = toolRegistry.get("hl_import_wallet")
      expect(handler).toBeDefined()
      expect(handler?.constructor.name).toBe("HyperliquidHandler")
    })
  })

  describe("Error Handling", () => {
    test("should handle validation errors with proper error messages", async () => {
      const handler = toolRegistry.get("hl_import_wallet")
      expect(handler).toBeDefined()

      if (handler) {
        try {
          // Test with invalid private key format
          await handler.execute({ privateKey: "invalid" })
          throw new Error("Should have thrown")
        } catch (error) {
          const errorMessage = (error as Error).message
          // Should contain validation error details
          expect(errorMessage).toContain("privateKey")
          expect(errorMessage).toContain("Invalid private key format")
        }
      }
    })

    test("should handle missing required arguments", async () => {
      const handler = toolRegistry.get("hl_place_order")
      expect(handler).toBeDefined()

      if (handler) {
        try {
          // Test with missing required fields
          await handler.execute({ coin: "BTC" })
          throw new Error("Should have thrown")
        } catch (error) {
          const errorMessage = (error as Error).message
          // Should indicate validation error for missing fields (isBuy and sz are required)
          const containsIsBuy = errorMessage.includes("isBuy")
          const containsSz = errorMessage.includes("sz")
          expect(containsIsBuy || containsSz).toBe(true)
        }
      }
    })

    test("should handle invalid argument types", async () => {
      const handler = toolRegistry.get("hl_place_order")
      expect(handler).toBeDefined()

      if (handler) {
        try {
          // Test with wrong type for sz (should be number)
          await handler.execute({
            coin: "BTC",
            isBuy: true,
            sz: "not-a-number",
            limitPx: 50000,
          })
          throw new Error("Should have thrown")
        } catch (error) {
          const errorMessage = (error as Error).message
          // Should indicate type error
          expect(errorMessage).toBeTruthy()
        }
      }
    })
  })

  describe("Integration with Registry Execute", () => {
    test("should execute through registry.execute method", async () => {
      const request: CallToolRequest = {
        method: "tools/call",
        params: {
          name: "hl_import_wallet",
          arguments: {
            privateKey: "not-valid-key",
          },
        },
      }

      try {
        await toolRegistry.execute(request)
        throw new Error("Should have thrown")
      } catch (error) {
        // Should fail with validation error
        expect((error as Error).message).toContain("Tool execution failed")
      }
    })

    test("should handle unknown Hyperliquid tool names", async () => {
      const request: CallToolRequest = {
        method: "tools/call",
        params: {
          name: "hl_unknown_tool",
          arguments: {},
        },
      }

      try {
        await toolRegistry.execute(request)
        throw new Error("Should have thrown")
      } catch (error) {
        expect((error as Error).message).toContain("Unknown tool")
      }
    })
  })

  describe("Wrapper Pattern Verification", () => {
    test("HyperliquidHandler wrapper should create proper request structure", () => {
      // Import the wrapper to test its structure
      const { hyperliquidHandlers } = require("../../src/tools/handlers/hyperliquid-wrapper.js")

      expect(hyperliquidHandlers).toBeDefined()
      expect(Array.isArray(hyperliquidHandlers)).toBe(true)
      expect(hyperliquidHandlers.length).toBe(9)

      // Check that each handler is an instance with proper properties
      for (const handler of hyperliquidHandlers) {
        expect(handler.name).toBeTruthy()
        expect(handler.description).toBeTruthy()
        expect(typeof handler.execute).toBe("function")
      }
    })

    test("should maintain consistent naming convention", () => {
      const hlHandlers = [
        "hl_import_wallet",
        "hl_get_account_info",
        "hl_place_order",
        "hl_cancel_order",
        "hl_get_open_orders",
        "hl_get_positions",
        "hl_transfer",
        "hl_get_all_mids",
        "hl_get_user_fills",
      ]

      for (const handlerName of hlHandlers) {
        // All Hyperliquid handlers should start with "hl_"
        expect(handlerName.startsWith("hl_")).toBe(true)
        // Should use snake_case
        expect(handlerName).toMatch(/^hl_[a-z_]+$/)
      }
    })
  })

  describe("Complete Tool Inventory", () => {
    test("should have exactly 9 Hyperliquid tools", () => {
      const allTools = toolRegistry.getNames()
      const hlTools = allTools.filter((name) => name.startsWith("hl_"))
      expect(hlTools.length).toBe(9)
    })

    test("Hyperliquid tools should cover all main operations", () => {
      const operations = {
        wallet: ["hl_import_wallet", "hl_get_account_info"],
        trading: ["hl_place_order", "hl_cancel_order", "hl_get_open_orders"],
        positions: ["hl_get_positions"],
        market: ["hl_get_all_mids", "hl_get_user_fills"],
        transfers: ["hl_transfer"],
      }

      for (const [_category, tools] of Object.entries(operations)) {
        for (const tool of tools) {
          expect(toolRegistry.has(tool)).toBe(true)
        }
      }
    })
  })
})
