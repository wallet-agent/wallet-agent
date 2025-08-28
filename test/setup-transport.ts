import { createTestTransport } from "./utils/test-transport.js"

// Set up global test transport for container to use
if (process.env.NODE_ENV === "test") {
  // Log setup in CI
  if (process.env.CI) {
    console.log("[Test Setup] Initializing mock transport, NODE_ENV:", process.env.NODE_ENV)
  }

  // Add mock responses for transaction queries
  const mockResponses = new Map<string, (params: unknown[]) => unknown>([
    // Mock transaction that doesn't exist
    [
      "eth_getTransactionByHash",
      (params: unknown[]) => {
        const [hash] = params as [string]
        if (hash === "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef") {
          return null // Transaction not found
        }
        // Default transaction
        return {
          hash,
          blockNumber: "0x1",
          from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          value: "0x0",
        }
      },
    ],
    [
      "eth_getTransactionReceipt",
      (params: unknown[]) => {
        const [hash] = params as [string]
        if (hash === "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef") {
          // Return null for non-existent transaction (this is what real nodes do)
          return null
        }
        // Default receipt
        return {
          transactionHash: hash,
          blockNumber: "0x1",
          status: "0x1",
          gasUsed: "0x5208",
          effectiveGasPrice: "0x4a817c800",
          from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          contractAddress: null,
          logs: [],
          type: "0x0",
          cumulativeGasUsed: "0x5208",
        }
      },
    ],
    // Mock eth_call to handle contract interactions
    [
      "eth_call",
      (params: unknown[]) => {
        const [callData] = params as [{ to?: string; data?: string }]
        // Check if it's a contract call
        if (callData.to && callData.data) {
          // Return error that indicates no data returned (no contract at address)
          throw new Error("execution reverted: returned no data")
        }
        throw new Error("execution reverted")
      },
    ],
    // Mock eth_getCode to return no code for all addresses (no contracts deployed)
    ["eth_getCode", () => "0x"],
  ])

  ;(global as { __testTransport?: unknown }).__testTransport = createTestTransport({
    mockResponses,
  })

  // Log completion in CI
  if (process.env.CI) {
    console.log("[Test Setup] Mock transport initialized and set on global")
  }
} else if (process.env.CI) {
  console.log(
    "[Test Setup] WARNING: NODE_ENV is not 'test', mock transport NOT initialized. NODE_ENV:",
    process.env.NODE_ENV,
  )
}
