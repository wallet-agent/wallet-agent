import { beforeEach, describe, expect, test } from "bun:test"
import { TestContainer } from "../../src/test-container.js"
import { handleToolCall } from "../../src/tools/handlers.js"
import {
  type DeployedContracts,
  deployTestContracts,
  isAnvilRunning,
} from "../setup/deploy-contracts.js"

interface McpServer {
  callTool(
    name: string,
    args: any,
  ): Promise<{
    isError: boolean
    content: [{ text: string; type: string }, ...Array<{ text: string; type: string }>]
    error?: string
  }>
}

const useRealAnvil = process.env.USE_REAL_ANVIL === "true"

describe.skipIf(!useRealAnvil)("Transaction Monitoring Integration Test", () => {
  let server: McpServer
  let testContainer: TestContainer
  let deployedContracts: DeployedContracts

  const testPrivateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
  const recipientAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"

  beforeEach(async () => {
    if (!useRealAnvil) return

    const anvilRunning = await isAnvilRunning()
    if (!anvilRunning) {
      throw new Error("Anvil is not running. Start Anvil for this test.")
    }

    testContainer = TestContainer.createForTest({})
    deployedContracts = await deployTestContracts()

    server = {
      async callTool(name: string, args: any) {
        try {
          ;(globalThis as any).__walletAgentTestContainer = testContainer

          const result = await handleToolCall({
            method: "tools/call",
            params: {
              name,
              arguments: args,
            },
          })
          return {
            isError: false,
            content: result.content || [],
          }
        } catch (error) {
          return {
            isError: true,
            content: [
              { text: error instanceof Error ? error.message : String(error), type: "text" },
            ],
            error: error instanceof Error ? error.message : String(error),
          }
        }
      },
    }

    await server.callTool("load_wagmi_config", {
      filePath: "./test/setup/test-wagmi-config.ts",
    })

    await server.callTool("import_private_key", {
      privateKey: testPrivateKey,
    })
  })

  describe("Transaction Status Monitoring", () => {
    test("should track ETH transfer transaction from send to confirmation", async () => {
      const sendResult = await server.callTool("send_transaction", {
        to: recipientAddress,
        value: "0.1",
      })

      expect(sendResult.isError).toBe(false)
      if (sendResult.isError) return

      const hashMatch = sendResult.content[0].text.match(/Hash: (0x[a-fA-F0-9]{64})/)
      expect(hashMatch).toBeDefined()
      const txHash = hashMatch?.[1]

      console.log("✓ Transaction sent with hash:", txHash)

      await new Promise((resolve) => setTimeout(resolve, 1000))

      const statusResult = await server.callTool("get_transaction_status", {
        hash: txHash,
      })

      expect(statusResult.isError).toBe(false)
      if (!statusResult.isError) {
        const statusText = statusResult.content[0].text
        expect(statusText).toMatch(/(confirmed|success|mined)/i)
        expect(statusText).toContain(txHash)
        console.log("✓ Transaction status:", statusText)
      }
    })

    test("should get detailed transaction receipt for ETH transfer", async () => {
      const sendResult = await server.callTool("send_transaction", {
        to: recipientAddress,
        value: "0.05",
      })

      expect(sendResult.isError).toBe(false)
      if (sendResult.isError) return

      const hashMatch = sendResult.content[0].text.match(/Hash: (0x[a-fA-F0-9]{64})/)
      const txHash = hashMatch?.[1]

      await new Promise((resolve) => setTimeout(resolve, 1000))

      const receiptResult = await server.callTool("get_transaction_receipt", {
        hash: txHash,
      })

      expect(receiptResult.isError).toBe(false)
      if (!receiptResult.isError) {
        const receiptText = receiptResult.content[0].text
        expect(receiptText).toContain("blockNumber")
        expect(receiptText).toContain("gasUsed")
        expect(receiptText).toContain("status")
        expect(receiptText).toContain(recipientAddress.toLowerCase())
        expect(receiptText).toMatch(/21000|21021/) // Standard gas for ETH transfer
        console.log("✓ Transaction receipt includes gas and block info")
      }
    })

    test("should track contract interaction transaction", async () => {
      const storeResult = await server.callTool("write_contract", {
        contract: "Storage",
        address: deployedContracts.storage,
        function: "store",
        args: [42],
      })

      expect(storeResult.isError).toBe(false)
      if (storeResult.isError) return

      const hashMatch = storeResult.content[0].text.match(/Hash: (0x[a-fA-F0-9]{64})/)
      const txHash = hashMatch?.[1]

      await new Promise((resolve) => setTimeout(resolve, 1000))

      const statusResult = await server.callTool("get_transaction_status", {
        hash: txHash,
      })

      expect(statusResult.isError).toBe(false)
      if (!statusResult.isError) {
        const statusText = statusResult.content[0].text
        expect(statusText).toMatch(/(confirmed|success)/i)
        console.log("✓ Contract transaction status:", statusText)
      }

      const receiptResult = await server.callTool("get_transaction_receipt", {
        hash: txHash,
      })

      expect(receiptResult.isError).toBe(false)
      if (!receiptResult.isError) {
        const receiptText = receiptResult.content[0].text
        expect(receiptText).toContain("gasUsed")
        expect(receiptText).toContain(deployedContracts.storage.toLowerCase())
        expect(receiptText).toMatch(/logs/)
        console.log("✓ Contract transaction receipt includes logs")
      }
    })

    test("should track ERC20 token transfer transaction", async () => {
      const transferResult = await server.callTool("write_contract", {
        contract: "ERC20",
        address: deployedContracts.erc20,
        function: "transfer",
        args: [recipientAddress, "1000000000000000000"],
      })

      expect(transferResult.isError).toBe(false)
      if (transferResult.isError) return

      const hashMatch = transferResult.content[0].text.match(/Hash: (0x[a-fA-F0-9]{64})/)
      const txHash = hashMatch?.[1]

      await new Promise((resolve) => setTimeout(resolve, 2000))

      const receiptResult = await server.callTool("get_transaction_receipt", {
        hash: txHash,
      })

      expect(receiptResult.isError).toBe(false)
      if (!receiptResult.isError) {
        const receiptText = receiptResult.content[0].text
        expect(receiptText).toContain("Transfer") // Transfer event
        expect(receiptText).toContain(recipientAddress.toLowerCase())
        expect(receiptText).toContain("1000000000000000000") // Amount
        console.log("✓ ERC20 transfer receipt includes Transfer event")
      }
    })
  })

  describe("Transaction Error Monitoring", () => {
    test("should handle non-existent transaction hash", async () => {
      const fakeHash = "0x1234567890123456789012345678901234567890123456789012345678901234"

      const statusResult = await server.callTool("get_transaction_status", {
        hash: fakeHash,
      })

      expect(statusResult.isError).toBe(true)
      if (statusResult.isError) {
        expect(statusResult.content[0].text).toMatch(/(not found|does not exist)/i)
      }
    })

    test("should handle invalid transaction hash format", async () => {
      const invalidHash = "0x123"

      const statusResult = await server.callTool("get_transaction_status", {
        hash: invalidHash,
      })

      expect(statusResult.isError).toBe(true)
      if (statusResult.isError) {
        expect(statusResult.content[0].text).toMatch(/(invalid|format|hash)/i)
      }
    })

    test("should track failed contract transaction", async () => {
      const failingResult = await server.callTool("write_contract", {
        contract: "ERC20",
        address: deployedContracts.erc20,
        function: "transfer",
        args: [recipientAddress, "999999999999999999999999999"],
      })

      if (!failingResult.isError) {
        const hashMatch = failingResult.content[0].text.match(/Hash: (0x[a-fA-F0-9]{64})/)
        if (hashMatch) {
          const txHash = hashMatch[1]

          await new Promise((resolve) => setTimeout(resolve, 2000))

          const receiptResult = await server.callTool("get_transaction_receipt", {
            hash: txHash,
          })

          if (!receiptResult.isError) {
            const receiptText = receiptResult.content[0].text
            expect(receiptText).toMatch(/(status.*0|failed|reverted)/i)
            console.log("✓ Failed transaction receipt shows failure status")
          }
        }
      }
    })
  })

  describe("Transaction Timing Analysis", () => {
    test("should measure transaction confirmation times", async () => {
      const startTime = Date.now()

      const sendResult = await server.callTool("send_transaction", {
        to: recipientAddress,
        value: "0.01",
      })

      expect(sendResult.isError).toBe(false)
      if (sendResult.isError) return

      const hashMatch = sendResult.content[0].text.match(/Hash: (0x[a-fA-F0-9]{64})/)
      const txHash = hashMatch?.[1]
      const sendTime = Date.now()

      let confirmed = false
      let attempts = 0
      const maxAttempts = 10

      while (!confirmed && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 500))

        const statusResult = await server.callTool("get_transaction_status", {
          hash: txHash,
        })

        attempts++

        if (!statusResult.isError && statusResult.content[0].text.includes("confirmed")) {
          confirmed = true
          const confirmTime = Date.now()
          const totalTime = confirmTime - startTime
          const waitTime = confirmTime - sendTime

          console.log(`✓ Transaction confirmed in ${totalTime}ms total (${waitTime}ms after send)`)
          expect(totalTime).toBeLessThan(15000) // Should confirm within 15 seconds on Anvil
        }
      }

      expect(confirmed).toBe(true)
    })
  })

  describe("Batch Transaction Monitoring", () => {
    test("should monitor multiple transactions simultaneously", async () => {
      const transactions = []

      for (let i = 0; i < 3; i++) {
        const sendResult = await server.callTool("send_transaction", {
          to: recipientAddress,
          value: "0.01",
        })

        expect(sendResult.isError).toBe(false)
        if (!sendResult.isError) {
          const hashMatch = sendResult.content[0].text.match(/Hash: (0x[a-fA-F0-9]{64})/)
          if (hashMatch) {
            transactions.push(hashMatch[1])
          }
        }
      }

      expect(transactions.length).toBe(3)

      await new Promise((resolve) => setTimeout(resolve, 2000))

      for (const txHash of transactions) {
        const statusResult = await server.callTool("get_transaction_status", {
          hash: txHash,
        })

        expect(statusResult.isError).toBe(false)
        if (!statusResult.isError) {
          expect(statusResult.content[0].text).toMatch(/(confirmed|success)/i)
        }
      }

      console.log("✓ All batch transactions confirmed")
    })
  })
})
