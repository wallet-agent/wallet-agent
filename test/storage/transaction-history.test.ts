import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { existsSync } from "node:fs"
import { mkdir, readFile, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { TransactionHistoryManager } from "../../src/storage/transaction-history.js"
import type { TransactionRecord } from "../../src/storage/types.js"
import { FREE_TIER_LIMITS } from "../../src/storage/types.js"

describe("TransactionHistoryManager", () => {
  let tempDir: string
  let historyManager: TransactionHistoryManager

  beforeEach(async () => {
    // Create temporary directory for tests
    tempDir = join(
      process.cwd(),
      "test-temp",
      `tx-history-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    )
    await mkdir(tempDir, { recursive: true })

    historyManager = new TransactionHistoryManager(tempDir)
  })

  afterEach(async () => {
    // Clean up temporary directory
    if (existsSync(tempDir)) {
      await rm(tempDir, { recursive: true })
    }
  })

  describe("recordTransaction", () => {
    test("should record a new transaction", async () => {
      const transaction: TransactionRecord = {
        hash: "0x1234567890123456789012345678901234567890123456789012345678901234",
        from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        value: "1000000000000000000",
        chainId: 31337,
        timestamp: "2025-08-27T12:00:00.000Z",
        status: "pending",
        metadata: {
          type: "send",
        },
      }

      await historyManager.recordTransaction(transaction)

      // Check file was created
      const expectedFilename = "31337-20250827.json"
      const filepath = join(tempDir, expectedFilename)
      expect(existsSync(filepath)).toBe(true)

      // Check transaction was recorded
      const content = await readFile(filepath, "utf-8")
      const transactions: TransactionRecord[] = JSON.parse(content)
      expect(transactions).toHaveLength(1)
      expect(transactions[0]).toEqual(transaction)
    })

    test("should append to existing file", async () => {
      const transaction1: TransactionRecord = {
        hash: "0x1111111111111111111111111111111111111111111111111111111111111111",
        from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        value: "1000000000000000000",
        chainId: 31337,
        timestamp: "2025-08-27T12:00:00.000Z",
        status: "pending",
        metadata: { type: "send" },
      }

      const transaction2: TransactionRecord = {
        hash: "0x2222222222222222222222222222222222222222222222222222222222222222",
        from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        to: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        value: "2000000000000000000",
        chainId: 31337,
        timestamp: "2025-08-27T13:00:00.000Z",
        status: "pending",
        metadata: { type: "send" },
      }

      await historyManager.recordTransaction(transaction1)
      await historyManager.recordTransaction(transaction2)

      const filepath = join(tempDir, "31337-20250827.json")
      const content = await readFile(filepath, "utf-8")
      const transactions: TransactionRecord[] = JSON.parse(content)

      expect(transactions).toHaveLength(2)
      expect(transactions[0]).toEqual(transaction1)
      expect(transactions[1]).toEqual(transaction2)
    })

    test("should create separate files for different chains", async () => {
      const ethTransaction: TransactionRecord = {
        hash: "0x1111111111111111111111111111111111111111111111111111111111111111",
        from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        value: "1000000000000000000",
        chainId: 1,
        timestamp: "2025-08-27T12:00:00.000Z",
        status: "pending",
        metadata: { type: "send" },
      }

      const polygonTransaction: TransactionRecord = {
        hash: "0x2222222222222222222222222222222222222222222222222222222222222222",
        from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        value: "1000000000000000000",
        chainId: 137,
        timestamp: "2025-08-27T12:00:00.000Z",
        status: "pending",
        metadata: { type: "send" },
      }

      await historyManager.recordTransaction(ethTransaction)
      await historyManager.recordTransaction(polygonTransaction)

      // Check separate files were created
      expect(existsSync(join(tempDir, "1-20250827.json"))).toBe(true)
      expect(existsSync(join(tempDir, "137-20250827.json"))).toBe(true)

      // Check contents
      const ethContent = JSON.parse(await readFile(join(tempDir, "1-20250827.json"), "utf-8"))
      const polygonContent = JSON.parse(await readFile(join(tempDir, "137-20250827.json"), "utf-8"))

      expect(ethContent).toHaveLength(1)
      expect(polygonContent).toHaveLength(1)
      expect(ethContent[0].chainId).toBe(1)
      expect(polygonContent[0].chainId).toBe(137)
    })
  })

  describe("updateTransactionStatus", () => {
    test("should update transaction status", async () => {
      const transaction: TransactionRecord = {
        hash: "0x1234567890123456789012345678901234567890123456789012345678901234",
        from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        value: "1000000000000000000",
        chainId: 31337,
        timestamp: "2025-08-27T12:00:00.000Z",
        status: "pending",
        metadata: { type: "send" },
      }

      await historyManager.recordTransaction(transaction)

      // Update status
      await historyManager.updateTransactionStatus(transaction.hash, "success", "21000", 12345)

      const transactions = await historyManager.getTransactionHistory()
      expect(transactions).toHaveLength(1)
      expect(transactions[0]?.status).toBe("success")
      expect(transactions[0]?.gasUsed).toBe("21000")
      expect(transactions[0]?.blockNumber).toBe(12345)
    })

    test("should handle non-existent transaction", async () => {
      // Should not throw error
      await historyManager.updateTransactionStatus(
        "0x9999999999999999999999999999999999999999999999999999999999999999",
        "success",
      )

      const transactions = await historyManager.getTransactionHistory()
      expect(transactions).toHaveLength(0)
    })
  })

  describe("getTransactionHistory", () => {
    beforeEach(async () => {
      // Set up test data
      const transactions: TransactionRecord[] = [
        {
          hash: "0x1111111111111111111111111111111111111111111111111111111111111111",
          from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          value: "1000000000000000000",
          chainId: 31337,
          timestamp: "2025-08-27T12:00:00.000Z",
          status: "success",
          metadata: { type: "send" },
        },
        {
          hash: "0x2222222222222222222222222222222222222222222222222222222222222222",
          from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          to: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
          value: "2000000000000000000",
          chainId: 1,
          timestamp: "2025-08-27T13:00:00.000Z",
          status: "pending",
          metadata: { type: "contract_call", contractName: "TestToken" },
        },
        {
          hash: "0x3333333333333333333333333333333333333333333333333333333333333333",
          from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          to: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
          value: "0",
          chainId: 31337,
          timestamp: "2025-08-26T14:00:00.000Z",
          status: "failed",
          metadata: { type: "token_transfer", tokenSymbol: "USDC" },
        },
      ]

      for (const tx of transactions) {
        await historyManager.recordTransaction(tx)
      }
    })

    test("should get all transactions sorted by timestamp", async () => {
      const transactions = await historyManager.getTransactionHistory()

      expect(transactions).toHaveLength(3)
      // Should be sorted newest first
      expect(transactions[0]?.timestamp).toBe("2025-08-27T13:00:00.000Z")
      expect(transactions[1]?.timestamp).toBe("2025-08-27T12:00:00.000Z")
      expect(transactions[2]?.timestamp).toBe("2025-08-26T14:00:00.000Z")
    })

    test("should filter by chain ID", async () => {
      const transactions = await historyManager.getTransactionHistory({ chainId: 31337 })

      expect(transactions).toHaveLength(2)
      expect(transactions.every((tx) => tx.chainId === 31337)).toBe(true)
    })

    test("should filter by status", async () => {
      const pending = await historyManager.getTransactionHistory({ status: "pending" })
      const success = await historyManager.getTransactionHistory({ status: "success" })
      const failed = await historyManager.getTransactionHistory({ status: "failed" })

      expect(pending).toHaveLength(1)
      expect(success).toHaveLength(1)
      expect(failed).toHaveLength(1)
    })

    test("should filter by type", async () => {
      const sends = await historyManager.getTransactionHistory({ type: "send" })
      const contracts = await historyManager.getTransactionHistory({ type: "contract_call" })
      const tokens = await historyManager.getTransactionHistory({ type: "token_transfer" })

      expect(sends).toHaveLength(1)
      expect(contracts).toHaveLength(1)
      expect(tokens).toHaveLength(1)
    })

    test("should limit results", async () => {
      const transactions = await historyManager.getTransactionHistory({ limit: 2 })

      expect(transactions).toHaveLength(2)
      // Should get newest 2
      expect(transactions[0]?.timestamp).toBe("2025-08-27T13:00:00.000Z")
      expect(transactions[1]?.timestamp).toBe("2025-08-27T12:00:00.000Z")
    })

    test("should filter by date range", async () => {
      const transactions = await historyManager.getTransactionHistory({
        fromDate: "2025-08-27T00:00:00.000Z",
        toDate: "2025-08-27T23:59:59.999Z",
      })

      expect(transactions).toHaveLength(2)
      expect(transactions.every((tx) => tx.timestamp.startsWith("2025-08-27"))).toBe(true)
    })
  })

  describe("getTransactionSummary", () => {
    test("should return empty summary for no transactions", async () => {
      const summary = await historyManager.getTransactionSummary()

      expect(summary.totalTransactions).toBe(0)
      expect(summary.successfulTransactions).toBe(0)
      expect(summary.failedTransactions).toBe(0)
      expect(summary.totalValue).toBe("0")
      expect(summary.totalGasUsed).toBe("0")
      expect(summary.chains).toEqual([])
    })

    test("should calculate summary statistics", async () => {
      const transactions: TransactionRecord[] = [
        {
          hash: "0x1111111111111111111111111111111111111111111111111111111111111111",
          from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          value: "1000000000000000000", // 1 ETH
          chainId: 31337,
          timestamp: "2025-08-27T12:00:00.000Z",
          status: "success",
          gasUsed: "21000",
          metadata: { type: "send" },
        },
        {
          hash: "0x2222222222222222222222222222222222222222222222222222222222222222",
          from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          to: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
          value: "2000000000000000000", // 2 ETH
          chainId: 1,
          timestamp: "2025-08-27T13:00:00.000Z",
          status: "success",
          gasUsed: "50000",
          metadata: { type: "contract_call" },
        },
        {
          hash: "0x3333333333333333333333333333333333333333333333333333333333333333",
          from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          to: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
          value: "500000000000000000", // 0.5 ETH
          chainId: 137,
          timestamp: "2025-08-26T14:00:00.000Z",
          status: "failed",
          metadata: { type: "token_transfer" },
        },
      ]

      for (const tx of transactions) {
        await historyManager.recordTransaction(tx)
      }

      const summary = await historyManager.getTransactionSummary()

      expect(summary.totalTransactions).toBe(3)
      expect(summary.successfulTransactions).toBe(2)
      expect(summary.failedTransactions).toBe(1)
      expect(summary.totalValue).toBe("3000000000000000000") // Only successful txs: 1 + 2 ETH
      expect(summary.totalGasUsed).toBe("71000") // 21000 + 50000
      expect(summary.chains.sort()).toEqual([1, 31337, 137].sort())
    })
  })

  describe("cleanupOldTransactions", () => {
    test("should remove transactions older than 7 days", async () => {
      const now = new Date()
      const eightDaysAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000)
      const sixDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000)

      const oldTransaction: TransactionRecord = {
        hash: "0x1111111111111111111111111111111111111111111111111111111111111111",
        from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        value: "1000000000000000000",
        chainId: 31337,
        timestamp: eightDaysAgo.toISOString(),
        status: "success",
        metadata: { type: "send" },
      }

      const recentTransaction: TransactionRecord = {
        hash: "0x2222222222222222222222222222222222222222222222222222222222222222",
        from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        value: "1000000000000000000",
        chainId: 31337,
        timestamp: sixDaysAgo.toISOString(),
        status: "success",
        metadata: { type: "send" },
      }

      // Manually create file with both transactions
      const filename = historyManager.getTransactionFilename(31337, now.toISOString())
      const filepath = join(tempDir, filename)
      await writeFile(filepath, JSON.stringify([oldTransaction, recentTransaction], null, 2))

      await historyManager.cleanupOldTransactions()

      const transactions = await historyManager.getTransactionHistory()
      expect(transactions).toHaveLength(1)
      expect(transactions[0]?.hash).toBe(recentTransaction.hash)
    })

    test("should delete entire file if no recent transactions", async () => {
      const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)

      const oldTransaction: TransactionRecord = {
        hash: "0x1111111111111111111111111111111111111111111111111111111111111111",
        from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        value: "1000000000000000000",
        chainId: 31337,
        timestamp: eightDaysAgo.toISOString(),
        status: "success",
        metadata: { type: "send" },
      }

      // Manually create file with old transaction
      const filename = historyManager.getTransactionFilename(31337, eightDaysAgo.toISOString())
      const filepath = join(tempDir, filename)
      await writeFile(filepath, JSON.stringify([oldTransaction], null, 2))

      expect(existsSync(filepath)).toBe(true)

      await historyManager.cleanupOldTransactions()

      expect(existsSync(filepath)).toBe(false)
      const transactions = await historyManager.getTransactionHistory()
      expect(transactions).toHaveLength(0)
    })

    test("should respect FREE_TIER_LIMITS.maxDays", async () => {
      const limitDays = FREE_TIER_LIMITS.transactionHistory.maxDays
      const exactlyLimitDaysAgo = new Date(Date.now() - limitDays * 24 * 60 * 60 * 1000 - 1000) // 1 second over
      const withinLimit = new Date(Date.now() - (limitDays - 1) * 24 * 60 * 60 * 1000)

      // Manually create files to avoid automatic cleanup during recordTransaction
      const oldTransaction = {
        hash: "0x1111111111111111111111111111111111111111111111111111111111111111",
        from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        value: "1000000000000000000",
        chainId: 31337,
        timestamp: exactlyLimitDaysAgo.toISOString(),
        status: "success",
        metadata: { type: "send" },
      }

      const recentTransaction = {
        hash: "0x2222222222222222222222222222222222222222222222222222222222222222",
        from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        value: "1000000000000000000",
        chainId: 31337,
        timestamp: withinLimit.toISOString(),
        status: "success",
        metadata: { type: "send" },
      }

      // Manually create file with both transactions
      const filename = historyManager.getTransactionFilename(31337, new Date().toISOString())
      const filepath = join(tempDir, filename)
      await writeFile(filepath, JSON.stringify([oldTransaction, recentTransaction], null, 2))

      // Should have 2 transactions before cleanup
      let allTransactions = await historyManager.getTransactionHistory()
      expect(allTransactions).toHaveLength(2)

      await historyManager.cleanupOldTransactions()

      // Should only have 1 transaction after cleanup (the one within limit)
      allTransactions = await historyManager.getTransactionHistory()
      expect(allTransactions).toHaveLength(1)
      expect(allTransactions[0]?.hash).toBe(
        "0x2222222222222222222222222222222222222222222222222222222222222222",
      )
    })
  })

  describe("getTransactionCount", () => {
    test("should count transactions for specific chain", async () => {
      const transactions: TransactionRecord[] = [
        {
          hash: "0x1111111111111111111111111111111111111111111111111111111111111111",
          from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          value: "1000000000000000000",
          chainId: 31337,
          timestamp: "2025-08-27T12:00:00.000Z",
          status: "success",
          metadata: { type: "send" },
        },
        {
          hash: "0x2222222222222222222222222222222222222222222222222222222222222222",
          from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          value: "1000000000000000000",
          chainId: 31337,
          timestamp: "2025-08-27T13:00:00.000Z",
          status: "success",
          metadata: { type: "send" },
        },
        {
          hash: "0x3333333333333333333333333333333333333333333333333333333333333333",
          from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          value: "1000000000000000000",
          chainId: 1,
          timestamp: "2025-08-27T13:00:00.000Z",
          status: "success",
          metadata: { type: "send" },
        },
      ]

      for (const tx of transactions) {
        await historyManager.recordTransaction(tx)
      }

      const anvilCount = await historyManager.getTransactionCount(31337)
      const mainnetCount = await historyManager.getTransactionCount(1)
      const polygonCount = await historyManager.getTransactionCount(137)

      expect(anvilCount).toBe(2)
      expect(mainnetCount).toBe(1)
      expect(polygonCount).toBe(0)
    })
  })
})
