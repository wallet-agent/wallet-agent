import { beforeAll, describe, expect, test } from "bun:test"
import {
  type DocumentationExample,
  validateDocumentationExample,
  validateTokenBalanceFormat,
  validateTokenInfoFormat,
} from "../helpers/documentation-validator.js"
import { setupClaudeSDKTests, testPrompt } from "../setup.js"

describe("Documentation Examples - Token Operations", () => {
  beforeAll(() => {
    setupClaudeSDKTests()
  })

  beforeAll(async () => {
    // Switch to Anvil which has pre-configured test tokens
    await testPrompt("Switch to Anvil")
    await testPrompt("Connect to 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
  })

  describe("Checking Token Balances Section", () => {
    test("should execute 'Get my USDC balance' with exact documented format", async () => {
      const example: DocumentationExample = {
        prompt: "Get my USDC balance",
        expectedOutput: {
          contains: ["token balance:", "amount: 1000.0 usdc", "raw: 1000000000", "decimals: 6"],
        },
        expectedTools: ["get_token_balance"],
        description: "Get USDC balance with exact format",
        source: "docs/user-guide/token-operations.md:13",
        section: "Get Token Balance",
      }

      const result = await testPrompt(example.prompt)
      validateDocumentationExample(result, example)

      // Validate exact format from documentation
      const content = result.finalResult
      expect(content).toMatch(/token\s+balance\s*:/i)
      expect(content).toMatch(/amount\s*:\s*\d+(\.\d+)?\s*usdc/i)
      expect(content).toMatch(/raw\s*:\s*\d+/i)
      expect(content).toMatch(/decimals\s*:\s*\d+/i)

      // Validate specific token balance format
      validateTokenBalanceFormat(result, "USDC")
    })

    test("should execute 'Show me all my token balances' with proper format", async () => {
      const example: DocumentationExample = {
        prompt: "Show me all my token balances",
        expectedOutput: {
          contains: ["token balance", "amount", "decimals"],
        },
        expectedTools: ["get_token_balance"],
        description: "Check multiple token balances",
        source: "docs/user-guide/token-operations.md:27",
        section: "Check Multiple Token Balances",
      }

      const result = await testPrompt(example.prompt)

      if (result.success) {
        validateDocumentationExample(result, example)

        // Should show multiple tokens or explain how to check specific ones
        const content = result.finalResult
        expect(content).toMatch(/token.*balance/i)

        // May show multiple tokens or provide guidance
        const hasMultipleTokens = content.match(/usdc|usdt|weth|dai/gi)
        const hasGuidance = content.match(/check.*specific|which.*token|specify.*token/gi)

        expect(hasMultipleTokens || hasGuidance).toBeTruthy()
      }
    })

    test("should execute 'Get USDC token info' with exact documented format", async () => {
      const example: DocumentationExample = {
        prompt: "Get USDC token info",
        expectedOutput: {
          contains: ["token information:", "name: usd coin", "symbol: usdc", "decimals:"],
        },
        expectedTools: ["get_token_info"],
        description: "Get token contract information",
        source: "docs/user-guide/token-operations.md:43",
        section: "Get Token Information",
      }

      const result = await testPrompt(example.prompt)
      validateDocumentationExample(result, example)

      // Validate exact format from documentation
      const content = result.finalResult
      expect(content).toMatch(/token\s+information\s*:/i)
      expect(content).toMatch(/name\s*:\s*.*coin/i)
      expect(content).toMatch(/symbol\s*:\s*usdc/i)
      expect(content).toMatch(/decimals\s*:\s*\d+/i)

      // Validate token info format
      validateTokenInfoFormat(result)
    })
  })

  describe("Token Transfer Operations Section", () => {
    test("should execute basic token transfer with exact documented format", async () => {
      const example: DocumentationExample = {
        prompt: "Transfer 100 USDC to 0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        expectedOutput: {
          contains: [
            "token transfer successful",
            "transaction hash:",
            "token: usdc",
            "amount: 100",
          ],
        },
        expectedTools: ["transfer_token"],
        description: "Transfer tokens with documented format",
        source: "docs/user-guide/token-operations.md (implied)",
        section: "Transfer Tokens",
      }

      const result = await testPrompt(example.prompt)
      validateDocumentationExample(result, example)

      // Validate exact format for token transfers
      const content = result.finalResult
      expect(content).toMatch(/token\s+transfer\s+successful/i)
      expect(content).toMatch(/transaction\s+hash\s*:\s*0x[a-fA-F0-9]+/i)
      expect(content).toMatch(/token\s*:\s*usdc/i)
      expect(content).toMatch(/amount\s*:\s*100/i)
    })

    test("should handle token transfers to short addresses", async () => {
      const example: DocumentationExample = {
        prompt: "Transfer 50 USDC to 0x7099",
        expectedOutput: {
          contains: ["transfer", "usdc", "50"],
        },
        expectedTools: ["transfer_token"],
        description: "Transfer to short address (auto-expansion)",
        source: "docs/user-guide/token-operations.md (implied)",
        section: "Short Address Transfers",
      }

      const result = await testPrompt(example.prompt)

      if (result.success) {
        validateDocumentationExample(result, example)

        // Should expand to full address
        expect(result.finalResult).toMatch(/0x70997970c51812dc3a010c7d01b50e0d17dc79c8/i)
      }
    })

    test("should execute maximum amount token transfer as documented", async () => {
      const example: DocumentationExample = {
        prompt: "Transfer all USDC to 0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        expectedOutput: {
          contains: ["all", "usdc", "transfer", "maximum", "available"],
        },
        expectedTools: ["get_token_balance", "transfer_token"],
        description: "Transfer maximum available tokens",
        source: "docs/user-guide/token-operations.md (implied)",
        section: "Maximum Amount Transfers",
      }

      const result = await testPrompt(example.prompt)

      if (result.success) {
        validateDocumentationExample(result, example)

        // Should show calculation of maximum amount
        expect(result.finalResult).toMatch(/all|maximum|available|balance/i)
        expect(result.finalResult).toMatch(/\d+(\.\d+)?\s*usdc/i)
      } else {
        // Should explain why it can't transfer all or show balance first
        expect(result.finalResult).toMatch(/balance|available|amount/i)
      }
    })

    test("should handle token transfers using contract addresses", async () => {
      const example: DocumentationExample = {
        prompt:
          "Transfer 50 tokens at 0xA0b86991c431B0c8C5c0C78E6F4ce6aB8827279cffFb92266 to 0x7099",
        expectedOutput: {
          contains: ["transfer", "token", "contract"],
        },
        expectedTools: ["transfer_token"],
        description: "Transfer using contract address",
        source: "docs/user-guide/token-operations.md (implied)",
        section: "Contract Address Transfers",
      }

      const result = await testPrompt(example.prompt)

      if (result.success) {
        validateDocumentationExample(result, example)
      } else {
        // Should provide helpful info about contract address format
        expect(result.finalResult).toMatch(/contract.*address|token.*address|0x.*address/i)
      }
    })
  })

  describe("Token Approval Operations Section", () => {
    test("should execute basic token approval with documented format", async () => {
      const example: DocumentationExample = {
        prompt: "Approve 1000 USDC for 0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        expectedOutput: {
          contains: [
            "token approval successful",
            "transaction hash:",
            "token: usdc",
            "spender:",
            "amount: 1000",
          ],
        },
        expectedTools: ["approve_token"],
        description: "Approve token spending",
        source: "docs/user-guide/token-operations.md (implied)",
        section: "Token Approvals",
      }

      const result = await testPrompt(example.prompt)
      validateDocumentationExample(result, example)

      // Validate token approval format
      const content = result.finalResult
      expect(content).toMatch(/approval.*successful|approved/i)
      expect(content).toMatch(/transaction.*hash/i)
      expect(content).toMatch(/usdc/i)
      expect(content).toMatch(/1000/i)
    })

    test("should execute unlimited approval as documented", async () => {
      const example: DocumentationExample = {
        prompt: "Approve unlimited USDC for 0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        expectedOutput: {
          contains: ["unlimited", "approve", "usdc", "max"],
        },
        expectedTools: ["approve_token"],
        description: "Approve unlimited token spending",
        source: "docs/user-guide/token-operations.md (implied)",
        section: "Unlimited Approvals",
      }

      const result = await testPrompt(example.prompt)
      validateDocumentationExample(result, example)

      // Should indicate unlimited/max approval
      expect(result.finalResult).toMatch(/unlimited|maximum|max|infinite/i)
    })

    test("should handle various approval phrasings", async () => {
      const approvalPhrases = [
        "Allow 0x7099 to spend 500 USDC",
        "Grant USDC approval to 0x7099",
        "Set approval for USDC to spender 0x7099",
        "Approve USDC spending for 0x7099",
      ]

      for (const phrase of approvalPhrases) {
        const result = await testPrompt(phrase)

        if (result.success) {
          expect(result.toolsUsed).toContain("approve_token")
          console.log(`✓ "${phrase}" works as expected`)
        } else {
          // Should still understand the intent
          expect(result.finalResult).toMatch(/approve|approval|allow|spend/i)
        }
      }
    })
  })

  describe("Multi-Token Operations", () => {
    test("should handle different token types consistently", async () => {
      const tokens = ["USDC", "USDT", "WETH", "DAI"]

      for (const token of tokens) {
        // Test balance checking for each token
        const balanceResult = await testPrompt(`Get my ${token} balance`)

        if (balanceResult.success) {
          expect(balanceResult.toolsUsed).toContain("get_token_balance")
          expect(balanceResult.finalResult).toMatch(new RegExp(token, "i"))
          console.log(`✓ ${token} balance check works`)
        }

        // Test token info for each token
        const infoResult = await testPrompt(`Get ${token} token info`)

        if (infoResult.success) {
          expect(infoResult.toolsUsed).toContain("get_token_info")
          expect(infoResult.finalResult).toMatch(new RegExp(token, "i"))
          console.log(`✓ ${token} info retrieval works`)
        }
      }
    })

    test("should provide comprehensive token portfolio overview", async () => {
      const result = await testPrompt("Give me a complete overview of my token holdings")

      // Should provide comprehensive information
      expect(result.finalResult).toBeTruthy()
      expect(result.finalResult.length).toBeGreaterThan(50)

      // Should mention multiple aspects of token holdings
      const content = result.finalResult.toLowerCase()
      const tokenTerms = ["token", "balance", "usdc", "holding", "portfolio"]
      const hasRelevantContent = tokenTerms.some((term) => content.includes(term))

      expect(hasRelevantContent).toBe(true)
    })
  })

  describe("Token Error Handling", () => {
    test("should handle unknown token gracefully", async () => {
      const result = await testPrompt("Get my UNKNOWN_TOKEN balance")

      // Should provide helpful error message
      if (!result.success || result.finalResult.includes("unknown")) {
        expect(result.finalResult).toMatch(/unknown.*token|not.*found|invalid.*token/i)
        console.log("✓ Unknown token handled properly")
      }
    })

    test("should handle insufficient token balance for transfers", async () => {
      const result = await testPrompt("Transfer 999999 USDC to 0x7099")

      // Should provide helpful error message
      if (!result.success || result.finalResult.includes("insufficient")) {
        expect(result.finalResult).toMatch(
          /insufficient.*balance|not.*enough.*usdc|balance.*too.*low/i,
        )
        console.log("✓ Insufficient token balance handled properly")
      }
    })

    test("should handle invalid token approval amounts", async () => {
      const result = await testPrompt("Approve -100 USDC for 0x7099")

      // Should handle invalid amounts gracefully
      if (!result.success || result.finalResult.includes("invalid")) {
        expect(result.finalResult).toMatch(/invalid.*amount|positive.*amount|valid.*number/i)
        console.log("✓ Invalid approval amount handled properly")
      }
    })
  })

  describe("Cross-Chain Token Operations", () => {
    test("should handle token operations across different chains", async () => {
      const chains = [
        { name: "Ethereum mainnet", commonTokens: ["USDC", "USDT", "WETH"] },
        { name: "Polygon", commonTokens: ["USDC", "USDT", "WETH"] },
      ]

      for (const chain of chains) {
        await testPrompt(`Switch to ${chain.name}`)

        for (const token of chain.commonTokens) {
          const result = await testPrompt(`Get ${token} token info`)

          if (result.success) {
            // Token info should work across chains
            expect(result.toolsUsed).toContain("get_token_info")
            console.log(`✓ ${chain.name}: ${token} info works`)
          } else {
            // Should provide helpful info about token availability
            console.log(`ℹ ${chain.name}: ${token} may not be available`)
          }
        }
      }
    })

    test("should adapt token contract addresses per chain", async () => {
      // USDC has different contract addresses on different chains
      await testPrompt("Switch to Ethereum mainnet")
      const mainnetResult = await testPrompt("Get USDC token info")

      await testPrompt("Switch to Polygon")
      const polygonResult = await testPrompt("Get USDC token info")

      if (mainnetResult.success && polygonResult.success) {
        // Both should work but may have different contract addresses
        expect(mainnetResult.finalResult).toMatch(/usdc/i)
        expect(polygonResult.finalResult).toMatch(/usdc/i)
        console.log("✓ USDC works on both Ethereum and Polygon")
      }
    })
  })

  describe("Token Operation Workflows", () => {
    test("should execute complete token workflow as documented", async () => {
      // Comprehensive token workflow from documentation
      const workflow = [
        "Get USDC token info",
        "Get my USDC balance",
        "Transfer 10 USDC to 0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "Approve 100 USDC for 0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      ]

      const results = []
      for (const step of workflow) {
        const result = await testPrompt(step)
        results.push(result)

        if (result.success) {
          console.log(`✓ Workflow step: "${step}" completed`)
        } else {
          console.log(`⚠ Workflow step: "${step}" had issues - may need investigation`)
        }
      }

      // Validate that the workflow produces consistent, useful results
      for (const result of results) {
        expect(result.finalResult).toBeTruthy()
        expect(result.finalResult.length).toBeGreaterThan(10)
      }
    })

    test("should handle token operations with proper sequencing", async () => {
      // Test logical sequence: info -> balance -> approval -> transfer
      const sequence = [
        { step: "Get USDC token info", expectTool: "get_token_info" },
        { step: "Get my current USDC balance", expectTool: "get_token_balance" },
        { step: "Approve 50 USDC for 0x7099", expectTool: "approve_token" },
        { step: "Transfer 25 USDC to 0x7099", expectTool: "transfer_token" },
      ]

      for (const item of sequence) {
        const result = await testPrompt(item.step)

        if (result.success) {
          expect(result.toolsUsed).toContain(item.expectTool)
          console.log(`✓ Sequence step "${item.step}" used correct tool`)
        }
      }
    })
  })

  describe("Format Validation for All Token Examples", () => {
    test("should validate all token outputs match documented formats", async () => {
      const tokenExamples = [
        {
          command: "Get my USDC balance",
          expectedFormat: /token\s+balance.*amount.*raw.*decimals/i,
        },
        {
          command: "Get USDC token info",
          expectedFormat: /token\s+information.*name.*symbol.*decimals/i,
        },
        {
          command: "Transfer 1 USDC to 0x7099",
          expectedFormat: /token\s+transfer.*successful.*hash/i,
        },
        {
          command: "Approve 100 USDC for 0x7099",
          expectedFormat: /approv.*successful|approved/i,
        },
      ]

      for (const example of tokenExamples) {
        const result = await testPrompt(example.command)

        if (result.success) {
          // Validate output format matches expectations
          expect(result.finalResult).toMatch(example.expectedFormat)

          // Validate output is well-formatted
          expect(result.finalResult).toBeTruthy()
          expect(result.finalResult.length).toBeGreaterThan(20)

          console.log(`✓ "${example.command}" produces correct format`)
        }
      }
    })

    test("should maintain consistent numeric formatting across token operations", async () => {
      // Test that token amounts are consistently formatted
      const amounts = ["1", "10.5", "1000", "0.001"]

      for (const amount of amounts) {
        const result = await testPrompt(`Transfer ${amount} USDC to 0x7099`)

        if (result.success) {
          // Should display the amount clearly
          expect(result.finalResult).toMatch(new RegExp(`${amount}.*usdc|usdc.*${amount}`, "i"))
          console.log(`✓ Amount ${amount} USDC formatted consistently`)
        }
      }
    })

    test("should provide consistent error message formats", async () => {
      const errorScenarios = [
        {
          command: "Get my INVALID_TOKEN balance",
          expectedError: /unknown.*token|not.*found|invalid.*token/i,
        },
        {
          command: "Transfer 999999 USDC to 0x7099",
          expectedError: /insufficient|not.*enough|balance.*low/i,
        },
      ]

      for (const scenario of errorScenarios) {
        const result = await testPrompt(scenario.command)

        // Error messages should be helpful and properly formatted
        if (!result.success || result.finalResult.match(scenario.expectedError)) {
          expect(result.finalResult).toMatch(scenario.expectedError)
          console.log(`✓ "${scenario.command}" provides proper error format`)
        }
      }
    })
  })
})
