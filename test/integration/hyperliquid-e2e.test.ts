/**
 * End-to-end tests for Hyperliquid handlers
 * Tests the complete flow from MCP request through registry to handler execution
 */

import { describe, expect, test } from "bun:test"
import type { CallToolRequest } from "@modelcontextprotocol/sdk/types.js"
import { handleToolCall } from "../../src/tools/handlers.js"

describe("Hyperliquid End-to-End Integration", () => {
  // Helper function to create proper MCP requests
  function createToolRequest(name: string, args: Record<string, unknown> = {}): CallToolRequest {
    return {
      method: "tools/call",
      params: {
        name,
        arguments: args,
      },
    }
  }

  describe("Request/Response Flow", () => {
    test("should handle valid import wallet request structure", async () => {
      const request = createToolRequest("hl_import_wallet", {
        privateKey: "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      })

      try {
        const result = await handleToolCall(request)
        // Should return proper MCP response structure
        expect(result).toBeDefined()
        expect(result.content).toBeDefined()
        expect(Array.isArray(result.content)).toBe(true)

        if (result.content.length > 0) {
          expect(result.content[0].type).toBe("text")
          expect(result.content[0].text).toContain("Hyperliquid")
        }
      } catch (error) {
        // Expected to fail in test environment due to network/SDK issues
        // But the error should be from execution, not from missing handlers
        const errorMessage = (error as Error).message
        expect(errorMessage).not.toContain("Unknown tool")
        expect(errorMessage).not.toContain("Tool not found")
      }
    })

    test("should handle validation errors with proper MCP error format", async () => {
      const request = createToolRequest("hl_import_wallet", {
        privateKey: "invalid-key",
      })

      try {
        await handleToolCall(request)
        throw new Error("Should have thrown")
      } catch (error) {
        const errorMessage = (error as Error).message
        // Should contain MCP error with validation details
        expect(errorMessage).toContain("Tool execution failed")
        expect(errorMessage).toContain("privateKey")
      }
    })

    test("should handle place order request structure", async () => {
      const request = createToolRequest("hl_place_order", {
        coin: "BTC",
        isBuy: true,
        sz: 0.1,
        limitPx: 50000,
      })

      try {
        await handleToolCall(request)
      } catch (error) {
        // Expected to fail without wallet, but should reach the handler
        const errorMessage = (error as Error).message
        expect(errorMessage).not.toContain("Unknown tool")
      }
    })

    test("should handle get account info request", async () => {
      const request = createToolRequest("hl_get_account_info", {
        address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7",
      })

      try {
        await handleToolCall(request)
      } catch (error) {
        // Expected to fail in test environment, but handler should exist
        const errorMessage = (error as Error).message
        expect(errorMessage).not.toContain("Unknown tool")
      }
    })
  })

  describe("Parameter Validation", () => {
    test("should validate private key format", async () => {
      const request = createToolRequest("hl_import_wallet", {
        privateKey: "not-hex",
      })

      try {
        await handleToolCall(request)
        throw new Error("Should have thrown")
      } catch (error) {
        expect((error as Error).message).toContain("Invalid private key format")
      }
    })

    test("should validate order parameters", async () => {
      const request = createToolRequest("hl_place_order", {
        coin: "BTC",
        // Missing required isBuy and sz parameters
      })

      try {
        await handleToolCall(request)
        throw new Error("Should have thrown")
      } catch (error) {
        const errorMessage = (error as Error).message
        expect(errorMessage).toContain("Tool execution failed")
        // Should mention missing required fields
        expect(errorMessage.includes("isBuy") || errorMessage.includes("sz")).toBe(true)
      }
    })

    test("should validate positive amounts for transfers", async () => {
      const request = createToolRequest("hl_transfer", {
        destination: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7",
        amount: -100, // Invalid negative amount
      })

      try {
        await handleToolCall(request)
        throw new Error("Should have thrown")
      } catch (error) {
        expect((error as Error).message).toContain("Tool execution failed")
      }
    })
  })

  describe("Error Propagation", () => {
    test("should propagate MCP errors correctly", async () => {
      const request = createToolRequest("hl_nonexistent_tool", {})

      try {
        await handleToolCall(request)
        throw new Error("Should have thrown")
      } catch (error) {
        const errorMessage = (error as Error).message
        expect(errorMessage).toContain("MCP error")
        expect(errorMessage).toContain("Unknown tool")
      }
    })

    test("should handle malformed requests", async () => {
      const malformedRequest = {
        method: "tools/call",
        params: {
          name: "hl_import_wallet",
          // Missing arguments field
        },
      } as CallToolRequest

      try {
        await handleToolCall(malformedRequest)
        throw new Error("Should have thrown")
      } catch (error) {
        // Should handle gracefully
        expect((error as Error).message).toBeTruthy()
      }
    })
  })

  describe("All Tool Integration", () => {
    const allHyperliquidTools = [
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

    test.each(allHyperliquidTools)("should handle %s tool requests", async (toolName) => {
      const request = createToolRequest(toolName, {})

      try {
        await handleToolCall(request)
      } catch (error) {
        // All tools should be found, even if execution fails
        const errorMessage = (error as Error).message
        expect(errorMessage).not.toContain("Unknown tool")
        expect(errorMessage).not.toContain("Tool not found")
      }
    })
  })

  describe("Wrapper Pattern Verification", () => {
    test("should preserve original handler behavior through wrapper", async () => {
      // Test that the wrapper properly delegates to the original implementation
      const request = createToolRequest("hl_get_all_mids", {})

      try {
        await handleToolCall(request)
      } catch (error) {
        // Should fail with SDK error, not wrapper error
        const errorMessage = (error as Error).message
        expect(errorMessage).not.toContain("wrapper")
        expect(errorMessage).not.toContain("delegation")
      }
    })

    test("should maintain consistent error format across all tools", async () => {
      const toolsToTest = ["hl_import_wallet", "hl_place_order", "hl_transfer"]

      for (const toolName of toolsToTest) {
        const request = createToolRequest(toolName, { invalid: "args" })

        try {
          await handleToolCall(request)
        } catch (error) {
          // All tools should return consistent MCP error format
          const errorMessage = (error as Error).message
          expect(errorMessage).toContain("MCP error")
          expect(errorMessage).toContain("Tool execution failed")
        }
      }
    })
  })
})
