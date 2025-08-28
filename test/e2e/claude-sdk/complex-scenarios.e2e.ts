import { beforeAll, describe, test } from "bun:test"
import { validateResponseStructure, validateWorkflow } from "./helpers/validator.js"
import { setupClaudeSDKTests, TEST_DATA, testPrompt, testWorkflow } from "./setup.js"

describe("Complex Multi-Step Scenarios", () => {
  beforeAll(() => {
    setupClaudeSDKTests()
  })

  describe("DeFi Interaction Workflows", () => {
    test("should handle complete DeFi interaction workflow", async () => {
      const defiScenario = `
        I want to interact with a DEX. First connect to my wallet at 
        ${TEST_DATA.WALLET_ADDRESS_1}, then check my USDC balance, 
        approve 1000 USDC for the DEX at ${TEST_DATA.WALLET_ADDRESS_2}, 
        and finally verify the approval was successful.
      `

      const result = await testPrompt(defiScenario, {
        toolsUsed: ["connect_wallet", "get_token_balance", "approve_token"],
        resultContains: ["connected", "balance", "approve", "successful"],
      })

      validateResponseStructure(result)
    })

    test("should execute multi-token portfolio check", async () => {
      const portfolioCheck = `
        Connect to ${TEST_DATA.WALLET_ADDRESS_1} and give me a complete 
        portfolio overview: check my ETH balance, USDC balance, 
        and USDT balance. Also show me what chain I'm on.
      `

      const result = await testPrompt(portfolioCheck, {
        toolsUsed: ["connect_wallet", "get_balance", "get_token_balance", "get_chain_info"],
        resultContains: ["balance", "portfolio", "chain"],
      })

      validateResponseStructure(result)
    })

    test("should handle cross-chain DeFi preparation", async () => {
      const crossChainFlow = [
        {
          prompt: `Connect to ${TEST_DATA.WALLET_ADDRESS_1} and check my ETH balance`,
          expected: {
            toolsUsed: ["connect_wallet", "get_balance"],
            resultContains: ["connected", "balance"],
          },
        },
        {
          prompt: "Now switch to Polygon and check my balance there too",
          expected: {
            toolsUsed: ["switch_chain", "get_balance"],
            resultContains: ["polygon", "balance"],
          },
        },
        {
          prompt: "Compare the balances and tell me which chain has more value",
          expected: {
            resultContains: ["balance", "compare", "chain"],
          },
        },
      ]

      const results = await testWorkflow("Cross-Chain DeFi Preparation", crossChainFlow)
      results.forEach((result) => validateResponseStructure(result))
    })
  })

  describe("NFT Management Workflows", () => {
    test("should handle NFT transfer with ownership verification", async () => {
      const nftTransferScenario = `
        Help me transfer my NFT. The NFT contract is at ${TEST_DATA.WALLET_ADDRESS_2}, 
        token ID is 42, and I want to send it to ${TEST_DATA.WALLET_ADDRESS_1}. 
        But first, check that I actually own this NFT.
      `

      const result = await testPrompt(nftTransferScenario, {
        toolsUsed: ["get_nft_owner", "transfer_nft"],
        resultContains: ["owner", "transfer", "nft"],
      })

      validateResponseStructure(result)
    })

    test("should perform comprehensive NFT analysis", async () => {
      const nftAnalysis = `
        Analyze the NFT collection at ${TEST_DATA.WALLET_ADDRESS_2}. 
        Get the collection info, check who owns token ID 1, 
        and see if I can get metadata for token ID 5.
      `

      const result = await testPrompt(nftAnalysis, {
        toolsUsed: ["get_nft_info", "get_nft_owner"],
        resultContains: ["nft", "info", "owner", "metadata"],
      })

      validateResponseStructure(result)
    })
  })

  describe("Multi-Chain Operations", () => {
    test("should handle complex multi-chain workflow", async () => {
      const multiChainWorkflow = [
        {
          prompt: `Connect to ${TEST_DATA.WALLET_ADDRESS_1} and check what chain I'm on`,
          expected: {
            toolsUsed: ["connect_wallet", "get_chain_info"],
            resultContains: ["connected", "chain"],
          },
        },
        {
          prompt:
            "Add a custom testnet: ChainID 99999, name 'Test Network', RPC https://test.example.com, currency TEST with 18 decimals",
          expected: {
            toolsUsed: ["add_custom_chain"],
            resultContains: ["custom", "chain", "added"],
          },
        },
        {
          prompt: "Switch to this new test network",
          expected: {
            toolsUsed: ["switch_chain"],
            resultContains: ["switched", "test"],
          },
        },
        {
          prompt: "Check my balance on this new chain and compare it with Anvil",
          expected: {
            toolsUsed: ["get_balance"],
            resultContains: ["balance", "compare"],
          },
        },
        {
          prompt: "Switch back to Anvil and remove the custom chain",
          expected: {
            toolsUsed: ["switch_chain", "remove_custom_chain"],
            resultContains: ["switched", "removed"],
          },
        },
      ]

      const results = await testWorkflow("Complex Multi-Chain Operations", multiChainWorkflow)

      validateWorkflow(results, [
        "connect_wallet",
        "get_chain_info",
        "add_custom_chain",
        "switch_chain",
        "remove_custom_chain",
      ])
    })

    test("should handle chain comparison and recommendation", async () => {
      const chainComparison = `
        Connect to ${TEST_DATA.WALLET_ADDRESS_1}, check my balance on Anvil, 
        then switch to Ethereum mainnet and check balance there too. 
        Recommend which chain I should use for a transaction and why.
      `

      const result = await testPrompt(chainComparison, {
        toolsUsed: ["connect_wallet", "get_balance", "switch_chain"],
        resultContains: ["balance", "recommend", "chain", "transaction"],
      })

      validateResponseStructure(result)
    })
  })

  describe("Contract Development Workflows", () => {
    test("should handle complete contract analysis workflow", async () => {
      const contractAnalysisFlow = [
        {
          prompt: "Load wagmi config from ./test/setup/test-wagmi-config.ts if it exists",
          expected: {
            // May succeed or fail depending on file existence
            resultContains: ["wagmi", "config"],
          },
        },
        {
          prompt: "List all available contracts and their functions",
          expected: {
            resultContains: ["contracts", "functions", "available"],
          },
        },
        {
          prompt:
            "If any ERC-20 contracts are available, analyze their capabilities and suggest testing approaches",
          expected: {
            resultContains: ["erc", "analyze", "test", "suggest"],
          },
        },
      ]

      const results = await testWorkflow("Contract Analysis Workflow", contractAnalysisFlow)
      results.forEach((result) => validateResponseStructure(result))
    })

    test("should handle contract testing preparation", async () => {
      const testingPrep = `
        I want to thoroughly test a smart contract. Help me prepare by:
        1. Connecting to ${TEST_DATA.WALLET_ADDRESS_1}
        2. Checking if I have enough ETH for gas
        3. Explaining how to test an ERC-20 contract safely
        4. Showing me what testing tools are available
      `

      const result = await testPrompt(testingPrep, {
        toolsUsed: ["connect_wallet", "get_balance"],
        resultContains: ["connect", "balance", "test", "safe", "tools"],
      })

      validateResponseStructure(result)
    })
  })

  describe("Security and Risk Management", () => {
    test("should handle security-conscious transaction workflow", async () => {
      const secureTransactionFlow = [
        {
          prompt: `Connect to ${TEST_DATA.WALLET_ADDRESS_1} and check my balance`,
          expected: {
            toolsUsed: ["connect_wallet", "get_balance"],
            resultContains: ["connected", "balance"],
          },
        },
        {
          prompt: `I want to send ${TEST_DATA.SMALL_ETH_AMOUNT} ETH to ${TEST_DATA.WALLET_ADDRESS_2}. First estimate the gas cost`,
          expected: {
            toolsUsed: ["estimate_gas"],
            resultContains: ["gas", "cost", "estimate"],
          },
        },
        {
          prompt:
            "The gas looks reasonable. Now simulate the transaction before actually sending it",
          expected: {
            toolsUsed: ["simulate_transaction"],
            resultContains: ["simulate", "transaction"],
          },
        },
        {
          prompt: "Everything looks good. Now send the actual transaction",
          expected: {
            toolsUsed: ["send_transaction"],
            resultContains: ["transaction", "sent"],
          },
        },
      ]

      const results = await testWorkflow("Security-Conscious Transaction", secureTransactionFlow)

      validateWorkflow(results, [
        "connect_wallet",
        "get_balance",
        "estimate_gas",
        "simulate_transaction",
        "send_transaction",
      ])
    })

    test("should handle risk assessment for large transaction", async () => {
      const riskAssessment = `
        I want to send a large amount of ETH (1 ETH) to ${TEST_DATA.WALLET_ADDRESS_2}. 
        Connect to ${TEST_DATA.WALLET_ADDRESS_1}, check if I have enough balance, 
        estimate gas costs, and warn me about any risks or considerations.
      `

      const result = await testPrompt(riskAssessment, {
        toolsUsed: ["connect_wallet", "get_balance", "estimate_gas"],
        resultContains: ["balance", "gas", "risk", "warn", "consider"],
      })

      validateResponseStructure(result)
    })
  })

  describe("Advanced Integration Scenarios", () => {
    test("should handle ENS-to-transaction workflow", async () => {
      const ensTransactionFlow = [
        {
          prompt: "Switch to Ethereum mainnet for ENS resolution",
          expected: {
            toolsUsed: ["switch_chain"],
            resultContains: ["mainnet", "ethereum"],
          },
        },
        {
          prompt: `Resolve ${TEST_DATA.ENS_NAMES[0]} to get the actual address`,
          expected: {
            toolsUsed: ["resolve_ens_name"],
            resultContains: ["resolved", "address"],
          },
        },
        {
          prompt: `Connect to ${TEST_DATA.WALLET_ADDRESS_1} and check balance`,
          expected: {
            toolsUsed: ["connect_wallet", "get_balance"],
            resultContains: ["connected", "balance"],
          },
        },
        {
          prompt: `Send ${TEST_DATA.SMALL_ETH_AMOUNT} ETH to the resolved ENS address`,
          expected: {
            toolsUsed: ["send_transaction"],
            resultContains: ["transaction", "sent"],
          },
        },
      ]

      const results = await testWorkflow("ENS-to-Transaction Workflow", ensTransactionFlow)
      results.forEach((result) => validateResponseStructure(result))
    })

    test("should handle comprehensive wallet audit", async () => {
      const walletAudit = `
        Perform a comprehensive audit of wallet ${TEST_DATA.WALLET_ADDRESS_1}:
        1. Connect and verify connection
        2. Check ETH balance
        3. Check USDC and USDT balances if available
        4. Show current chain info
        5. List wallet configuration
        6. Provide a summary report of findings
      `

      const result = await testPrompt(walletAudit, {
        toolsUsed: [
          "connect_wallet",
          "get_balance",
          "get_token_balance",
          "get_chain_info",
          "get_wallet_info",
        ],
        resultContains: ["audit", "balance", "chain", "config", "summary", "report"],
      })

      validateResponseStructure(result)
    })

    test("should handle emergency wallet operations", async () => {
      const emergencyOps = `
        Emergency scenario: I need to quickly move funds from ${TEST_DATA.WALLET_ADDRESS_1}.
        Connect, check all balances (ETH and major tokens), estimate gas for 
        moving everything to ${TEST_DATA.WALLET_ADDRESS_2}, but don't actually 
        send anything yet - just prepare the transaction plan.
      `

      const result = await testPrompt(emergencyOps, {
        toolsUsed: ["connect_wallet", "get_balance", "get_token_balance", "estimate_gas"],
        resultContains: ["emergency", "balance", "gas", "plan", "prepare"],
      })

      validateResponseStructure(result)
    })
  })

  describe("Conditional Logic Workflows", () => {
    test("should handle conditional transaction based on balance", async () => {
      const conditionalTx = `
        Connect to ${TEST_DATA.WALLET_ADDRESS_1}. If I have more than 1 ETH, 
        send ${TEST_DATA.SMALL_ETH_AMOUNT} ETH to ${TEST_DATA.WALLET_ADDRESS_2}. 
        If I have less than 1 ETH, just show me my balance and explain 
        why I shouldn't send the transaction.
      `

      const result = await testPrompt(conditionalTx, {
        toolsUsed: ["connect_wallet", "get_balance"],
        resultContains: ["balance", "eth", "condition"],
      })

      validateResponseStructure(result)
    })

    test("should handle multi-chain conditional logic", async () => {
      const multiChainConditional = `
        Check my balance on both Anvil and Polygon chains. Connect to 
        ${TEST_DATA.WALLET_ADDRESS_1} first, check balance on current chain, 
        then switch to Polygon and check there too. Recommend which chain 
        to use for a transaction based on balance and gas costs.
      `

      const result = await testPrompt(multiChainConditional, {
        toolsUsed: ["connect_wallet", "get_balance", "switch_chain"],
        resultContains: ["balance", "polygon", "recommend", "gas", "cost"],
      })

      validateResponseStructure(result)
    })

    test("should handle token availability conditional workflow", async () => {
      const tokenConditional = `
        Connect to ${TEST_DATA.WALLET_ADDRESS_1}. Check if I have any USDC. 
        If I do have USDC, show me the balance and get token info. 
        If I don't have USDC, explain how I could get some and what USDC is used for.
      `

      const result = await testPrompt(tokenConditional, {
        toolsUsed: ["connect_wallet", "get_token_balance", "get_token_info"],
        resultContains: ["usdc", "balance", "token", "info"],
      })

      validateResponseStructure(result)
    })
  })

  describe("Batch Operations", () => {
    test("should handle batch balance checks", async () => {
      const batchBalances = `
        Connect to ${TEST_DATA.WALLET_ADDRESS_1} and give me a complete 
        financial overview: ETH balance, USDC balance, USDT balance, 
        current chain info, and gas price estimates for a simple transfer.
      `

      const result = await testPrompt(batchBalances, {
        toolsUsed: [
          "connect_wallet",
          "get_balance",
          "get_token_balance",
          "get_chain_info",
          "estimate_gas",
        ],
        resultContains: ["balance", "overview", "chain", "gas"],
      })

      validateResponseStructure(result)
    })

    test("should handle batch contract operations", async () => {
      const batchContracts = `
        Load any available wagmi config, list all contracts, and for each 
        ERC-20 contract found, show me the ABI in human-readable format 
        and analyze its capabilities.
      `

      const result = await testPrompt(batchContracts, {
        resultContains: ["wagmi", "contracts", "abi", "analyze", "capabilities"],
      })

      validateResponseStructure(result)
    })

    test("should handle batch chain management", async () => {
      const batchChainOps = `
        Show me current chain info, list all available chains, 
        add a custom test chain (ID: 88888, name: 'Batch Test', 
        RPC: https://batch.example.com, currency: BATCH with 18 decimals), 
        then switch to it and back to the original chain.
      `

      const result = await testPrompt(batchChainOps, {
        toolsUsed: ["get_chain_info", "add_custom_chain", "switch_chain"],
        resultContains: ["chain", "info", "custom", "switch"],
      })

      validateResponseStructure(result)
    })
  })
})
