/**
 * Transaction history storage and management
 *
 * Stores transactions locally with 7-day retention for free tier
 */

import { existsSync } from "node:fs"
import { readdir, readFile, unlink, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { createLogger } from "../logger.js"
import type { TransactionRecord, TransactionSummary } from "./types.js"
import { FREE_TIER_LIMITS } from "./types.js"

const logger = createLogger("transaction-history")

export class TransactionHistoryManager {
  private transactionsDir: string

  constructor(transactionsDir: string) {
    this.transactionsDir = transactionsDir
  }

  /**
   * Record a new transaction
   */
  async recordTransaction(transaction: TransactionRecord): Promise<void> {
    try {
      const filename = this.getTransactionFilename(transaction.chainId, transaction.timestamp)
      const filepath = join(this.transactionsDir, filename)

      // Read existing transactions for this chain/day
      let transactions: TransactionRecord[] = []
      if (existsSync(filepath)) {
        const content = await readFile(filepath, "utf-8")
        transactions = JSON.parse(content)
      }

      // Add new transaction
      transactions.push(transaction)

      // Write back to file
      await writeFile(filepath, JSON.stringify(transactions, null, 2), { mode: 0o600 })

      logger.debug(`Recorded transaction ${transaction.hash} for chain ${transaction.chainId}`)

      // Clean up old transactions after recording
      await this.cleanupOldTransactions()
    } catch (error) {
      logger.error({ msg: "Failed to record transaction", error, hash: transaction.hash })
    }
  }

  /**
   * Update transaction status (e.g., from pending to success/failed)
   */
  async updateTransactionStatus(
    hash: string,
    status: "success" | "failed",
    gasUsed?: string,
    blockNumber?: number,
  ): Promise<void> {
    try {
      const files = await readdir(this.transactionsDir)

      for (const filename of files) {
        if (!filename.endsWith(".json")) continue

        const filepath = join(this.transactionsDir, filename)
        const content = await readFile(filepath, "utf-8")
        const transactions: TransactionRecord[] = JSON.parse(content)

        const txIndex = transactions.findIndex((tx) => tx.hash === hash)
        if (txIndex !== -1) {
          const transaction = transactions[txIndex]
          if (transaction) {
            transaction.status = status
            if (gasUsed) transaction.gasUsed = gasUsed
            if (blockNumber) transaction.blockNumber = blockNumber
          }

          await writeFile(filepath, JSON.stringify(transactions, null, 2), { mode: 0o600 })
          logger.debug(`Updated transaction ${hash} status to ${status}`)
          return
        }
      }

      logger.warn(`Transaction ${hash} not found for status update`)
    } catch (error) {
      logger.error({ msg: "Failed to update transaction status", error, hash })
    }
  }

  /**
   * Get transaction history with optional filtering
   */
  async getTransactionHistory(
    options: {
      chainId?: number
      limit?: number
      status?: "pending" | "success" | "failed"
      type?: TransactionRecord["metadata"]["type"]
      fromDate?: string
      toDate?: string
    } = {},
  ): Promise<TransactionRecord[]> {
    try {
      const files = await readdir(this.transactionsDir)
      const allTransactions: TransactionRecord[] = []

      // Read all transaction files
      for (const filename of files) {
        if (!filename.endsWith(".json")) continue

        // Parse chain ID and date from filename
        const parts = filename.replace(".json", "").split("-")
        if (parts.length !== 2) continue

        const [chainIdStr, dateStr] = parts
        if (!chainIdStr || !dateStr) continue

        const fileChainId = parseInt(chainIdStr)
        if (Number.isNaN(fileChainId)) continue

        // Skip if chain filter doesn't match
        if (options.chainId && fileChainId !== options.chainId) continue

        // Skip if date filter doesn't match
        if (options.fromDate) {
          const fromDateStr = options.fromDate.split("T")[0]?.replace(/-/g, "")
          if (fromDateStr && dateStr < fromDateStr) continue
        }
        if (options.toDate) {
          const toDateStr = options.toDate.split("T")[0]?.replace(/-/g, "")
          if (toDateStr && dateStr > toDateStr) continue
        }

        const filepath = join(this.transactionsDir, filename)
        const content = await readFile(filepath, "utf-8")
        const transactions: TransactionRecord[] = JSON.parse(content)

        allTransactions.push(...transactions)
      }

      // Apply filters
      let filteredTransactions = allTransactions

      if (options.status) {
        filteredTransactions = filteredTransactions.filter((tx) => tx.status === options.status)
      }

      if (options.type) {
        filteredTransactions = filteredTransactions.filter(
          (tx) => tx.metadata.type === options.type,
        )
      }

      if (options.fromDate) {
        const fromDate = options.fromDate
        filteredTransactions = filteredTransactions.filter((tx) => tx.timestamp >= fromDate)
      }

      if (options.toDate) {
        const toDate = options.toDate
        filteredTransactions = filteredTransactions.filter((tx) => tx.timestamp <= toDate)
      }

      // Sort by timestamp (newest first)
      filteredTransactions.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )

      // Apply limit
      if (options.limit) {
        filteredTransactions = filteredTransactions.slice(0, options.limit)
      }

      return filteredTransactions
    } catch (error) {
      logger.error({ msg: "Failed to get transaction history", error })
      return []
    }
  }

  /**
   * Get transaction summary statistics
   */
  async getTransactionSummary(): Promise<TransactionSummary> {
    try {
      const transactions = await this.getTransactionHistory()

      if (transactions.length === 0) {
        return {
          totalTransactions: 0,
          successfulTransactions: 0,
          failedTransactions: 0,
          totalValue: "0",
          totalGasUsed: "0",
          chains: [],
          oldestTimestamp: new Date().toISOString(),
          newestTimestamp: new Date().toISOString(),
        }
      }

      const successful = transactions.filter((tx) => tx.status === "success")
      const failed = transactions.filter((tx) => tx.status === "failed")
      const chains = [...new Set(transactions.map((tx) => tx.chainId))]

      // Calculate total value (only successful transactions)
      const totalValue = successful
        .reduce((sum, tx) => {
          return sum + BigInt(tx.value)
        }, BigInt(0))
        .toString()

      // Calculate total gas used (only successful transactions with gasUsed)
      const totalGasUsed = successful
        .reduce((sum, tx) => {
          if (tx.gasUsed) {
            return sum + BigInt(tx.gasUsed)
          }
          return sum
        }, BigInt(0))
        .toString()

      const timestamps = transactions.map((tx) => tx.timestamp).sort()

      return {
        totalTransactions: transactions.length,
        successfulTransactions: successful.length,
        failedTransactions: failed.length,
        totalValue,
        totalGasUsed,
        chains,
        oldestTimestamp: timestamps[0] || new Date().toISOString(),
        newestTimestamp: timestamps[timestamps.length - 1] || new Date().toISOString(),
      }
    } catch (error) {
      logger.error({ msg: "Failed to get transaction summary", error })
      throw new Error(
        `Failed to get transaction summary: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Clean up transactions older than 7 days (free tier limit)
   */
  async cleanupOldTransactions(): Promise<void> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - FREE_TIER_LIMITS.transactionHistory.maxDays)
      const cutoffTimestamp = cutoffDate.toISOString()

      const files = await readdir(this.transactionsDir)

      for (const filename of files) {
        if (!filename.endsWith(".json")) continue

        const filepath = join(this.transactionsDir, filename)
        const content = await readFile(filepath, "utf-8")
        const transactions: TransactionRecord[] = JSON.parse(content)

        // Filter out old transactions
        const recentTransactions = transactions.filter((tx) => tx.timestamp >= cutoffTimestamp)

        if (recentTransactions.length === 0) {
          // Delete entire file if no recent transactions
          await unlink(filepath)
          logger.debug(`Deleted old transaction file: ${filename}`)
        } else if (recentTransactions.length < transactions.length) {
          // Update file with only recent transactions
          await writeFile(filepath, JSON.stringify(recentTransactions, null, 2), { mode: 0o600 })
          logger.debug(
            `Cleaned up ${transactions.length - recentTransactions.length} old transactions from ${filename}`,
          )
        }
      }
    } catch (error) {
      logger.error({ msg: "Failed to cleanup old transactions", error })
    }
  }

  /**
   * Get filename for transactions based on chain ID and timestamp
   * Format: {chainId}-{YYYYMMDD}.json
   */
  private getTransactionFilename(chainId: number, timestamp: string): string {
    const date = new Date(timestamp)
    const datePart = date.toISOString().split("T")[0]
    if (!datePart) {
      throw new Error("Invalid date format")
    }
    const dateStr = datePart.replace(/-/g, "")
    return `${chainId}-${dateStr}.json`
  }

  /**
   * Get count of transactions for a specific chain (for rate limiting)
   */
  async getTransactionCount(chainId: number): Promise<number> {
    try {
      const transactions = await this.getTransactionHistory({ chainId })
      return transactions.length
    } catch {
      return 0
    }
  }
}
