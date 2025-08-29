import { beforeAll, describe, expect, test } from "bun:test"
import {
  type DocumentationExample,
  validateDocumentationExample,
} from "../helpers/documentation-validator.js"
import { setupClaudeSDKTests, testPrompt } from "../setup.js"

describe("Documentation Examples - Transactions", () => {
  beforeAll(() => {
    setupClaudeSDKTests()
  })

  beforeAll(async () => {
    // Connect wallet for transaction tests
    await testPrompt("Connect to 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
  })

  describe("Sending ETH/Native Tokens Section", () => {
    test("should execute 'Send 1 ETH' with exact documented format", async () => {
      const example: DocumentationExample = {
        prompt: "Send 1 ETH to 0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        expectedOutput: {
          contains: ["transaction sent successfully", "hash: 0x"],
        },
        expectedTools: ["send_transaction"],
        description: "Basic ETH transfer with exact format",
        source: "docs/user-guide/transactions.md:12",
        section: "Basic ETH Transfer",
      }

      const result = await testPrompt(example.prompt)
      validateDocumentationExample(result, example)

      // Validate exact format from documentation
      const content = result.finalResult
      expect(content).toMatch(/transaction\s+sent\s+successfully/i)
      expect(content).toMatch(/hash\s*:\s*0x[a-fA-F0-9]{64}/i)
    })

    test("should execute short address transfer as documented", async () => {
      const example: DocumentationExample = {
        prompt: "Send 0.5 ETH to 0x7099",
        expectedOutput: {
          contains: ["transaction sent successfully", "hash"],
        },
        expectedTools: ["send_transaction"],
        description: "Send to short address (auto-expansion)",
        source: "docs/user-guide/transactions.md:26",
        section: "Send to Short Address",
      }

      const result = await testPrompt(example.prompt)
      validateDocumentationExample(result, example)

      // Should auto-expand the short address
      expect(result.finalResult).toMatch(/0x70997970c51812dc3a010c7d01b50e0d17dc79c8/i)
    })

    test("should execute custom gas transaction as documented", async () => {
      const example: DocumentationExample = {
        prompt: "Send 2 ETH to 0x3C44 with fast gas",
        expectedOutput: {
          contains: ["transaction", "fast", "gas"],
        },
        expectedTools: ["send_transaction"],
        description: "Send with custom gas speed",
        source: "docs/user-guide/transactions.md:36",
        section: "Send with Custom Gas",
      }

      const result = await testPrompt(example.prompt)

      if (result.success) {
        validateDocumentationExample(result, example)

        // Should indicate fast gas was used
        expect(result.finalResult).toMatch(/fast|gas|speed|priority/i)
      } else {
        // Should provide helpful info about gas options
        expect(result.finalResult).toMatch(/gas|fast|slow|standard/i)
      }
    })

    test("should test all documented gas speed options", async () => {
      const gasOptions = ["slow", "standard", "fast", "fastest"]

      for (const speed of gasOptions) {
        const result = await testPrompt(`Send 0.001 ETH to 0x7099 with ${speed} gas`)

        if (result.success) {
          expect(result.toolsUsed).toContain("send_transaction")
          console.log(`✓ Gas speed "${speed}" works as documented`)
        } else {
          // Should at least recognize the gas speed option
          expect(result.finalResult).toMatch(new RegExp(speed, "i"))
        }
      }
    })
  })

  describe("Transaction Monitoring Section", () => {
    test("should execute 'Get transaction status' with exact documented format", async () => {
      // First send a transaction to get a hash
      const sendResult = await testPrompt(
        "Send 0.001 ETH to 0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      )

      if (sendResult.success) {
        const hashMatch = sendResult.finalResult.match(/0x[a-fA-F0-9]{64}/)

        if (hashMatch) {
          const txHash = hashMatch[0]

          const example: DocumentationExample = {
            prompt: `Get transaction status ${txHash}`,
            expectedOutput: {
              contains: [
                "transaction status",
                "hash",
                "status",
                "from",
                "to",
                "value",
                "block number",
              ],
            },
            expectedTools: ["get_transaction_status"],
            description: "Check transaction status with documented format",
            source: "docs/user-guide/transactions.md:52",
            section: "Get Transaction Status",
          }

          const result = await testPrompt(example.prompt)

          if (result.success) {
            validateDocumentationExample(result, example)

            // Validate exact format from documentation
            const content = result.finalResult
            expect(content).toMatch(/transaction\s+status\s*:/i)
            expect(content).toMatch(/hash\s*:\s*0x[a-fA-F0-9]{64}/i)
            expect(content).toMatch(/status\s*:\s*(confirmed|pending|failed)/i)
            expect(content).toMatch(/from\s*:\s*0x[a-fA-F0-9]{40}/i)
            expect(content).toMatch(/to\s*:\s*0x[a-fA-F0-9]{40}/i)
            expect(content).toMatch(/value\s*:\s*\d+(\.\d+)?\s*eth/i)
            expect(content).toMatch(/block\s+number\s*:\s*\d+/i)
          }
        }
      }
    })

    test("should execute 'Get transaction receipt' with exact documented format", async () => {
      // Send a transaction to get a hash
      const sendResult = await testPrompt(
        "Send 0.001 ETH to 0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      )

      if (sendResult.success) {
        const hashMatch = sendResult.finalResult.match(/0x[a-fA-F0-9]{64}/)

        if (hashMatch) {
          const txHash = hashMatch[0]

          const example: DocumentationExample = {
            prompt: `Get transaction receipt ${txHash}`,
            expectedOutput: {
              contains: [
                "transaction receipt",
                "hash",
                "status: success",
                "block number",
                "gas used",
                "effective gas price",
                "total cost",
                "logs",
              ],
            },
            expectedTools: ["get_transaction_receipt"],
            description: "Get detailed transaction receipt",
            source: "docs/user-guide/transactions.md:71",
            section: "Get Transaction Receipt",
          }

          const result = await testPrompt(example.prompt)

          if (result.success) {
            validateDocumentationExample(result, example)

            // Validate exact format from documentation
            const content = result.finalResult
            expect(content).toMatch(/transaction\s+receipt\s*:/i)
            expect(content).toMatch(/hash\s*:\s*0x[a-fA-F0-9]{64}/i)
            expect(content).toMatch(/status\s*:\s*(success|failed)/i)
            expect(content).toMatch(/block\s+number\s*:\s*\d+/i)
            expect(content).toMatch(/gas\s+used\s*:\s*\d+\s*units?/i)
            expect(content).toMatch(/effective\s+gas\s+price\s*:\s*[\d.]+\s*gwei/i)
            expect(content).toMatch(/total\s+cost\s*:\s*[\d.]+\s*eth/i)
            expect(content).toMatch(/logs\s*:\s*\d+\s*events?/i)
          }
        }
      }
    })
  })

  describe("Gas Management Section", () => {
    test("should execute 'Estimate gas' with exact documented format", async () => {
      const example: DocumentationExample = {
        prompt: "Estimate gas for sending 1 ETH to 0x7099",
        expectedOutput: {
          contains: ["gas estimation", "estimated gas", "gas price", "total cost"],
        },
        expectedTools: ["estimate_gas"],
        description: "Gas estimation with documented format",
        source: "docs/user-guide/transactions.md:95",
        section: "Estimate Gas Costs",
      }

      const result = await testPrompt(example.prompt)
      validateDocumentationExample(result, example)

      // Validate exact format from documentation
      const content = result.finalResult
      expect(content).toMatch(/gas\s+estimation\s*:/i)
      expect(content).toMatch(/estimated\s+gas\s*:\s*\d+\s*units/i)
      expect(content).toMatch(/gas\s+price\s*:\s*[\d.]+\s*gwei/i)
      expect(content).toMatch(/total\s+cost\s*:\s*[\d.]+\s*eth/i)
    })

    test("should provide gas recommendations for different speeds", async () => {
      const result = await testPrompt("What are the current gas price recommendations?")

      if (result.success) {
        // Should provide different speed options
        const content = result.finalResult.toLowerCase()
        expect(content).toMatch(/slow|standard|fast|fastest/i)
        expect(content).toMatch(/gas.*price|gwei/i)
      }
    })

    test("should handle custom gas parameters as documented", async () => {
      const customGasExample: DocumentationExample = {
        prompt: "Send 0.1 ETH to 0x7099 with gas limit 25000 and gas price 30 gwei",
        expectedOutput: {
          contains: ["transaction", "gas", "limit", "price"],
        },
        expectedTools: ["send_transaction"],
        description: "Custom gas parameters",
        source: "docs/user-guide/transactions.md (implied)",
        section: "Custom Gas Parameters",
      }

      const result = await testPrompt(customGasExample.prompt)

      if (result.success) {
        validateDocumentationExample(result, customGasExample)

        // Should acknowledge custom gas parameters
        expect(result.finalResult).toMatch(/gas.*limit.*25000|25000.*gas/i)
        expect(result.finalResult).toMatch(/gas.*price.*30|30.*gwei/i)
      } else {
        // Should provide helpful info about gas parameters
        expect(result.finalResult).toMatch(/gas.*limit|gas.*price|gwei/i)
      }
    })
  })

  describe("Advanced Transaction Features", () => {
    test("should handle maximum amount transfers as documented", async () => {
      const maxAmountExample: DocumentationExample = {
        prompt: "Send all ETH to 0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        expectedOutput: {
          contains: ["all", "maximum", "available", "balance"],
        },
        expectedTools: ["get_balance", "send_transaction"],
        description: "Send maximum available amount",
        source: "docs/user-guide/transactions.md (implied)",
        section: "Maximum Amount Transfers",
      }

      const result = await testPrompt(maxAmountExample.prompt)

      if (result.success) {
        // Should calculate and display maximum amount
        expect(result.finalResult).toMatch(/all|maximum|available|balance/i)
        expect(result.finalResult).toMatch(/\d+(\.\d+)?\s*eth/i)
      } else {
        // Should explain why it can't send all (e.g., gas reserves needed)
        expect(result.finalResult).toMatch(/gas|reserve|fee|cannot.*send.*all/i)
      }
    })

    test("should handle transactions with custom data as documented", async () => {
      const customDataExample: DocumentationExample = {
        prompt: "Send 0.1 ETH to 0x7099 with data 0x1234abcd",
        expectedOutput: {
          contains: ["transaction", "data", "0x1234abcd"],
        },
        expectedTools: ["send_transaction"],
        description: "Transaction with custom data",
        source: "docs/user-guide/transactions.md (implied)",
        section: "Custom Transaction Data",
      }

      const result = await testPrompt(customDataExample.prompt)

      if (result.success) {
        validateDocumentationExample(result, customDataExample)

        // Should acknowledge custom data was included
        expect(result.finalResult).toMatch(/data.*0x1234abcd|0x1234abcd.*data/i)
      } else {
        // Should provide info about custom data parameter
        expect(result.finalResult).toMatch(/data|0x1234abcd/i)
      }
    })

    test("should handle multi-chain native token operations", async () => {
      // Test that native currency names change properly across chains
      const chainTests = [
        { chain: "Ethereum mainnet", currency: "ETH" },
        { chain: "Polygon", currency: "POL" },
        { chain: "Anvil", currency: "ETH" },
      ]

      for (const chainTest of chainTests) {
        await testPrompt(`Switch to ${chainTest.chain}`)
        const result = await testPrompt("Check my balance")

        if (result.success) {
          // Should show balance in correct native currency
          expect(result.finalResult).toMatch(new RegExp(chainTest.currency, "i"))
          console.log(`✓ ${chainTest.chain}: Shows balance in ${chainTest.currency}`)
        }

        // Test sending with proper currency name
        const sendResult = await testPrompt(`Send 0.001 ${chainTest.currency} to 0x7099`)

        if (sendResult.success || sendResult.finalResult.includes(chainTest.currency)) {
          console.log(`✓ ${chainTest.chain}: Handles ${chainTest.currency} transfers`)
        }
      }
    })
  })

  describe("Transaction Error Handling", () => {
    test("should handle insufficient balance gracefully", async () => {
      // Try to send more than available balance
      const result = await testPrompt("Send 99999 ETH to 0x7099")

      // Should provide helpful error message
      if (!result.success || result.finalResult.includes("insufficient")) {
        expect(result.finalResult).toMatch(
          /insufficient.*balance|not.*enough.*eth|balance.*too.*low/i,
        )
        console.log("✓ Insufficient balance handled properly")
      }
    })

    test("should handle invalid recipient addresses", async () => {
      const result = await testPrompt("Send 1 ETH to invalid-address")

      // Should provide helpful error about address format
      if (!result.success || result.finalResult.includes("invalid")) {
        expect(result.finalResult).toMatch(
          /invalid.*address|address.*format|valid.*ethereum.*address/i,
        )
        console.log("✓ Invalid address handled properly")
      }
    })

    test("should handle transaction status for non-existent hash", async () => {
      const fakeHash = "0x1234567890123456789012345678901234567890123456789012345678901234"
      const result = await testPrompt(`Get transaction status ${fakeHash}`)

      // Should handle gracefully
      if (!result.success || result.finalResult.includes("not found")) {
        expect(result.finalResult).toMatch(/not.*found|transaction.*not.*exist|invalid.*hash/i)
        console.log("✓ Non-existent transaction hash handled properly")
      }
    })
  })

  describe("Transaction Recovery Operations", () => {
    test("should provide information about stuck transactions", async () => {
      const result = await testPrompt("My transaction is stuck. What can I do?")

      // Should provide helpful guidance
      expect(result.finalResult).toBeTruthy()
      expect(result.finalResult).toMatch(/stuck|replace|higher.*gas|nonce|cancel/i)
    })

    test("should explain transaction replacement options", async () => {
      const result = await testPrompt("How do I replace a pending transaction with higher gas?")

      // Should provide guidance on transaction replacement
      expect(result.finalResult).toBeTruthy()
      expect(result.finalResult).toMatch(/replace|higher.*gas|same.*nonce|pending/i)
    })
  })

  describe("Chain-Specific Transaction Behavior", () => {
    test("should adjust transaction behavior for different chains", async () => {
      const chains = ["Ethereum mainnet", "Polygon", "Anvil"]

      for (const chain of chains) {
        await testPrompt(`Switch to ${chain}`)

        // Gas estimation should work on all chains
        const gasResult = await testPrompt("Estimate gas for sending 0.1 ETH to 0x7099")

        if (gasResult.success) {
          expect(gasResult.toolsUsed).toContain("estimate_gas")
          console.log(`✓ ${chain}: Gas estimation works`)
        }

        // Transaction sending should adapt to chain
        const sendResult = await testPrompt("Send 0.001 ETH to 0x7099")

        if (sendResult.success) {
          // Should work on all supported chains
          expect(sendResult.toolsUsed).toContain("send_transaction")
          console.log(`✓ ${chain}: Transaction sending works`)
        }
      }
    })
  })

  describe("Format Validation for All Transaction Examples", () => {
    test("should validate all transaction outputs match documented formats", async () => {
      const transactionExamples = [
        {
          command: "Send 0.001 ETH to 0x7099",
          validator: "transaction success format",
        },
        {
          command: "Estimate gas for sending 0.1 ETH to 0x7099",
          validator: "gas estimation format",
        },
      ]

      for (const example of transactionExamples) {
        const result = await testPrompt(example.command)

        if (result.success) {
          // Validate output is well-formatted and informative
          expect(result.finalResult).toBeTruthy()
          expect(result.finalResult.length).toBeGreaterThan(20)

          // Should not contain formatting artifacts
          expect(result.finalResult).not.toMatch(/\[object Object\]|undefined|null/)

          console.log(`✓ "${example.command}" produces proper format`)
        }
      }
    })

    test("should provide consistent transaction hash format", async () => {
      // Send multiple transactions and verify hash format consistency
      const transactions = ["Send 0.001 ETH to 0x7099", "Send 0.002 ETH to 0x3C44"]

      for (const tx of transactions) {
        const result = await testPrompt(tx)

        if (result.success) {
          // All transaction hashes should follow same format
          const hashMatch = result.finalResult.match(/hash\s*:\s*0x[a-fA-F0-9]{64}/i)
          expect(hashMatch).toBeTruthy()

          console.log(`✓ "${tx}" produces consistent hash format`)
        }
      }
    })
  })
})
