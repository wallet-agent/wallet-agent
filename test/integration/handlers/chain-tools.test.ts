import { beforeEach, describe, expect, it } from "bun:test"
import {
  expectToolExecutionError,
  expectToolSuccess,
  expectToolValidationError,
  setupContainer,
  TEST_ADDRESS_1,
} from "./setup.js"

describe("Chain Tools Integration", () => {
  setupContainer()

  beforeEach(async () => {
    // Set up wallet for operations - do this in beforeEach instead of beforeAll
    // to ensure fresh connection after container reset
    await expectToolSuccess("connect_wallet", {
      address: TEST_ADDRESS_1,
    })
  })

  describe("add_custom_chain", () => {
    it("should add a valid custom chain", async () => {
      const result = await expectToolSuccess("add_custom_chain", {
        chainId: 999999,
        name: "Test Chain",
        rpcUrl: "https://test-rpc.example.com",
        nativeCurrency: {
          name: "Test Token",
          symbol: "TEST",
          decimals: 18,
        },
      })

      expect(result.text).toContain("Custom chain added successfully")
      expect(result.text).toContain("Test Chain")
    })

    it("should handle chain configuration with zero decimals (edge case)", async () => {
      const result = await expectToolSuccess("add_custom_chain", {
        chainId: 999988,
        name: "Zero Decimal Chain",
        rpcUrl: "https://zero-decimal.example.com",
        nativeCurrency: {
          name: "Zero Decimal Token",
          symbol: "ZERO",
          decimals: 0, // Edge case: zero decimals should be valid
        },
      })

      expect(result.text).toContain("Custom chain added successfully")
      expect(result.text).toContain("Zero Decimal Chain")
    })

    it("should add a custom chain with block explorer", async () => {
      const result = await expectToolSuccess("add_custom_chain", {
        chainId: 999998,
        name: "Test Chain 2",
        rpcUrl: "https://test-rpc2.example.com",
        nativeCurrency: {
          name: "Test Token 2",
          symbol: "TEST2",
          decimals: 18,
        },
        blockExplorerUrl: "https://explorer.example.com",
      })

      expect(result.text).toContain("Custom chain added successfully")
      expect(result.text).toContain("Test Chain 2")
    })

    it("should validate chain ID parameter", async () => {
      await expectToolValidationError("add_custom_chain", {
        chainId: "invalid",
        name: "Test Chain",
        rpcUrl: "https://test-rpc.example.com",
        nativeCurrency: {
          name: "Test Token",
          symbol: "TEST",
          decimals: 18,
        },
      })
    })

    it("should handle invalid chain configuration - negative decimals", async () => {
      await expectToolValidationError("add_custom_chain", {
        chainId: 999997,
        name: "Test Chain",
        rpcUrl: "https://test-rpc.example.com",
        nativeCurrency: {
          name: "Test Token",
          symbol: "TEST",
          decimals: -1, // Invalid: negative decimals
        },
      })
    })

    it("should handle invalid chain configuration - empty name", async () => {
      await expectToolValidationError("add_custom_chain", {
        chainId: 999996,
        name: "", // Invalid: empty name
        rpcUrl: "https://test-rpc.example.com",
        nativeCurrency: {
          name: "Test Token",
          symbol: "TEST",
          decimals: 18,
        },
      })
    })

    it("should handle invalid chain configuration - empty currency symbol", async () => {
      await expectToolValidationError("add_custom_chain", {
        chainId: 999995,
        name: "Test Chain",
        rpcUrl: "https://test-rpc.example.com",
        nativeCurrency: {
          name: "Test Token",
          symbol: "", // Invalid: empty symbol
          decimals: 18,
        },
      })
    })
  })

  describe("update_custom_chain", () => {
    it("should update a custom chain", async () => {
      // First add a chain
      await expectToolSuccess("add_custom_chain", {
        chainId: 999994,
        name: "Original Chain",
        rpcUrl: "https://original-rpc.example.com",
        nativeCurrency: {
          name: "Original Token",
          symbol: "ORIG",
          decimals: 18,
        },
      })

      // Then update it
      const result = await expectToolSuccess("update_custom_chain", {
        chainId: 999994,
        name: "Updated Chain",
        rpcUrl: "https://updated-rpc.example.com",
      })

      expect(result.text).toContain("Custom chain 999994 updated successfully")
      expect(result.text).toContain("Updated Chain")
    })

    it("should validate RPC URL format", async () => {
      // First add a chain
      await expectToolSuccess("add_custom_chain", {
        chainId: 999993,
        name: "Test Chain",
        rpcUrl: "https://test-rpc.example.com",
        nativeCurrency: {
          name: "Test Token",
          symbol: "TEST",
          decimals: 18,
        },
      })

      // Try to update with invalid RPC URL
      await expectToolValidationError("update_custom_chain", {
        chainId: 999993,
        rpcUrl: "invalid-url", // Invalid: doesn't start with http
      })
    })

    it("should validate native currency updates - negative decimals", async () => {
      // First add a chain
      await expectToolSuccess("add_custom_chain", {
        chainId: 999992,
        name: "Test Chain",
        rpcUrl: "https://test-rpc.example.com",
        nativeCurrency: {
          name: "Test Token",
          symbol: "TEST",
          decimals: 18,
        },
      })

      // Try to update with invalid native currency
      await expectToolValidationError("update_custom_chain", {
        chainId: 999992,
        nativeCurrency: {
          name: "Updated Token",
          symbol: "UPD",
          decimals: -5, // Invalid: negative decimals
        },
      })
    })

    it("should validate native currency updates - empty symbol", async () => {
      // First add a chain
      await expectToolSuccess("add_custom_chain", {
        chainId: 999991,
        name: "Test Chain",
        rpcUrl: "https://test-rpc.example.com",
        nativeCurrency: {
          name: "Test Token",
          symbol: "TEST",
          decimals: 18,
        },
      })

      // Try to update with invalid native currency
      await expectToolValidationError("update_custom_chain", {
        chainId: 999991,
        nativeCurrency: {
          name: "Updated Token",
          symbol: "", // Invalid: empty symbol
          decimals: 18,
        },
      })
    })

    it("should handle non-existent chain ID", async () => {
      await expectToolExecutionError(
        "update_custom_chain",
        {
          chainId: 888888, // Non-existent chain
          name: "Updated Chain",
        },
        "Custom chain with ID 888888 not found",
      )
    })
  })

  describe("remove_custom_chain", () => {
    it("should remove a custom chain", async () => {
      // First add a chain
      await expectToolSuccess("add_custom_chain", {
        chainId: 999990,
        name: "Chain to Remove",
        rpcUrl: "https://remove-rpc.example.com",
        nativeCurrency: {
          name: "Remove Token",
          symbol: "REM",
          decimals: 18,
        },
      })

      // Then remove it
      const result = await expectToolSuccess("remove_custom_chain", {
        chainId: 999990,
      })

      expect(result.text).toContain("Custom chain 999990 removed successfully")
    })

    it("should prevent removing currently connected chain", async () => {
      // First add a chain
      await expectToolSuccess("add_custom_chain", {
        chainId: 999989,
        name: "Current Chain",
        rpcUrl: "https://current-rpc.example.com",
        nativeCurrency: {
          name: "Current Token",
          symbol: "CUR",
          decimals: 18,
        },
      })

      // Switch to this chain
      await expectToolSuccess("switch_chain", {
        chainId: 999989,
      })

      // Try to remove it while connected
      await expectToolExecutionError(
        "remove_custom_chain",
        {
          chainId: 999989,
        },
        "Cannot remove the currently connected chain",
      )

      // Switch back to default chain for cleanup
      await expectToolSuccess("switch_chain", {
        chainId: 31337, // Anvil chain
      })
    })

    it("should handle non-existent chain ID", async () => {
      await expectToolExecutionError(
        "remove_custom_chain",
        {
          chainId: 777777, // Non-existent chain
        },
        "Custom chain with ID 777777 not found",
      )
    })

    it("should validate chain ID parameter", async () => {
      await expectToolValidationError("remove_custom_chain", {
        chainId: "invalid",
      })
    })
  })
})
