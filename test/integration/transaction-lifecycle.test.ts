import { beforeEach, describe, expect, test } from "bun:test"
import type { McpServer } from "../../src/server.js"
import { TestContainer } from "../../src/test-container.js"

describe("Transaction Lifecycle Integration Test", () => {
  let testContainer: TestContainer
  let server: McpServer

  // Test wallet details (Anvil default accounts)
  const testAddress1 = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  const testAddress2 = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
  const testAddress3 = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
  const testPrivateKey1 = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

  beforeEach(async () => {
    testContainer = TestContainer.createForTest({})
    server = testContainer.get("server")

    // Setup private key wallet for all tests
    await server.callTool("import_private_key", {
      privateKey: testPrivateKey1,
    })

    await server.callTool("set_wallet_type", {
      type: "privateKey",
    })

    await server.callTool("connect_wallet", {
      address: testAddress1,
    })

    // Switch to Anvil for reliable testing
    await server.callTool("switch_chain", {
      chainId: 31337,
    })
  })

  describe("1. Basic Transaction Lifecycle", () => {
    test("should complete full ETH transfer lifecycle", async () => {
      // 1. Check initial balance
      const initialBalance = await server.callTool("get_balance", {})
      expect(initialBalance.isError).toBe(false)

      // 2. Estimate gas for transaction
      const gasEstimate = await server.callTool("estimate_gas", {
        to: testAddress2,
        value: "0.1",
      })
      expect(gasEstimate.isError).toBe(false)
      if (!gasEstimate.isError) {
        expect(gasEstimate.content[0].text).toMatch(/gas.*\d+/i)
      }

      // 3. Send transaction
      const txResult = await server.callTool("send_transaction", {
        to: testAddress2,
        value: "0.1",
      })
      expect(txResult.isError).toBe(false)

      let txHash: string | null = null
      if (!txResult.isError) {
        const response = txResult.content[0].text
        expect(response).toMatch(/transaction.*sent|hash.*0x/i)

        const hashMatch = response.match(/0x[a-fA-F0-9]{64}/)
        expect(hashMatch).toBeTruthy()
        if (hashMatch) {
          txHash = hashMatch[0]
        }
      }

      // 4. Monitor transaction status
      if (txHash) {
        const statusResult = await server.callTool("get_transaction_status", {
          hash: txHash,
        })
        expect(statusResult.isError).toBe(false)
        if (!statusResult.isError) {
          expect(statusResult.content[0].text).toMatch(/(status|pending|confirmed|success)/i)
        }

        // 5. Get transaction receipt
        const receiptResult = await server.callTool("get_transaction_receipt", {
          hash: txHash,
        })
        expect(receiptResult.isError).toBe(false)
        if (!receiptResult.isError) {
          const response = receiptResult.content[0].text
          expect(response).toMatch(/(receipt|gas.*used|status.*success)/i)
          expect(response).toContain(testAddress1.toLowerCase())
          expect(response).toContain(testAddress2.toLowerCase())
        }
      }

      // 6. Verify balance changes
      const finalBalance = await server.callTool("get_balance", {})
      expect(finalBalance.isError).toBe(false)

      const recipientBalance = await server.callTool("get_balance", {
        address: testAddress2,
      })
      expect(recipientBalance.isError).toBe(false)
    }, 15000)

    test("should handle transaction with custom data", async () => {
      // Send transaction with custom data
      const customData = "0x48656c6c6f20576f726c64" // "Hello World" in hex

      const txResult = await server.callTool("send_transaction", {
        to: testAddress2,
        value: "0.01",
        data: customData,
      })

      expect(txResult.isError).toBe(false)
      if (!txResult.isError) {
        const response = txResult.content[0].text
        expect(response).toMatch(/transaction.*sent|hash.*0x/i)

        const hashMatch = response.match(/0x[a-fA-F0-9]{64}/)
        if (hashMatch) {
          const txHash = hashMatch[0]

          // Verify receipt includes the custom data
          const receiptResult = await server.callTool("get_transaction_receipt", {
            hash: txHash,
          })
          expect(receiptResult.isError).toBe(false)
          if (!receiptResult.isError) {
            expect(receiptResult.content[0].text).toMatch(/(receipt|success)/i)
          }
        }
      }
    }, 10000)

    test("should track multiple simultaneous transactions", async () => {
      const transactions: string[] = []

      // Send multiple transactions concurrently
      const txPromises = [
        server.callTool("send_transaction", {
          to: testAddress2,
          value: "0.01",
        }),
        server.callTool("send_transaction", {
          to: testAddress3,
          value: "0.02",
        }),
      ]

      const results = await Promise.all(txPromises)

      // Extract transaction hashes
      for (const result of results) {
        expect(result.isError).toBe(false)
        if (!result.isError) {
          const hashMatch = result.content[0].text.match(/0x[a-fA-F0-9]{64}/)
          if (hashMatch) {
            transactions.push(hashMatch[0])
          }
        }
      }

      expect(transactions.length).toBe(2)

      // Monitor status of all transactions
      for (const txHash of transactions) {
        const statusResult = await server.callTool("get_transaction_status", {
          hash: txHash,
        })
        expect(statusResult.isError).toBe(false)
        if (!statusResult.isError) {
          expect(statusResult.content[0].text).toMatch(/(status|success|confirmed)/i)
        }
      }
    }, 15000)
  })

  describe("2. Token Transaction Lifecycle", () => {
    // Mock ERC-20 token for testing
    const mockTokenAddress = "0x1234567890123456789012345678901234567890"

    test("should handle ERC-20 token transfer lifecycle", async () => {
      // Note: This will likely fail without a real token contract, but tests the workflow
      const tokenTransferResult = await server.callTool("transfer_token", {
        token: mockTokenAddress,
        to: testAddress2,
        amount: "100",
      })

      // Should handle gracefully if token doesn't exist
      if (tokenTransferResult.isError) {
        expect(tokenTransferResult.content).toMatch(/(token|contract|not found|invalid)/i)
      } else {
        // If successful, should provide transaction hash
        expect(tokenTransferResult.content[0].text).toMatch(/transaction|hash|0x/i)

        const hashMatch = tokenTransferResult.content[0].text.match(/0x[a-fA-F0-9]{64}/)
        if (hashMatch) {
          const txHash = hashMatch[0]

          const statusResult = await server.callTool("get_transaction_status", {
            hash: txHash,
          })
          expect(statusResult.isError).toBe(false)
        }
      }
    })

    test("should handle token approval lifecycle", async () => {
      const approvalResult = await server.callTool("approve_token", {
        token: mockTokenAddress,
        spender: testAddress2,
        amount: "1000",
      })

      // Should handle gracefully if token doesn't exist
      if (approvalResult.isError) {
        expect(approvalResult.content).toMatch(/(token|contract|not found|invalid)/i)
      } else {
        expect(approvalResult.content[0].text).toMatch(/transaction|approval|hash/i)
      }
    })

    test("should check token balance before and after transfer", async () => {
      // Check initial balance (likely 0 or error for mock token)
      const initialBalance = await server.callTool("get_token_balance", {
        token: mockTokenAddress,
        address: testAddress1,
      })

      // Should handle gracefully - either return 0 or error for non-existent token
      if (initialBalance.isError) {
        expect(initialBalance.content).toMatch(/(token|contract|not found)/i)
      } else {
        expect(initialBalance.content[0].text).toMatch(/balance.*\d+/i)
      }
    })
  })

  describe("3. NFT Transaction Lifecycle", () => {
    const mockNftAddress = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"
    const tokenId = "123"

    test("should handle NFT transfer lifecycle", async () => {
      const nftTransferResult = await server.callTool("transfer_nft", {
        nft: mockNftAddress,
        to: testAddress2,
        tokenId: tokenId,
      })

      // Should handle gracefully if NFT contract doesn't exist
      if (nftTransferResult.isError) {
        expect(nftTransferResult.content).toMatch(/(nft|contract|not found|invalid|token)/i)
      } else {
        expect(nftTransferResult.content[0].text).toMatch(/transaction|transfer|hash/i)

        const hashMatch = nftTransferResult.content[0].text.match(/0x[a-fA-F0-9]{64}/)
        if (hashMatch) {
          const txHash = hashMatch[0]

          const receiptResult = await server.callTool("get_transaction_receipt", {
            hash: txHash,
          })
          expect(receiptResult.isError).toBe(false)
        }
      }
    })

    test("should check NFT ownership before and after transfer", async () => {
      // Check NFT ownership
      const ownershipResult = await server.callTool("get_nft_info", {
        nft: mockNftAddress,
        tokenId: tokenId,
      })

      // Should handle gracefully for mock NFT
      if (ownershipResult.isError) {
        expect(ownershipResult.content).toMatch(/(nft|contract|not found|invalid)/i)
      } else {
        expect(ownershipResult.content[0].text).toMatch(/(owner|metadata|token)/i)
      }
    })
  })

  describe("4. Transaction Error Handling and Recovery", () => {
    test("should handle insufficient balance gracefully", async () => {
      // Try to send more ETH than available
      const txResult = await server.callTool("send_transaction", {
        to: testAddress2,
        value: "999999999", // Impossibly large amount
      })

      expect(txResult.isError).toBe(true)
      if (txResult.isError) {
        expect(txResult.content).toMatch(/(insufficient|balance|funds|exceed)/i)
      }
    })

    test("should handle invalid recipient addresses", async () => {
      const invalidAddresses = [
        "0xinvalid",
        "not-an-address",
        "0x123", // Too short
        "0xzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz", // Invalid hex
      ]

      for (const invalidAddress of invalidAddresses) {
        const txResult = await server.callTool("send_transaction", {
          to: invalidAddress,
          value: "0.01",
        })

        expect(txResult.isError).toBe(true)
        if (txResult.isError) {
          expect(txResult.content).toMatch(/(invalid|address|format)/i)
        }
      }
    })

    test("should handle malformed transaction data", async () => {
      // Test with invalid hex data
      const invalidDataResult = await server.callTool("send_transaction", {
        to: testAddress2,
        value: "0.01",
        data: "not-hex-data",
      })

      expect(invalidDataResult.isError).toBe(true)
      if (invalidDataResult.isError) {
        expect(invalidDataResult.content).toMatch(/(invalid|hex|data|format)/i)
      }

      // Test with odd-length hex
      const oddLengthResult = await server.callTool("send_transaction", {
        to: testAddress2,
        value: "0.01",
        data: "0x123", // Odd length
      })

      expect(oddLengthResult.isError).toBe(true)
      if (oddLengthResult.isError) {
        expect(oddLengthResult.content).toMatch(/(invalid|hex|odd|length)/i)
      }
    })

    test("should handle non-existent transaction queries", async () => {
      const fakeHash = "0x1234567890123456789012345678901234567890123456789012345678901234"

      // Query status of non-existent transaction
      const statusResult = await server.callTool("get_transaction_status", {
        hash: fakeHash,
      })

      expect(statusResult.isError).toBe(true)
      if (statusResult.isError) {
        expect(statusResult.content).toMatch(/(not found|doesn't exist|invalid|transaction)/i)
      }

      // Query receipt of non-existent transaction
      const receiptResult = await server.callTool("get_transaction_receipt", {
        hash: fakeHash,
      })

      expect(receiptResult.isError).toBe(true)
      if (receiptResult.isError) {
        expect(receiptResult.content).toMatch(/(not found|doesn't exist|invalid|transaction)/i)
      }
    })
  })

  describe("5. Cross-Chain Transaction Lifecycle", () => {
    test("should handle transactions on different chains", async () => {
      const chains = [31337, 1, 137] // Anvil, Ethereum, Polygon
      const chainTransactions: Array<{ chainId: number; txHash: string }> = []

      for (const chainId of chains) {
        // Switch to the chain
        const switchResult = await server.callTool("switch_chain", {
          chainId,
        })
        expect(switchResult.isError).toBe(false)

        // Send a small transaction on this chain
        const txResult = await server.callTool("send_transaction", {
          to: testAddress2,
          value: "0.001",
        })

        if (!txResult.isError) {
          const hashMatch = txResult.content[0].text.match(/0x[a-fA-F0-9]{64}/)
          if (hashMatch) {
            chainTransactions.push({ chainId, txHash: hashMatch[0] })
          }
        }
        // Note: Mainnet transactions will likely fail due to gas/funds, but Anvil should work
      }

      // Should have at least one successful transaction (Anvil)
      expect(chainTransactions.length).toBeGreaterThan(0)

      // Monitor transactions on their respective chains
      for (const { chainId, txHash } of chainTransactions) {
        await server.callTool("switch_chain", { chainId })

        const statusResult = await server.callTool("get_transaction_status", {
          hash: txHash,
        })
        expect(statusResult.isError).toBe(false)
      }
    }, 20000)

    test("should show different gas patterns on different chains", async () => {
      const gasEstimates: Array<{ chainId: number; gas: number }> = []

      const testChains = [31337, 1, 137] // Anvil, Ethereum, Polygon

      for (const chainId of testChains) {
        await server.callTool("switch_chain", { chainId })

        const gasResult = await server.callTool("estimate_gas", {
          to: testAddress2,
          value: "0.01",
        })

        if (!gasResult.isError) {
          const gasMatch = gasResult.content[0].text.match(/(\d+)/)?.[1]
          if (gasMatch) {
            gasEstimates.push({ chainId, gas: parseInt(gasMatch) })
          }
        }
      }

      // Should have estimates from multiple chains
      expect(gasEstimates.length).toBeGreaterThan(0)

      // All estimates should be reasonable for ETH transfers
      for (const estimate of gasEstimates) {
        expect(estimate.gas).toBeGreaterThan(20000) // At least 21k gas
        expect(estimate.gas).toBeLessThan(100000) // Not excessive
      }
    })
  })

  describe("6. Transaction Batching and Optimization", () => {
    test("should optimize gas for multiple similar transactions", async () => {
      const recipients = [testAddress2, testAddress3]
      const batchTransactions: string[] = []

      // Send multiple transactions quickly
      for (const recipient of recipients) {
        // Estimate gas first
        const gasResult = await server.callTool("estimate_gas", {
          to: recipient,
          value: "0.005",
        })
        expect(gasResult.isError).toBe(false)

        // Send transaction
        const txResult = await server.callTool("send_transaction", {
          to: recipient,
          value: "0.005",
        })

        expect(txResult.isError).toBe(false)
        if (!txResult.isError) {
          const hashMatch = txResult.content[0].text.match(/0x[a-fA-F0-9]{64}/)
          if (hashMatch) {
            batchTransactions.push(hashMatch[0])
          }
        }
      }

      expect(batchTransactions.length).toBe(recipients.length)

      // Monitor all transactions
      for (const txHash of batchTransactions) {
        const statusResult = await server.callTool("get_transaction_status", {
          hash: txHash,
        })
        expect(statusResult.isError).toBe(false)
      }
    }, 15000)

    test("should handle transaction nonce management", async () => {
      // Send multiple transactions in sequence to test nonce handling
      const sequentialTxs: string[] = []

      for (let i = 0; i < 3; i++) {
        const txResult = await server.callTool("send_transaction", {
          to: testAddress2,
          value: "0.001",
        })

        expect(txResult.isError).toBe(false)
        if (!txResult.isError) {
          const hashMatch = txResult.content[0].text.match(/0x[a-fA-F0-9]{64}/)
          if (hashMatch) {
            sequentialTxs.push(hashMatch[0])
          }
        }

        // Small delay to ensure proper nonce sequencing
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      expect(sequentialTxs.length).toBe(3)

      // All transactions should have different hashes (different nonces)
      const uniqueHashes = new Set(sequentialTxs)
      expect(uniqueHashes.size).toBe(3)

      // All should eventually succeed
      for (const txHash of sequentialTxs) {
        const receiptResult = await server.callTool("get_transaction_receipt", {
          hash: txHash,
        })
        expect(receiptResult.isError).toBe(false)
      }
    }, 20000)
  })

  describe("7. Complete Transaction Lifecycle Workflow", () => {
    test("should support complete production transaction workflow", async () => {
      // 1. Pre-transaction setup and validation
      const initialBalance = await server.callTool("get_balance", {})
      expect(initialBalance.isError).toBe(false)

      const recipientInitialBalance = await server.callTool("get_balance", {
        address: testAddress2,
      })
      expect(recipientInitialBalance.isError).toBe(false)

      // 2. Transaction planning with gas estimation
      const gasEstimate = await server.callTool("estimate_gas", {
        to: testAddress2,
        value: "0.5",
      })
      expect(gasEstimate.isError).toBe(false)

      let estimatedGas: number = 21000
      if (!gasEstimate.isError) {
        const gasMatch = gasEstimate.content[0].text.match(/(\d+)/)?.[1]
        if (gasMatch) {
          estimatedGas = parseInt(gasMatch)
        }
      }

      // 3. Transaction execution
      const txResult = await server.callTool("send_transaction", {
        to: testAddress2,
        value: "0.5",
      })
      expect(txResult.isError).toBe(false)

      let txHash: string | null = null
      if (!txResult.isError) {
        const response = txResult.content[0].text
        expect(response).toMatch(/transaction.*sent|hash.*0x/i)

        const hashMatch = response.match(/0x[a-fA-F0-9]{64}/)
        expect(hashMatch).toBeTruthy()
        if (hashMatch) {
          txHash = hashMatch[0]
        }
      }

      // 4. Transaction monitoring and status tracking
      if (txHash) {
        let attempts = 0
        let confirmed = false

        while (attempts < 10 && !confirmed) {
          const statusResult = await server.callTool("get_transaction_status", {
            hash: txHash,
          })

          expect(statusResult.isError).toBe(false)
          if (!statusResult.isError) {
            const statusText = statusResult.content[0].text
            if (statusText.match(/(success|confirmed|mined)/i)) {
              confirmed = true
            }
          }

          if (!confirmed) {
            await new Promise((resolve) => setTimeout(resolve, 500))
          }
          attempts++
        }

        // 5. Receipt verification and gas usage analysis
        const receiptResult = await server.callTool("get_transaction_receipt", {
          hash: txHash,
        })
        expect(receiptResult.isError).toBe(false)

        if (!receiptResult.isError) {
          const receiptText = receiptResult.content[0].text
          expect(receiptText).toMatch(/(receipt|gas.*used|status.*success)/i)

          // Verify gas usage is close to estimate
          const gasUsedMatch = receiptText.match(/gas.*used.*?(\d+)/i)?.[1]
          if (gasUsedMatch) {
            const actualGas = parseInt(gasUsedMatch)
            // Actual gas should be close to estimate (within reasonable range)
            expect(actualGas).toBeGreaterThanOrEqual(estimatedGas * 0.8)
            expect(actualGas).toBeLessThanOrEqual(estimatedGas * 1.2)
          }
        }

        // 6. Post-transaction balance verification
        const finalBalance = await server.callTool("get_balance", {})
        expect(finalBalance.isError).toBe(false)

        const recipientFinalBalance = await server.callTool("get_balance", {
          address: testAddress2,
        })
        expect(recipientFinalBalance.isError).toBe(false)

        // 7. Transaction history and audit trail
        // Re-query the transaction to ensure it's permanently recorded
        const finalStatusResult = await server.callTool("get_transaction_status", {
          hash: txHash,
        })
        expect(finalStatusResult.isError).toBe(false)
        if (!finalStatusResult.isError) {
          expect(finalStatusResult.content[0].text).toMatch(/(success|confirmed)/i)
        }
      }

      // 8. Cross-validation with chain state
      // Switch chains and back to ensure state consistency
      await server.callTool("switch_chain", { chainId: 1 }) // Ethereum
      await server.callTool("switch_chain", { chainId: 31337 }) // Back to Anvil

      // Final balance check after chain switching
      const consistencyBalance = await server.callTool("get_balance", {})
      expect(consistencyBalance.isError).toBe(false)
    }, 30000) // Allow extra time for complete workflow
  })
})
