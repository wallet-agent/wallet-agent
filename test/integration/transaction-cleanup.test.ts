import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { existsSync } from "node:fs"
import { mkdir, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"
import type { TransactionRecord } from "../../src/storage/types.js"
import { FREE_TIER_LIMITS } from "../../src/storage/types.js"
import { TestContainer } from "../../src/test-container.js"

describe("Transaction History Cleanup Integration", () => {
  let testContainer: TestContainer
  let tempStorageDir: string

  beforeEach(async () => {
    // Create custom storage directory for testing
    tempStorageDir = join(
      process.cwd(),
      "test-temp",
      `cleanup-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    )
    await mkdir(tempStorageDir, { recursive: true })
    await mkdir(join(tempStorageDir, "transactions"), { recursive: true })

    testContainer = TestContainer.createForTest({}, { enableStorage: true })

    // Override storage manager to use our temp directory
    const storageManager = testContainer.getStorageManager()
    if (storageManager) {
      // Replace the transaction history manager with one using our temp directory
      storageManager.getTransactionHistory.bind(storageManager)
      storageManager.getTransactionHistory = () => {
        const { TransactionHistoryManager } = require("../../src/storage/transaction-history.js")
        return new TransactionHistoryManager(join(tempStorageDir, "transactions"))
      }
    }
  })

  afterEach(async () => {
    // Clean up temporary directory
    if (existsSync(tempStorageDir)) {
      await rm(tempStorageDir, { recursive: true })
    }
  })

  describe("automatic cleanup on transaction recording", () => {
    test("should clean up old transactions when recording new ones", async () => {
      const storageManager = testContainer.getStorageManager()
      if (!storageManager) {
        return
      }

      // Connect wallet
      await testContainer.walletEffects.connectWallet("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")

      const historyManager = storageManager.getTransactionHistory()

      // Create old transactions directly in files (before recording system existed)
      const oldDate = new Date(
        Date.now() - (FREE_TIER_LIMITS.transactionHistory.maxDays + 1) * 24 * 60 * 60 * 1000,
      )
      const recentDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago

      const oldTransactions: TransactionRecord[] = [
        {
          hash: "0x1111111111111111111111111111111111111111111111111111111111111111",
          from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          value: "1000000000000000000",
          chainId: 31337,
          timestamp: oldDate.toISOString(),
          status: "success",
          metadata: { type: "send" },
        },
        {
          hash: "0x2222222222222222222222222222222222222222222222222222222222222222",
          from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          value: "2000000000000000000",
          chainId: 31337,
          timestamp: recentDate.toISOString(),
          status: "success",
          metadata: { type: "send" },
        },
      ]

      // Manually create file with old transactions
      const oldFilename = `31337-${oldDate.toISOString().split("T")[0]?.replace(/-/g, "")}.json`
      const oldFilepath = join(tempStorageDir, "transactions", oldFilename)
      await writeFile(oldFilepath, JSON.stringify(oldTransactions, null, 2))

      // Verify old file exists and has 2 transactions
      expect(existsSync(oldFilepath)).toBe(true)
      let allTransactions = await historyManager.getTransactionHistory()
      expect(allTransactions).toHaveLength(2)

      // Record a new transaction (this should trigger cleanup)
      await testContainer.walletEffects.sendTransaction({
        to: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        value: BigInt("3000000000000000000"),
      })

      // Wait for async recording and cleanup
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Check that cleanup happened
      allTransactions = await historyManager.getTransactionHistory()

      // Should have 2 transactions: the recent one from old file + new one
      expect(allTransactions).toHaveLength(2)

      // Old transaction should be gone, recent one from old file should remain
      const hashes = allTransactions.map((tx: any) => tx.hash)
      expect(hashes).not.toContain(
        "0x1111111111111111111111111111111111111111111111111111111111111111",
      ) // Old one removed
      expect(hashes).toContain("0x2222222222222222222222222222222222222222222222222222222222222222") // Recent one kept

      // New transaction should be present
      expect(allTransactions.some((tx: any) => tx.value === "3000000000000000000")).toBe(true)
    })

    test("should delete entire files with only old transactions", async () => {
      const storageManager = testContainer.getStorageManager()
      if (!storageManager) {
        return
      }

      await testContainer.walletEffects.connectWallet("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
      const historyManager = storageManager.getTransactionHistory()

      // Create a file with only old transactions
      const veryOldDate = new Date(
        Date.now() - (FREE_TIER_LIMITS.transactionHistory.maxDays + 2) * 24 * 60 * 60 * 1000,
      )

      const veryOldTransactions: TransactionRecord[] = [
        {
          hash: "0x1111111111111111111111111111111111111111111111111111111111111111",
          from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          value: "1000000000000000000",
          chainId: 31337,
          timestamp: veryOldDate.toISOString(),
          status: "success",
          metadata: { type: "send" },
        },
      ]

      const oldFilename = `31337-${veryOldDate.toISOString().split("T")[0]?.replace(/-/g, "")}.json`
      const oldFilepath = join(tempStorageDir, "transactions", oldFilename)
      await writeFile(oldFilepath, JSON.stringify(veryOldTransactions, null, 2))

      // Verify file exists
      expect(existsSync(oldFilepath)).toBe(true)
      let allTransactions = await historyManager.getTransactionHistory()
      expect(allTransactions).toHaveLength(1)

      // Record new transaction to trigger cleanup
      await testContainer.walletEffects.sendTransaction({
        to: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        value: BigInt("2000000000000000000"),
      })

      await new Promise((resolve) => setTimeout(resolve, 100))

      // Old file should be deleted entirely
      expect(existsSync(oldFilepath)).toBe(false)

      // Should only have the new transaction
      allTransactions = await historyManager.getTransactionHistory()
      expect(allTransactions).toHaveLength(1)
      expect(allTransactions[0]?.value).toBe("2000000000000000000")
    })

    test("should cleanup across multiple chains", async () => {
      const storageManager = testContainer.getStorageManager()
      if (!storageManager) {
        return
      }

      await testContainer.walletEffects.connectWallet("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
      const historyManager = storageManager.getTransactionHistory()

      const oldDate = new Date(
        Date.now() - (FREE_TIER_LIMITS.transactionHistory.maxDays + 1) * 24 * 60 * 60 * 1000,
      )

      // Create old transactions for multiple chains
      const chains = [31337, 1, 137]
      for (const chainId of chains) {
        const oldTransactions: TransactionRecord[] = [
          {
            hash: `0x${chainId.toString().padStart(64, "0")}`,
            from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            value: "1000000000000000000",
            chainId,
            timestamp: oldDate.toISOString(),
            status: "success",
            metadata: { type: "send" },
          },
        ]

        const filename = `${chainId}-${oldDate.toISOString().split("T")[0]?.replace(/-/g, "")}.json`
        const filepath = join(tempStorageDir, "transactions", filename)
        await writeFile(filepath, JSON.stringify(oldTransactions, null, 2))
      }

      // Verify all files exist
      let allTransactions = await historyManager.getTransactionHistory()
      expect(allTransactions).toHaveLength(3)

      // Record new transaction to trigger cleanup
      await testContainer.walletEffects.sendTransaction({
        to: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        value: BigInt("5000000000000000000"),
      })

      await new Promise((resolve) => setTimeout(resolve, 100))

      // All old files should be cleaned up
      allTransactions = await historyManager.getTransactionHistory()
      expect(allTransactions).toHaveLength(1) // Only the new transaction
      expect(allTransactions[0]?.value).toBe("5000000000000000000")
    })
  })

  describe("performance with many transactions", () => {
    test("should handle cleanup efficiently with many files", async () => {
      const storageManager = testContainer.getStorageManager()
      if (!storageManager) {
        return
      }

      await testContainer.walletEffects.connectWallet("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
      const historyManager = storageManager.getTransactionHistory()

      // Create many transaction files (simulating weeks of usage)
      const transactionCounts: number[] = []

      for (let daysAgo = 1; daysAgo <= 20; daysAgo++) {
        const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
        const isOld = daysAgo > FREE_TIER_LIMITS.transactionHistory.maxDays

        const transactions: TransactionRecord[] = []
        const transactionsInDay = Math.floor(Math.random() * 5) + 1 // 1-5 transactions per day

        for (let i = 0; i < transactionsInDay; i++) {
          transactions.push({
            hash: `0x${daysAgo.toString().padStart(2, "0")}${i.toString().padStart(62, "0")}`,
            from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            value: (BigInt(i + 1) * BigInt(1000000000000000000)).toString(),
            chainId: 31337,
            timestamp: date.toISOString(),
            status: "success",
            metadata: { type: "send" },
          })
        }

        const filename = `31337-${date.toISOString().split("T")[0]?.replace(/-/g, "")}.json`
        const filepath = join(tempStorageDir, "transactions", filename)
        await writeFile(filepath, JSON.stringify(transactions, null, 2))

        if (!isOld) {
          transactionCounts.push(transactionsInDay)
        }
      }

      // Measure time for transaction recording + cleanup
      const startTime = Date.now()

      await testContainer.walletEffects.sendTransaction({
        to: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        value: BigInt("1000000000000000000"),
      })

      await new Promise((resolve) => setTimeout(resolve, 100))

      const endTime = Date.now()
      const cleanupTime = endTime - startTime

      // Should complete cleanup reasonably quickly (less than 1 second for 20 files)
      expect(cleanupTime).toBeLessThan(1000)

      // Should keep only recent transactions + new one
      const allTransactions = await historyManager.getTransactionHistory()
      const expectedCount = transactionCounts.reduce((sum, count) => sum + count, 0) + 1 // +1 for new transaction

      expect(allTransactions).toHaveLength(expectedCount)
    })
  })
})
