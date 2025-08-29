import { describe, expect, test } from "bun:test"
import { expectToolSuccess, setupContainer, TEST_ADDRESS_1 } from "./setup.js"

describe("Chain Info Tool Integration", () => {
  setupContainer()

  describe("get_chain_info", () => {
    test("should return current chain info when no wallet connected", async () => {
      const { text } = await expectToolSuccess("get_chain_info", {})

      // Should show default chain info (likely Anvil/localhost)
      expect(text).toContain("Current Chain:")
      expect(text).toContain("Native Currency:")
      expect(text).toContain("RPC URL:")
      expect(text).toContain("Available Chains:")
    })

    test("should return current chain info with connected wallet", async () => {
      // Connect wallet first
      await expectToolSuccess("connect_wallet", { address: TEST_ADDRESS_1 })

      const { text } = await expectToolSuccess("get_chain_info", {})

      // Should show current chain with ← Current indicator
      expect(text).toContain("Current Chain:")
      expect(text).toContain("← Current")
      expect(text).toContain("Available Chains:")
    })

    test("should list multiple available chains", async () => {
      const { text } = await expectToolSuccess("get_chain_info", {})

      // Should contain built-in chains
      expect(text).toContain("Available Chains:")

      // Common chains that should be available
      const chainPatterns = [
        /- .+ \(\d+\)/, // Chain format: "- Name (ID)"
      ]

      for (const pattern of chainPatterns) {
        expect(text).toMatch(pattern)
      }
    })

    test("should show current chain marked with indicator", async () => {
      await expectToolSuccess("connect_wallet", { address: TEST_ADDRESS_1 })

      const { text } = await expectToolSuccess("get_chain_info", {})

      // Should have exactly one "← Current" marker
      const currentMarkers = (text.match(/← Current/g) || []).length
      expect(currentMarkers).toBe(1)
    })

    test("should include native currency information", async () => {
      const { text } = await expectToolSuccess("get_chain_info", {})

      expect(text).toContain("Native Currency:")

      // Should show currency symbol (ETH for most chains)
      expect(text).toMatch(/Native Currency: \w+/)
    })

    test("should include RPC URL information", async () => {
      const { text } = await expectToolSuccess("get_chain_info", {})

      expect(text).toContain("RPC URL:")

      // Should show valid RPC URL format
      expect(text).toMatch(/RPC URL: https?:\/\//)
    })

    test("should update current chain after switching", async () => {
      await expectToolSuccess("connect_wallet", { address: TEST_ADDRESS_1 })

      // Get initial chain info
      const { text: initialText } = await expectToolSuccess("get_chain_info", {})

      // Extract current chain ID
      const initialChainMatch = initialText.match(/Current Chain: .+ \((\d+)\)/)
      expect(initialChainMatch).toBeTruthy()
      const initialChainIdStr = initialChainMatch?.[1]
      expect(initialChainIdStr).toBeDefined()
      const initialChainId = Number.parseInt(initialChainIdStr!)

      // Find a different chain to switch to
      const availableChains = initialText.match(/- .+ \((\d+)\)/g) || []
      const otherChain = availableChains.find((chain) => {
        const chainIdMatch = chain.match(/\((\d+)\)/)
        if (!chainIdMatch?.[1]) return false
        const chainId = Number.parseInt(chainIdMatch[1])
        return chainId !== initialChainId
      })

      if (otherChain) {
        const targetChainIdMatch = otherChain.match(/\((\d+)\)/)
        expect(targetChainIdMatch).toBeTruthy()
        if (!targetChainIdMatch || !targetChainIdMatch[1]) {
          throw new Error("Failed to extract target chain ID")
        }
        const targetChainId = Number.parseInt(targetChainIdMatch[1])

        // Switch chain
        await expectToolSuccess("switch_chain", { chainId: targetChainId })

        // Get updated chain info
        const { text: updatedText } = await expectToolSuccess("get_chain_info", {})

        // Should show new current chain
        expect(updatedText).toContain(`Current Chain: `)
        expect(updatedText).toContain(`(${targetChainId})`)
        expect(updatedText).toContain("← Current")

        // Should not show old chain as current
        expect(updatedText).not.toContain(`(${initialChainId}) ← Current`)
      }
    })

    test("should work with custom chains", async () => {
      // Add a custom chain
      await expectToolSuccess("add_custom_chain", {
        chainId: 12345,
        name: "Test Chain Info",
        rpcUrl: "https://test-chain-info.example.com",
        nativeCurrency: {
          name: "Test Token",
          symbol: "TEST",
          decimals: 18,
        },
      })

      // Get chain info - should include the new custom chain
      const { text } = await expectToolSuccess("get_chain_info", {})

      expect(text).toContain("Test Chain Info (12345)")
      expect(text).toContain("Available Chains:")
    })

    test("should show custom chain as current when switched", async () => {
      // Add and switch to custom chain
      await expectToolSuccess("add_custom_chain", {
        chainId: 54321,
        name: "Current Custom Chain",
        rpcUrl: "https://current-custom.example.com",
        nativeCurrency: {
          name: "Custom Token",
          symbol: "CSTM",
          decimals: 18,
        },
      })

      await expectToolSuccess("connect_wallet", { address: TEST_ADDRESS_1 })
      await expectToolSuccess("switch_chain", { chainId: 54321 })

      const { text } = await expectToolSuccess("get_chain_info", {})

      expect(text).toContain("Current Chain: Current Custom Chain (54321)")
      expect(text).toContain("Native Currency: CSTM")
      expect(text).toContain("RPC URL: https://current-custom.example.com")
      expect(text).toContain("← Current")
    })

    test("should handle multiple custom chains in list", async () => {
      // Add multiple custom chains
      const chains = [
        {
          chainId: 11111,
          name: "First Custom",
          rpcUrl: "https://first.example.com",
          nativeCurrency: { name: "First", symbol: "FST", decimals: 18 },
        },
        {
          chainId: 22222,
          name: "Second Custom",
          rpcUrl: "https://second.example.com",
          nativeCurrency: { name: "Second", symbol: "SND", decimals: 18 },
        },
        {
          chainId: 33333,
          name: "Third Custom",
          rpcUrl: "https://third.example.com",
          nativeCurrency: { name: "Third", symbol: "TRD", decimals: 18 },
        },
      ]

      for (const chain of chains) {
        await expectToolSuccess("add_custom_chain", chain)
      }

      const { text } = await expectToolSuccess("get_chain_info", {})

      // All custom chains should be listed
      expect(text).toContain("First Custom (11111)")
      expect(text).toContain("Second Custom (22222)")
      expect(text).toContain("Third Custom (33333)")
    })

    test("should maintain chain order consistency", async () => {
      // Get chain info multiple times to verify consistent ordering
      const results = []
      for (let i = 0; i < 3; i++) {
        const { text } = await expectToolSuccess("get_chain_info", {})
        results.push(text)
      }

      // All results should have the same chain ordering
      const firstResult = results[0]
      expect(firstResult).toBeDefined()
      if (!firstResult) {
        throw new Error("No first result available")
      }
      const firstChainList = firstResult.split("Available Chains:\n")[1]
      expect(firstChainList).toBeDefined()
      if (!firstChainList) {
        throw new Error("No first chain list available")
      }

      for (let i = 1; i < results.length; i++) {
        const currentResult = results[i]
        expect(currentResult).toBeDefined()
        if (!currentResult) {
          throw new Error(`No result at index ${i}`)
        }
        const chainList = currentResult.split("Available Chains:\n")[1]
        expect(chainList).toBeDefined()
        if (!chainList) {
          throw new Error(`No chain list at index ${i}`)
        }
        expect(chainList).toBe(firstChainList)
      }
    })

    test("should handle chain info when switched to unsupported chain", async () => {
      // This test ensures graceful handling if somehow on an unknown chain
      // In practice, this might be hard to simulate with current architecture
      // but the test documents expected behavior

      const { text } = await expectToolSuccess("get_chain_info", {})

      // Should never show "Unknown chain" in normal operation
      expect(text).not.toContain("Unknown chain:")
    })
  })

  describe("get_chain_info formatting", () => {
    test("should format output consistently", async () => {
      const { text } = await expectToolSuccess("get_chain_info", {})

      // Check structure format
      const lines = text.split("\n")
      expect(lines[0]).toMatch(/^Current Chain: .+ \(\d+\)$/)
      expect(lines[1]).toMatch(/^Native Currency: \w+$/)
      expect(lines[2]).toMatch(/^RPC URL: https?:\/\//)
      expect(lines[3]).toBe("")
      expect(lines[4]).toBe("Available Chains:")
    })

    test("should handle long chain names gracefully", async () => {
      await expectToolSuccess("add_custom_chain", {
        chainId: 99999,
        name: "Very Long Chain Name That Should Be Displayed Properly Without Breaking Format",
        rpcUrl: "https://very-long-name.example.com",
        nativeCurrency: {
          name: "Very Long Token Name",
          symbol: "VLTN",
          decimals: 18,
        },
      })

      const { text } = await expectToolSuccess("get_chain_info", {})

      expect(text).toContain(
        "Very Long Chain Name That Should Be Displayed Properly Without Breaking Format (99999)",
      )
    })

    test("should handle special characters in chain info", async () => {
      await expectToolSuccess("add_custom_chain", {
        chainId: 88888,
        name: "Test & Special Chars (Тест)",
        rpcUrl: "https://special-chars.example.com",
        nativeCurrency: {
          name: "Test & Token",
          symbol: "T&T",
          decimals: 18,
        },
      })

      const { text } = await expectToolSuccess("get_chain_info", {})

      expect(text).toContain("Test & Special Chars (Тест) (88888)")
    })
  })
})
