import { beforeAll, describe, test } from "bun:test"
import { validateResponseStructure, validateTransaction } from "./helpers/validator.js"
import { setupClaudeSDKTests, TEST_DATA, testPrompt, testWorkflow } from "./setup.js"

describe("Transaction Operations via Natural Language", () => {
  beforeAll(() => {
    setupClaudeSDKTests()
  })

  beforeAll(async () => {
    // Connect wallet for transaction tests
    await testPrompt(`Connect to wallet ${TEST_DATA.WALLET_ADDRESS_1}`)
  })

  describe("ETH transfer scenarios", () => {
    test("should send ETH with standard format", async () => {
      const result = await testPrompt(
        `Send ${TEST_DATA.SMALL_ETH_AMOUNT} ETH to ${TEST_DATA.WALLET_ADDRESS_2}`,
        {
          toolsUsed: ["send_transaction"],
          resultContains: ["transaction", "sent"],
        },
      )

      validateTransaction(result, "send")
      validateResponseStructure(result)
    })

    test("should transfer ETH with polite request", async () => {
      const result = await testPrompt(
        `Please transfer ${TEST_DATA.SMALL_ETH_AMOUNT} ether to address ${TEST_DATA.WALLET_ADDRESS_2}`,
        {
          toolsUsed: ["send_transaction"],
          resultContains: ["transfer", "transaction"],
        },
      )

      validateTransaction(result, "send")
    })

    test("should send ETH with casual language", async () => {
      const result = await testPrompt(
        `I want to send ${TEST_DATA.SMALL_ETH_AMOUNT} ETH to ${TEST_DATA.WALLET_ADDRESS_2}`,
        {
          toolsUsed: ["send_transaction"],
          resultMatches: [/transaction|sent|hash/i],
        },
      )

      validateTransaction(result, "send")
    })

    test("should handle ETH transfer with wei amount", async () => {
      const weiAmount = "1000000000000000" // 0.001 ETH in wei
      const result = await testPrompt(`Send ${weiAmount} wei to ${TEST_DATA.WALLET_ADDRESS_2}`, {
        toolsUsed: ["send_transaction"],
        resultContains: ["transaction"],
      })

      validateTransaction(result, "send")
    })

    test("should send to ENS name", async () => {
      // Switch to mainnet for ENS resolution
      await testPrompt("Switch to Ethereum mainnet")

      const result = await testPrompt(
        `Send ${TEST_DATA.SMALL_ETH_AMOUNT} ETH to ${TEST_DATA.ENS_NAMES[0]}`,
        {
          toolsUsed: ["resolve_ens_name", "send_transaction"],
          resultContains: ["transaction", "sent"],
        },
      )

      validateTransaction(result, "send")
    })
  })

  describe("gas estimation scenarios", () => {
    test("should estimate gas for simple transfer", async () => {
      const result = await testPrompt(
        `How much gas would it cost to send ${TEST_DATA.MEDIUM_ETH_AMOUNT} ETH to ${TEST_DATA.WALLET_ADDRESS_2}?`,
        {
          toolsUsed: ["estimate_gas"],
          resultContains: ["gas", "cost", "wei"],
        },
      )

      validateTransaction(result, "estimate")
    })

    test("should estimate gas with casual phrasing", async () => {
      const result = await testPrompt(`Estimate gas for sending 0.5 ETH to another wallet`, {
        toolsUsed: ["estimate_gas"],
        resultContains: ["gas", "estimate"],
      })

      validateTransaction(result, "estimate")
    })

    test("should estimate gas with specific details", async () => {
      const result = await testPrompt(
        `What would be the gas cost to transfer 1 ETH from my wallet to ${TEST_DATA.WALLET_ADDRESS_2}?`,
        {
          toolsUsed: ["estimate_gas"],
          resultMatches: [/gas|wei|cost|estimate/i],
        },
      )

      validateTransaction(result, "estimate")
    })
  })

  describe("transaction monitoring", () => {
    test("should check transaction status", async () => {
      // First send a transaction to get a hash
      const sendResult = await testPrompt(
        `Send ${TEST_DATA.SMALL_ETH_AMOUNT} ETH to ${TEST_DATA.WALLET_ADDRESS_2}`,
      )

      // Extract transaction hash from the result
      const hashMatch = sendResult.finalResult.match(/0x[a-fA-F0-9]{64}/)
      if (hashMatch) {
        const txHash = hashMatch[0]

        const statusResult = await testPrompt(`What's the status of transaction ${txHash}?`, {
          toolsUsed: ["get_transaction_status"],
          resultContains: ["status", "transaction"],
        })

        validateResponseStructure(statusResult)
      }
    })

    test("should get transaction receipt", async () => {
      // Send a transaction first
      const sendResult = await testPrompt(
        `Send ${TEST_DATA.SMALL_ETH_AMOUNT} ETH to ${TEST_DATA.WALLET_ADDRESS_2}`,
      )

      const hashMatch = sendResult.finalResult.match(/0x[a-fA-F0-9]{64}/)
      if (hashMatch) {
        const txHash = hashMatch[0]

        const receiptResult = await testPrompt(
          `Get the detailed receipt for transaction ${txHash}`,
          {
            toolsUsed: ["get_transaction_receipt"],
            resultContains: ["receipt", "transaction"],
          },
        )

        validateResponseStructure(receiptResult)
      }
    })

    test("should monitor transaction with casual language", async () => {
      const sendResult = await testPrompt(
        `Send ${TEST_DATA.SMALL_ETH_AMOUNT} ETH to ${TEST_DATA.WALLET_ADDRESS_2}`,
      )

      const hashMatch = sendResult.finalResult.match(/0x[a-fA-F0-9]{64}/)
      if (hashMatch) {
        const txHash = hashMatch[0]

        const monitorResult = await testPrompt(`Has my transaction ${txHash} been confirmed yet?`, {
          toolsUsed: ["get_transaction_status"],
          resultContains: ["status", "confirmed", "pending"],
        })

        validateResponseStructure(monitorResult)
      }
    })
  })

  describe("transaction simulation", () => {
    test("should simulate transaction before sending", async () => {
      const result = await testPrompt(
        `Simulate sending ${TEST_DATA.MEDIUM_ETH_AMOUNT} ETH to ${TEST_DATA.WALLET_ADDRESS_2} without actually sending it`,
        {
          toolsUsed: ["simulate_transaction", "estimate_gas"],
          resultContains: ["simulate", "gas", "cost"],
        },
      )

      validateResponseStructure(result)
    })

    test("should preview transaction effects", async () => {
      const result = await testPrompt(
        `What would happen if I send 1 ETH to ${TEST_DATA.WALLET_ADDRESS_2}? Don't actually send it.`,
        {
          toolsUsed: ["simulate_transaction", "estimate_gas"],
          resultContains: ["simulate", "preview", "gas"],
        },
      )

      validateResponseStructure(result)
    })
  })

  describe("complete transaction workflows", () => {
    test("should handle complete send workflow", async () => {
      const results = await testWorkflow("Complete Transaction Flow", [
        {
          prompt: `How much would it cost to send ${TEST_DATA.SMALL_ETH_AMOUNT} ETH to ${TEST_DATA.WALLET_ADDRESS_2}?`,
          expected: { toolsUsed: ["estimate_gas"] },
        },
        {
          prompt: `That looks good. Send ${TEST_DATA.SMALL_ETH_AMOUNT} ETH to ${TEST_DATA.WALLET_ADDRESS_2}`,
          expected: { toolsUsed: ["send_transaction"] },
        },
      ])

      results.forEach((result) => validateResponseStructure(result))
    })

    test("should handle transaction monitoring workflow", async () => {
      const results = await testWorkflow("Transaction Monitoring", [
        {
          prompt: `Send ${TEST_DATA.SMALL_ETH_AMOUNT} ETH to ${TEST_DATA.WALLET_ADDRESS_2}`,
          expected: { toolsUsed: ["send_transaction"] },
        },
        // Note: Follow-up status check would require extracting hash from first result
      ])

      results.forEach((result) => validateResponseStructure(result))
    })
  })

  describe("error handling scenarios", () => {
    test("should handle insufficient balance", async () => {
      const result = await testPrompt(`Send 1000 ETH to ${TEST_DATA.WALLET_ADDRESS_2}`, {
        errorExpected: true,
        errorMessage: "insufficient",
      })

      // This might succeed with error handling or fail gracefully
      validateResponseStructure(result)
    })

    test("should handle invalid recipient address", async () => {
      const result = await testPrompt("Send 0.1 ETH to 0xinvalid", {
        errorExpected: true,
        errorMessage: "invalid",
      })

      validateResponseStructure(result)
    })

    test("should handle ambiguous send request", async () => {
      const result = await testPrompt("Send some ETH", {
        resultContains: ["amount", "recipient", "address", "how much"],
      })

      // Should ask for clarification
      validateResponseStructure(result)
    })

    test("should handle invalid transaction hash", async () => {
      const result = await testPrompt("What's the status of transaction 0xinvalid?", {
        errorExpected: true,
        errorMessage: "invalid",
      })

      validateResponseStructure(result)
    })
  })

  describe("natural language variations", () => {
    test("should understand various send phrasings", async () => {
      const sendPhrases = ["Transfer", "Send", "Move", "Pay", "Transmit"]

      for (const phrase of sendPhrases) {
        const fullPrompt = `${phrase} ${TEST_DATA.SMALL_ETH_AMOUNT} ETH to ${TEST_DATA.WALLET_ADDRESS_2}`

        const result = await testPrompt(fullPrompt, {
          toolsUsed: ["send_transaction"],
          resultContains: ["transaction"],
        })

        validateTransaction(result, "send")
      }
    })

    test("should understand various gas estimation phrasings", async () => {
      const gasPhrases = [
        "How much gas to send 0.1 ETH?",
        "What's the gas cost for transferring 0.1 ETH?",
        "Estimate fees for 0.1 ETH transaction",
        "Gas price to move 0.1 ETH",
        "Transaction cost for sending 0.1 ETH",
      ]

      for (const phrase of gasPhrases) {
        const result = await testPrompt(phrase, {
          toolsUsed: ["estimate_gas"],
          resultContains: ["gas"],
        })

        validateTransaction(result, "estimate")
      }
    })

    test("should understand different amount formats", async () => {
      const amountFormats = ["0.001 ETH", "1000000000000000 wei", "0.001 ether", "1 milliether"]

      for (const amount of amountFormats) {
        const result = await testPrompt(`Send ${amount} to ${TEST_DATA.WALLET_ADDRESS_2}`, {
          toolsUsed: ["send_transaction"],
          resultContains: ["transaction"],
        })

        validateTransaction(result, "send")
      }
    })
  })

  describe("advanced transaction scenarios", () => {
    test("should handle transaction with data", async () => {
      const result = await testPrompt(
        `Send ${TEST_DATA.SMALL_ETH_AMOUNT} ETH to ${TEST_DATA.WALLET_ADDRESS_2} with data 0x1234`,
        {
          toolsUsed: ["send_transaction"],
          resultContains: ["transaction", "data"],
        },
      )

      validateTransaction(result, "send")
    })

    test("should estimate gas for transaction with data", async () => {
      const result = await testPrompt(
        `Estimate gas for sending 0.1 ETH with data 0xabcd to ${TEST_DATA.WALLET_ADDRESS_2}`,
        {
          toolsUsed: ["estimate_gas"],
          resultContains: ["gas", "estimate"],
        },
      )

      validateTransaction(result, "estimate")
    })

    test("should handle batch transaction requests", async () => {
      const result = await testPrompt(
        `I need to send ${TEST_DATA.SMALL_ETH_AMOUNT} ETH to ${TEST_DATA.WALLET_ADDRESS_2} and also check the gas cost first`,
        {
          toolsUsed: ["estimate_gas", "send_transaction"],
          resultContains: ["gas", "transaction"],
        },
      )

      validateResponseStructure(result)
    })
  })
})
