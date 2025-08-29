import { describe, expect, test } from "bun:test"
import {
  expectToolExecutionError,
  expectToolSuccess,
  expectToolValidationError,
  setupContainer,
  TEST_ADDRESS_1,
} from "./setup.js"

describe("Chain Switching Integration with Chain Info", () => {
  setupContainer()

  describe("switch_chain and get_chain_info interaction", () => {
    test("should update chain info after switching chains", async () => {
      await expectToolSuccess("connect_wallet", { address: TEST_ADDRESS_1 })

      // Get initial chain info
      const { text: initialInfo } = await expectToolSuccess("get_chain_info", {})
      const initialChainMatch = initialInfo.match(/Current Chain: .+ \((\d+)\)/)
      expect(initialChainMatch).toBeTruthy()
      if (!initialChainMatch || !initialChainMatch[1]) {
        throw new Error("Failed to extract initial chain ID")
      }
      const initialChainId = Number.parseInt(initialChainMatch[1])

      // Find available chains to switch to
      const availableChains = initialInfo.match(/- (.+) \((\d+)\)(?! ← Current)/g) || []
      expect(availableChains.length).toBeGreaterThan(0)

      // Extract first available chain that's not current
      const firstOtherChain = availableChains[0]
      expect(firstOtherChain).toBeDefined()
      if (!firstOtherChain) {
        throw new Error("No other chain available to switch to")
      }
      const targetChainMatch = firstOtherChain.match(/- (.+) \((\d+)\)/)
      expect(targetChainMatch).toBeTruthy()
      if (!targetChainMatch || !targetChainMatch[1] || !targetChainMatch[2]) {
        throw new Error("Failed to extract target chain info")
      }
      const targetChainId = Number.parseInt(targetChainMatch[2])
      const targetChainName = targetChainMatch[1]

      // Switch to the target chain
      await expectToolSuccess("switch_chain", { chainId: targetChainId })

      // Verify chain info updated
      const { text: updatedInfo } = await expectToolSuccess("get_chain_info", {})

      expect(updatedInfo).toContain(`Current Chain: ${targetChainName} (${targetChainId})`)
      expect(updatedInfo).toContain(`${targetChainName} (${targetChainId}) ← Current`)
      expect(updatedInfo).not.toContain(`(${initialChainId}) ← Current`)
    })

    test("should handle switching between multiple chains", async () => {
      await expectToolSuccess("connect_wallet", { address: TEST_ADDRESS_1 })

      // Add multiple custom chains
      const customChains = [
        { id: 11111, name: "Chain Alpha", rpc: "https://alpha.example.com", symbol: "ALPHA" },
        { id: 22222, name: "Chain Beta", rpc: "https://beta.example.com", symbol: "BETA" },
        { id: 33333, name: "Chain Gamma", rpc: "https://gamma.example.com", symbol: "GAMMA" },
      ]

      for (const chain of customChains) {
        await expectToolSuccess("add_custom_chain", {
          chainId: chain.id,
          name: chain.name,
          rpcUrl: chain.rpc,
          nativeCurrency: {
            name: `${chain.name} Token`,
            symbol: chain.symbol,
            decimals: 18,
          },
        })
      }

      // Switch between chains and verify each time
      for (const chain of customChains) {
        await expectToolSuccess("switch_chain", { chainId: chain.id })

        const { text } = await expectToolSuccess("get_chain_info", {})
        expect(text).toContain(`Current Chain: ${chain.name} (${chain.id})`)
        expect(text).toContain(`Native Currency: ${chain.symbol}`)
        expect(text).toContain(`RPC URL: ${chain.rpc}`)
        expect(text).toContain("← Current")
      }
    })

    test("should maintain chain list consistency during switches", async () => {
      await expectToolSuccess("connect_wallet", { address: TEST_ADDRESS_1 })

      // Add custom chain for more options
      await expectToolSuccess("add_custom_chain", {
        chainId: 44444,
        name: "Consistency Chain",
        rpcUrl: "https://consistency.example.com",
        nativeCurrency: {
          name: "Consistency Token",
          symbol: "CONS",
          decimals: 18,
        },
      })

      const { text: initialInfo } = await expectToolSuccess("get_chain_info", {})
      const initialChainList = initialInfo.split("Available Chains:\n")[1]
      expect(initialChainList).toBeDefined()

      // Switch to custom chain
      await expectToolSuccess("switch_chain", { chainId: 44444 })

      const { text: afterSwitchInfo } = await expectToolSuccess("get_chain_info", {})
      const afterSwitchChainList = afterSwitchInfo.split("Available Chains:\n")[1]
      expect(afterSwitchChainList).toBeDefined()

      // Chain list should be the same (only current marker should change)
      const initialChains = initialChainList
        ?.replace(/← Current/g, "")
        .replace(/\s+/g, " ")
        .trim()
      const afterSwitchChains = afterSwitchChainList
        ?.replace(/← Current/g, "")
        .replace(/\s+/g, " ")
        .trim()

      expect(afterSwitchChains).toBe(initialChains)
    })

    test("should show correct native currency after chain switch", async () => {
      await expectToolSuccess("connect_wallet", { address: TEST_ADDRESS_1 })

      // Add chain with specific currency
      await expectToolSuccess("add_custom_chain", {
        chainId: 55555,
        name: "Currency Test Chain",
        rpcUrl: "https://currency-test.example.com",
        nativeCurrency: {
          name: "Currency Test Token",
          symbol: "CTT",
          decimals: 6, // Different decimals
        },
      })

      // Switch to the custom chain
      await expectToolSuccess("switch_chain", { chainId: 55555 })

      // Verify native currency is shown correctly
      const { text } = await expectToolSuccess("get_chain_info", {})
      expect(text).toContain("Native Currency: CTT")
      expect(text).toContain("Current Chain: Currency Test Chain (55555)")
    })

    test("should handle rapid chain switching", async () => {
      await expectToolSuccess("connect_wallet", { address: TEST_ADDRESS_1 })

      // Add multiple chains
      const chains = [66666, 77777, 88888]
      for (const chainId of chains) {
        await expectToolSuccess("add_custom_chain", {
          chainId,
          name: `Rapid Chain ${chainId}`,
          rpcUrl: `https://rapid-${chainId}.example.com`,
          nativeCurrency: {
            name: `Rapid Token ${chainId}`,
            symbol: `R${chainId.toString().slice(-3)}`,
            decimals: 18,
          },
        })
      }

      // Rapid switching
      for (const chainId of chains) {
        await expectToolSuccess("switch_chain", { chainId })

        // Immediately check chain info
        const { text } = await expectToolSuccess("get_chain_info", {})
        expect(text).toContain(`Current Chain: Rapid Chain ${chainId} (${chainId})`)
        expect(text).toContain("← Current")
      }
    })

    test("should handle switching to built-in chains", async () => {
      await expectToolSuccess("connect_wallet", { address: TEST_ADDRESS_1 })

      // Get initial info to find built-in chains
      const { text: initialInfo } = await expectToolSuccess("get_chain_info", {})

      // Look for common built-in chains (Ethereum mainnet: 1, Sepolia: 11155111, etc.)
      const builtInChainIds = [1, 11155111, 137, 10, 42161] // Common chains

      for (const chainId of builtInChainIds) {
        if (initialInfo.includes(`(${chainId})`)) {
          await expectToolSuccess("switch_chain", { chainId })

          const { text } = await expectToolSuccess("get_chain_info", {})
          expect(text).toContain(`(${chainId}) ← Current`)
          break // Test at least one built-in chain
        }
      }
    })

    test("should validate chain switch parameters", async () => {
      await expectToolSuccess("connect_wallet", { address: TEST_ADDRESS_1 })

      // Invalid chain ID type
      await expectToolValidationError("switch_chain", {
        chainId: "invalid",
      })

      // Missing chain ID
      await expectToolValidationError("switch_chain", {})

      // Negative chain ID
      await expectToolValidationError("switch_chain", {
        chainId: -1,
      })
    })

    test("should fail switching to non-existent chain", async () => {
      await expectToolSuccess("connect_wallet", { address: TEST_ADDRESS_1 })

      await expectToolExecutionError(
        "switch_chain",
        {
          chainId: 999999999, // Very unlikely to exist
        },
        "Chain ID 999999999 is not supported",
      )
    })

    test("should handle wallet disconnection during chain operations", async () => {
      await expectToolSuccess("connect_wallet", { address: TEST_ADDRESS_1 })

      // Add custom chain
      await expectToolSuccess("add_custom_chain", {
        chainId: 99999,
        name: "Disconnect Test Chain",
        rpcUrl: "https://disconnect-test.example.com",
        nativeCurrency: {
          name: "Disconnect Token",
          symbol: "DIS",
          decimals: 18,
        },
      })

      // Switch to custom chain
      await expectToolSuccess("switch_chain", { chainId: 99999 })

      // Disconnect wallet
      await expectToolSuccess("disconnect_wallet", {})

      // Chain info should still work (but show no current chain indication)
      const { text } = await expectToolSuccess("get_chain_info", {})
      expect(text).toContain("Disconnect Test Chain (99999)")

      // Try to switch without wallet connection - should work as chain switching doesn't require wallet
      await expectToolSuccess("switch_chain", {
        chainId: 11155111,
      })
    })
  })

  describe("chain switching edge cases", () => {
    test("should handle switching to same chain", async () => {
      await expectToolSuccess("connect_wallet", { address: TEST_ADDRESS_1 })

      // Get current chain
      const { text: initialInfo } = await expectToolSuccess("get_chain_info", {})
      const chainMatch = initialInfo.match(/Current Chain: .+ \((\d+)\)/)
      expect(chainMatch).toBeTruthy()
      if (!chainMatch || !chainMatch[1]) {
        throw new Error("Failed to extract current chain ID")
      }
      const currentChainId = Number.parseInt(chainMatch[1])

      // Switch to same chain
      const { text } = await expectToolSuccess("switch_chain", { chainId: currentChainId })

      // Should indicate already on this chain or successful switch
      expect(text).toContain(`${currentChainId}`)
    })

    test("should maintain custom chain configurations after switches", async () => {
      await expectToolSuccess("connect_wallet", { address: TEST_ADDRESS_1 })

      // Add custom chain with specific configuration
      const customConfig = {
        chainId: 123123,
        name: "Config Test Chain",
        rpcUrl: "https://config-test.example.com",
        nativeCurrency: {
          name: "Config Test Token",
          symbol: "CFG",
          decimals: 12,
        },
        blockExplorerUrl: "https://explorer.config-test.example.com",
      }

      await expectToolSuccess("add_custom_chain", customConfig)

      // Switch to another chain and back
      const { text: otherChains } = await expectToolSuccess("get_chain_info", {})
      const otherChainMatch = otherChains.match(/- (.+) \((\d+)\)(?! ← Current)/)
      if (otherChainMatch?.[2]) {
        const otherChainId = Number.parseInt(otherChainMatch[2])
        await expectToolSuccess("switch_chain", { chainId: otherChainId })
      }

      // Switch back to custom chain
      await expectToolSuccess("switch_chain", { chainId: customConfig.chainId })

      // Verify configuration is preserved
      const { text: finalInfo } = await expectToolSuccess("get_chain_info", {})
      expect(finalInfo).toContain(`Current Chain: ${customConfig.name} (${customConfig.chainId})`)
      expect(finalInfo).toContain(`Native Currency: ${customConfig.nativeCurrency.symbol}`)
      expect(finalInfo).toContain(`RPC URL: ${customConfig.rpcUrl}`)
    })

    test("should handle chain switching with updated custom chain", async () => {
      await expectToolSuccess("connect_wallet", { address: TEST_ADDRESS_1 })

      // Add and switch to custom chain
      await expectToolSuccess("add_custom_chain", {
        chainId: 456456,
        name: "Original Update Chain",
        rpcUrl: "https://original-update.example.com",
        nativeCurrency: {
          name: "Original Token",
          symbol: "ORIG",
          decimals: 18,
        },
      })

      await expectToolSuccess("switch_chain", { chainId: 456456 })

      // Update the chain configuration
      await expectToolSuccess("update_custom_chain", {
        chainId: 456456,
        name: "Updated Update Chain",
        rpcUrl: "https://updated-update.example.com",
      })

      // Chain info should reflect the update (need to switch back first)
      await expectToolSuccess("switch_chain", { chainId: 456456 })
      const { text } = await expectToolSuccess("get_chain_info", {})
      expect(text).toContain("Current Chain: Updated Update Chain (456456)")
      expect(text).toContain("RPC URL: https://updated-update.example.com")
    })
  })
})
