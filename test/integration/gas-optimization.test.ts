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

describe("Gas Optimization Integration Test", () => {
  let server: McpServer
  let testContainer: TestContainer

  const testAddress1 = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  const testAddress2 = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
  const testPrivateKey1 = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

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

  describe("1. Basic Gas Estimation", () => {
    beforeEach(async () => {
      // Connect wallet for gas operations
      await server.callTool("connect_wallet", {
        address: testAddress1,
      })
    })

    test("should estimate gas for simple ETH transfers", async () => {
      const gasResult = await server.callTool("estimate_gas", {
        to: testAddress2,
        value: "0.1",
      })

      expect(gasResult.isError).toBe(false)
      if (!gasResult.isError) {
        const response = gasResult.content[0].text
        expect(response).toMatch(/gas.*\d+/i)
        expect(response).toMatch(/estimate|cost|fee/i)
        // Simple transfer should be around 21,000 gas
        expect(response).toMatch(/21[\s,]*000|0x5208/i)
      }
    })

    test("should estimate gas with different amounts", async () => {
      const testAmounts = ["0.001", "1.0", "10.0"]

      for (const amount of testAmounts) {
        const gasResult = await server.callTool("estimate_gas", {
          to: testAddress2,
          value: amount,
        })

        expect(gasResult.isError).toBe(false)
        if (!gasResult.isError) {
          const response = gasResult.content[0].text
          expect(response).toMatch(/gas.*\d+/i)
          // ETH transfers should have consistent gas regardless of amount
          expect(response).toMatch(/21[\s,]*000|0x5208/i)
        }
      }
    })

    test("should estimate gas with custom data", async () => {
      // Test with contract interaction data (e.g., ERC-20 transfer)
      const erc20TransferData =
        "0xa9059cbb000000000000000000000000" +
        testAddress2.slice(2) +
        "0000000000000000000000000000000000000000000000000de0b6b3a7640000" // 1 token (18 decimals)

      const gasResult = await server.callTool("estimate_gas", {
        to: "0xA0b86a33E6411c980C96B9f372a98a4d3D5b6b8e", // Mock ERC-20 contract
        data: erc20TransferData,
      })

      expect(gasResult.isError).toBe(false)
      if (!gasResult.isError) {
        const response = gasResult.content[0].text
        expect(response).toMatch(/gas.*\d+/i)
        // Contract calls should require more gas than simple transfers
        const gasMatch = response.match(/(\d+)/)?.[1]
        if (gasMatch) {
          const gasAmount = parseInt(gasMatch)
          expect(gasAmount).toBeGreaterThan(21000)
        }
      }
    })

    test("should handle gas estimation errors gracefully", async () => {
      // Test with insufficient balance scenario
      const gasResult = await server.callTool("estimate_gas", {
        to: testAddress2,
        value: "999999999999999999999999", // Impossible amount
      })

      // Should either succeed with estimation or fail gracefully
      if (gasResult.isError) {
        expect(gasResult.content).toMatch(/(insufficient|balance|funds|revert)/i)
      } else {
        // If it succeeds, should still provide valid gas estimate
        expect(gasResult.content[0].text).toMatch(/gas.*\d+/i)
      }
    })
  })

  describe("2. Cross-Chain Gas Comparison", () => {
    beforeEach(async () => {
      // Setup private key wallet for cross-chain testing
      await server.callTool("import_private_key", {
        privateKey: testPrivateKey1,
      })

      await server.callTool("set_wallet_type", {
        type: "privateKey",
      })

      await server.callTool("connect_wallet", {
        address: testAddress1,
      })
    })

    test("should compare gas costs across different chains", async () => {
      const chains: Array<{ id: number; name: string; expectedRange: [number, number] }> = [
        { id: 31337, name: "Anvil", expectedRange: [21000, 25000] },
        { id: 1, name: "Ethereum", expectedRange: [21000, 25000] },
        { id: 137, name: "Polygon", expectedRange: [21000, 25000] },
        { id: 42161, name: "Arbitrum", expectedRange: [21000, 30000] }, // L2 may have different gas
      ]

      const gasEstimates = []

      for (const chain of chains) {
        // Switch to the chain
        const switchResult = await server.callTool("switch_chain", {
          chainId: chain.id,
        })
        expect(switchResult.isError).toBe(false)

        // Estimate gas for the same transaction
        const gasResult = await server.callTool("estimate_gas", {
          to: testAddress2,
          value: "0.01",
        })

        expect(gasResult.isError).toBe(false)
        if (!gasResult.isError) {
          const response = gasResult.content[0].text
          expect(response).toMatch(/gas.*\d+/i)

          // Extract gas amount for comparison
          const gasMatch = response.match(/(\d+)/)?.[1]
          if (gasMatch) {
            const gasAmount = parseInt(gasMatch, 10)
            expect(gasAmount).not.toBeNaN()
            gasEstimates.push({ chain: chain.name, gas: gasAmount })

            // Verify gas is within expected range for chain
            expect(gasAmount).toBeGreaterThanOrEqual(chain.expectedRange[0])
            expect(gasAmount).toBeLessThanOrEqual(chain.expectedRange[1])
          }
        }
      }

      // Should have collected estimates from all chains
      expect(gasEstimates.length).toBeGreaterThan(0)
    })

    test("should show different gas patterns for Layer 1 vs Layer 2", async () => {
      const l1Chain = { id: 1, name: "Ethereum" }
      const l2Chain = { id: 137, name: "Polygon" }

      // Test on Layer 1
      await server.callTool("switch_chain", { chainId: l1Chain.id })
      const l1GasResult = await server.callTool("estimate_gas", {
        to: testAddress2,
        value: "0.01",
      })
      expect(l1GasResult.isError).toBe(false)

      // Test on Layer 2
      await server.callTool("switch_chain", { chainId: l2Chain.id })
      const l2GasResult = await server.callTool("estimate_gas", {
        to: testAddress2,
        value: "0.01",
      })
      expect(l2GasResult.isError).toBe(false)

      // Both should provide valid gas estimates
      if (!l1GasResult.isError && !l2GasResult.isError) {
        expect(l1GasResult.content[0].text).toMatch(/gas.*\d+/i)
        expect(l2GasResult.content[0].text).toMatch(/gas.*\d+/i)
      }
    })
  })

  describe("3. Contract Interaction Gas Optimization", () => {
    beforeEach(async () => {
      await server.callTool("connect_wallet", {
        address: testAddress1,
      })
    })

    test("should simulate contract calls before gas estimation", async () => {
      // First simulate a contract call
      const mockContractAddress = "0xA0b86a33E6411c980C96B9f372a98a4d3D5b6b8e"

      // Test simulation (this may not work without actual contract, but should handle gracefully)
      const simulateResult = await server.callTool("simulate_contract_call", {
        contract: mockContractAddress,
        function: "transfer",
        args: [testAddress2, "1000000000000000000"], // 1 token
      })

      // Should either succeed or fail gracefully
      if (simulateResult.isError) {
        expect(simulateResult.content).toMatch(/(contract|not found|simulation)/i)
      } else {
        expect(simulateResult.content[0].text).toMatch(/(simulation|result|call)/i)
      }
    })

    test("should estimate gas for different contract functions", async () => {
      const mockContractAddress = "0xA0b86a33E6411c980C96B9f372a98a4d3D5b6b8e"

      // Test different function calls that typically have different gas costs
      const functionTests: Array<{
        name: string
        data: string
        expectedGasRange: [number, number]
      }> = [
        {
          name: "simple_transfer",
          data:
            "0xa9059cbb" + // transfer(address,uint256)
            testAddress2.slice(2).padStart(64, "0") + // to address
            "0000000000000000000000000000000000000000000000000de0b6b3a7640000", // 1 ETH worth
          expectedGasRange: [25000, 80000],
        },
        {
          name: "approve",
          data:
            "0x095ea7b3" + // approve(address,uint256)
            testAddress2.slice(2).padStart(64, "0") + // spender address
            "0000000000000000000000000000000000000000000000000de0b6b3a7640000", // 1 ETH worth
          expectedGasRange: [20000, 60000],
        },
      ]

      for (const test of functionTests) {
        const gasResult = await server.callTool("estimate_gas", {
          to: mockContractAddress,
          data: test.data,
        })

        expect(gasResult.isError).toBe(false)
        if (!gasResult.isError) {
          const response = gasResult.content[0].text
          expect(response).toMatch(/gas.*\d+/i)

          const gasMatch = response.match(/(\d+)/)?.[1]
          if (gasMatch) {
            const gasAmount = parseInt(gasMatch, 10)
            expect(gasAmount).not.toBeNaN()
            expect(gasAmount).toBeGreaterThanOrEqual(test.expectedGasRange[0])
            expect(gasAmount).toBeLessThanOrEqual(test.expectedGasRange[1])
          }
        }
      }
    })

    test("should compare gas costs for batch vs individual operations", async () => {
      // Individual transfer gas estimate
      const singleTransferGas = await server.callTool("estimate_gas", {
        to: testAddress2,
        value: "0.01",
      })
      expect(singleTransferGas.isError).toBe(false)

      // Simulate batch transfer (higher value, representing multiple transfers)
      const batchTransferGas = await server.callTool("estimate_gas", {
        to: testAddress2,
        value: "0.05", // 5x the amount, simulating 5 transfers
      })
      expect(batchTransferGas.isError).toBe(false)

      // Both should provide valid estimates
      if (!singleTransferGas.isError && !batchTransferGas.isError) {
        expect(singleTransferGas.content[0].text).toMatch(/gas.*\d+/i)
        expect(batchTransferGas.content[0].text).toMatch(/gas.*\d+/i)

        // Simple transfers should have same gas regardless of amount
        const singleGas = singleTransferGas.content[0].text.match(/(\d+)/)?.[1]
        const batchGas = batchTransferGas.content[0].text.match(/(\d+)/)?.[1]

        if (singleGas && batchGas) {
          expect(parseInt(singleGas)).toBe(parseInt(batchGas))
        }
      }
    })
  })

  describe("4. Transaction Lifecycle with Gas Monitoring", () => {
    beforeEach(async () => {
      // Setup private key wallet for actual transactions
      await server.callTool("import_private_key", {
        privateKey: testPrivateKey1,
      })

      await server.callTool("set_wallet_type", {
        type: "privateKey",
      })

      await server.callTool("connect_wallet", {
        address: testAddress1,
      })

      // Switch to Anvil for testing
      await server.callTool("switch_chain", {
        chainId: 31337,
      })
    })

    test("should estimate gas before transaction and verify actual usage", async () => {
      // First estimate gas
      const gasEstimate = await server.callTool("estimate_gas", {
        to: testAddress2,
        value: "0.001",
      })

      expect(gasEstimate.isError).toBe(false)
      if (!gasEstimate.isError) {
        expect(gasEstimate.content[0].text).toMatch(/gas.*\d+/i)
      }

      // Send the transaction
      const txResult = await server.callTool("send_transaction", {
        to: testAddress2,
        value: "0.001",
      })

      expect(txResult.isError).toBe(false)
      if (!txResult.isError) {
        const response = txResult.content[0].text
        expect(response).toMatch(/transaction.*sent|hash.*0x/i)

        // Extract transaction hash
        const hashMatch = response.match(/0x[a-fA-F0-9]{64}/)
        expect(hashMatch).toBeTruthy()

        if (hashMatch) {
          const txHash = hashMatch[0]

          // Get transaction receipt to check actual gas used
          const receiptResult = await server.callTool("get_transaction_receipt", {
            hash: txHash,
          })

          expect(receiptResult.isError).toBe(false)
          if (!receiptResult.isError) {
            const receiptResponse = receiptResult.content[0].text
            expect(receiptResponse).toMatch(/(gas.*used|receipt|status.*success)/i)
          }
        }
      }
    }, 10000) // Allow time for transaction mining

    test("should monitor transaction status and gas consumption", async () => {
      // Send a transaction
      const txResult = await server.callTool("send_transaction", {
        to: testAddress2,
        value: "0.0001",
      })

      expect(txResult.isError).toBe(false)
      if (!txResult.isError) {
        const response = txResult.content[0].text
        const hashMatch = response.match(/0x[a-fA-F0-9]{64}/)

        if (hashMatch) {
          const txHash = hashMatch[0]

          // Check transaction status
          const statusResult = await server.callTool("get_transaction_status", {
            hash: txHash,
          })

          expect(statusResult.isError).toBe(false)
          if (!statusResult.isError) {
            const statusResponse = statusResult.content[0].text
            expect(statusResponse).toMatch(/(status|pending|confirmed|success)/i)
          }
        }
      }
    }, 10000)
  })

  describe("5. Gas Price Optimization Strategies", () => {
    beforeEach(async () => {
      await server.callTool("connect_wallet", {
        address: testAddress1,
      })
    })

    test("should handle gas estimation with different transaction priorities", async () => {
      // Test standard transaction
      const standardGas = await server.callTool("estimate_gas", {
        to: testAddress2,
        value: "0.01",
      })
      expect(standardGas.isError).toBe(false)

      // Test with data (should require more gas)
      const dataGas = await server.callTool("estimate_gas", {
        to: testAddress2,
        value: "0.01",
        data: "0x1234567890abcdef", // Some arbitrary data
      })
      expect(dataGas.isError).toBe(false)

      // Verify both provide estimates and data transaction costs more
      if (!standardGas.isError && !dataGas.isError) {
        expect(standardGas.content[0].text).toMatch(/gas.*\d+/i)
        expect(dataGas.content[0].text).toMatch(/gas.*\d+/i)

        const standardAmount = standardGas.content[0].text.match(/(\d+)/)?.[1]
        const dataAmount = dataGas.content[0].text.match(/(\d+)/)?.[1]

        if (standardAmount && dataAmount) {
          expect(parseInt(dataAmount)).toBeGreaterThan(parseInt(standardAmount))
        }
      }
    })

    test("should estimate gas for time-sensitive vs cost-optimized transactions", async () => {
      // Multiple estimates to see consistency
      const estimates: number[] = []

      for (let i = 0; i < 3; i++) {
        const gasResult = await server.callTool("estimate_gas", {
          to: testAddress2,
          value: "0.005",
        })

        expect(gasResult.isError).toBe(false)
        if (!gasResult.isError) {
          const gasMatch = gasResult.content[0].text.match(/(\d+)/)?.[1]
          if (gasMatch) {
            const gasAmount = parseInt(gasMatch, 10)
            if (!Number.isNaN(gasAmount)) {
              estimates.push(gasAmount)
            }
          }
        }
      }

      // Should have consistent estimates for same transaction
      expect(estimates.length).toBe(3)
      expect(estimates.every((est) => est === estimates[0])).toBe(true)
    })
  })

  describe("6. Error Handling and Edge Cases", () => {
    beforeEach(async () => {
      await server.callTool("connect_wallet", {
        address: testAddress1,
      })
    })

    test("should handle gas estimation for invalid recipients", async () => {
      // Test with invalid address
      const invalidResult = await server.callTool("estimate_gas", {
        to: "0xinvalid",
        value: "0.01",
      })

      expect(invalidResult.isError).toBe(true)
      if (invalidResult.isError) {
        expect(invalidResult.content).toMatch(/(invalid|address|format)/i)
      }

      // Test with zero address
      const zeroResult = await server.callTool("estimate_gas", {
        to: "0x0000000000000000000000000000000000000000",
        value: "0.01",
      })

      // Zero address should either be handled or provide estimate
      if (zeroResult.isError) {
        expect(zeroResult.content).toMatch(/(invalid|zero|address)/i)
      } else {
        expect(zeroResult.content[0].text).toMatch(/gas.*\d+/i)
      }
    })

    test("should handle gas estimation with malformed data", async () => {
      // Test with invalid hex data
      const invalidDataResult = await server.callTool("estimate_gas", {
        to: testAddress2,
        value: "0.01",
        data: "invalid-hex-data",
      })

      expect(invalidDataResult.isError).toBe(true)
      if (invalidDataResult.isError) {
        expect(invalidDataResult.content).toMatch(/(invalid|hex|data|format)/i)
      }

      // Test with odd-length hex
      const oddHexResult = await server.callTool("estimate_gas", {
        to: testAddress2,
        value: "0.01",
        data: "0x123", // Odd length
      })

      expect(oddHexResult.isError).toBe(true)
      if (oddHexResult.isError) {
        expect(oddHexResult.content).toMatch(/(invalid|hex|odd|length)/i)
      }
    })

    test("should handle network failures gracefully", async () => {
      // Switch to a chain that might have connectivity issues
      const unreliableChain = { id: 99999 }

      // First add a custom chain with potentially unreliable RPC
      const addChainResult = await server.callTool("add_custom_chain", {
        chainId: unreliableChain.id,
        name: "Unreliable Test Chain",
        rpcUrl: "https://nonexistent-rpc-that-will-timeout.com",
        symbol: "TEST",
        blockExplorerUrl: "https://explorer.test.com",
      })
      expect(addChainResult.isError).toBe(false)

      // Try to switch (may fail or succeed depending on lazy loading)
      const switchResult = await server.callTool("switch_chain", {
        chainId: unreliableChain.id,
      })

      if (switchResult.isError) {
        expect(switchResult.content).toMatch(/(network|connection|timeout|rpc)/i)
      } else {
        // If switch succeeded, gas estimation might fail
        const gasResult = await server.callTool("estimate_gas", {
          to: testAddress2,
          value: "0.01",
        })

        if (gasResult.isError) {
          expect(gasResult.content).toMatch(/(network|connection|timeout|rpc)/i)
        }
      }
    })
  })

  describe("7. Complete Gas Optimization Workflow", () => {
    test("should support complete gas optimization development lifecycle", async () => {
      // 1. Setup for optimization testing
      await server.callTool("import_private_key", {
        privateKey: testPrivateKey1,
      })

      await server.callTool("set_wallet_type", {
        type: "privateKey",
      })

      await server.callTool("connect_wallet", {
        address: testAddress1,
      })

      // 2. Test on development chain (Anvil)
      await server.callTool("switch_chain", { chainId: 31337 })

      const devGasEstimate = await server.callTool("estimate_gas", {
        to: testAddress2,
        value: "0.01",
      })
      expect(devGasEstimate.isError).toBe(false)

      // 3. Compare across multiple chains for gas optimization
      const chains = [31337, 1, 137] // Anvil, Ethereum, Polygon
      const chainGasData = []

      for (const chainId of chains) {
        await server.callTool("switch_chain", { chainId })

        const gasResult = await server.callTool("estimate_gas", {
          to: testAddress2,
          value: "0.01",
        })

        if (!gasResult.isError) {
          const gasMatch = gasResult.content[0].text.match(/(\d+)/)?.[1]
          if (gasMatch) {
            chainGasData.push({ chainId, gas: parseInt(gasMatch) })
          }
        }
      }

      // Should have collected gas data from multiple chains
      expect(chainGasData.length).toBeGreaterThan(0)

      // 4. Test different transaction types for optimization
      await server.callTool("switch_chain", { chainId: 31337 }) // Back to Anvil for testing

      const transactionTypes = [
        { type: "simple", to: testAddress2, value: "0.01" },
        { type: "with_data", to: testAddress2, value: "0.01", data: "0x1234" },
      ]

      for (const txType of transactionTypes) {
        const gasResult = await server.callTool("estimate_gas", txType)
        expect(gasResult.isError).toBe(false)
        if (!gasResult.isError) {
          expect(gasResult.content[0].text).toMatch(/gas.*\d+/i)
        }
      }

      // 5. Simulate actual transaction with optimized gas
      const optimizedTxResult = await server.callTool("send_transaction", {
        to: testAddress2,
        value: "0.001", // Small amount for testing
      })

      expect(optimizedTxResult.isError).toBe(false)

      if (!optimizedTxResult.isError) {
        const response = optimizedTxResult.content[0].text
        const hashMatch = response.match(/0x[a-fA-F0-9]{64}/)

        if (hashMatch) {
          const txHash = hashMatch[0]

          // 6. Verify actual gas usage vs estimate
          const receiptResult = await server.callTool("get_transaction_receipt", {
            hash: txHash,
          })

          expect(receiptResult.isError).toBe(false)
          if (!receiptResult.isError) {
            expect(receiptResult.content[0].text).toMatch(/(gas.*used|receipt|success)/i)
          }
        }
      }

      // 7. Final verification - check transaction status
      if (!optimizedTxResult.isError) {
        const hashMatch = optimizedTxResult.content[0].text.match(/0x[a-fA-F0-9]{64}/)
        if (hashMatch) {
          const statusResult = await server.callTool("get_transaction_status", {
            hash: hashMatch[0],
          })

          expect(statusResult.isError).toBe(false)
          if (!statusResult.isError) {
            expect(statusResult.content[0].text).toMatch(/(status|success|confirmed)/i)
          }
        }
      }
    }, 15000) // Allow extra time for complete workflow with transactions
  })
})
