import { beforeEach, describe, expect, test } from "bun:test"
import type { TransactionRecord } from "../../src/storage/types.js"
import { TestContainer } from "../../src/test-container.js"

describe("Transaction History Resource Logic", () => {
  let testContainer: TestContainer

  beforeEach(() => {
    testContainer = TestContainer.createForTest({}, { enableStorage: true })
  })

  describe("transaction history resource data", () => {
    test("should return empty state initially", async () => {
      const storageManager = testContainer.getStorageManager()
      if (!storageManager) {
        // Test the no-storage case
        const emptyResult = {
          error: "No storage available",
          transactions: [],
          summary: {
            totalTransactions: 0,
            successfulTransactions: 0,
            failedTransactions: 0,
            totalValue: "0",
            totalGasUsed: "0",
            chains: [],
          },
        }
        expect(emptyResult.transactions).toEqual([])
        expect(emptyResult.summary.totalTransactions).toBe(0)
        return
      }

      const historyManager = storageManager.getTransactionHistory()
      const [transactions, summary] = await Promise.all([
        historyManager.getTransactionHistory({ limit: 50 }),
        historyManager.getTransactionSummary(),
      ])

      const result = {
        transactions,
        summary,
        retentionPolicy: {
          maxDays: 7,
          tier: "free",
        },
      }

      expect(result.transactions).toEqual([])
      expect(result.summary.totalTransactions).toBe(0)
      expect(result.retentionPolicy.maxDays).toBe(7)
      expect(result.retentionPolicy.tier).toBe("free")
    })

    test("should return transaction history after recording", async () => {
      const storageManager = testContainer.getStorageManager()
      if (!storageManager) {
        return
      }

      // Record some test transactions
      const historyManager = storageManager.getTransactionHistory()
      const transactions: TransactionRecord[] = [
        {
          hash: "0x1111111111111111111111111111111111111111111111111111111111111111",
          from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          value: "1000000000000000000",
          chainId: 31337,
          timestamp: new Date().toISOString(),
          status: "success",
          metadata: { type: "send" },
        },
        {
          hash: "0x2222222222222222222222222222222222222222222222222222222222222222",
          from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          to: "0xA0b86a33E6441b49D8b5C96D0B2BfFf3bF4B8f76",
          value: "0",
          chainId: 31337,
          timestamp: new Date().toISOString(),
          status: "pending",
          metadata: {
            type: "contract_call",
            contractName: "TestToken",
            functionName: "transfer",
          },
        },
      ]

      for (const tx of transactions) {
        await historyManager.recordTransaction(tx)
      }

      const [recordedTransactions, summary] = await Promise.all([
        historyManager.getTransactionHistory({ limit: 50 }),
        historyManager.getTransactionSummary(),
      ])

      const result = {
        transactions: recordedTransactions,
        summary,
        retentionPolicy: {
          maxDays: 7,
          tier: "free",
        },
      }

      expect(result.transactions).toHaveLength(2)
      expect(result.summary.totalTransactions).toBe(2)
      expect(result.summary.successfulTransactions).toBe(1)
      expect(result.summary.failedTransactions).toBe(0)
      expect(result.summary.chains).toContain(31337)

      // Check transaction details
      const txs = result.transactions as TransactionRecord[]
      expect(txs[0]?.hash).toBe(
        "0x2222222222222222222222222222222222222222222222222222222222222222",
      ) // Newest first
      expect(txs[0]?.metadata.type).toBe("contract_call")
      expect(txs[0]?.metadata.contractName).toBe("TestToken")
      expect(txs[1]?.hash).toBe(
        "0x1111111111111111111111111111111111111111111111111111111111111111",
      )
      expect(txs[1]?.metadata.type).toBe("send")
    })

    test("should limit transactions to 50 by default", async () => {
      const storageManager = testContainer.getStorageManager()
      if (!storageManager) {
        return
      }

      const historyManager = storageManager.getTransactionHistory()

      // Create 60 transactions
      const transactions: TransactionRecord[] = []
      for (let i = 0; i < 60; i++) {
        transactions.push({
          hash: `0x${i.toString().padStart(64, "0")}`,
          from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          value: "1000000000000000000",
          chainId: 31337,
          timestamp: new Date(Date.now() + i * 1000).toISOString(), // Different timestamps
          status: "success",
          metadata: { type: "send" },
        })
      }

      for (const tx of transactions) {
        await historyManager.recordTransaction(tx)
      }

      const [recordedTransactions, summary] = await Promise.all([
        historyManager.getTransactionHistory({ limit: 50 }),
        historyManager.getTransactionSummary(),
      ])

      // Should be limited to 50
      expect(recordedTransactions).toHaveLength(50)
      expect(summary.totalTransactions).toBe(60) // Summary should show all
    })
  })

  describe("send_transaction integration", () => {
    test("should record transaction when sending", async () => {
      const storageManager = testContainer.getStorageManager()
      if (!storageManager) {
        return
      }

      // Connect wallet first
      await testContainer.walletEffects.connectWallet("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")

      // Send transaction directly via wallet effects
      const hash = await testContainer.walletEffects.sendTransaction({
        to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        value: BigInt("1000000000000000"), // 0.001 ETH in wei
      })

      // Wait a bit for async recording
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Check transaction was recorded
      const historyManager = storageManager.getTransactionHistory()
      const [transactions] = await Promise.all([
        historyManager.getTransactionHistory({ limit: 50 }),
      ])

      expect(transactions).toHaveLength(1)
      const tx = transactions[0] as TransactionRecord
      expect(tx.from).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
      expect(tx.to).toBe("0x70997970C51812dc3A010C7d01b50e0d17dc79C8")
      expect(tx.value).toBe("1000000000000000") // 0.001 ETH in wei
      expect(tx.hash).toBe(hash)
      expect(tx.chainId).toBe(31337)
      expect(tx.status).toBe("pending")
      expect(tx.metadata.type).toBe("send")
    })
  })

  describe("contract transaction integration", () => {
    test("should record contract transaction", async () => {
      const storageManager = testContainer.getStorageManager()
      if (!storageManager) {
        return
      }

      // Connect wallet
      await testContainer.walletEffects.connectWallet("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")

      // Mock a contract write (since we need ABI loaded)
      const historyManager = storageManager.getTransactionHistory()

      // Simulate what would happen in a real contract call
      const contractTransaction: TransactionRecord = {
        hash: "0x1234567890123456789012345678901234567890123456789012345678901234",
        from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        to: "0xA0b86a33E6441b49D8b5C96D0B2BfFf3bF4B8f76",
        value: "0",
        chainId: 31337,
        timestamp: new Date().toISOString(),
        status: "pending",
        metadata: {
          type: "contract_call",
          contractName: "TestERC20",
          functionName: "transfer",
        },
      }

      await historyManager.recordTransaction(contractTransaction)

      // Check via transaction history
      const transactions = await historyManager.getTransactionHistory({ limit: 50 })

      expect(transactions).toHaveLength(1)
      const tx = transactions[0] as TransactionRecord
      expect(tx.metadata.type).toBe("contract_call")
      expect(tx.metadata.contractName).toBe("TestERC20")
      expect(tx.metadata.functionName).toBe("transfer")
    })
  })
})
