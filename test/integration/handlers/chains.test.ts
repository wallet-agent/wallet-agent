import { describe, expect, test } from "bun:test"
import {
  expectToolSuccess,
  expectToolValidationError,
  setupContainer,
  TEST_ADDRESS_1,
} from "./setup.js"

describe("Chain Management Tools Integration", () => {
  setupContainer()

  describe("add_custom_chain", () => {
    test("should add a valid custom chain", async () => {
      const { text } = await expectToolSuccess(
        "add_custom_chain",
        {
          chainId: 12345,
          name: "Test Chain",
          rpcUrl: "https://test-rpc.example.com",
          nativeCurrency: {
            name: "Test Token",
            symbol: "TEST",
            decimals: 18,
          },
        },
        "Custom chain added successfully",
      )

      expect(text).toContain("Chain ID: 12345")
      expect(text).toContain("Name: Test Chain")
      expect(text).toContain("RPC URL: https://test-rpc.example.com")
      expect(text).toContain("Native Currency: TEST")
    })

    test("should add chain with block explorer", async () => {
      const { text } = await expectToolSuccess(
        "add_custom_chain",
        {
          chainId: 54321,
          name: "Explorer Chain",
          rpcUrl: "https://explorer-rpc.example.com",
          nativeCurrency: {
            name: "Explorer Token",
            symbol: "EXP",
            decimals: 18,
          },
          blockExplorerUrl: "https://explorer.example.com",
        },
        "Custom chain added successfully",
      )

      expect(text).toContain("Chain ID: 54321")
      expect(text).toContain("Name: Explorer Chain")
    })

    test("should validate chainId is positive", async () => {
      await expectToolValidationError(
        "add_custom_chain",
        {
          chainId: -1,
          name: "Invalid Chain",
          rpcUrl: "https://test.com",
          nativeCurrency: { name: "Test", symbol: "TST", decimals: 18 },
        },
        "Chain ID must be a positive integer",
      )
    })

    test("should validate RPC URL format", async () => {
      await expectToolValidationError(
        "add_custom_chain",
        {
          chainId: 12345,
          name: "Test Chain",
          rpcUrl: "not-a-url",
          nativeCurrency: { name: "Test", symbol: "TST", decimals: 18 },
        },
        "Invalid RPC URL",
      )
    })

    test("should validate native currency decimals", async () => {
      await expectToolValidationError(
        "add_custom_chain",
        {
          chainId: 12345,
          name: "Test Chain",
          rpcUrl: "https://test.com",
          nativeCurrency: { name: "Test", symbol: "TST", decimals: -1 },
        },
        "Too small: expected number to be >=0",
      )
    })

    test("should validate all required fields", async () => {
      // Missing chainId
      await expectToolValidationError(
        "add_custom_chain",
        {
          name: "Test Chain",
          rpcUrl: "https://test.com",
          nativeCurrency: { name: "Test", symbol: "TST", decimals: 18 },
        },
        "Invalid input: expected number",
      )

      // Missing name
      await expectToolValidationError(
        "add_custom_chain",
        {
          chainId: 12345,
          rpcUrl: "https://test.com",
          nativeCurrency: { name: "Test", symbol: "TST", decimals: 18 },
        },
        "Invalid input: expected string",
      )

      // Missing nativeCurrency
      await expectToolValidationError(
        "add_custom_chain",
        {
          chainId: 12345,
          name: "Test Chain",
          rpcUrl: "https://test.com",
        },
        "Invalid input: expected object",
      )
    })

    test("should validate native currency structure", async () => {
      // Missing symbol
      await expectToolValidationError(
        "add_custom_chain",
        {
          chainId: 12345,
          name: "Test Chain",
          rpcUrl: "https://test.com",
          nativeCurrency: { name: "Test", decimals: 18 },
        },
        "Invalid input: expected string",
      )

      // Invalid decimals type
      await expectToolValidationError(
        "add_custom_chain",
        {
          chainId: 12345,
          name: "Test Chain",
          rpcUrl: "https://test.com",
          nativeCurrency: { name: "Test", symbol: "TST", decimals: "eighteen" },
        },
        "Invalid input: expected number",
      )
    })

    test("should allow switching to custom chain after adding", async () => {
      // Add custom chain
      await expectToolSuccess("add_custom_chain", {
        chainId: 99999,
        name: "Switch Test Chain",
        rpcUrl: "https://switch-test.example.com",
        nativeCurrency: {
          name: "Switch Token",
          symbol: "SWT",
          decimals: 18,
        },
      })

      // Connect wallet and switch to custom chain
      await expectToolSuccess("connect_wallet", { address: TEST_ADDRESS_1 })

      const { text } = await expectToolSuccess(
        "switch_chain",
        { chainId: 99999 },
        "Switched to Switch Test Chain",
      )

      expect(text).toContain("Chain ID: 99999")
    })

    test("should handle adding multiple custom chains", async () => {
      // Add first chain
      await expectToolSuccess("add_custom_chain", {
        chainId: 11111,
        name: "First Chain",
        rpcUrl: "https://first.example.com",
        nativeCurrency: { name: "First", symbol: "FST", decimals: 18 },
      })

      // Add second chain
      await expectToolSuccess("add_custom_chain", {
        chainId: 22222,
        name: "Second Chain",
        rpcUrl: "https://second.example.com",
        nativeCurrency: { name: "Second", symbol: "SND", decimals: 18 },
      })

      // Both chains should be available for switching
      await expectToolSuccess("connect_wallet", { address: TEST_ADDRESS_1 })

      await expectToolSuccess("switch_chain", { chainId: 11111 })
      await expectToolSuccess("switch_chain", { chainId: 22222 })
    })

    test("should handle special characters in chain name", async () => {
      const { text } = await expectToolSuccess(
        "add_custom_chain",
        {
          chainId: 33333,
          name: "Test & Dev Chain (Beta)",
          rpcUrl: "https://special-chars.example.com",
          nativeCurrency: {
            name: "Test & Dev Token",
            symbol: "T&D",
            decimals: 18,
          },
        },
        "Custom chain added successfully",
      )

      expect(text).toContain("Name: Test & Dev Chain (Beta)")
      expect(text).toContain("Native Currency: T&D")
    })
  })

  describe("update_custom_chain", () => {
    test("should update RPC URL of custom chain", async () => {
      // Add a custom chain first
      await expectToolSuccess("add_custom_chain", {
        chainId: 44444,
        name: "Update Test Chain",
        rpcUrl: "https://old-rpc.example.com",
        nativeCurrency: {
          name: "Update Token",
          symbol: "UPD",
          decimals: 18,
        },
      })

      // Update the RPC URL
      const { text } = await expectToolSuccess(
        "update_custom_chain",
        {
          chainId: 44444,
          rpcUrl: "https://new-rpc.example.com",
        },
        "Custom chain 44444 updated successfully",
      )

      expect(text).toContain("RPC URL: https://new-rpc.example.com")
    })

    test("should update chain name", async () => {
      // Add a custom chain first
      await expectToolSuccess("add_custom_chain", {
        chainId: 55555,
        name: "Old Name",
        rpcUrl: "https://test.example.com",
        nativeCurrency: {
          name: "Test",
          symbol: "TST",
          decimals: 18,
        },
      })

      // Update the name
      const { text } = await expectToolSuccess(
        "update_custom_chain",
        {
          chainId: 55555,
          name: "New Name",
        },
        "Custom chain 55555 updated successfully",
      )

      expect(text).toContain("Name: New Name")
    })

    test("should update native currency", async () => {
      // Add a custom chain first
      await expectToolSuccess("add_custom_chain", {
        chainId: 66666,
        name: "Currency Test Chain",
        rpcUrl: "https://currency.example.com",
        nativeCurrency: {
          name: "Old Currency",
          symbol: "OLD",
          decimals: 18,
        },
      })

      // Update the native currency
      const { text } = await expectToolSuccess(
        "update_custom_chain",
        {
          chainId: 66666,
          nativeCurrency: {
            name: "New Currency",
            symbol: "NEW",
            decimals: 6,
          },
        },
        "Custom chain 66666 updated successfully",
      )

      expect(text).toContain("Native Currency: NEW")
    })

    test("should update multiple properties at once", async () => {
      // Add a custom chain first
      await expectToolSuccess("add_custom_chain", {
        chainId: 77777,
        name: "Multi Update Chain",
        rpcUrl: "https://multi-old.example.com",
        nativeCurrency: {
          name: "Multi Old",
          symbol: "MOLD",
          decimals: 18,
        },
      })

      // Update multiple properties
      const { text } = await expectToolSuccess(
        "update_custom_chain",
        {
          chainId: 77777,
          name: "Multi Update Chain V2",
          rpcUrl: "https://multi-new.example.com",
          blockExplorerUrl: "https://explorer.multi.example.com",
        },
        "Custom chain 77777 updated successfully",
      )

      expect(text).toContain("Name: Multi Update Chain V2")
      expect(text).toContain("RPC URL: https://multi-new.example.com")
      expect(text).toContain("Block Explorer: https://explorer.multi.example.com")
    })

    test("should fail to update non-existent chain", async () => {
      await expectToolValidationError(
        "update_custom_chain",
        {
          chainId: 88888,
          name: "Non-existent",
        },
        "Custom chain with ID 88888 not found",
      )
    })

    test("should validate chainId is required", async () => {
      await expectToolValidationError(
        "update_custom_chain",
        {
          name: "Missing Chain ID",
        },
        "Invalid input: expected number, received undefined",
      )
    })

    test("should validate RPC URL format", async () => {
      // Add a chain first
      await expectToolSuccess("add_custom_chain", {
        chainId: 99999,
        name: "Validation Test",
        rpcUrl: "https://valid.example.com",
        nativeCurrency: {
          name: "Test",
          symbol: "TST",
          decimals: 18,
        },
      })

      await expectToolValidationError(
        "update_custom_chain",
        {
          chainId: 99999,
          rpcUrl: "not-a-url",
        },
        "Invalid RPC URL",
      )
    })

    test("should work with connected wallet on updated chain", async () => {
      // Add a custom chain
      await expectToolSuccess("add_custom_chain", {
        chainId: 10101,
        name: "Connection Test",
        rpcUrl: "https://connection-old.example.com",
        nativeCurrency: {
          name: "Connection",
          symbol: "CON",
          decimals: 18,
        },
      })

      // Update the chain RPC
      const { text } = await expectToolSuccess("update_custom_chain", {
        chainId: 10101,
        rpcUrl: "https://connection-new.example.com",
      })

      // Verify the update was successful
      expect(text).toContain("Custom chain 10101 updated successfully")
      expect(text).toContain("RPC URL: https://connection-new.example.com")
    })
  })
})
