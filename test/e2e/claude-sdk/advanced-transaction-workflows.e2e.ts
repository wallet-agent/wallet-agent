import { beforeAll, describe, test } from "bun:test"
import {
  validateResponseStructure,
  validateTransaction,
  validateWorkflow,
} from "./helpers/validator.js"
import { setupClaudeSDKTests, TEST_DATA, testPrompt, testWorkflow } from "./setup.js"

describe("Advanced Transaction Workflows", () => {
  beforeAll(() => {
    setupClaudeSDKTests()
  })

  beforeAll(async () => {
    // Connect wallet for advanced transaction tests
    await testPrompt(`Connect to wallet ${TEST_DATA.WALLET_ADDRESS_1}`)
  })

  describe("Transaction Monitoring and Status Tracking", () => {
    test("should monitor transaction lifecycle from submission to confirmation", async () => {
      const transactionFlow = [
        {
          prompt: `Send 0.001 ETH to ${TEST_DATA.WALLET_ADDRESS_2} and show me the transaction hash`,
          expected: {
            toolsUsed: ["send_transaction"],
            resultContains: ["transaction", "hash", "sent"],
          },
        },
        {
          prompt: "Check the status of that transaction",
          expected: {
            toolsUsed: ["get_transaction_status"],
            resultContains: ["status", "pending", "confirmed", "transaction"],
          },
        },
        {
          prompt: "Get the full transaction receipt with details",
          expected: {
            toolsUsed: ["get_transaction_receipt"],
            resultContains: ["receipt", "block", "gas", "details"],
          },
        },
      ]

      const result = await testWorkflow("transaction_monitoring", transactionFlow)
      validateWorkflow(result, [
        "send_transaction",
        "get_transaction_status",
        "get_transaction_receipt",
      ])
    })

    test("should track multiple concurrent transactions", async () => {
      const result = await testPrompt(
        `Send three small transactions to different addresses and track all their statuses: 
         0.001 ETH to ${TEST_DATA.WALLET_ADDRESS_1}, 
         0.001 ETH to ${TEST_DATA.WALLET_ADDRESS_2}, 
         0.001 ETH to ${TEST_DATA.WALLET_ADDRESS_2}`,
        {
          toolsUsed: ["send_transaction", "get_transaction_status"],
          resultContains: ["concurrent", "transactions", "tracking", "status"],
        },
      )

      validateResponseStructure(result)
    })

    test("should handle failed transaction monitoring gracefully", async () => {
      const result = await testPrompt(
        `Check the status of a non-existent transaction hash: 0x1234567890123456789012345678901234567890123456789012345678901234`,
        {
          toolsUsed: ["get_transaction_status"],
          resultContains: ["transaction", "not found", "invalid", "hash"],
        },
      )

      validateResponseStructure(result)
    })

    test("should provide transaction timeline and block confirmation details", async () => {
      const result = await testPrompt(
        `Send transaction and provide detailed timeline including block confirmations and finality`,
        {
          toolsUsed: ["send_transaction", "get_transaction_receipt"],
          resultContains: ["timeline", "block", "confirmations", "finality"],
        },
      )

      validateTransaction(result, "send")
    })
  })

  describe("Gas Optimization Workflows", () => {
    test("should optimize gas for batch operations", async () => {
      const result = await testPrompt(
        `Estimate gas for multiple token transfers and optimize for lowest cost: 
         transfer 10 USDC to ${TEST_DATA.WALLET_ADDRESS_1}, 
         transfer 20 USDC to ${TEST_DATA.WALLET_ADDRESS_2}`,
        {
          toolsUsed: ["estimate_gas", "transfer_token"],
          resultContains: ["gas", "optimization", "batch", "cost"],
        },
      )

      validateResponseStructure(result)
    })

    test("should provide gas price recommendations for different urgency levels", async () => {
      const result = await testPrompt(
        `Get gas price recommendations for slow, standard, and fast transaction speeds`,
        {
          toolsUsed: ["estimate_gas"],
          resultContains: ["gas", "price", "slow", "standard", "fast", "recommendations"],
        },
      )

      validateResponseStructure(result)
    })

    test("should handle dynamic gas pricing based on network conditions", async () => {
      const result = await testPrompt(
        `Analyze current network congestion and adjust gas price accordingly for a transaction`,
        {
          toolsUsed: ["estimate_gas", "send_transaction"],
          resultContains: ["network", "congestion", "dynamic", "gas", "adjustment"],
        },
      )

      validateResponseStructure(result)
    })

    test("should calculate cost-benefit analysis for transaction timing", async () => {
      const result = await testPrompt(
        `Calculate whether to send transaction now with high gas or wait for lower gas prices`,
        {
          toolsUsed: ["estimate_gas"],
          resultContains: ["cost", "benefit", "timing", "analysis", "gas"],
        },
      )

      validateResponseStructure(result)
    })
  })

  describe("Transaction Recovery and Error Handling", () => {
    test("should handle stuck transactions with nonce management", async () => {
      const result = await testPrompt(
        `My transaction is stuck with low gas. Help me create a replacement transaction with higher gas`,
        {
          toolsUsed: ["get_transaction_status", "send_transaction"],
          resultContains: ["stuck", "replacement", "higher", "gas", "nonce"],
        },
      )

      validateResponseStructure(result)
    })

    test("should provide transaction failure analysis and recovery options", async () => {
      const result = await testPrompt(
        `Analyze why my transaction failed and provide recovery options`,
        {
          toolsUsed: ["get_transaction_receipt", "get_transaction_status"],
          resultContains: ["failed", "analysis", "recovery", "options", "reason"],
        },
      )

      validateResponseStructure(result)
    })

    test("should handle insufficient balance with suggested solutions", async () => {
      const result = await testPrompt(
        `Try to send more ETH than I have and get suggestions for how to proceed`,
        {
          toolsUsed: ["get_balance", "send_transaction"],
          resultContains: ["insufficient", "balance", "suggestions", "solutions"],
        },
      )

      validateResponseStructure(result)
    })

    test("should provide transaction retry mechanisms with exponential backoff", async () => {
      const result = await testPrompt(
        `Retry a failed transaction with intelligent backoff strategy`,
        {
          toolsUsed: ["send_transaction", "get_transaction_status"],
          resultContains: ["retry", "backoff", "strategy", "failed"],
        },
      )

      validateResponseStructure(result)
    })
  })

  describe("Cross-Chain Transaction Workflows", () => {
    test("should handle cross-chain transaction preparation", async () => {
      const crossChainFlow = [
        {
          prompt: `Prepare for cross-chain transfer: Check my balance on Ethereum mainnet`,
          expected: {
            toolsUsed: ["switch_chain", "get_balance"],
            resultContains: ["ethereum", "balance", "mainnet"],
          },
        },
        {
          prompt: `Now switch to Polygon and check gas costs for receiving transaction`,
          expected: {
            toolsUsed: ["switch_chain", "estimate_gas"],
            resultContains: ["polygon", "switched", "gas", "costs"],
          },
        },
        {
          prompt: `Calculate total cost of cross-chain transfer including bridge fees`,
          expected: {
            toolsUsed: ["estimate_gas"],
            resultContains: ["total", "cost", "bridge", "fees"],
          },
        },
      ]

      const result = await testWorkflow("cross_chain", crossChainFlow)
      validateWorkflow(result, ["switch_chain", "get_balance", "estimate_gas"])
    })

    test("should validate cross-chain addresses and compatibility", async () => {
      const result = await testPrompt(
        `Validate that address ${TEST_DATA.WALLET_ADDRESS_1} works on both Ethereum and Polygon`,
        {
          toolsUsed: ["switch_chain", "get_balance"],
          resultContains: ["validate", "address", "ethereum", "polygon", "compatibility"],
        },
      )

      validateResponseStructure(result)
    })

    test("should estimate cross-chain transaction times and costs", async () => {
      const result = await testPrompt(
        `Estimate time and cost to bridge 100 USDC from Ethereum to Polygon`,
        {
          toolsUsed: ["estimate_gas", "switch_chain"],
          resultContains: ["estimate", "time", "cost", "bridge", "usdc"],
        },
      )

      validateResponseStructure(result)
    })
  })

  describe("Advanced DeFi Transaction Workflows", () => {
    test("should execute complex DeFi strategy with multiple steps", async () => {
      const defiFlow = [
        {
          prompt: `Connect and check my USDC balance for DeFi operations`,
          expected: {
            toolsUsed: ["get_token_balance"],
            resultContains: ["usdc", "balance", "defi"],
          },
        },
        {
          prompt: `Approve 1000 USDC for DEX contract at ${TEST_DATA.WALLET_ADDRESS_2}`,
          expected: {
            toolsUsed: ["approve_token"],
            resultContains: ["approve", "usdc", "dex", "contract"],
          },
        },
        {
          prompt: `Simulate swap of 500 USDC to ETH and check gas costs`,
          expected: {
            toolsUsed: ["simulate_transaction", "estimate_gas"],
            resultContains: ["simulate", "swap", "usdc", "eth", "gas"],
          },
        },
        {
          prompt: `Execute the swap if simulation is successful`,
          expected: {
            toolsUsed: ["write_contract"],
            resultContains: ["execute", "swap", "successful", "simulation"],
          },
        },
      ]

      const result = await testWorkflow("defi_strategy", defiFlow)
      validateWorkflow(result, [
        "get_token_balance",
        "approve_token",
        "simulate_transaction",
        "write_contract",
      ])
    })

    test("should handle liquidation protection workflow", async () => {
      const result = await testPrompt(
        `Monitor my DeFi position and alert if liquidation risk increases`,
        {
          toolsUsed: ["read_contract", "get_balance"],
          resultContains: ["monitor", "position", "liquidation", "risk", "alert"],
        },
      )

      validateResponseStructure(result)
    })

    test("should execute yield farming strategy with risk assessment", async () => {
      const result = await testPrompt(
        `Analyze yield farming opportunity and execute if risk/reward ratio is favorable`,
        {
          toolsUsed: ["read_contract", "simulate_transaction", "write_contract"],
          resultContains: ["yield", "farming", "risk", "reward", "analysis"],
        },
      )

      validateResponseStructure(result)
    })
  })

  describe("Security-Enhanced Transaction Workflows", () => {
    test("should validate transaction recipients against known addresses", async () => {
      const result = await testPrompt(
        `Verify that recipient address ${TEST_DATA.WALLET_ADDRESS_2} is safe before sending transaction`,
        {
          toolsUsed: ["send_transaction"],
          resultContains: ["verify", "recipient", "safe", "validation"],
        },
      )

      validateTransaction(result, "send")
    })

    test("should detect and warn about potential MEV attacks", async () => {
      const result = await testPrompt(`Check for MEV risks before executing large DEX trade`, {
        toolsUsed: ["simulate_transaction", "estimate_gas"],
        resultContains: ["mev", "risks", "dex", "trade", "warning"],
      })

      validateResponseStructure(result)
    })

    test("should implement transaction sandboxing for testing", async () => {
      const result = await testPrompt(
        `Test transaction in sandbox environment before mainnet execution`,
        {
          toolsUsed: ["simulate_transaction"],
          resultContains: ["sandbox", "test", "environment", "mainnet"],
        },
      )

      validateResponseStructure(result)
    })

    test("should provide security audit trail for high-value transactions", async () => {
      const result = await testPrompt(
        `Create audit trail for transaction sending 10 ETH with security checkpoints`,
        {
          toolsUsed: ["send_transaction", "get_transaction_receipt"],
          resultContains: ["audit", "trail", "security", "checkpoints", "high"],
        },
      )

      validateTransaction(result, "send")
    })
  })

  describe("Automated Transaction Workflows", () => {
    test("should set up conditional transaction execution", async () => {
      const result = await testPrompt(
        `Set up automatic ETH purchase when price drops below $2000`,
        {
          toolsUsed: ["read_contract", "simulate_transaction"],
          resultContains: ["conditional", "automatic", "price", "trigger"],
        },
      )

      validateResponseStructure(result)
    })

    test("should implement dollar-cost averaging strategy", async () => {
      const result = await testPrompt(
        `Execute dollar-cost averaging: buy $100 worth of ETH weekly`,
        {
          toolsUsed: ["get_balance", "write_contract"],
          resultContains: ["dollar", "cost", "averaging", "weekly", "strategy"],
        },
      )

      validateResponseStructure(result)
    })

    test("should handle portfolio rebalancing automation", async () => {
      const result = await testPrompt(
        `Automatically rebalance portfolio to maintain 60% ETH, 40% USDC allocation`,
        {
          toolsUsed: ["get_balance", "get_token_balance", "transfer_token"],
          resultContains: ["rebalance", "portfolio", "allocation", "automatic"],
        },
      )

      validateResponseStructure(result)
    })

    test("should implement stop-loss and take-profit mechanisms", async () => {
      const result = await testPrompt(
        `Set up stop-loss at -10% and take-profit at +25% for my ETH position`,
        {
          toolsUsed: ["read_contract", "simulate_transaction"],
          resultContains: ["stop", "loss", "take", "profit", "position"],
        },
      )

      validateResponseStructure(result)
    })
  })
})
