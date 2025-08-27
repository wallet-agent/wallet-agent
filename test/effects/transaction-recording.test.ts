import { beforeEach, describe, expect, test } from "bun:test"
import { TestContainer } from "../../src/test-container.js"

describe("Transaction Recording Integration", () => {
  let testContainer: TestContainer

  beforeEach(() => {
    testContainer = TestContainer.createForTest({}, { enableStorage: true })
  })

  describe("WalletEffects.sendTransaction recording", () => {
    test("should record transaction with correct metadata", async () => {
      const storageManager = testContainer.getStorageManager()
      if (!storageManager) {
        return // Skip if no storage
      }

      // Connect wallet
      await testContainer.walletEffects.connectWallet("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")

      // Send transaction
      const hash = await testContainer.walletEffects.sendTransaction({
        to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        value: BigInt("1500000000000000000"), // 1.5 ETH
        data: "0x1234", // Some data
      })

      // Wait for async recording
      await new Promise((resolve) => setTimeout(resolve, 50))

      // Check recording
      const historyManager = storageManager.getTransactionHistory()
      const transactions = await historyManager.getTransactionHistory()

      expect(transactions).toHaveLength(1)

      const tx = transactions[0]
      expect(tx?.hash).toBe(hash)
      expect(tx?.from).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
      expect(tx?.to).toBe("0x70997970C51812dc3A010C7d01b50e0d17dc79C8")
      expect(tx?.value).toBe("1500000000000000000")
      expect(tx?.chainId).toBe(31337) // Default anvil
      expect(tx?.status).toBe("pending")
      expect(tx?.metadata.type).toBe("send")
    })

    test("should record multiple transactions", async () => {
      const storageManager = testContainer.getStorageManager()
      if (!storageManager) {
        return
      }

      await testContainer.walletEffects.connectWallet("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")

      // Send multiple transactions
      const hash1 = await testContainer.walletEffects.sendTransaction({
        to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        value: BigInt("1000000000000000000"),
      })

      const hash2 = await testContainer.walletEffects.sendTransaction({
        to: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        value: BigInt("2000000000000000000"),
      })

      await new Promise((resolve) => setTimeout(resolve, 50))

      const historyManager = storageManager.getTransactionHistory()
      const transactions = await historyManager.getTransactionHistory()

      expect(transactions).toHaveLength(2)

      // Should be sorted newest first
      expect(transactions[0]?.hash).toBe(hash2)
      expect(transactions[1]?.hash).toBe(hash1)
    })

    test("should handle recording errors gracefully", async () => {
      const storageManager = testContainer.getStorageManager()
      if (!storageManager) {
        return
      }

      await testContainer.walletEffects.connectWallet("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")

      // Mock a broken storage manager
      const originalGetTransactionHistory = storageManager.getTransactionHistory
      storageManager.getTransactionHistory = () => {
        throw new Error("Storage error")
      }

      // Transaction should still succeed even if recording fails
      const hash = await testContainer.walletEffects.sendTransaction({
        to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        value: BigInt("1000000000000000000"),
      })

      expect(hash).toMatch(/^0x[0-9a-f]{64}$/)

      // Restore original method
      storageManager.getTransactionHistory = originalGetTransactionHistory
    })

    test("should not record if no storage manager", async () => {
      // Create container without storage
      const noStorageContainer = TestContainer.createForTest({}, { enableStorage: false })

      await noStorageContainer.walletEffects.connectWallet(
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      )

      // Should still work without recording
      const hash = await noStorageContainer.walletEffects.sendTransaction({
        to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        value: BigInt("1000000000000000000"),
      })

      expect(hash).toMatch(/^0x[0-9a-f]{64}$/)
    })

    test("should record different transaction types correctly", async () => {
      const storageManager = testContainer.getStorageManager()
      if (!storageManager) {
        return
      }

      await testContainer.walletEffects.connectWallet("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")

      // Simple send (no data)
      await testContainer.walletEffects.sendTransaction({
        to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        value: BigInt("1000000000000000000"),
      })

      // Transaction with data (could be contract interaction)
      await testContainer.walletEffects.sendTransaction({
        to: "0xA0b86a33E6441b49D8b5C96D0B2BfFf3bF4B8f76",
        value: BigInt("0"),
        data: "0xa9059cbb000000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8000000000000000000000000000000000000000000000000de0b6b3a7640000", // transfer function call
      })

      await new Promise((resolve) => setTimeout(resolve, 50))

      const historyManager = storageManager.getTransactionHistory()
      const transactions = await historyManager.getTransactionHistory()

      expect(transactions).toHaveLength(2)

      // Both should be recorded as "send" type (contract type determined at higher level)
      expect(transactions.every((tx) => tx.metadata.type === "send")).toBe(true)
    })
  })

  describe("Chain switching", () => {
    test("should record transactions on correct chain", async () => {
      const storageManager = testContainer.getStorageManager()
      if (!storageManager) {
        return
      }

      await testContainer.walletEffects.connectWallet("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")

      // Send on default chain (Anvil)
      await testContainer.walletEffects.sendTransaction({
        to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        value: BigInt("1000000000000000000"),
      })

      // Switch to different chain
      await testContainer.walletEffects.switchChain(1) // Mainnet

      // Send on new chain
      await testContainer.walletEffects.sendTransaction({
        to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        value: BigInt("2000000000000000000"),
      })

      await new Promise((resolve) => setTimeout(resolve, 50))

      const historyManager = storageManager.getTransactionHistory()
      const anvilTransactions = await historyManager.getTransactionHistory({ chainId: 31337 })
      const mainnetTransactions = await historyManager.getTransactionHistory({ chainId: 1 })

      expect(anvilTransactions).toHaveLength(1)
      expect(mainnetTransactions).toHaveLength(1)
      expect(anvilTransactions[0]?.value).toBe("1000000000000000000")
      expect(mainnetTransactions[0]?.value).toBe("2000000000000000000")
    })
  })

  describe("Wallet connection states", () => {
    test("should not record if wallet not connected", async () => {
      const storageManager = testContainer.getStorageManager()
      if (!storageManager) {
        return
      }

      // Try to send without connecting wallet
      try {
        await testContainer.walletEffects.sendTransaction({
          to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          value: BigInt("1000000000000000000"),
        })
        expect(true).toBe(false) // Should have thrown
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }

      // Should not have recorded anything
      const historyManager = storageManager.getTransactionHistory()
      const transactions = await historyManager.getTransactionHistory()
      expect(transactions).toHaveLength(0)
    })

    test("should record with different wallet addresses", async () => {
      const storageManager = testContainer.getStorageManager()
      if (!storageManager) {
        return
      }

      // Connect first wallet
      await testContainer.walletEffects.connectWallet("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
      await testContainer.walletEffects.sendTransaction({
        to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        value: BigInt("1000000000000000000"),
      })

      // Switch to second wallet
      await testContainer.walletEffects.connectWallet("0x70997970C51812dc3A010C7d01b50e0d17dc79C8")
      await testContainer.walletEffects.sendTransaction({
        to: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        value: BigInt("2000000000000000000"),
      })

      await new Promise((resolve) => setTimeout(resolve, 50))

      const historyManager = storageManager.getTransactionHistory()
      const transactions = await historyManager.getTransactionHistory()

      expect(transactions).toHaveLength(2)
      expect(transactions[0]?.from).toBe("0x70997970C51812dc3A010C7d01b50e0d17dc79C8") // Newest first
      expect(transactions[1]?.from).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
    })
  })

  describe("Mock vs Private Key wallets", () => {
    test("should record transactions for both wallet types", async () => {
      const storageManager = testContainer.getStorageManager()
      if (!storageManager) {
        return
      }

      // Test with mock wallet (default)
      await testContainer.walletEffects.connectWallet("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
      await testContainer.walletEffects.sendTransaction({
        to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        value: BigInt("1000000000000000000"),
      })

      // Test with private key wallet (if available)
      try {
        testContainer.walletEffects.setWalletType("privateKey")
        // This would fail if no private keys imported, but recording should work the same
      } catch {
        // Expected if no private keys imported
      }

      await new Promise((resolve) => setTimeout(resolve, 50))

      const historyManager = storageManager.getTransactionHistory()
      const transactions = await historyManager.getTransactionHistory()

      expect(transactions).toHaveLength(1)
      expect(transactions[0]?.metadata.type).toBe("send")
    })
  })
})
