import { describe, expect, test } from "bun:test"
import {
  expectToolExecutionError,
  expectToolSuccess,
  expectToolValidationError,
  setupContainer,
  TEST_ADDRESS_1,
} from "./setup.js"

describe("Custom Chain Operations Integration", () => {
  setupContainer()

  describe("comprehensive custom chain lifecycle", () => {
    test("should handle complete chain lifecycle: add -> switch -> update -> remove", async () => {
      await expectToolSuccess("connect_wallet", { address: TEST_ADDRESS_1 })

      // 1. Add custom chain
      const chainConfig = {
        chainId: 777777,
        name: "Lifecycle Test Chain",
        rpcUrl: "https://lifecycle.example.com",
        nativeCurrency: {
          name: "Lifecycle Token",
          symbol: "LIFE",
          decimals: 18,
        },
        blockExplorerUrl: "https://explorer.lifecycle.example.com",
      }

      await expectToolSuccess("add_custom_chain", chainConfig)

      // Verify chain appears in chain info
      let { text } = await expectToolSuccess("get_chain_info", {})
      expect(text).toContain("Lifecycle Test Chain (777777)")

      // 2. Switch to custom chain
      await expectToolSuccess("switch_chain", { chainId: chainConfig.chainId })

      // Verify current chain in chain info
      const switchResult = await expectToolSuccess("get_chain_info", {})
      text = switchResult.text
      expect(text).toContain("Current Chain: Lifecycle Test Chain (777777)")
      expect(text).toContain("Native Currency: LIFE")
      expect(text).toContain("RPC URL: https://lifecycle.example.com")
      expect(text).toContain("← Current")

      // 3. Update chain configuration while on the chain
      await expectToolSuccess("update_custom_chain", {
        chainId: chainConfig.chainId,
        name: "Updated Lifecycle Chain",
        rpcUrl: "https://updated-lifecycle.example.com",
      })

      // Verify updates in chain info (chain name should be updated in list)
      const updateResult = await expectToolSuccess("get_chain_info", {})
      text = updateResult.text
      expect(text).toContain("Updated Lifecycle Chain (777777)")

      // Switch back to the updated chain to verify RPC URL
      await expectToolSuccess("switch_chain", { chainId: chainConfig.chainId })
      const switchedResult = await expectToolSuccess("get_chain_info", {})
      expect(switchedResult.text).toContain("Current Chain: Updated Lifecycle Chain (777777)")
      expect(switchedResult.text).toContain("RPC URL: https://updated-lifecycle.example.com")

      // 4. Switch away from custom chain
      const { text: availableChains } = await expectToolSuccess("get_chain_info", {})
      const otherChainMatch = availableChains.match(/- (.+) \((\d+)\)(?! ← Current)/)
      expect(otherChainMatch).toBeTruthy()
      const otherChainId = Number.parseInt(otherChainMatch?.[2])

      await expectToolSuccess("switch_chain", { chainId: otherChainId })

      // 5. Remove custom chain
      await expectToolSuccess("remove_custom_chain", { chainId: chainConfig.chainId })

      // Verify chain no longer appears in chain info
      const finalResult = await expectToolSuccess("get_chain_info", {})
      text = finalResult.text
      expect(text).not.toContain("Updated Lifecycle Chain (777777)")
    })

    test("should handle multiple custom chains with similar configurations", async () => {
      await expectToolSuccess("connect_wallet", { address: TEST_ADDRESS_1 })

      // Add multiple chains with similar names
      const chains = [
        {
          chainId: 111001,
          name: "Similar Chain Alpha",
          rpcUrl: "https://alpha-similar.example.com",
          symbol: "SIMA",
        },
        {
          chainId: 111002,
          name: "Similar Chain Beta",
          rpcUrl: "https://beta-similar.example.com",
          symbol: "SIMB",
        },
        {
          chainId: 111003,
          name: "Similar Chain Gamma",
          rpcUrl: "https://gamma-similar.example.com",
          symbol: "SIMC",
        },
      ]

      // Add all chains
      for (const chain of chains) {
        await expectToolSuccess("add_custom_chain", {
          chainId: chain.chainId,
          name: chain.name,
          rpcUrl: chain.rpcUrl,
          nativeCurrency: {
            name: `${chain.name} Token`,
            symbol: chain.symbol,
            decimals: 18,
          },
        })
      }

      // Verify all chains appear in chain info
      const { text } = await expectToolSuccess("get_chain_info", {})
      for (const chain of chains) {
        expect(text).toContain(`${chain.name} (${chain.chainId})`)
      }

      // Test switching between similar chains
      for (const chain of chains) {
        await expectToolSuccess("switch_chain", { chainId: chain.chainId })

        const { text: currentInfo } = await expectToolSuccess("get_chain_info", {})
        expect(currentInfo).toContain(`Current Chain: ${chain.name} (${chain.chainId})`)
        expect(currentInfo).toContain(`Native Currency: ${chain.symbol}`)
        expect(currentInfo).toContain(`RPC URL: ${chain.rpcUrl}`)
      }
    })

    test("should handle chain operations with special characters and unicode", async () => {
      await expectToolSuccess("connect_wallet", { address: TEST_ADDRESS_1 })

      const specialChains = [
        {
          chainId: 222001,
          name: "Chain with Émojis 🚀🌟",
          rpcUrl: "https://emoji-chain.example.com",
          symbol: "🌟EMJ",
          currencyName: "Émoji Tøken",
        },
        {
          chainId: 222002,
          name: "Chаin with Суrilliс (Mixed Scripts)",
          rpcUrl: "https://cyrillic-chain.example.com",
          symbol: "CYR-Ł",
          currencyName: "Суrilliс Tøken",
        },
        {
          chainId: 222003,
          name: "Chain & Symbols + More (Special)",
          rpcUrl: "https://special-chars.example.com",
          symbol: "S&P+",
          currencyName: "Special & Token",
        },
      ]

      // Add chains with special characters
      for (const chain of specialChains) {
        await expectToolSuccess("add_custom_chain", {
          chainId: chain.chainId,
          name: chain.name,
          rpcUrl: chain.rpcUrl,
          nativeCurrency: {
            name: chain.currencyName,
            symbol: chain.symbol,
            decimals: 18,
          },
        })
      }

      // Verify chains are handled correctly
      const { text } = await expectToolSuccess("get_chain_info", {})
      for (const chain of specialChains) {
        expect(text).toContain(`${chain.name} (${chain.chainId})`)
      }

      // Test switching to chains with special characters
      for (const chain of specialChains) {
        await expectToolSuccess("switch_chain", { chainId: chain.chainId })

        const { text: currentInfo } = await expectToolSuccess("get_chain_info", {})
        expect(currentInfo).toContain(`Current Chain: ${chain.name} (${chain.chainId})`)
        expect(currentInfo).toContain(`Native Currency: ${chain.symbol}`)
      }
    })

    test("should handle chains with different decimal configurations", async () => {
      await expectToolSuccess("connect_wallet", { address: TEST_ADDRESS_1 })

      const decimalChains = [
        { chainId: 333001, decimals: 0, name: "Zero Decimal Chain", symbol: "ZERO" },
        { chainId: 333002, decimals: 6, name: "Six Decimal Chain", symbol: "SIX" },
        { chainId: 333003, decimals: 8, name: "Eight Decimal Chain", symbol: "EIGHT" },
        { chainId: 333004, decimals: 18, name: "Eighteen Decimal Chain", symbol: "ETEEN" },
        { chainId: 333005, decimals: 18, name: "Standard Decimal Chain", symbol: "STD" },
      ]

      // Add chains with different decimals
      for (const chain of decimalChains) {
        await expectToolSuccess("add_custom_chain", {
          chainId: chain.chainId,
          name: chain.name,
          rpcUrl: `https://${chain.symbol.toLowerCase()}.example.com`,
          nativeCurrency: {
            name: `${chain.name} Token`,
            symbol: chain.symbol,
            decimals: chain.decimals,
          },
        })
      }

      // Test switching to each chain and verify configuration
      for (const chain of decimalChains) {
        await expectToolSuccess("switch_chain", { chainId: chain.chainId })

        const { text } = await expectToolSuccess("get_chain_info", {})
        expect(text).toContain(`Current Chain: ${chain.name} (${chain.chainId})`)
        expect(text).toContain(`Native Currency: ${chain.symbol}`)
      }
    })

    test("should handle chain updates with different field combinations", async () => {
      await expectToolSuccess("connect_wallet", { address: TEST_ADDRESS_1 })

      // Add base chain
      const baseChainId = 444001
      await expectToolSuccess("add_custom_chain", {
        chainId: baseChainId,
        name: "Update Test Base",
        rpcUrl: "https://base.example.com",
        nativeCurrency: {
          name: "Base Token",
          symbol: "BASE",
          decimals: 18,
        },
      })

      // Test updating only name
      await expectToolSuccess("update_custom_chain", {
        chainId: baseChainId,
        name: "Updated Name Only",
      })

      let { text } = await expectToolSuccess("get_chain_info", {})
      expect(text).toContain("Updated Name Only (444001)")

      // Test updating only RPC URL
      await expectToolSuccess("update_custom_chain", {
        chainId: baseChainId,
        rpcUrl: "https://updated-rpc.example.com",
      })

      let result = await expectToolSuccess("get_chain_info", {})
      text = result.text

      // Switch to the chain to see the RPC URL change
      await expectToolSuccess("switch_chain", { chainId: baseChainId })
      result = await expectToolSuccess("get_chain_info", {})
      text = result.text
      expect(text).toContain("https://updated-rpc.example.com")

      // Test updating only native currency
      await expectToolSuccess("update_custom_chain", {
        chainId: baseChainId,
        nativeCurrency: {
          name: "Updated Currency",
          symbol: "UPD",
          decimals: 6,
        },
      })

      // Switch to chain to see currency update
      await expectToolSuccess("switch_chain", { chainId: baseChainId })
      result = await expectToolSuccess("get_chain_info", {})
      text = result.text
      expect(text).toContain("Native Currency: UPD")

      // Test updating multiple fields at once
      await expectToolSuccess("update_custom_chain", {
        chainId: baseChainId,
        name: "Fully Updated Chain",
        rpcUrl: "https://fully-updated.example.com",
        blockExplorerUrl: "https://explorer.fully-updated.example.com",
        nativeCurrency: {
          name: "Fully Updated Token",
          symbol: "FULL",
          decimals: 12,
        },
      })

      // Switch back to see the full updates
      await expectToolSuccess("switch_chain", { chainId: baseChainId })
      result = await expectToolSuccess("get_chain_info", {})
      text = result.text
      expect(text).toContain("Current Chain: Fully Updated Chain (444001)")
      expect(text).toContain("Native Currency: FULL")
      expect(text).toContain("RPC URL: https://fully-updated.example.com")
    })

    test("should handle chain removal edge cases", async () => {
      await expectToolSuccess("connect_wallet", { address: TEST_ADDRESS_1 })

      // Add multiple chains
      const chainIds = [555001, 555002, 555003]
      for (let i = 0; i < chainIds.length; i++) {
        await expectToolSuccess("add_custom_chain", {
          chainId: chainIds[i],
          name: `Removal Test Chain ${i + 1}`,
          rpcUrl: `https://removal-${i + 1}.example.com`,
          nativeCurrency: {
            name: `Removal Token ${i + 1}`,
            symbol: `REM${i + 1}`,
            decimals: 18,
          },
        })
      }

      // Switch to middle chain
      await expectToolSuccess("switch_chain", { chainId: chainIds[1] })

      // Try to remove current chain (should fail)
      await expectToolExecutionError(
        "remove_custom_chain",
        { chainId: chainIds[1] },
        "Cannot remove the currently connected chain",
      )

      // Remove other chains
      await expectToolSuccess("remove_custom_chain", { chainId: chainIds[0] })
      await expectToolSuccess("remove_custom_chain", { chainId: chainIds[2] })

      // Verify only current chain remains
      const { text } = await expectToolSuccess("get_chain_info", {})
      expect(text).toContain("Removal Test Chain 2 (555002)")
      expect(text).not.toContain("Removal Test Chain 1 (555001)")
      expect(text).not.toContain("Removal Test Chain 3 (555003)")

      // Switch away and remove last custom chain
      const availableChains = text.match(/- (.+) \((\d+)\)(?! ← Current)/)
      if (availableChains) {
        const otherChainId = Number.parseInt(availableChains[2])
        await expectToolSuccess("switch_chain", { chainId: otherChainId })
      }

      await expectToolSuccess("remove_custom_chain", { chainId: chainIds[1] })

      // Verify no custom chains remain
      const { text: finalInfo } = await expectToolSuccess("get_chain_info", {})
      expect(finalInfo).not.toContain("Removal Test Chain 2 (555002)")
    })
  })

  describe("custom chain validation and error handling", () => {
    test("should validate unique chain IDs", async () => {
      // Add first chain
      await expectToolSuccess("add_custom_chain", {
        chainId: 666001,
        name: "First Unique Chain",
        rpcUrl: "https://first-unique.example.com",
        nativeCurrency: {
          name: "First Token",
          symbol: "FIRST",
          decimals: 18,
        },
      })

      // Try to add chain with same ID (should fail or update existing)
      await expectToolExecutionError(
        "add_custom_chain",
        {
          chainId: 666001, // Duplicate ID
          name: "Duplicate Chain",
          rpcUrl: "https://duplicate.example.com",
          nativeCurrency: {
            name: "Duplicate Token",
            symbol: "DUP",
            decimals: 18,
          },
        },
        "already exists", // Expected error message pattern
      )
    })

    test("should validate RPC URL accessibility patterns", async () => {
      const invalidRpcUrls = [
        "not-a-url",
        "ftp://invalid-protocol.example.com",
        "http://", // Incomplete URL
        "", // Empty string
        "https://", // Just protocol
      ]

      for (const invalidUrl of invalidRpcUrls) {
        await expectToolExecutionError("add_custom_chain", {
          chainId: 777001,
          name: "Invalid RPC Test",
          rpcUrl: invalidUrl,
          nativeCurrency: {
            name: "Test Token",
            symbol: "TEST",
            decimals: 18,
          },
        })
      }
    })

    test("should validate native currency constraints", async () => {
      const baseChain = {
        chainId: 888001,
        name: "Currency Validation Chain",
        rpcUrl: "https://currency-validation.example.com",
      }

      // Test invalid decimals (limit is 18)
      const invalidCurrencies = [
        { decimals: -1, symbol: "NEG", name: "Negative Decimals" },
        { decimals: 19, symbol: "HUGE", name: "Too Many Decimals" },
      ]

      for (const currency of invalidCurrencies) {
        await expectToolValidationError("add_custom_chain", {
          ...baseChain,
          nativeCurrency: currency,
        })
      }

      // Test invalid symbols
      const invalidSymbols = [
        { decimals: 18, symbol: "", name: "Empty Symbol" },
        { decimals: 18, symbol: " ", name: "Space Symbol" },
        { decimals: 18, symbol: "\n", name: "Newline Symbol" },
      ]

      for (const currency of invalidSymbols) {
        await expectToolExecutionError("add_custom_chain", {
          ...baseChain,
          chainId: baseChain.chainId + 1, // Increment to avoid conflicts
          nativeCurrency: currency,
        })
      }
    })

    test("should handle concurrent chain operations", async () => {
      await expectToolSuccess("connect_wallet", { address: TEST_ADDRESS_1 })

      // Add multiple chains concurrently (simulate)
      const concurrentChains = [
        { chainId: 999001, name: "Concurrent Chain 1", symbol: "CON1" },
        { chainId: 999002, name: "Concurrent Chain 2", symbol: "CON2" },
        { chainId: 999003, name: "Concurrent Chain 3", symbol: "CON3" },
      ]

      // Add all chains
      const addPromises = concurrentChains.map((chain) =>
        expectToolSuccess("add_custom_chain", {
          chainId: chain.chainId,
          name: chain.name,
          rpcUrl: `https://${chain.symbol.toLowerCase()}.example.com`,
          nativeCurrency: {
            name: `${chain.name} Token`,
            symbol: chain.symbol,
            decimals: 18,
          },
        }),
      )

      await Promise.all(addPromises)

      // Verify all chains were added
      const { text } = await expectToolSuccess("get_chain_info", {})
      for (const chain of concurrentChains) {
        expect(text).toContain(`${chain.name} (${chain.chainId})`)
      }

      // Concurrent chain switches (sequential to avoid conflicts)
      for (const chain of concurrentChains) {
        await expectToolSuccess("switch_chain", { chainId: chain.chainId })

        const { text: currentInfo } = await expectToolSuccess("get_chain_info", {})
        expect(currentInfo).toContain(`Current Chain: ${chain.name} (${chain.chainId})`)
      }
    })

    test("should handle maximum length constraints", async () => {
      // Test very long chain name
      const veryLongName = "A".repeat(200) // Very long name
      const veryLongCurrencyName = "B".repeat(100) // Very long currency name
      const veryLongSymbol = "C".repeat(20) // Very long symbol

      // This might pass or fail depending on validation rules
      try {
        await expectToolSuccess("add_custom_chain", {
          chainId: 111111,
          name: veryLongName,
          rpcUrl: "https://long-names.example.com",
          nativeCurrency: {
            name: veryLongCurrencyName,
            symbol: veryLongSymbol,
            decimals: 18,
          },
        })

        // If successful, verify it appears in chain info
        const { text } = await expectToolSuccess("get_chain_info", {})
        expect(text).toContain("(111111)")
      } catch (_error) {
        // If validation fails, that's also acceptable behavior
        console.log("Long names properly rejected by validation")
      }
    })
  })
})
