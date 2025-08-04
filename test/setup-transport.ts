import { createTestTransport } from "./utils/test-transport.js";

// Set up global test transport for container to use
if (process.env.NODE_ENV === "test") {
  // Add mock responses for transaction queries
  const mockResponses = new Map([
    // Mock transaction that doesn't exist
    [
      "eth_getTransactionByHash",
      (params: unknown[]) => {
        const [hash] = params as [string];
        if (
          hash ===
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
        ) {
          return null; // Transaction not found
        }
        // Default transaction
        return {
          hash,
          blockNumber: "0x1",
          from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          value: "0x0",
        };
      },
    ],
    [
      "eth_getTransactionReceipt",
      (params: unknown[]) => {
        const [hash] = params as [string];
        if (
          hash ===
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
        ) {
          // Return null for non-existent transaction (this is what real nodes do)
          return null;
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
        };
      },
    ],
  ]);

  (global as { __testTransport?: unknown }).__testTransport =
    createTestTransport({ mockResponses });
}
