import { describe, expect, test as it } from "bun:test"
import { handleHyperliquidTool } from "./hyperliquid-handlers.js"

// Integration tests for Hyperliquid handlers
// These tests validate the basic flow and error handling
// The unit tests in hyperliquid-handlers.test.ts handle detailed mocking

describe("handleHyperliquidTool integration tests", () => {
  const testPrivateKey = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

  // Note: These tests validate basic error handling and input validation
  // They don't make real API calls or require complex mocking

  describe("hl_import_wallet", () => {
    it("should import wallet and return address", async () => {
      const result = await handleHyperliquidTool({
        params: {
          name: "hl_import_wallet",
          arguments: { privateKey: testPrivateKey },
        },
        method: "tools/call",
      })

      expect(result.content).toBeDefined()
      expect(result.content[0].text).toContain("Hyperliquid wallet imported successfully")
      expect(result.content[0].text).toMatch(/Address: 0x[a-fA-F0-9]{40}/)
    })

    it("should reject invalid private key", async () => {
      await expect(
        handleHyperliquidTool({
          params: {
            name: "hl_import_wallet",
            arguments: { privateKey: "invalid" },
          },
          method: "tools/call",
        }),
      ).rejects.toThrow("Invalid private key format")
    })

    it("should reject private key without 0x prefix", async () => {
      await expect(
        handleHyperliquidTool({
          params: {
            name: "hl_import_wallet",
            arguments: { privateKey: testPrivateKey.slice(2) },
          },
          method: "tools/call",
        }),
      ).rejects.toThrow("Invalid private key format")
    })
  })

  describe("tool validation", () => {
    it("should validate place order parameters", async () => {
      await expect(
        handleHyperliquidTool({
          params: {
            name: "hl_place_order",
            arguments: {
              coin: "BTC",
              isBuy: true,
              sz: -1, // Invalid negative size
            },
          },
          method: "tools/call",
        }),
      ).rejects.toThrow()
    })

    it("should validate transfer parameters", async () => {
      await expect(
        handleHyperliquidTool({
          params: {
            name: "hl_transfer",
            arguments: {
              destination: "0x1234567890123456789012345678901234567890",
              amount: -100, // Invalid negative amount
            },
          },
          method: "tools/call",
        }),
      ).rejects.toThrow()
    })

    it("should handle unknown tool", async () => {
      await expect(
        handleHyperliquidTool({
          params: {
            name: "hl_unknown_tool",
            arguments: {},
          },
          method: "tools/call",
        }),
      ).rejects.toThrow("Unknown tool")
    })
  })

  // Skip API interaction tests as they require real SDK initialization
  // These are better tested in the unit tests with proper mocking
})
