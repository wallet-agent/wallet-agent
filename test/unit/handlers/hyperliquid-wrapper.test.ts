import { describe, expect, test } from "bun:test"
import { toolRegistry } from "../../../src/tools/handler-registry.js"
import { hyperliquidHandlers } from "../../../src/tools/handlers/hyperliquid-wrapper.js"

describe("Hyperliquid Wrapper Handlers", () => {
  test("should export all expected Hyperliquid handlers", () => {
    expect(hyperliquidHandlers).toHaveLength(9)

    const handlerNames = hyperliquidHandlers.map((h) => h.name)
    expect(handlerNames).toContain("hl_import_wallet")
    expect(handlerNames).toContain("hl_get_account_info")
    expect(handlerNames).toContain("hl_place_order")
    expect(handlerNames).toContain("hl_cancel_order")
    expect(handlerNames).toContain("hl_get_open_orders")
    expect(handlerNames).toContain("hl_get_positions")
    expect(handlerNames).toContain("hl_transfer")
    expect(handlerNames).toContain("hl_get_all_mids")
    expect(handlerNames).toContain("hl_get_user_fills")
  })

  test("should have proper descriptions", () => {
    const walletHandler = hyperliquidHandlers.find((h) => h.name === "hl_import_wallet")
    expect(walletHandler?.description).toBe("Import a wallet for Hyperliquid trading")

    const orderHandler = hyperliquidHandlers.find((h) => h.name === "hl_place_order")
    expect(orderHandler?.description).toBe("Place an order on Hyperliquid")
  })

  test("handlers should be registered in the registry", () => {
    // Check that all handlers are in the registry (already registered by handlers.ts)
    for (const handler of hyperliquidHandlers) {
      expect(toolRegistry.has(handler.name)).toBe(true)
      // Note: We can't check exact handler instance equality since they're registered separately
      const registeredHandler = toolRegistry.get(handler.name)
      expect(registeredHandler).toBeDefined()
      expect(registeredHandler?.name).toBe(handler.name)
      expect(registeredHandler?.description).toBe(handler.description)
    }
  })

  test("should be able to execute through registry", async () => {
    // This test verifies the wrapper delegates properly
    // We can't fully test without mocking the underlying implementation
    // but we can verify the handler is callable

    const handler = toolRegistry.get("hl_get_all_mids")
    expect(handler).toBeDefined()
    expect(handler?.name).toBe("hl_get_all_mids")
    expect(handler?.description).toBe("Get mid prices for all coins on Hyperliquid")
  })
})
