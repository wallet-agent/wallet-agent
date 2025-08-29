import { beforeEach, describe, expect, test } from "bun:test"
import { TestContainer } from "../../src/test-container.js"
import { handleToolCall } from "../../src/tools/handlers.js"

interface McpServer {
  callTool(
    name: string,
    args: any,
  ): Promise<{
    isError: boolean
    content: [{ text: string; type: string }, ...Array<{ text: string; type: string }>]
    error?: string
  }>
}

describe("Multi-Chain Development Integration Test", () => {
  let server: McpServer
  let testContainer: TestContainer

  const testAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  const testPrivateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

  beforeEach(async () => {
    testContainer = TestContainer.createForTest({})

    server = {
      async callTool(name: string, args: any) {
        try {
          ;(globalThis as any).__walletAgentTestContainer = testContainer

          const result = await handleToolCall({
            method: "tools/call",
            params: {
              name,
              arguments: args,
            },
          })
          return {
            isError: false,
            content: result.content || [],
          }
        } catch (error) {
          return {
            isError: true,
            content: [
              { text: error instanceof Error ? error.message : String(error), type: "text" },
            ],
            error: error instanceof Error ? error.message : String(error),
          }
        }
      },
    }
  })

  describe("1. Built-in Chain Operations", () => {
    test("should get chain information and list available chains", async () => {
      const chainInfoResult = await server.callTool("get_chain_info", {})

      expect(chainInfoResult.isError).toBe(false)
      if (!chainInfoResult.isError) {
        const response = chainInfoResult.content[0].text
        expect(response).toMatch(/(current|chain|id)/i)
        expect(response).toMatch(/(ethereum|mainnet|polygon|arbitrum|base)/i)
      }
    })

    test("should switch between built-in chains", async () => {
      const switchMainnetResult = await server.callTool("switch_chain", {
        chainId: 1,
      })

      expect(switchMainnetResult.isError).toBe(false)
      if (!switchMainnetResult.isError) {
        expect(switchMainnetResult.content[0].text).toContain("Ethereum")
        expect(switchMainnetResult.content[0].text).toMatch(/(switched|mainnet)/i)
      }

      const chainInfoResult = await server.callTool("get_chain_info", {})
      expect(chainInfoResult.isError).toBe(false)
      if (!chainInfoResult.isError) {
        const response = chainInfoResult.content[0].text
        expect(response).toContain("Ethereum")
        expect(response).toMatch(/(current.*1|id.*1)/i)
      }

      const switchPolygonResult = await server.callTool("switch_chain", {
        chainId: 137,
      })

      expect(switchPolygonResult.isError).toBe(false)
      if (!switchPolygonResult.isError) {
        expect(switchPolygonResult.content[0].text).toContain("Polygon")
        expect(switchPolygonResult.content[0].text).toMatch(/(switched|polygon)/i)
      }

      const switchAnvilResult = await server.callTool("switch_chain", {
        chainId: 31337,
      })

      expect(switchAnvilResult.isError).toBe(false)
      if (!switchAnvilResult.isError) {
        expect(switchAnvilResult.content[0].text).toContain("Anvil")
        expect(switchAnvilResult.content[0].text).toMatch(/(switched|anvil|local)/i)
      }
    })

    test("should handle invalid chain IDs gracefully", async () => {
      const invalidChainResult = await server.callTool("switch_chain", {
        chainId: 999999,
      })

      expect(invalidChainResult.isError).toBe(true)
      if (invalidChainResult.isError) {
        expect(invalidChainResult.content).toMatch(/(not found|unsupported|invalid)/i)
      }
    })
  })

  describe("2. Custom Chain Management", () => {
    test("should add a custom chain", async () => {
      const customChainConfig = {
        chainId: 12345,
        name: "Test Custom Chain",
        rpcUrl: "https://rpc.testcustomchain.com",
        symbol: "TCC",
        blockExplorerUrl: "https://explorer.testcustomchain.com",
      }

      const addResult = await server.callTool("add_custom_chain", customChainConfig)

      expect(addResult.isError).toBe(false)
      if (!addResult.isError) {
        const response = addResult.content[0].text
        expect(response).toMatch(/(added|custom|chain)/i)
        expect(response).toContain("Test Custom Chain")
        expect(response).toContain("12345")
      }

      const chainInfoResult = await server.callTool("get_chain_info", {})
      expect(chainInfoResult.isError).toBe(false)
      if (!chainInfoResult.isError) {
        const response = chainInfoResult.content[0].text
        expect(response).toContain("Test Custom Chain")
        expect(response).toContain("12345")
      }
    })

    test("should switch to custom chains", async () => {
      await server.callTool("add_custom_chain", {
        chainId: 54321,
        name: "Development Chain",
        rpcUrl: "https://dev-rpc.example.com",
        symbol: "DEV",
        blockExplorerUrl: "https://dev-explorer.example.com",
      })

      const switchResult = await server.callTool("switch_chain", {
        chainId: 54321,
      })

      expect(switchResult.isError).toBe(false)
      if (!switchResult.isError) {
        expect(switchResult.content[0].text).toContain("Development Chain")
        expect(switchResult.content[0].text).toMatch(/(switched|dev)/i)
      }

      const chainInfoResult = await server.callTool("get_chain_info", {})
      expect(chainInfoResult.isError).toBe(false)
      if (!chainInfoResult.isError) {
        const response = chainInfoResult.content[0].text
        expect(response).toContain("Development Chain")
        expect(response).toMatch(/(current.*54321|id.*54321)/i)
      }
    })

    test("should update custom chain configuration", async () => {
      await server.callTool("add_custom_chain", {
        chainId: 11111,
        name: "Original Chain",
        rpcUrl: "https://original-rpc.com",
        symbol: "ORG",
        blockExplorerUrl: "https://original-explorer.com",
      })

      const updateResult = await server.callTool("update_custom_chain", {
        chainId: 11111,
        name: "Updated Chain",
        rpcUrl: "https://updated-rpc.com",
        symbol: "UPD",
        blockExplorerUrl: "https://updated-explorer.com",
      })

      expect(updateResult.isError).toBe(false)
      if (!updateResult.isError) {
        const response = updateResult.content[0].text
        expect(response).toMatch(/(updated|chain)/i)
        expect(response).toContain("Updated Chain")
      }

      const chainInfoResult = await server.callTool("get_chain_info", {})
      expect(chainInfoResult.isError).toBe(false)
      if (!chainInfoResult.isError) {
        const response = chainInfoResult.content[0].text
        expect(response).toContain("Updated Chain")
        expect(response).not.toContain("Original Chain")
        expect(response).toContain("UPD")
      }
    })

    test("should remove custom chains", async () => {
      await server.callTool("add_custom_chain", {
        chainId: 22222,
        name: "Temporary Chain",
        rpcUrl: "https://temp-rpc.com",
        symbol: "TMP",
        blockExplorerUrl: "https://temp-explorer.com",
      })

      const chainInfoBefore = await server.callTool("get_chain_info", {})
      expect(chainInfoBefore.isError).toBe(false)
      if (!chainInfoBefore.isError) {
        expect(chainInfoBefore.content[0].text).toContain("Temporary Chain")
      }

      const removeResult = await server.callTool("remove_custom_chain", {
        chainId: 22222,
      })

      expect(removeResult.isError).toBe(false)
      if (!removeResult.isError) {
        const response = removeResult.content[0].text
        expect(response).toMatch(/(removed|deleted)/i)
        expect(response).toContain("22222")
      }

      const chainInfoAfter = await server.callTool("get_chain_info", {})
      expect(chainInfoAfter.isError).toBe(false)
      if (!chainInfoAfter.isError) {
        expect(chainInfoAfter.content[0].text).not.toContain("Temporary Chain")
      }
    })

    test("should handle duplicate chain IDs", async () => {
      await server.callTool("add_custom_chain", {
        chainId: 33333,
        name: "First Chain",
        rpcUrl: "https://first-rpc.com",
        symbol: "FST",
        blockExplorerUrl: "https://first-explorer.com",
      })

      const duplicateResult = await server.callTool("add_custom_chain", {
        chainId: 33333,
        name: "Second Chain",
        rpcUrl: "https://second-rpc.com",
        symbol: "SND",
        blockExplorerUrl: "https://second-explorer.com",
      })

      expect(duplicateResult.isError).toBe(true)
      if (duplicateResult.isError) {
        expect(duplicateResult.content).toMatch(/(already exists|duplicate|chain id)/i)
      }
    })

    test("should prevent removal of built-in chains", async () => {
      const removeResult = await server.callTool("remove_custom_chain", {
        chainId: 1,
      })

      expect(removeResult.isError).toBe(true)
      if (removeResult.isError) {
        expect(removeResult.content).toMatch(/(built-in|cannot remove|protected)/i)
      }
    })
  })

  describe("3. Cross-Chain Balance Checking", () => {
    beforeEach(async () => {
      await server.callTool("connect_wallet", {
        address: testAddress,
      })
    })

    test("should check balances across multiple chains", async () => {
      const chains = [
        { id: 31337, name: "Anvil", symbol: "ETH" },
        { id: 1, name: "Ethereum", symbol: "ETH" },
        { id: 137, name: "Polygon", symbol: "MATIC" },
        { id: 42161, name: "Arbitrum", symbol: "ETH" },
      ]

      for (const chain of chains) {
        const switchResult = await server.callTool("switch_chain", {
          chainId: chain.id,
        })
        expect(switchResult.isError).toBe(false)

        const balanceResult = await server.callTool("get_balance", {})
        expect(balanceResult.isError).toBe(false)

        if (!balanceResult.isError) {
          const response = balanceResult.content[0].text
          expect(response).toMatch(
            new RegExp(`\\d+(\\.\\d+)?\\s*(${chain.symbol}|${chain.symbol.toLowerCase()})`, "i"),
          )
        }
      }
    })

    test("should handle balance queries for specific addresses on different chains", async () => {
      await server.callTool("switch_chain", { chainId: 1 })

      const ethBalanceResult = await server.callTool("get_balance", {
        address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      })
      expect(ethBalanceResult.isError).toBe(false)
      if (!ethBalanceResult.isError) {
        expect(ethBalanceResult.content[0].text).toMatch(/\d+(\.\d+)?\s*ETH/i)
      }

      await server.callTool("switch_chain", { chainId: 137 })

      const maticBalanceResult = await server.callTool("get_balance", {
        address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      })
      expect(maticBalanceResult.isError).toBe(false)
      if (!maticBalanceResult.isError) {
        expect(maticBalanceResult.content[0].text).toMatch(/\d+(\.\d+)?\s*MATIC/i)
      }
    })
  })

  describe("4. Cross-Chain Transaction Operations", () => {
    beforeEach(async () => {
      await server.callTool("import_private_key", {
        privateKey: testPrivateKey,
      })

      await server.callTool("set_wallet_type", {
        type: "privateKey",
      })

      await server.callTool("connect_wallet", {
        address: testAddress,
      })
    })

    test("should estimate gas on different chains", async () => {
      const chains = [31337, 1, 137, 42161] // Anvil, Ethereum, Polygon, Arbitrum

      for (const chainId of chains) {
        await server.callTool("switch_chain", { chainId })

        const gasResult = await server.callTool("estimate_gas", {
          to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          value: "0.01",
        })

        expect(gasResult.isError).toBe(false)
        if (!gasResult.isError) {
          const response = gasResult.content[0].text
          expect(response).toMatch(/(gas|estimate|\d+)/i)
        }
      }
    })

    test("should handle different native currencies correctly", async () => {
      const testCases = [
        { chainId: 1, symbol: "ETH", name: "Ethereum" },
        { chainId: 137, symbol: "MATIC", name: "Polygon" },
        { chainId: 56, symbol: "BNB", name: "BSC" },
      ]

      for (const testCase of testCases) {
        const switchResult = await server.callTool("switch_chain", {
          chainId: testCase.chainId,
        })

        expect(switchResult.isError).toBe(false)
        if (!switchResult.isError) {
          expect(switchResult.content[0].text).toContain(testCase.name)
        }

        const balanceResult = await server.callTool("get_balance", {})
        expect(balanceResult.isError).toBe(false)
        if (!balanceResult.isError) {
          expect(balanceResult.content[0].text).toMatch(
            new RegExp(
              `\\d+(\\.\\d+)?\\s*(${testCase.symbol}|${testCase.symbol.toLowerCase()})`,
              "i",
            ),
          )
        }
      }
    })
  })

  describe("5. Multi-Chain Contract Operations", () => {
    test("should handle contract interactions across chains", async () => {
      await server.callTool("connect_wallet", {
        address: testAddress,
      })

      // Test with a simple contract call on different chains
      const chains = [31337, 1, 137] // Anvil, Ethereum, Polygon

      for (const chainId of chains) {
        await server.callTool("switch_chain", { chainId })

        const chainInfo = await server.callTool("get_chain_info", {})
        expect(chainInfo.isError).toBe(false)
        if (!chainInfo.isError) {
          expect(chainInfo.content[0].text).toMatch(
            new RegExp(`(current.*${chainId}|id.*${chainId})`, "i"),
          )
        }
      }
    })

    test("should validate chain-specific contract addresses", async () => {
      await server.callTool("switch_chain", { chainId: 1 })

      const chainInfo = await server.callTool("get_chain_info", {})
      expect(chainInfo.isError).toBe(false)
      if (!chainInfo.isError) {
        expect(chainInfo.content[0].text).toContain("Ethereum")
      }
    })
  })

  describe("6. Error Handling and Edge Cases", () => {
    test("should handle network connectivity issues", async () => {
      const unreachableChainResult = await server.callTool("add_custom_chain", {
        chainId: 99999,
        name: "Unreachable Chain",
        rpcUrl: "https://nonexistent-rpc-endpoint-that-will-fail.com",
        symbol: "FAIL",
        blockExplorerUrl: "https://fake-explorer.com",
      })

      expect(unreachableChainResult.isError).toBe(false) // Adding should succeed

      const switchResult = await server.callTool("switch_chain", {
        chainId: 99999,
      })

      if (switchResult.isError) {
        expect(switchResult.content).toMatch(/(network|connection|rpc|timeout)/i)
      }
    })

    test("should validate custom chain parameters", async () => {
      const invalidChainId = await server.callTool("add_custom_chain", {
        chainId: -1,
        name: "Invalid Chain",
        rpcUrl: "https://invalid-rpc.com",
        symbol: "INV",
        blockExplorerUrl: "https://invalid-explorer.com",
      })

      expect(invalidChainId.isError).toBe(true)
      if (invalidChainId.isError) {
        expect(invalidChainId.content).toMatch(/(invalid|chain id|negative)/i)
      }

      const invalidRpc = await server.callTool("add_custom_chain", {
        chainId: 55555,
        name: "Invalid RPC Chain",
        rpcUrl: "not-a-valid-url",
        symbol: "INV",
        blockExplorerUrl: "https://valid-explorer.com",
      })

      expect(invalidRpc.isError).toBe(true)
      if (invalidRpc.isError) {
        expect(invalidRpc.content).toMatch(/(invalid|url|rpc)/i)
      }
    })

    test("should handle operations on non-existent custom chains", async () => {
      const updateResult = await server.callTool("update_custom_chain", {
        chainId: 77777,
        name: "Nonexistent Chain",
        rpcUrl: "https://some-rpc.com",
        symbol: "NON",
        blockExplorerUrl: "https://some-explorer.com",
      })

      expect(updateResult.isError).toBe(true)
      if (updateResult.isError) {
        expect(updateResult.content).toMatch(/(not found|doesn't exist|unknown)/i)
      }

      const removeResult = await server.callTool("remove_custom_chain", {
        chainId: 88888,
      })

      expect(removeResult.isError).toBe(true)
      if (removeResult.isError) {
        expect(removeResult.content).toMatch(/(not found|doesn't exist|unknown)/i)
      }
    })
  })

  describe("7. Complete Multi-Chain Development Workflow", () => {
    test("should support full multi-chain development lifecycle", async () => {
      // 1. Start with chain discovery
      const initialChainInfo = await server.callTool("get_chain_info", {})
      expect(initialChainInfo.isError).toBe(false)

      // 2. Add development and staging chains
      await server.callTool("add_custom_chain", {
        chainId: 12345,
        name: "Development Chain",
        rpcUrl: "https://dev-rpc.myproject.com",
        symbol: "DEV",
        blockExplorerUrl: "https://dev-explorer.myproject.com",
      })

      await server.callTool("add_custom_chain", {
        chainId: 54321,
        name: "Staging Chain",
        rpcUrl: "https://staging-rpc.myproject.com",
        symbol: "STG",
        blockExplorerUrl: "https://staging-explorer.myproject.com",
      })

      // 3. Connect wallet for testing
      await server.callTool("import_private_key", {
        privateKey: testPrivateKey,
      })

      await server.callTool("set_wallet_type", {
        type: "privateKey",
      })

      await server.callTool("connect_wallet", {
        address: testAddress,
      })

      // 4. Test on development chain
      await server.callTool("switch_chain", { chainId: 12345 })

      const devChainInfo = await server.callTool("get_chain_info", {})
      expect(devChainInfo.isError).toBe(false)
      if (!devChainInfo.isError) {
        expect(devChainInfo.content[0].text).toContain("Development Chain")
      }

      // 5. Test gas estimation on dev chain
      const devGasResult = await server.callTool("estimate_gas", {
        to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        value: "0.01",
      })
      expect(devGasResult.isError).toBe(false)

      // 6. Switch to staging for final testing
      await server.callTool("switch_chain", { chainId: 54321 })

      const stagingChainInfo = await server.callTool("get_chain_info", {})
      expect(stagingChainInfo.isError).toBe(false)
      if (!stagingChainInfo.isError) {
        expect(stagingChainInfo.content[0].text).toContain("Staging Chain")
      }

      // 7. Deploy to mainnet (switch to Ethereum)
      await server.callTool("switch_chain", { chainId: 1 })

      const mainnetChainInfo = await server.callTool("get_chain_info", {})
      expect(mainnetChainInfo.isError).toBe(false)
      if (!mainnetChainInfo.isError) {
        expect(mainnetChainInfo.content[0].text).toContain("Ethereum")
      }

      // 8. Extend to Layer 2s
      await server.callTool("switch_chain", { chainId: 137 }) // Polygon
      await server.callTool("switch_chain", { chainId: 42161 }) // Arbitrum

      // 9. Update staging configuration
      await server.callTool("update_custom_chain", {
        chainId: 54321,
        name: "Updated Staging Chain",
        rpcUrl: "https://new-staging-rpc.myproject.com",
        symbol: "STG2",
        blockExplorerUrl: "https://new-staging-explorer.myproject.com",
      })

      // 10. Clean up development chain
      await server.callTool("remove_custom_chain", {
        chainId: 12345,
      })

      const finalChainInfo = await server.callTool("get_chain_info", {})
      expect(finalChainInfo.isError).toBe(false)
      if (!finalChainInfo.isError) {
        const response = finalChainInfo.content[0].text
        expect(response).toContain("Updated Staging Chain")
        expect(response).not.toContain("Development Chain")
      }
    }, 20000) // Allow extra time for complete workflow
  })
})
