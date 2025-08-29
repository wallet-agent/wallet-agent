import { describe, expect, it } from "bun:test"
import { addCustomChain, removeCustomChain, updateCustomChain } from "../../src/chains.js"
import { Container } from "../../src/container.js"

describe("chains.ts unit tests", () => {
  describe("addCustomChain", () => {
    it("should add a chain successfully with valid config", async () => {
      const chain = addCustomChain(999111, "Test Chain", "https://test.com", {
        name: "Test",
        symbol: "TEST",
        decimals: 18,
      })

      expect(chain.id).toBe(999111)
      expect(chain.name).toBe("Test Chain")
    })
  })

  describe("updateCustomChain", () => {
    it("should handle RPC URL validation error", async () => {
      // First add a chain
      addCustomChain(999112, "Test Chain", "https://test.com", {
        name: "Test",
        symbol: "TEST",
        decimals: 18,
      })

      // Now try to update with invalid RPC URL (this will hit our chains.ts validation)
      expect(() => {
        updateCustomChain(999112, {
          rpcUrl: "ftp://invalid-protocol.com", // Invalid protocol
        })
      }).toThrow("RPC URL must start with http:// or https://")
    })

    it("should handle native currency validation with ZodError", async () => {
      // First add a chain
      addCustomChain(999113, "Test Chain 2", "https://test2.com", {
        name: "Test2",
        symbol: "TEST2",
        decimals: 18,
      })

      // Now try to update with invalid native currency that would trigger ZodError
      // We need to test the ZodError path in updateCustomChain
      expect(() => {
        updateCustomChain(999113, {
          nativeCurrency: {
            name: "", // Empty name should trigger validation error
            symbol: "TEST2",
            decimals: 18,
          },
        })
      }).toThrow("Invalid native currency")
    })

    it("should handle native currency validation with zero decimals", async () => {
      // First add a chain
      addCustomChain(999114, "Test Chain 3", "https://test3.com", {
        name: "Test3",
        symbol: "TEST3",
        decimals: 18,
      })

      // Update with zero decimals - should fail (positive() means >0)
      expect(() => {
        updateCustomChain(999114, {
          nativeCurrency: {
            name: "Updated Test3",
            symbol: "UTEST3",
            decimals: 0, // Zero should fail with positive() validation
          },
        })
      }).toThrow("Invalid native currency")
    })

    it("should handle native currency validation with negative decimals", async () => {
      // First add a chain
      addCustomChain(999115, "Test Chain 4", "https://test4.com", {
        name: "Test4",
        symbol: "TEST4",
        decimals: 18,
      })

      // Try to update with negative decimals
      expect(() => {
        updateCustomChain(999115, {
          nativeCurrency: {
            name: "Updated Test4",
            symbol: "UTEST4",
            decimals: -1, // Negative should fail
          },
        })
      }).toThrow("Invalid native currency")
    })
  })

  describe("removeCustomChain", () => {
    it("should prevent removing currently connected chain", async () => {
      // Add a custom chain
      addCustomChain(999116, "Connected Chain", "https://connected.com", {
        name: "Connected",
        symbol: "CONN",
        decimals: 18,
      })

      // Mock the wallet effects to return this chain as current
      const container = Container.getInstance()
      const originalGetChainId = container.walletEffects.getChainId
      container.walletEffects.getChainId = () => 999116

      try {
        expect(() => {
          removeCustomChain(999116)
        }).toThrow("Cannot remove the currently connected chain")
      } finally {
        // Restore original method
        container.walletEffects.getChainId = originalGetChainId
      }
    })

    it("should successfully remove a non-connected chain", async () => {
      // Add a custom chain
      addCustomChain(999117, "Removable Chain", "https://removable.com", {
        name: "Removable",
        symbol: "REM",
        decimals: 18,
      })

      // Mock the wallet effects to return a different chain as current
      const container = Container.getInstance()
      const originalGetChainId = container.walletEffects.getChainId
      container.walletEffects.getChainId = () => 31337 // Anvil chain

      try {
        expect(() => {
          removeCustomChain(999117)
        }).not.toThrow()
      } finally {
        // Restore original method
        container.walletEffects.getChainId = originalGetChainId
      }
    })
  })
})
