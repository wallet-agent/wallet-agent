import { beforeAll, describe, test } from "bun:test"
import { validateResponseStructure, validateTransaction } from "./helpers/validator.js"
import { setupClaudeSDKTests, TEST_DATA, testPrompt } from "./setup.js"

describe("Safe Transaction Scenarios with Simulation", () => {
  beforeAll(() => {
    setupClaudeSDKTests()
  })

  beforeAll(async () => {
    // Connect wallet for transaction tests
    await testPrompt(`Connect to wallet ${TEST_DATA.WALLET_ADDRESS_1}`)
  })

  describe("Safe Transaction Sending", () => {
    test("should send transaction with automatic simulation", async () => {
      const result = await testPrompt(
        `Safely send 0.001 ETH to ${TEST_DATA.WALLET_ADDRESS_2} with simulation first`,
        {
          toolsUsed: ["safe_send_transaction"],
          resultContains: ["simulation", "safety", "transaction", "sent"],
        },
      )

      validateTransaction(result, "send")
    })

    test("should detect and warn about risky transactions", async () => {
      const result = await testPrompt(
        `Send 1000 ETH to ${TEST_DATA.WALLET_ADDRESS_2} with safety checks`,
        {
          toolsUsed: ["safe_send_transaction"],
          resultContains: ["warning", "balance", "insufficient", "simulation"],
        },
      )

      validateResponseStructure(result)
    })

    test("should warn when sending to contract without data", async () => {
      // First create a mock contract scenario
      const result = await testPrompt(
        `Send 0.01 ETH to contract address 0x1234567890123456789012345678901234567890 with safety checks`,
        {
          toolsUsed: ["safe_send_transaction"],
          resultContains: ["warning", "contract", "data", "transaction"],
        },
      )

      validateResponseStructure(result)
    })

    test("should execute transaction when simulation passes", async () => {
      const result = await testPrompt(
        `Safely transfer 0.0001 ETH to ${TEST_DATA.WALLET_ADDRESS_2} after checking it's safe`,
        {
          toolsUsed: ["safe_send_transaction"],
          resultContains: ["simulation", "passed", "executed", "transaction"],
        },
      )

      validateTransaction(result, "send")
    })

    test("should allow bypassing simulation when explicitly requested", async () => {
      const result = await testPrompt(
        `Send 0.001 ETH to ${TEST_DATA.WALLET_ADDRESS_2} without simulation`,
        {
          toolsUsed: ["safe_send_transaction"],
          resultContains: ["transaction", "sent", "without simulation"],
        },
      )

      validateTransaction(result, "send")
    })
  })

  describe("Safe Contract Writing", () => {
    test("should simulate contract write before execution", async () => {
      const result = await testPrompt(
        `Safely call approve function on token contract to approve 100 tokens for ${TEST_DATA.WALLET_ADDRESS_2}`,
        {
          toolsUsed: ["safe_write_contract"],
          resultContains: ["simulation", "contract", "approve", "safety"],
        },
      )

      validateResponseStructure(result)
    })

    test("should handle contract write simulation failures gracefully", async () => {
      const result = await testPrompt(
        `Safely transfer 999999999 tokens to ${TEST_DATA.WALLET_ADDRESS_2} using contract write`,
        {
          toolsUsed: ["safe_write_contract"],
          resultContains: ["simulation", "failed", "insufficient", "balance"],
        },
      )

      validateResponseStructure(result)
    })

    test("should execute contract write when simulation succeeds", async () => {
      const result = await testPrompt(
        `Safely mint 1 NFT to myself using contract write with simulation`,
        {
          toolsUsed: ["safe_write_contract"],
          resultContains: ["simulation", "successful", "contract", "executed"],
        },
      )

      validateResponseStructure(result)
    })

    test("should provide detailed gas estimates for contract writes", async () => {
      const result = await testPrompt(
        `Safely execute approve function with detailed gas information`,
        {
          toolsUsed: ["safe_write_contract"],
          resultContains: ["gas", "estimate", "cost", "simulation"],
        },
      )

      validateResponseStructure(result)
    })
  })

  describe("Safe Token Operations", () => {
    test("should safely transfer tokens with balance verification", async () => {
      const result = await testPrompt(
        `Safely transfer 50 USDC to ${TEST_DATA.WALLET_ADDRESS_2} with balance check`,
        {
          toolsUsed: ["safe_transfer_token"],
          resultContains: ["simulation", "balance", "transfer", "safe"],
        },
      )

      validateResponseStructure(result)
    })

    test("should detect insufficient token balance", async () => {
      const result = await testPrompt(
        `Safely transfer 999999 USDC to ${TEST_DATA.WALLET_ADDRESS_2}`,
        {
          toolsUsed: ["safe_transfer_token"],
          resultContains: ["simulation", "insufficient", "balance", "failed"],
        },
      )

      validateResponseStructure(result)
    })

    test("should validate token contract exists before transfer", async () => {
      const result = await testPrompt(
        `Safely transfer 100 FAKE tokens to ${TEST_DATA.WALLET_ADDRESS_2}`,
        {
          toolsUsed: ["safe_transfer_token"],
          resultContains: ["contract", "not found", "token", "invalid"],
        },
      )

      validateResponseStructure(result)
    })

    test("should execute token transfer when all checks pass", async () => {
      const result = await testPrompt(
        `Safely send 10 USDC to ${TEST_DATA.WALLET_ADDRESS_2} after verification`,
        {
          toolsUsed: ["safe_transfer_token"],
          resultContains: ["simulation", "successful", "transfer", "executed"],
        },
      )

      validateResponseStructure(result)
    })

    test("should handle token approval with safety checks", async () => {
      const result = await testPrompt(
        `Safely approve 500 USDC spending for ${TEST_DATA.WALLET_ADDRESS_2}`,
        {
          toolsUsed: ["safe_transfer_token", "approve_token"],
          resultContains: ["approve", "simulation", "safety", "spending"],
        },
      )

      validateResponseStructure(result)
    })
  })

  describe("Transaction Safety Features", () => {
    test("should provide comprehensive transaction previews", async () => {
      const result = await testPrompt(
        `Show me a detailed preview of sending 0.05 ETH to ${TEST_DATA.WALLET_ADDRESS_2}`,
        {
          toolsUsed: ["safe_send_transaction"],
          resultContains: ["preview", "gas", "cost", "recipient", "amount"],
        },
      )

      validateResponseStructure(result)
    })

    test("should validate addresses before transactions", async () => {
      const result = await testPrompt(`Safely send 0.01 ETH to an invalid address: 0xinvalid`, {
        resultContains: ["invalid", "address", "error", "validation"],
      })

      validateResponseStructure(result)
    })

    test("should show USD value estimates when available", async () => {
      const result = await testPrompt(`Send 0.1 ETH with USD cost estimate and safety checks`, {
        toolsUsed: ["safe_send_transaction"],
        resultContains: ["simulation", "cost", "usd", "estimate"],
      })

      validateResponseStructure(result)
    })

    test("should handle network congestion warnings", async () => {
      const result = await testPrompt(`Safely send transaction with high gas price warning`, {
        toolsUsed: ["safe_send_transaction"],
        resultContains: ["gas", "price", "network", "transaction"],
      })

      validateResponseStructure(result)
    })

    test("should provide confirmation prompts for high-value transactions", async () => {
      const result = await testPrompt(`Send 5 ETH with confirmation required due to high value`, {
        toolsUsed: ["safe_send_transaction"],
        resultContains: ["confirmation", "high", "value", "required"],
      })

      validateResponseStructure(result)
    })
  })

  describe("Error Recovery and Edge Cases", () => {
    test("should handle failed simulations gracefully", async () => {
      const result = await testPrompt(
        `Try to send transaction that will fail simulation and handle error gracefully`,
        {
          toolsUsed: ["safe_send_transaction"],
          resultContains: ["simulation", "failed", "error", "reason"],
        },
      )

      validateResponseStructure(result)
    })

    test("should provide actionable error messages", async () => {
      const result = await testPrompt(
        `Attempt transaction with insufficient gas and get helpful error message`,
        {
          toolsUsed: ["safe_send_transaction"],
          resultContains: ["insufficient", "gas", "increase", "suggestion"],
        },
      )

      validateResponseStructure(result)
    })

    test("should handle network connection issues during simulation", async () => {
      const result = await testPrompt(`Test safe transaction with network connectivity issues`, {
        toolsUsed: ["safe_send_transaction"],
        resultContains: ["network", "error", "retry", "connection"],
      })

      validateResponseStructure(result)
    })

    test("should recover from temporary simulation failures", async () => {
      const result = await testPrompt(
        `Retry transaction after simulation failure with exponential backoff`,
        {
          toolsUsed: ["safe_send_transaction"],
          resultContains: ["retry", "simulation", "backoff", "recovery"],
        },
      )

      validateResponseStructure(result)
    })
  })

  describe("Integration with Other Features", () => {
    test("should work with ENS resolution in safe transactions", async () => {
      const result = await testPrompt(
        `Safely send 0.01 ETH to ${TEST_DATA.ENS_NAMES[0]} with ENS resolution`,
        {
          toolsUsed: ["resolve_ens_name", "safe_send_transaction"],
          resultContains: ["ens", "resolved", "simulation", "transaction"],
        },
      )

      validateResponseStructure(result)
    })

    test("should integrate with chain switching for safe transactions", async () => {
      const result = await testPrompt(
        `Switch to Polygon and safely send transaction with chain-specific checks`,
        {
          toolsUsed: ["switch_chain", "safe_send_transaction"],
          resultContains: ["chain", "switched", "polygon", "simulation"],
        },
      )

      validateResponseStructure(result)
    })

    test("should work with custom chains for safe operations", async () => {
      const result = await testPrompt(
        `Use custom chain for safe transaction with appropriate safety checks`,
        {
          toolsUsed: ["add_custom_chain", "safe_send_transaction"],
          resultContains: ["custom", "chain", "safety", "simulation"],
        },
      )

      validateResponseStructure(result)
    })
  })
})
