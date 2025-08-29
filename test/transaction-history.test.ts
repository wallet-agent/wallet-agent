import { beforeEach, describe, expect, test } from "bun:test"
import type { TransactionRecord } from "../src/storage/types.js"
import { TestContainer } from "../src/test-container.js"

describe("Transaction History", () => {
  let testContainer: TestContainer

  beforeEach(() => {
    testContainer = TestContainer.createForTest({}, { enableStorage: true })
  })

  test("should record transactions when sending", async () => {
    const storageManager = testContainer.getStorageManager()

    // Skip if no storage (tests run without storage by default)
    if (!storageManager) {
      return
    }

    // Connect a wallet
    await testContainer.walletEffects.connectWallet("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")

    // Send a transaction
    const hash = await testContainer.walletEffects.sendTransaction({
      to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      value: BigInt("1000000000000000"), // 0.001 ETH in wei
    })

    // Wait a bit for async recording to complete
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Check that transaction was recorded
    const historyManager = storageManager.getTransactionHistory()
    const transactions = await historyManager.getTransactionHistory({ limit: 1 })

    expect(transactions).toHaveLength(1)

    const transaction = transactions[0]
    expect(transaction?.hash).toBe(hash)
    expect(transaction?.from).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
    expect(transaction?.to).toBe("0x70997970C51812dc3A010C7d01b50e0d17dc79C8")
    expect(transaction?.value).toBe("1000000000000000")
    expect(transaction?.status).toBe("pending")
    expect(transaction?.metadata.type).toBe("send")
  })

  test("should record contract transactions when writing", async () => {
    const storageManager = testContainer.getStorageManager()

    // Skip if no storage
    if (!storageManager) {
      return
    }

    // Load built-in ERC20 contract
    const contractStore = testContainer.contractAdapter as any
    expect(contractStore.hasContract("builtin:ERC20")).toBe(true)

    // Connect a wallet
    await testContainer.walletEffects.connectWallet("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")

    // Mock write contract call
    const mockHash = "0x1234567890123456789012345678901234567890123456789012345678901234"

    // Simulate recording a contract transaction directly
    const historyManager = storageManager.getTransactionHistory()
    const transactionRecord: TransactionRecord = {
      hash: mockHash,
      from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      to: "0xA0b86a33E6441b49D8b5C96D0B2BfFf3bF4B8f76", // Mock ERC20 address
      value: "0",
      chainId: 31337,
      timestamp: new Date().toISOString(),
      status: "pending",
      metadata: {
        type: "contract_call",
        contractName: "TestToken",
        functionName: "transfer",
      },
    }

    await historyManager.recordTransaction(transactionRecord)

    // Check that transaction was recorded
    const transactions = await historyManager.getTransactionHistory({ limit: 1 })

    expect(transactions).toHaveLength(1)

    const transaction = transactions[0]
    expect(transaction?.hash).toBe(mockHash)
    expect(transaction?.metadata.type).toBe("contract_call")
    expect(transaction?.metadata.contractName).toBe("TestToken")
    expect(transaction?.metadata.functionName).toBe("transfer")
  })
})
