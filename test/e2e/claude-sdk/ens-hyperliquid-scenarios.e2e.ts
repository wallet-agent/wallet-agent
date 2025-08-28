import { beforeAll, describe, test } from "bun:test"
import { validateENSResolution, validateResponseStructure } from "./helpers/validator.js"
import { setupClaudeSDKTests, TEST_DATA, testPrompt, testWorkflow } from "./setup.js"

describe("ENS and Hyperliquid Operations via Natural Language", () => {
  beforeAll(() => {
    setupClaudeSDKTests()
  })

  describe("ENS (Ethereum Name Service) Operations", () => {
    beforeAll(async () => {
      // Switch to mainnet for ENS resolution
      await testPrompt("Switch to Ethereum mainnet")
    })

    test("should resolve ENS name to address", async () => {
      const result = await testPrompt(
        `Resolve ${TEST_DATA.ENS_NAMES[0]} to get the Ethereum address`,
        {
          toolsUsed: ["resolve_ens_name"],
          resultContains: ["resolved", "address", "ens"],
        },
      )

      validateENSResolution(result, TEST_DATA.ENS_NAMES[0])
    })

    test("should resolve multiple ENS names", async () => {
      const result = await testPrompt(
        `Resolve both ${TEST_DATA.ENS_NAMES[0]} and ${TEST_DATA.ENS_NAMES[1]} to their addresses`,
        {
          toolsUsed: ["resolve_ens_name"],
          resultContains: ["resolved", "addresses", "ens"],
        },
      )

      validateResponseStructure(result)
    })

    test("should handle ENS resolution with various phrasings", async () => {
      const ensPhrases = [
        "Resolve ENS name",
        "Convert ENS to address",
        "Lookup ENS domain",
        "Get address for ENS",
        "Translate ENS name",
      ]

      for (const phrase of ensPhrases) {
        const result = await testPrompt(`${phrase} ${TEST_DATA.ENS_NAMES[0]}`, {
          toolsUsed: ["resolve_ens_name"],
          resultContains: ["ens", "address"],
        })

        validateResponseStructure(result)
      }
    })

    test("should use ENS name in transaction", async () => {
      const ensTransactionFlow = [
        {
          prompt: `Connect to wallet ${TEST_DATA.WALLET_ADDRESS_1}`,
          expected: { toolsUsed: ["connect_wallet"] },
        },
        {
          prompt: `Resolve ${TEST_DATA.ENS_NAMES[0]} to address`,
          expected: {
            toolsUsed: ["resolve_ens_name"],
            resultContains: ["resolved"],
          },
        },
        {
          prompt: `Send ${TEST_DATA.SMALL_ETH_AMOUNT} ETH to ${TEST_DATA.ENS_NAMES[0]}`,
          expected: {
            toolsUsed: ["resolve_ens_name", "send_transaction"],
            resultContains: ["sent", "transaction"],
          },
        },
      ]

      const results = await testWorkflow("ENS Transaction Flow", ensTransactionFlow)
      results.forEach((result) => validateResponseStructure(result))
    })

    test("should use ENS name in token operations", async () => {
      const result = await testPrompt(`Transfer 10 USDC to ${TEST_DATA.ENS_NAMES[0]}`, {
        toolsUsed: ["resolve_ens_name", "transfer_token"],
        resultContains: ["ens", "transfer", "usdc"],
      })

      validateResponseStructure(result)
    })

    test("should handle invalid ENS names", async () => {
      const result = await testPrompt("Resolve invalid-ens-name-that-does-not-exist.eth", {
        toolsUsed: ["resolve_ens_name"],
        errorExpected: true,
        errorMessage: "not found",
      })

      validateResponseStructure(result)
    })

    test("should handle ENS on wrong network", async () => {
      // Switch to a network that doesn't support ENS
      await testPrompt("Switch to Anvil local chain")

      const result = await testPrompt(`Resolve ${TEST_DATA.ENS_NAMES[0]} on local network`, {
        toolsUsed: ["resolve_ens_name"],
        errorExpected: true,
        errorMessage: "mainnet",
      })

      validateResponseStructure(result)

      // Switch back to mainnet for other tests
      await testPrompt("Switch to Ethereum mainnet")
    })

    test("should provide ENS-based workflow guidance", async () => {
      const result = await testPrompt(
        `I want to send ETH to ${TEST_DATA.ENS_NAMES[0]}. Guide me through the process including ENS resolution.`,
        {
          toolsUsed: ["resolve_ens_name", "send_transaction"],
          resultContains: ["guide", "ens", "resolution", "process"],
        },
      )

      validateResponseStructure(result)
    })
  })

  describe("Hyperliquid Operations", () => {
    test("should import Hyperliquid wallet", async () => {
      const result = await testPrompt(
        "Import Hyperliquid wallet with private key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        {
          toolsUsed: ["hl_import_wallet"],
          resultContains: ["imported", "hyperliquid", "wallet"],
        },
      )

      validateResponseStructure(result)
    })

    test("should get Hyperliquid account info", async () => {
      // Import wallet first
      await testPrompt(
        "Import Hyperliquid wallet with private key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
      )

      const result = await testPrompt(
        "Show my Hyperliquid account information including balance and positions",
        {
          toolsUsed: ["hl_get_account_info"],
          resultContains: ["account", "balance", "positions", "hyperliquid"],
        },
      )

      validateResponseStructure(result)
    })

    test("should place Hyperliquid order", async () => {
      await testPrompt(
        "Import Hyperliquid wallet with private key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
      )

      const result = await testPrompt("Place a buy order for 0.1 BTC at $45000 on Hyperliquid", {
        toolsUsed: ["hl_place_order"],
        resultContains: ["place", "order", "btc", "hyperliquid"],
      })

      validateResponseStructure(result)
    })

    test("should place market order", async () => {
      const result = await testPrompt("Place a market sell order for 0.05 ETH on Hyperliquid", {
        toolsUsed: ["hl_place_order"],
        resultContains: ["market", "sell", "eth", "hyperliquid"],
      })

      validateResponseStructure(result)
    })

    test("should cancel Hyperliquid order", async () => {
      // First place an order
      await testPrompt("Place a buy order for 0.1 BTC at $45000 on Hyperliquid")

      const result = await testPrompt("Cancel my BTC order on Hyperliquid", {
        toolsUsed: ["hl_cancel_order"],
        resultContains: ["cancel", "order", "btc"],
      })

      validateResponseStructure(result)
    })

    test("should get open orders", async () => {
      const result = await testPrompt("Show all my open orders on Hyperliquid", {
        toolsUsed: ["hl_get_open_orders"],
        resultContains: ["open", "orders", "hyperliquid"],
      })

      validateResponseStructure(result)
    })

    test("should get positions", async () => {
      const result = await testPrompt("Display my current positions on Hyperliquid", {
        toolsUsed: ["hl_get_positions"],
        resultContains: ["positions", "current", "hyperliquid"],
      })

      validateResponseStructure(result)
    })

    test("should transfer USDC on Hyperliquid", async () => {
      const result = await testPrompt(
        `Transfer 100 USDC to ${TEST_DATA.WALLET_ADDRESS_2} on Hyperliquid`,
        {
          toolsUsed: ["hl_transfer"],
          resultContains: ["transfer", "usdc", "hyperliquid"],
        },
      )

      validateResponseStructure(result)
    })

    test("should get market prices", async () => {
      const result = await testPrompt(
        "Show me current mid prices for all trading pairs on Hyperliquid",
        {
          toolsUsed: ["hl_get_all_mids"],
          resultContains: ["mid", "prices", "trading", "pairs"],
        },
      )

      validateResponseStructure(result)
    })

    test("should get user fill history", async () => {
      const result = await testPrompt("Show my trade fill history on Hyperliquid", {
        toolsUsed: ["hl_get_user_fills"],
        resultContains: ["fill", "history", "trade", "hyperliquid"],
      })

      validateResponseStructure(result)
    })
  })

  describe("Complete Hyperliquid Trading Workflows", () => {
    test("should execute complete trading setup", async () => {
      const tradingSetup = [
        {
          prompt:
            "Import Hyperliquid wallet with private key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
          expected: {
            toolsUsed: ["hl_import_wallet"],
            resultContains: ["imported", "wallet"],
          },
        },
        {
          prompt: "Check my Hyperliquid account balance and positions",
          expected: {
            toolsUsed: ["hl_get_account_info"],
            resultContains: ["balance", "positions"],
          },
        },
        {
          prompt: "Get current market prices for major trading pairs",
          expected: {
            toolsUsed: ["hl_get_all_mids"],
            resultContains: ["prices", "trading", "pairs"],
          },
        },
        {
          prompt: "Show any existing open orders",
          expected: {
            toolsUsed: ["hl_get_open_orders"],
            resultContains: ["open", "orders"],
          },
        },
      ]

      const results = await testWorkflow("Hyperliquid Trading Setup", tradingSetup)
      results.forEach((result) => validateResponseStructure(result))
    })

    test("should execute trading strategy workflow", async () => {
      const tradingStrategy = [
        {
          prompt: "Check BTC price on Hyperliquid",
          expected: {
            toolsUsed: ["hl_get_all_mids"],
            resultContains: ["btc", "price"],
          },
        },
        {
          prompt: "If BTC is below $50000, place a buy order for 0.1 BTC",
          expected: {
            toolsUsed: ["hl_place_order"],
            resultContains: ["buy", "order", "btc"],
          },
        },
        {
          prompt: "Monitor my position and orders",
          expected: {
            toolsUsed: ["hl_get_positions", "hl_get_open_orders"],
            resultContains: ["monitor", "position", "orders"],
          },
        },
      ]

      const results = await testWorkflow("Trading Strategy Execution", tradingStrategy)
      results.forEach((result) => validateResponseStructure(result))
    })

    test("should handle portfolio management", async () => {
      const portfolioManagement = `
        Manage my Hyperliquid portfolio: check all positions, review recent fills,
        assess current market conditions, and suggest any position adjustments
        based on the current setup.
      `

      const result = await testPrompt(portfolioManagement, {
        toolsUsed: ["hl_get_positions", "hl_get_user_fills", "hl_get_all_mids"],
        resultContains: ["portfolio", "positions", "market", "suggest"],
      })

      validateResponseStructure(result)
    })
  })

  describe("Error Handling Scenarios", () => {
    test("should handle invalid Hyperliquid private key", async () => {
      const result = await testPrompt("Import Hyperliquid wallet with invalid key 0xinvalid", {
        toolsUsed: ["hl_import_wallet"],
        errorExpected: true,
        errorMessage: "invalid",
      })

      validateResponseStructure(result)
    })

    test("should handle insufficient balance for order", async () => {
      const result = await testPrompt(
        "Place a buy order for 1000 BTC (more than available balance) on Hyperliquid",
        {
          toolsUsed: ["hl_place_order"],
          errorExpected: true,
          errorMessage: "insufficient",
        },
      )

      validateResponseStructure(result)
    })

    test("should handle invalid trading pair", async () => {
      const result = await testPrompt("Place order for INVALIDCOIN on Hyperliquid", {
        toolsUsed: ["hl_place_order"],
        errorExpected: true,
        errorMessage: "invalid",
      })

      validateResponseStructure(result)
    })

    test("should handle canceling non-existent order", async () => {
      const result = await testPrompt("Cancel order ID 999999 on Hyperliquid", {
        toolsUsed: ["hl_cancel_order"],
        errorExpected: true,
        errorMessage: "not found",
      })

      validateResponseStructure(result)
    })
  })

  describe("Natural Language Variations", () => {
    test("should understand various ENS resolution phrasings", async () => {
      await testPrompt("Switch to Ethereum mainnet")

      const ensPhrases = [
        "What address is",
        "Resolve the ENS name",
        "Convert ENS to address",
        "Lookup ENS domain",
        "Find address for",
      ]

      for (const phrase of ensPhrases) {
        const result = await testPrompt(`${phrase} ${TEST_DATA.ENS_NAMES[0]}?`, {
          toolsUsed: ["resolve_ens_name"],
          resultContains: ["ens", "address"],
        })

        validateResponseStructure(result)
      }
    })

    test("should understand various Hyperliquid trading phrasings", async () => {
      const tradingPhrases = [
        "Buy BTC on Hyperliquid",
        "Purchase Bitcoin via Hyperliquid",
        "Long BTC position on HL",
        "Open BTC buy order",
        "Acquire Bitcoin on Hyperliquid",
      ]

      for (const phrase of tradingPhrases) {
        const result = await testPrompt(`${phrase} - 0.1 BTC at $45000`, {
          toolsUsed: ["hl_place_order"],
          resultContains: ["buy", "btc", "hyperliquid"],
        })

        validateResponseStructure(result)
      }
    })

    test("should understand Hyperliquid account queries", async () => {
      const accountPhrases = [
        "Show my Hyperliquid account",
        "What's my HL balance?",
        "Display Hyperliquid positions",
        "Check my Hyperliquid portfolio",
        "Hyperliquid account status",
      ]

      for (const phrase of accountPhrases) {
        const result = await testPrompt(phrase, {
          toolsUsed: ["hl_get_account_info"],
          resultContains: ["account", "hyperliquid"],
        })

        validateResponseStructure(result)
      }
    })
  })

  describe("Integration Scenarios", () => {
    test("should combine ENS with DeFi operations", async () => {
      await testPrompt("Switch to Ethereum mainnet")

      const ensDefiFlow = [
        {
          prompt: `Connect to wallet ${TEST_DATA.WALLET_ADDRESS_1}`,
          expected: { toolsUsed: ["connect_wallet"] },
        },
        {
          prompt: `Resolve ${TEST_DATA.ENS_NAMES[0]} for token transfer`,
          expected: {
            toolsUsed: ["resolve_ens_name"],
            resultContains: ["resolved", "ens"],
          },
        },
        {
          prompt: `Transfer 50 USDC to ${TEST_DATA.ENS_NAMES[0]}`,
          expected: {
            toolsUsed: ["resolve_ens_name", "transfer_token"],
            resultContains: ["transfer", "usdc", "ens"],
          },
        },
      ]

      const results = await testWorkflow("ENS + DeFi Integration", ensDefiFlow)
      results.forEach((result) => validateResponseStructure(result))
    })

    test("should handle complex Hyperliquid strategy", async () => {
      const complexStrategy = `
        Execute a complex trading strategy on Hyperliquid: First import my wallet,
        check account status, analyze BTC and ETH prices, place limit orders
        for both assets if conditions are favorable, then monitor the positions.
      `

      const result = await testPrompt(complexStrategy, {
        toolsUsed: ["hl_import_wallet", "hl_get_account_info", "hl_get_all_mids", "hl_place_order"],
        resultContains: ["strategy", "wallet", "prices", "orders", "monitor"],
      })

      validateResponseStructure(result)
    })

    test("should provide trading education", async () => {
      const result = await testPrompt(
        "Explain how to use Hyperliquid for trading and what features are available through this wallet agent",
        {
          resultContains: ["hyperliquid", "trading", "features", "explain"],
        },
      )

      validateResponseStructure(result)
    })

    test("should handle risk management workflow", async () => {
      const riskManagement = [
        {
          prompt: "Check my current Hyperliquid positions and their P&L",
          expected: {
            toolsUsed: ["hl_get_positions"],
            resultContains: ["positions", "pnl"],
          },
        },
        {
          prompt: "Review my recent fills to understand trading performance",
          expected: {
            toolsUsed: ["hl_get_user_fills"],
            resultContains: ["fills", "performance"],
          },
        },
        {
          prompt: "Analyze current market prices and suggest risk adjustments",
          expected: {
            toolsUsed: ["hl_get_all_mids"],
            resultContains: ["market", "prices", "risk", "adjustments"],
          },
        },
      ]

      const results = await testWorkflow("Risk Management Workflow", riskManagement)
      results.forEach((result) => validateResponseStructure(result))
    })
  })
})
