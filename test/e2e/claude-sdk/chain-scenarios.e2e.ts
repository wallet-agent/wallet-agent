import { beforeAll, describe, test } from "bun:test"
import { validateChainSwitch, validateResponseStructure } from "./helpers/validator.js"
import { setupClaudeSDKTests, TEST_DATA, testPrompt, testWorkflow } from "./setup.js"

describe("Chain Management Operations via Natural Language", () => {
  beforeAll(() => {
    setupClaudeSDKTests()
  })

  describe("Built-in Chain Operations", () => {
    test("should switch to Ethereum mainnet", async () => {
      const result = await testPrompt("Switch to Ethereum mainnet", {
        toolsUsed: ["switch_chain"],
        resultContains: ["ethereum", "mainnet", "switched"],
      })

      validateChainSwitch(result, TEST_DATA.MAINNET_CHAIN_ID)
    })

    test("should switch to Polygon", async () => {
      const result = await testPrompt("Change to Polygon network", {
        toolsUsed: ["switch_chain"],
        resultContains: ["polygon", "switched"],
      })

      validateChainSwitch(result, TEST_DATA.POLYGON_CHAIN_ID)
    })

    test("should switch to Sepolia testnet", async () => {
      const result = await testPrompt("Switch to Sepolia testnet", {
        toolsUsed: ["switch_chain"],
        resultContains: ["sepolia", "testnet"],
      })

      validateResponseStructure(result)
    })

    test("should switch to Anvil local chain", async () => {
      const result = await testPrompt("Go back to Anvil local chain", {
        toolsUsed: ["switch_chain"],
        resultContains: ["anvil", "local"],
      })

      validateChainSwitch(result, TEST_DATA.ANVIL_CHAIN_ID)
    })

    test("should handle various chain switching phrasings", async () => {
      const chainPhrases = [
        "Switch to mainnet",
        "Change to Ethereum",
        "Move to Polygon",
        "Use Sepolia network",
        "Go to Anvil",
      ]

      for (const phrase of chainPhrases) {
        const result = await testPrompt(phrase, {
          toolsUsed: ["switch_chain"],
          resultContains: ["switched", "chain", "network"],
        })

        validateResponseStructure(result)
      }
    })
  })

  describe("Custom Chain Management", () => {
    test("should add a custom chain", async () => {
      const result = await testPrompt(
        "Add a custom chain called TestNet with chain ID 12345, RPC https://testnet-rpc.example.com, and native currency TEST with symbol TEST and 18 decimals",
        {
          toolsUsed: ["add_custom_chain"],
          resultContains: ["custom", "chain", "added", "testnet"],
        },
      )

      validateResponseStructure(result)
    })

    test("should add custom chain with block explorer", async () => {
      const result = await testPrompt(
        "Add custom chain: Name 'DevChain', ID 99999, RPC https://dev.example.com, currency DEV (18 decimals), explorer https://explorer.dev.example.com",
        {
          toolsUsed: ["add_custom_chain"],
          resultContains: ["custom", "added", "devchain"],
        },
      )

      validateResponseStructure(result)
    })

    test("should update custom chain configuration", async () => {
      // First add a chain
      await testPrompt(
        "Add custom chain: Name 'UpdateTest', ID 88888, RPC https://old.example.com, currency UPD (18 decimals)",
      )

      const result = await testPrompt(
        "Update the UpdateTest chain RPC to https://new.example.com",
        {
          toolsUsed: ["update_custom_chain"],
          resultContains: ["updated", "chain", "rpc"],
        },
      )

      validateResponseStructure(result)
    })

    test("should remove custom chain", async () => {
      // Add a chain first
      await testPrompt(
        "Add custom chain: Name 'TempChain', ID 77777, RPC https://temp.example.com, currency TEMP (18 decimals)",
      )

      const result = await testPrompt("Remove the custom chain with ID 77777", {
        toolsUsed: ["remove_custom_chain"],
        resultContains: ["removed", "custom", "chain"],
      })

      validateResponseStructure(result)
    })

    test("should handle full custom chain lifecycle", async () => {
      const customChainFlow = [
        {
          prompt:
            "Add custom chain: Name 'LifecycleTest', ID 66666, RPC https://lifecycle.example.com, currency LIFE (18 decimals)",
          expected: {
            toolsUsed: ["add_custom_chain"],
            resultContains: ["added", "custom"],
          },
        },
        {
          prompt: "Switch to LifecycleTest chain",
          expected: {
            toolsUsed: ["switch_chain"],
            resultContains: ["switched", "lifecycle"],
          },
        },
        {
          prompt: "Update LifecycleTest chain name to 'Updated Lifecycle'",
          expected: {
            toolsUsed: ["update_custom_chain"],
            resultContains: ["updated"],
          },
        },
        {
          prompt: "Switch back to Anvil",
          expected: {
            toolsUsed: ["switch_chain"],
            resultContains: ["anvil"],
          },
        },
        {
          prompt: "Remove the custom chain 66666",
          expected: {
            toolsUsed: ["remove_custom_chain"],
            resultContains: ["removed"],
          },
        },
      ]

      const results = await testWorkflow("Custom Chain Lifecycle", customChainFlow)
      results.forEach((result) => validateResponseStructure(result))
    })
  })

  describe("Chain Information and Status", () => {
    test("should get current chain information", async () => {
      const result = await testPrompt("What chain am I currently on?", {
        resultContains: ["chain", "current", "network"],
      })

      validateResponseStructure(result)
    })

    test("should show chain details with various phrasings", async () => {
      const chainInfoPhrases = [
        "Show me current chain info",
        "What network am I using?",
        "Display chain details",
        "Current blockchain information",
        "Which chain is active?",
      ]

      for (const phrase of chainInfoPhrases) {
        const result = await testPrompt(phrase, {
          resultContains: ["chain", "network", "info"],
        })

        validateResponseStructure(result)
      }
    })

    test("should provide comprehensive chain status", async () => {
      const result = await testPrompt(
        "Give me detailed information about the current blockchain network including chain ID, name, and native currency",
        {
          resultContains: ["chain", "id", "name", "currency", "network"],
        },
      )

      validateResponseStructure(result)
    })
  })

  describe("Multi-Chain Workflows", () => {
    test("should compare balances across chains", async () => {
      const multiChainFlow = [
        {
          prompt: `Connect to ${TEST_DATA.WALLET_ADDRESS_1}`,
          expected: { toolsUsed: ["connect_wallet"] },
        },
        {
          prompt: "Check my balance on current chain",
          expected: { toolsUsed: ["get_balance"] },
        },
        {
          prompt: "Switch to Polygon and check balance there",
          expected: {
            toolsUsed: ["switch_chain", "get_balance"],
            resultContains: ["polygon", "balance"],
          },
        },
        {
          prompt: "Switch to mainnet and check balance",
          expected: {
            toolsUsed: ["switch_chain", "get_balance"],
            resultContains: ["mainnet", "balance"],
          },
        },
        {
          prompt: "Which chain has the highest balance?",
          expected: {
            resultContains: ["balance", "highest", "chain"],
          },
        },
      ]

      const results = await testWorkflow("Multi-Chain Balance Comparison", multiChainFlow)
      results.forEach((result) => validateResponseStructure(result))
    })

    test("should handle chain-specific token operations", async () => {
      const chainTokenFlow = [
        {
          prompt: `Connect to ${TEST_DATA.WALLET_ADDRESS_1}`,
          expected: { toolsUsed: ["connect_wallet"] },
        },
        {
          prompt: "Switch to Polygon",
          expected: { toolsUsed: ["switch_chain"] },
        },
        {
          prompt: "Check my USDC balance on Polygon",
          expected: {
            toolsUsed: ["get_token_balance"],
            resultContains: ["usdc", "polygon"],
          },
        },
        {
          prompt: "Switch to mainnet",
          expected: { toolsUsed: ["switch_chain"] },
        },
        {
          prompt: "Check my USDC balance on mainnet",
          expected: {
            toolsUsed: ["get_token_balance"],
            resultContains: ["usdc", "mainnet"],
          },
        },
      ]

      const results = await testWorkflow("Chain-Specific Token Operations", chainTokenFlow)
      results.forEach((result) => validateResponseStructure(result))
    })

    test("should recommend optimal chain for transactions", async () => {
      const result = await testPrompt(
        `Connect to ${TEST_DATA.WALLET_ADDRESS_1}, check gas prices on Ethereum mainnet and Polygon, then recommend which chain I should use for a token transfer`,
        {
          toolsUsed: ["connect_wallet", "switch_chain", "estimate_gas"],
          resultContains: ["gas", "recommend", "chain", "optimal"],
        },
      )

      validateResponseStructure(result)
    })
  })

  describe("Chain Configuration Management", () => {
    test("should handle complex chain setup", async () => {
      const complexChainSetup = `
        Set up a complete test environment: Add a custom chain called 'TestEnv' 
        with ID 12321, RPC https://testenv.example.com, currency TENV (18 decimals), 
        and block explorer https://scan.testenv.example.com. Then switch to it 
        and verify the setup.
      `

      const result = await testPrompt(complexChainSetup, {
        toolsUsed: ["add_custom_chain", "switch_chain"],
        resultContains: ["testenv", "custom", "switched", "setup"],
      })

      validateResponseStructure(result)
    })

    test("should manage multiple custom chains", async () => {
      const multiChainSetup = [
        {
          prompt:
            "Add custom chain: Name 'Dev1', ID 11111, RPC https://dev1.example.com, currency D1 (18 decimals)",
          expected: { toolsUsed: ["add_custom_chain"] },
        },
        {
          prompt:
            "Add custom chain: Name 'Dev2', ID 22222, RPC https://dev2.example.com, currency D2 (18 decimals)",
          expected: { toolsUsed: ["add_custom_chain"] },
        },
        {
          prompt: "Switch between Dev1 and Dev2 chains to test connectivity",
          expected: {
            toolsUsed: ["switch_chain"],
            resultContains: ["dev1", "dev2", "switch"],
          },
        },
        {
          prompt: "Remove both custom chains",
          expected: {
            toolsUsed: ["remove_custom_chain"],
            resultContains: ["removed"],
          },
        },
      ]

      const results = await testWorkflow("Multiple Custom Chains Management", multiChainSetup)
      results.forEach((result) => validateResponseStructure(result))
    })
  })

  describe("Error Handling Scenarios", () => {
    test("should handle unknown chain name", async () => {
      const result = await testPrompt("Switch to UnknownChain network", {
        errorExpected: true,
        errorMessage: "unknown",
      })

      validateResponseStructure(result)
    })

    test("should handle invalid chain ID", async () => {
      const result = await testPrompt("Switch to chain ID 999999999", {
        errorExpected: true,
        errorMessage: "not found",
      })

      validateResponseStructure(result)
    })

    test("should handle duplicate custom chain", async () => {
      // Add a chain first
      await testPrompt(
        "Add custom chain: Name 'DupeTest', ID 55555, RPC https://dupe.example.com, currency DUPE (18 decimals)",
      )

      const result = await testPrompt(
        "Add custom chain: Name 'DupeTest2', ID 55555, RPC https://dupe2.example.com, currency DUPE2 (18 decimals)",
        {
          errorExpected: true,
          errorMessage: "already exists",
        },
      )

      validateResponseStructure(result)
    })

    test("should handle invalid RPC URL", async () => {
      const result = await testPrompt(
        "Add custom chain: Name 'BadRPC', ID 44444, RPC invalid-url, currency BAD (18 decimals)",
        {
          errorExpected: true,
          errorMessage: "invalid",
        },
      )

      validateResponseStructure(result)
    })

    test("should handle removing non-existent chain", async () => {
      const result = await testPrompt("Remove custom chain with ID 999888777", {
        errorExpected: true,
        errorMessage: "not found",
      })

      validateResponseStructure(result)
    })
  })

  describe("Natural Language Variations", () => {
    test("should understand various chain addition phrasings", async () => {
      const addChainPhrases = [
        "Create a new custom chain",
        "Set up a custom network",
        "Add a new blockchain",
        "Configure custom chain",
        "Register new network",
      ]

      for (const phrase of addChainPhrases) {
        const fullPrompt = `${phrase} called TestPhrase with ID ${Math.floor(Math.random() * 100000)}, RPC https://test.example.com, currency TEST (18 decimals)`

        const result = await testPrompt(fullPrompt, {
          toolsUsed: ["add_custom_chain"],
          resultContains: ["custom", "chain", "added"],
        })

        validateResponseStructure(result)
      }
    })

    test("should understand various chain switching phrasings", async () => {
      const switchPhrases = ["Change to", "Switch to", "Move to", "Use", "Go to", "Connect to"]

      for (const phrase of switchPhrases) {
        const result = await testPrompt(`${phrase} Ethereum mainnet`, {
          toolsUsed: ["switch_chain"],
          resultContains: ["ethereum", "mainnet"],
        })

        validateResponseStructure(result)
      }
    })

    test("should understand chain information requests", async () => {
      const infoPhrases = [
        "What chain am I on?",
        "Current network info",
        "Show blockchain details",
        "Which network is active?",
        "Display chain information",
      ]

      for (const phrase of infoPhrases) {
        const result = await testPrompt(phrase, {
          resultContains: ["chain", "network"],
        })

        validateResponseStructure(result)
      }
    })
  })

  describe("Integration with Other Operations", () => {
    test("should handle chain switch before token operations", async () => {
      const integrationFlow = [
        {
          prompt: `Connect to ${TEST_DATA.WALLET_ADDRESS_1}`,
          expected: { toolsUsed: ["connect_wallet"] },
        },
        {
          prompt: "Switch to Polygon for lower gas fees",
          expected: {
            toolsUsed: ["switch_chain"],
            resultContains: ["polygon"],
          },
        },
        {
          prompt: "Check my USDC balance on Polygon",
          expected: {
            toolsUsed: ["get_token_balance"],
            resultContains: ["usdc", "balance"],
          },
        },
        {
          prompt: `Transfer 10 USDC to ${TEST_DATA.WALLET_ADDRESS_2} on Polygon`,
          expected: {
            toolsUsed: ["transfer_token"],
            resultContains: ["transfer", "usdc", "polygon"],
          },
        },
      ]

      const results = await testWorkflow("Chain Switch for Token Operations", integrationFlow)
      results.forEach((result) => validateResponseStructure(result))
    })

    test("should estimate gas costs across different chains", async () => {
      const gasComparisonFlow = [
        {
          prompt: `Connect to ${TEST_DATA.WALLET_ADDRESS_1}`,
          expected: { toolsUsed: ["connect_wallet"] },
        },
        {
          prompt: "Switch to Ethereum mainnet",
          expected: { toolsUsed: ["switch_chain"] },
        },
        {
          prompt: `Estimate gas for sending ${TEST_DATA.SMALL_ETH_AMOUNT} ETH`,
          expected: {
            toolsUsed: ["estimate_gas"],
            resultContains: ["gas", "mainnet"],
          },
        },
        {
          prompt: "Switch to Polygon",
          expected: { toolsUsed: ["switch_chain"] },
        },
        {
          prompt: `Estimate gas for the same transaction on Polygon`,
          expected: {
            toolsUsed: ["estimate_gas"],
            resultContains: ["gas", "polygon"],
          },
        },
        {
          prompt: "Compare the gas costs and recommend the better chain",
          expected: {
            resultContains: ["compare", "gas", "recommend", "cheaper"],
          },
        },
      ]

      const results = await testWorkflow("Cross-Chain Gas Comparison", gasComparisonFlow)
      results.forEach((result) => validateResponseStructure(result))
    })
  })
})
