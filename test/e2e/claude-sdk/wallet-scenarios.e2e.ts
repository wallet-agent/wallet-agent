import { beforeAll, describe, test } from "bun:test"
import {
  validateBalanceCheck,
  validateResponseStructure,
  validateWalletConnection,
} from "./helpers/validator.js"
import { setupClaudeSDKTests, TEST_DATA, testPrompt, testWorkflow } from "./setup.js"

describe("Wallet Connection Scenarios via Natural Language", () => {
  beforeAll(() => {
    setupClaudeSDKTests()
  })

  describe("wallet connection prompts", () => {
    test("should connect using direct address request", async () => {
      const result = await testPrompt(`Connect to wallet ${TEST_DATA.WALLET_ADDRESS_1}`, {
        toolsUsed: ["connect_wallet"],
        resultContains: ["connected", "wallet"],
      })

      validateWalletConnection(result, TEST_DATA.WALLET_ADDRESS_1)
      validateResponseStructure(result)
    })

    test("should connect using polite phrasing", async () => {
      const result = await testPrompt(
        `Please connect my wallet at address ${TEST_DATA.WALLET_ADDRESS_1}`,
        {
          toolsUsed: ["connect_wallet"],
          resultContains: ["connected"],
        },
      )

      validateWalletConnection(result, TEST_DATA.WALLET_ADDRESS_1)
    })

    test("should connect using casual language", async () => {
      const result = await testPrompt(`I want to use wallet ${TEST_DATA.WALLET_ADDRESS_1}`, {
        toolsUsed: ["connect_wallet"],
        successMessage: /connected|using/i,
      })

      validateWalletConnection(result)
    })

    test("should connect using shortened address", async () => {
      const shortAddress = `${TEST_DATA.WALLET_ADDRESS_1.slice(0, 8)}...`
      const result = await testPrompt(
        `Connect ${shortAddress} (use the full address ${TEST_DATA.WALLET_ADDRESS_1})`,
        {
          toolsUsed: ["connect_wallet"],
        },
      )

      validateWalletConnection(result)
    })
  })

  describe("wallet information queries", () => {
    test("should get current account info", async () => {
      // First connect a wallet
      await testPrompt(`Connect to wallet ${TEST_DATA.WALLET_ADDRESS_1}`)

      const result = await testPrompt("What wallet am I currently using?", {
        toolsUsed: ["get_current_account"],
        resultContains: ["connected", "address"],
      })

      validateResponseStructure(result)
    })

    test("should show available mock accounts", async () => {
      const result = await testPrompt("What wallet addresses can I use for testing?", {
        toolsUsed: ["get_accounts"],
        resultContains: ["available", "mock", "accounts"],
      })

      validateResponseStructure(result)
    })

    test("should get wallet configuration info", async () => {
      const result = await testPrompt("Show me my wallet configuration and settings", {
        toolsUsed: ["get_wallet_info"],
        resultContains: ["wallet", "info"],
      })

      validateResponseStructure(result)
    })
  })

  describe("balance checking scenarios", () => {
    test("should check balance with simple question", async () => {
      await testPrompt(`Connect to wallet ${TEST_DATA.WALLET_ADDRESS_1}`)

      const result = await testPrompt("What's my balance?", {
        toolsUsed: ["get_balance"],
        resultContains: ["balance", "eth"],
      })

      validateBalanceCheck(result)
    })

    test("should check balance with specific currency mention", async () => {
      await testPrompt(`Connect to wallet ${TEST_DATA.WALLET_ADDRESS_1}`)

      const result = await testPrompt("Check my ETH balance", {
        toolsUsed: ["get_balance"],
        resultContains: ["balance"],
      })

      validateBalanceCheck(result)
    })

    test("should check balance with casual phrasing", async () => {
      await testPrompt(`Connect to wallet ${TEST_DATA.WALLET_ADDRESS_1}`)

      const result = await testPrompt("How much ETH do I have?", {
        toolsUsed: ["get_balance"],
        resultMatches: [/balance|eth|\d+/i],
      })

      validateBalanceCheck(result)
    })

    test("should check balance for specific address", async () => {
      const result = await testPrompt(`What's the balance of ${TEST_DATA.WALLET_ADDRESS_2}?`, {
        toolsUsed: ["get_balance"],
        resultContains: ["balance"],
      })

      validateBalanceCheck(result)
    })

    test("should check balance using different phrasings", async () => {
      const prompts = [
        "Show my wallet balance",
        "Display my current ETH amount",
        "How much money is in my wallet?",
        "What funds do I have available?",
      ]

      for (const prompt of prompts) {
        await testPrompt(`Connect to wallet ${TEST_DATA.WALLET_ADDRESS_1}`)

        const result = await testPrompt(prompt, {
          toolsUsed: ["get_balance"],
          resultContains: ["balance"],
        })

        validateBalanceCheck(result)
      }
    })
  })

  describe("wallet disconnection scenarios", () => {
    test("should disconnect wallet with direct command", async () => {
      // Connect first
      await testPrompt(`Connect to wallet ${TEST_DATA.WALLET_ADDRESS_1}`)

      const result = await testPrompt("Disconnect my wallet", {
        toolsUsed: ["disconnect_wallet"],
        resultContains: ["disconnect"],
      })

      validateResponseStructure(result)
    })

    test("should disconnect with polite request", async () => {
      await testPrompt(`Connect to wallet ${TEST_DATA.WALLET_ADDRESS_1}`)

      const result = await testPrompt("Please disconnect the current wallet", {
        toolsUsed: ["disconnect_wallet"],
        successMessage: /disconnect/i,
      })

      validateResponseStructure(result)
    })
  })

  describe("complete wallet workflow", () => {
    test("should handle complete wallet lifecycle", async () => {
      const results = await testWorkflow("Complete Wallet Lifecycle", [
        {
          prompt: "Show me available wallet accounts for testing",
          expected: { toolsUsed: ["get_accounts"] },
        },
        {
          prompt: `Connect to wallet ${TEST_DATA.WALLET_ADDRESS_1}`,
          expected: { toolsUsed: ["connect_wallet"] },
        },
        {
          prompt: "What wallet am I currently connected to?",
          expected: { toolsUsed: ["get_current_account"] },
        },
        {
          prompt: "Check my current balance",
          expected: { toolsUsed: ["get_balance"] },
        },
        {
          prompt: "Show my wallet configuration",
          expected: { toolsUsed: ["get_wallet_info"] },
        },
        {
          prompt: "Disconnect my wallet",
          expected: { toolsUsed: ["disconnect_wallet"] },
        },
      ])

      // Validate that all steps completed successfully
      results.forEach((result) => validateResponseStructure(result))
    })

    test("should switch between different wallets", async () => {
      const results = await testWorkflow("Multi-Wallet Switching", [
        {
          prompt: `Connect to first wallet ${TEST_DATA.WALLET_ADDRESS_1}`,
          expected: { toolsUsed: ["connect_wallet"] },
        },
        {
          prompt: "Check my balance",
          expected: { toolsUsed: ["get_balance"] },
        },
        {
          prompt: `Now switch to different wallet ${TEST_DATA.WALLET_ADDRESS_2}`,
          expected: { toolsUsed: ["connect_wallet"] },
        },
        {
          prompt: "What's my current wallet address?",
          expected: { toolsUsed: ["get_current_account"] },
        },
        {
          prompt: "Check the balance of this wallet",
          expected: { toolsUsed: ["get_balance"] },
        },
      ])

      results.forEach((result) => validateResponseStructure(result))
    })
  })

  describe("error handling scenarios", () => {
    test("should handle ambiguous wallet connection request", async () => {
      const result = await testPrompt("Connect to my wallet", {
        // Should either ask for clarification or use default
        resultContains: ["address", "which", "specify"],
      })

      // This might succeed with available accounts or ask for clarification
      validateResponseStructure(result)
    })

    test("should handle invalid wallet address", async () => {
      const result = await testPrompt("Connect to wallet 0xinvalid", {
        errorExpected: true,
        errorMessage: "invalid",
      })

      validateResponseStructure(result)
    })

    test("should handle balance check without connected wallet", async () => {
      // Ensure no wallet is connected
      await testPrompt("Disconnect my wallet")

      const result = await testPrompt("What's my balance?", {
        // Should either connect to a default wallet or ask for address
        resultContains: ["balance", "connect", "address"],
      })

      validateResponseStructure(result)
    })
  })

  describe("natural language variations", () => {
    test("should understand various connection phrasings", async () => {
      const connectionPhrases = [
        "Connect wallet",
        "Use wallet address",
        "Switch to wallet",
        "I want to connect",
        "Link my wallet",
        "Access wallet",
      ]

      for (const phrase of connectionPhrases) {
        const fullPrompt = `${phrase} ${TEST_DATA.WALLET_ADDRESS_1}`

        const result = await testPrompt(fullPrompt, {
          toolsUsed: ["connect_wallet"],
          resultContains: ["connect", "wallet"],
        })

        validateResponseStructure(result)
      }
    })

    test("should understand various balance check phrasings", async () => {
      await testPrompt(`Connect to wallet ${TEST_DATA.WALLET_ADDRESS_1}`)

      const balancePhrases = [
        "Show balance",
        "Display funds",
        "How much do I have?",
        "Current balance please",
        "ETH amount",
        "Check funds",
      ]

      for (const phrase of balancePhrases) {
        const result = await testPrompt(phrase, {
          toolsUsed: ["get_balance"],
          resultContains: ["balance"],
        })

        validateBalanceCheck(result)
      }
    })
  })
})
