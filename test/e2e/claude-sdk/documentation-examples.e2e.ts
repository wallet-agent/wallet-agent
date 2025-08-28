import { beforeAll, describe, test } from "bun:test"
import {
  validateBalanceCheck,
  validateChainSwitch,
  validateResponseStructure,
  validateTokenOperation,
  validateTransaction,
  validateWagmiOperation,
  validateWalletConnection,
  validateWorkflow,
} from "./helpers/validator.js"
import { setupClaudeSDKTests, TEST_DATA, testPrompt, testWorkflow } from "./setup.js"

describe("README Documentation Examples E2E", () => {
  beforeAll(() => {
    setupClaudeSDKTests()
  })

  describe("Basic Flow Examples from README", () => {
    test("should execute complete basic flow from documentation", async () => {
      const basicFlow = [
        {
          prompt: `Connect to ${TEST_DATA.WALLET_ADDRESS_1}`,
          expected: {
            toolsUsed: ["connect_wallet"],
            resultContains: ["connected"],
          },
        },
        {
          prompt: "Check my balance",
          expected: {
            toolsUsed: ["get_balance"],
            resultContains: ["balance"],
          },
        },
        {
          prompt: `Send 0.1 ETH to ${TEST_DATA.ENS_NAMES[0]}`,
          expected: {
            toolsUsed: ["resolve_ens_name", "send_transaction"],
            resultContains: ["transaction", "sent"],
          },
        },
        {
          prompt: "Switch to Polygon",
          expected: {
            toolsUsed: ["switch_chain"],
            resultContains: ["polygon", "switched"],
          },
        },
      ]

      const results = await testWorkflow("Basic Flow Documentation", basicFlow)

      // Validate each step
      if (results[0]) validateWalletConnection(results[0])
      if (results[1]) validateBalanceCheck(results[1])
      if (results[2]) validateTransaction(results[2], "send")
      if (results[3]) validateChainSwitch(results[3], TEST_DATA.POLYGON_CHAIN_ID)

      validateWorkflow(results, [
        "connect_wallet",
        "get_balance",
        "send_transaction",
        "switch_chain",
      ])
    })

    test("should handle basic flow with exact README commands", async () => {
      // These are the exact commands from the README
      const exactCommands = [
        `"Connect to ${TEST_DATA.WALLET_ADDRESS_1}"`,
        `"Check my balance"`,
        `"Send ${TEST_DATA.SMALL_ETH_AMOUNT} ETH to ${TEST_DATA.WALLET_ADDRESS_2}"`,
        `"Switch to Polygon"`,
      ]

      for (const command of exactCommands) {
        // Remove quotes for actual execution
        const cleanCommand = command.replace(/"/g, "")
        const result = await testPrompt(cleanCommand)
        validateResponseStructure(result)
      }
    })
  })

  describe("Token Operations Examples from README", () => {
    test("should execute token operations flow", async () => {
      const tokenFlow = [
        {
          prompt: `Connect to ${TEST_DATA.WALLET_ADDRESS_1}`,
          expected: { toolsUsed: ["connect_wallet"] },
        },
        {
          prompt: `Transfer 100 USDC to ${TEST_DATA.WALLET_ADDRESS_2}`,
          expected: {
            toolsUsed: ["transfer_token"],
            resultContains: ["transfer", "usdc"],
          },
        },
        {
          prompt: "Get my USDC balance",
          expected: {
            toolsUsed: ["get_token_balance"],
            resultContains: ["balance", "usdc"],
          },
        },
        {
          prompt: `Approve USDC spending for ${TEST_DATA.WALLET_ADDRESS_2}`,
          expected: {
            toolsUsed: ["approve_token"],
            resultContains: ["approve", "usdc"],
          },
        },
      ]

      const results = await testWorkflow("Token Operations Documentation", tokenFlow)

      // Validate token operations
      if (results[1]) validateTokenOperation(results[1], "transfer")
      if (results[2]) validateTokenOperation(results[2], "balance")
      if (results[3]) validateTokenOperation(results[3], "approve")
    })

    test("should handle exact README token commands", async () => {
      await testPrompt(`Connect to ${TEST_DATA.WALLET_ADDRESS_1}`)

      const tokenCommands = [
        `"Transfer 100 USDC to ${TEST_DATA.WALLET_ADDRESS_2}"`,
        `"Get my DOGE balance"`,
        `"Approve USDC spending for ${TEST_DATA.WALLET_ADDRESS_2}"`,
      ]

      for (const command of tokenCommands) {
        const cleanCommand = command.replace(/"/g, "")
        const result = await testPrompt(cleanCommand)
        validateResponseStructure(result)
      }
    })
  })

  describe("Contract Development Examples from README", () => {
    test("should execute wagmi contract workflow", async () => {
      // This test uses existing wagmi config for contract workflow testing
      // Mock wagmi config would need file system access which is not available in E2E tests
      const contractFlow = [
        {
          prompt: "Load wagmi config from ./test/setup/test-wagmi-config.ts",
          expected: {
            toolsUsed: ["load_wagmi_config"],
            resultContains: ["loaded", "config"],
          },
        },
        {
          prompt: "List all available contracts",
          expected: {
            toolsUsed: ["list_contracts"],
            resultContains: ["contracts", "available"],
          },
        },
      ]

      const results = await testWorkflow("Wagmi Config Documentation", contractFlow)

      if (results[0]) validateWagmiOperation(results[0], "load")
      if (results[1]) validateWagmiOperation(results[1], "list")
    })

    test("should handle contract analysis commands", async () => {
      // These tests may need existing wagmi config
      const analysisCommands = [
        "Extract ABI for MyToken contract in human-readable format",
        "List all view functions for MyToken",
        "Analyze MyToken contract capabilities",
        "Export MyToken ABI to ./abis/MyToken.json",
      ]

      for (const command of analysisCommands) {
        const result = await testPrompt(command)
        // These may fail if no wagmi config is loaded, but should handle gracefully
        validateResponseStructure(result)
      }
    })
  })

  describe("Contract Testing Examples from README", () => {
    test("should execute contract testing workflow", async () => {
      const testingCommands = [
        {
          prompt: "Test contract function transfer for MyToken",
          expected: {
            toolsUsed: ["test_contract_function"],
            resultContains: ["test", "function"],
          },
        },
        {
          prompt: `Simulate balanceOf function for MyToken with account ${TEST_DATA.WALLET_ADDRESS_1}`,
          expected: {
            toolsUsed: ["simulate_contract_call"],
            resultContains: ["simulate", "balance"],
          },
        },
        {
          prompt: `Dry run transaction: approve 1000 USDC for ${TEST_DATA.WALLET_ADDRESS_2}`,
          expected: {
            toolsUsed: ["dry_run_transaction"],
            resultContains: ["dry run", "approve"],
          },
        },
        {
          prompt: "Test contract MyNFT with view functions only",
          expected: {
            toolsUsed: ["test_contract"],
            resultContains: ["test", "contract", "view"],
          },
        },
      ]

      for (const { prompt, expected } of testingCommands) {
        const result = await testPrompt(prompt, expected)
        validateResponseStructure(result)
      }
    })

    test("should validate contract testing output format", async () => {
      const result = await testPrompt(
        "Test contract function transfer for a hypothetical ERC20 token",
      )

      // Should provide structured testing output even if contract doesn't exist
      validateResponseStructure(result)
    })
  })

  describe("Chain Management Examples", () => {
    test("should handle supported chains examples", async () => {
      const chainCommands = [
        {
          prompt: "Switch to Ethereum Mainnet",
          expected: {
            toolsUsed: ["switch_chain"],
            resultContains: ["ethereum", "mainnet"],
          },
        },
        {
          prompt: "Switch to Sepolia testnet",
          expected: {
            toolsUsed: ["switch_chain"],
            resultContains: ["sepolia"],
          },
        },
        {
          prompt: "Change to Polygon network",
          expected: {
            toolsUsed: ["switch_chain"],
            resultContains: ["polygon"],
          },
        },
        {
          prompt: "Go back to Anvil local chain",
          expected: {
            toolsUsed: ["switch_chain"],
            resultContains: ["anvil", "local"],
          },
        },
      ]

      for (const { prompt, expected } of chainCommands) {
        const result = await testPrompt(prompt, expected)
        validateResponseStructure(result)
      }
    })

    test("should demonstrate custom chain workflow", async () => {
      const customChainFlow = [
        {
          prompt:
            "Add a custom chain called TestNet with chain ID 12345, RPC https://testnet-rpc.example.com, and native currency TEST with symbol TEST and 18 decimals",
          expected: {
            toolsUsed: ["add_custom_chain"],
            resultContains: ["custom", "chain", "added"],
          },
        },
        {
          prompt: "Switch to TestNet chain",
          expected: {
            toolsUsed: ["switch_chain"],
            resultContains: ["testnet", "switched"],
          },
        },
        {
          prompt: "Get current chain information",
          expected: {
            toolsUsed: ["get_chain_info"],
            resultContains: ["chain", "info", "testnet"],
          },
        },
        {
          prompt: "Update TestNet chain RPC to https://new-testnet-rpc.example.com",
          expected: {
            toolsUsed: ["update_custom_chain"],
            resultContains: ["updated", "chain"],
          },
        },
      ]

      const results = await testWorkflow("Custom Chain Documentation", customChainFlow)
      results.forEach((result) => validateResponseStructure(result))
    })
  })

  describe("Usage Patterns from Documentation", () => {
    test("should demonstrate complete DeFi interaction", async () => {
      const defiFlow = [
        {
          prompt: `Connect to ${TEST_DATA.WALLET_ADDRESS_1}`,
          expected: { toolsUsed: ["connect_wallet"] },
        },
        {
          prompt: "Check my USDC balance",
          expected: { toolsUsed: ["get_token_balance"] },
        },
        {
          prompt: `Approve 1000 USDC for DEX contract ${TEST_DATA.WALLET_ADDRESS_2}`,
          expected: { toolsUsed: ["approve_token"] },
        },
        {
          prompt: "Check the approval was successful by getting token info",
          expected: { toolsUsed: ["get_token_info"] },
        },
      ]

      const results = await testWorkflow("DeFi Interaction Pattern", defiFlow)
      results.forEach((result) => validateResponseStructure(result))
    })

    test("should demonstrate NFT interaction pattern", async () => {
      const nftFlow = [
        {
          prompt: `Check who owns NFT token ID 1 in contract ${TEST_DATA.WALLET_ADDRESS_2}`,
          expected: { toolsUsed: ["get_nft_owner"] },
        },
        {
          prompt: `Get information about NFT contract ${TEST_DATA.WALLET_ADDRESS_2}`,
          expected: { toolsUsed: ["get_nft_info"] },
        },
      ]

      const results = await testWorkflow("NFT Interaction Pattern", nftFlow)
      results.forEach((result) => validateResponseStructure(result))
    })

    test("should demonstrate multi-chain workflow", async () => {
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
          prompt: "Switch to Polygon",
          expected: { toolsUsed: ["switch_chain"] },
        },
        {
          prompt: "Check my balance on Polygon",
          expected: { toolsUsed: ["get_balance"] },
        },
        {
          prompt: "Switch back to Anvil",
          expected: { toolsUsed: ["switch_chain"] },
        },
      ]

      const results = await testWorkflow("Multi-Chain Pattern", multiChainFlow)
      results.forEach((result) => validateResponseStructure(result))
    })
  })

  describe("Error Scenarios from Documentation", () => {
    test("should handle unsupported operations gracefully", async () => {
      const result = await testPrompt("Deploy a new smart contract with solidity code", {
        // Should explain that deployment isn't directly supported
        resultContains: ["not", "supported", "available", "wagmi"],
      })

      validateResponseStructure(result)
    })

    test("should handle mainnet warnings appropriately", async () => {
      const result = await testPrompt("Switch to Ethereum mainnet and send 100 ETH to someone", {
        resultContains: ["warning", "mainnet", "testnet", "careful"],
      })

      // Should provide warnings about mainnet usage
      validateResponseStructure(result)
    })

    test("should handle missing configuration gracefully", async () => {
      const result = await testPrompt("List all contracts from wagmi config that doesn't exist")

      // Should handle missing wagmi config gracefully
      validateResponseStructure(result)
    })
  })

  describe("Advanced Examples Validation", () => {
    test("should validate complex contract analysis example", async () => {
      const result = await testPrompt(
        "Provide a detailed analysis of an ERC-20 token contract including functions, events, and standards compliance",
      )

      // Should provide comprehensive analysis even without specific contract
      validateResponseStructure(result)
    })

    test("should demonstrate batch operations", async () => {
      const result = await testPrompt(
        `Connect to ${TEST_DATA.WALLET_ADDRESS_1}, check balance, get account info, and show current chain information`,
      )

      // Should handle multiple operations in one request
      validateResponseStructure(result)
    })

    test("should handle complex transaction scenarios", async () => {
      const result = await testPrompt(
        `Estimate gas for sending 0.1 ETH, then if it's reasonable, send the transaction to ${TEST_DATA.WALLET_ADDRESS_2}`,
      )

      // Should handle conditional logic
      validateResponseStructure(result)
    })
  })
})
