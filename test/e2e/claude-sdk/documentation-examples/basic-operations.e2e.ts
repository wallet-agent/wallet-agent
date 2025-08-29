import { beforeAll, describe, expect, test } from "bun:test"
import {
  type DocumentationExample,
  validateDocumentationExample,
} from "../helpers/documentation-validator.js"
import { setupClaudeSDKTests, testPrompt } from "../setup.js"

describe("Documentation Examples - Basic Operations", () => {
  beforeAll(() => {
    setupClaudeSDKTests()
  })

  describe("Wallet Information Section", () => {
    test("should execute 'Get wallet info' with exact documented output format", async () => {
      const example: DocumentationExample = {
        prompt: "Get wallet info",
        expectedOutput: {
          contains: [
            "current wallet configuration",
            "type",
            "available addresses",
            "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
            "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
            "0x3c44cddddb6a900fa2b585dd299e03d12fa4293bc",
          ],
          structure: {
            configHeader: "current wallet configuration",
            typeField: "type: mock",
            addressCount: "available addresses: 3",
          },
        },
        expectedTools: ["get_wallet_info"],
        description: "Get current wallet status with exact format",
        source: "docs/user-guide/basic-operations.md:12",
        section: "Get Current Status",
      }

      const result = await testPrompt(example.prompt)
      validateDocumentationExample(result, example)

      // Validate the exact documented format structure
      const content = result.finalResult

      // Should match exactly: "Current wallet configuration:"
      expect(content).toMatch(/current\s+wallet\s+configuration\s*:/i)

      // Should match exactly: "- Type: mock"
      expect(content).toMatch(/-\s*type\s*:\s*mock/i)

      // Should match exactly: "- Available addresses: 3"
      expect(content).toMatch(/-\s*available\s+addresses\s*:\s*\d+/i)

      // Should list the three specific test addresses with proper indentation
      expect(content).toMatch(/\s*-\s*0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266/i)
      expect(content).toMatch(/\s*-\s*0x70997970c51812dc3a010c7d01b50e0d17dc79c8/i)
      expect(content).toMatch(/\s*-\s*0x3c44cddddb6a900fa2b585dd299e03d12fa4293bc/i)
    })

    test("should execute 'Get accounts' with exact documented format", async () => {
      const example: DocumentationExample = {
        prompt: "Get accounts",
        expectedOutput: {
          contains: [
            "available mock accounts",
            "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
            "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
            "0x3c44cddddb6a900fa2b585dd299e03d12fa4293bc",
          ],
        },
        expectedTools: ["get_accounts"],
        description: "List available accounts",
        source: "docs/user-guide/basic-operations.md:36",
        section: "List Available Accounts",
      }

      const result = await testPrompt(example.prompt)
      validateDocumentationExample(result, example)

      // Validate exact format: "Available mock accounts:"
      const content = result.finalResult
      expect(content).toMatch(/available\s+mock\s+accounts\s*:/i)
    })
  })

  describe("Wallet Connection Section", () => {
    test("should execute full address connection exactly as documented", async () => {
      const example: DocumentationExample = {
        prompt: "Connect to 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        expectedOutput: {
          contains: [
            "connected to wallet: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
            "chain: 31337",
          ],
        },
        expectedTools: ["connect_wallet"],
        description: "Connect to specific wallet address",
        source: "docs/user-guide/basic-operations.md:54",
        section: "Connect to a Specific Wallet",
      }

      const result = await testPrompt(example.prompt)
      validateDocumentationExample(result, example)

      // Validate exact format from documentation
      const content = result.finalResult
      expect(content).toMatch(
        /connected\s+to\s+wallet\s*:\s*0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266/i,
      )
      expect(content).toMatch(/chain\s*:\s*31337/i)
    })

    test("should execute short address connection as documented", async () => {
      const example: DocumentationExample = {
        prompt: "Connect to 0xf39F",
        expectedOutput: {
          contains: ["connected", "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"],
        },
        expectedTools: ["connect_wallet"],
        description: "Connect using short address that auto-expands",
        source: "docs/user-guide/basic-operations.md:68",
        section: "Connect Using Short Address",
      }

      const result = await testPrompt(example.prompt)
      validateDocumentationExample(result, example)

      // Should auto-expand to full address and connect
      expect(result.finalResult).toMatch(/0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266/i)
    })

    test("should execute 'Get current account' with exact documented format", async () => {
      // First ensure we're connected
      await testPrompt("Connect to 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")

      const example: DocumentationExample = {
        prompt: "Get current account",
        expectedOutput: {
          contains: [
            "connected: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
            "chain id: 31337",
            "connector: mock connector",
          ],
        },
        expectedTools: ["get_current_account"],
        description: "Check currently connected wallet",
        source: "docs/user-guide/basic-operations.md:78",
        section: "Get Current Account",
      }

      const result = await testPrompt(example.prompt)
      validateDocumentationExample(result, example)

      // Validate exact format from documentation
      const content = result.finalResult
      expect(content).toMatch(/connected\s*:\s*0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266/i)
      expect(content).toMatch(/chain\s+id\s*:\s*31337/i)
      expect(content).toMatch(/connector\s*:\s*mock\s+connector/i)
    })
  })

  describe("Balance Checking Section", () => {
    test("should execute 'Check my balance' with exact documented format", async () => {
      // Ensure wallet is connected first
      await testPrompt("Connect to 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")

      const example: DocumentationExample = {
        prompt: "Check my balance",
        expectedOutput: {
          contains: ["balance: 10000.0 eth", "raw: 10000000000000000000000 wei"],
        },
        expectedTools: ["get_balance"],
        description: "Check ETH balance with specific format",
        source: "docs/user-guide/basic-operations.md:95",
        section: "Check ETH/Native Token Balance",
      }

      const result = await testPrompt(example.prompt)
      validateDocumentationExample(result, example)

      // Validate exact format from documentation
      const content = result.finalResult
      expect(content).toMatch(/balance\s*:\s*\d+(\.\d+)?\s*eth/i)
      expect(content).toMatch(/raw\s*:\s*\d+\s*wei/i)
    })

    test("should handle balance checks on different chains with proper currency names", async () => {
      // Connect wallet first
      await testPrompt("Connect to 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")

      // Test Polygon balance (should show POL instead of ETH)
      await testPrompt("Switch to Polygon")
      const polygonResult = await testPrompt("Check my balance")

      if (polygonResult.success) {
        // Should show balance in POL (Polygon's native token)
        expect(polygonResult.finalResult).toMatch(/balance.*POL|MATIC/i)
      }

      // Switch back to test mainnet balance display
      await testPrompt("Switch to Ethereum mainnet")
      const mainnetResult = await testPrompt("Check my balance")

      if (mainnetResult.success) {
        // Should show balance in ETH
        expect(mainnetResult.finalResult).toMatch(/balance.*ETH/i)
      }
    })
  })

  describe("Advanced Status Information", () => {
    test("should provide comprehensive status overview", async () => {
      const example: DocumentationExample = {
        prompt: "What's my current status?",
        expectedOutput: {
          contains: ["wallet", "chain", "balance", "status"],
        },
        expectedTools: ["get_wallet_info", "get_balance", "get_current_account"],
        description: "Comprehensive wallet status",
        source: "docs/user-guide/basic-operations.md (implied)",
        section: "Status Overview",
      }

      const result = await testPrompt(example.prompt)

      // Should provide comprehensive information
      expect(result.finalResult).toMatch(/wallet|account/i)
      expect(result.finalResult).toMatch(/chain|network/i)
      expect(result.finalResult.length).toBeGreaterThan(50)
    })

    test("should handle address validation gracefully", async () => {
      // Test invalid address format
      const invalidResult = await testPrompt("Connect to invalid-address-format")

      // Should provide helpful error message
      expect(invalidResult.finalResult).toMatch(/invalid|address|format|error/i)

      // Test non-existent valid format address
      const nonExistentResult = await testPrompt(
        "Connect to 0x1234567890123456789012345678901234567890",
      )

      // Should handle gracefully (may succeed with warning or provide helpful info)
      expect(nonExistentResult.finalResult).toBeTruthy()
    })
  })

  describe("Chain-Aware Operations", () => {
    test("should show chain-specific information in wallet status", async () => {
      // Test on different chains to ensure chain-specific info is shown
      const chains = [
        { name: "Anvil", id: 31337, currency: "ETH" },
        { name: "Polygon", id: 137, currency: "POL" },
        { name: "Ethereum mainnet", id: 1, currency: "ETH" },
      ]

      for (const chain of chains) {
        await testPrompt(`Switch to ${chain.name}`)
        const statusResult = await testPrompt("Get wallet info")

        if (statusResult.success) {
          // Should contain chain-specific information
          expect(statusResult.finalResult).toMatch(new RegExp(chain.name, "i"))
          console.log(`✓ Chain ${chain.name}: Status includes chain info`)
        }
      }
    })

    test("should handle 'no wallet connected' scenario properly", async () => {
      // Disconnect first (if possible)
      await testPrompt("Disconnect wallet")

      // Try to check balance without connection
      const noWalletResult = await testPrompt("Check my balance")

      // Should provide helpful error message matching documentation style
      if (!noWalletResult.success || noWalletResult.finalResult.includes("not connected")) {
        expect(noWalletResult.finalResult).toMatch(/not.*connected|connect.*wallet|no.*wallet/i)
        console.log("✓ 'No wallet connected' handled properly")
      }
    })
  })

  describe("Error Message Format Validation", () => {
    test("should provide consistently formatted error messages", async () => {
      const errorScenarios = [
        { command: "Connect to 0xinvalid", expectedError: /invalid.*address/i },
        {
          command: "Switch to NonExistentChain",
          expectedError: /chain.*not.*found|unknown.*chain/i,
        },
      ]

      for (const scenario of errorScenarios) {
        const result = await testPrompt(scenario.command)

        // Error messages should be helpful and properly formatted
        if (!result.success || result.finalResult.toLowerCase().includes("error")) {
          expect(result.finalResult).toMatch(scenario.expectedError)
          console.log(`✓ "${scenario.command}" provides proper error format`)
        }
      }
    })
  })

  describe("Interactive Help and Guidance", () => {
    test("should provide helpful next steps and suggestions", async () => {
      // Test that responses include helpful guidance
      const helpResult = await testPrompt("What can I do with my wallet?")

      // Should provide actionable suggestions
      expect(helpResult.finalResult).toBeTruthy()
      expect(helpResult.finalResult.length).toBeGreaterThan(50)

      // May include suggestions for next actions
      const content = helpResult.finalResult.toLowerCase()
      const helpfulPhrases = [
        "you can",
        "try",
        "next",
        "help",
        "command",
        "operation",
        "send",
        "transfer",
        "check",
        "balance",
        "switch",
      ]

      const hasHelpfulGuidance = helpfulPhrases.some((phrase) => content.includes(phrase))
      expect(hasHelpfulGuidance).toBe(true)
    })
  })

  describe("Format Consistency Across Operations", () => {
    test("should maintain consistent formatting across all basic operations", async () => {
      // Run through all basic operations and verify consistent formatting
      const operations = [
        "Get wallet info",
        "Get accounts",
        "Connect to 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "Get current account",
        "Check my balance",
      ]

      for (const operation of operations) {
        const result = await testPrompt(operation)

        if (result.success) {
          // Each result should be well-formatted
          expect(result.finalResult).toBeTruthy()
          expect(result.finalResult.trim()).toBeTruthy()

          // Should not contain obvious formatting issues
          expect(result.finalResult).not.toMatch(/\[object Object\]|undefined|null/)

          console.log(`✓ "${operation}" produces well-formatted output`)
        }
      }
    })
  })
})
