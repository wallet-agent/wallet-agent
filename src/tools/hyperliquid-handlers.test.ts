import { afterEach, beforeEach, describe, expect, test as it, jest, mock } from "bun:test"

// Mock fetch globally
// biome-ignore lint/suspicious/noExplicitAny: Mock types for testing
global.fetch = jest.fn() as any

// Create mock wallet manager
const _createMockWalletManager = () => ({
  importPrivateKey: jest.fn(),
  getAccount: jest.fn(),
  getAddress: jest.fn(),
  hasWallet: jest.fn(),
  signMessage: jest.fn(),
  signTypedData: jest.fn(),
  clearWallet: jest.fn(),
})

// Mock the Hyperliquid SDK
mock.module("@nktkas/hyperliquid", () => {
  class MockHttpTransport {
    isTestnet: boolean
    constructor({ isTestnet }: { isTestnet: boolean }) {
      this.isTestnet = isTestnet
    }
  }

  class MockInfoClient {
    transport: MockHttpTransport
    constructor({ transport }: { transport: MockHttpTransport }) {
      this.transport = transport
    }

    async meta() {
      return {
        universe: [
          { name: "BTC", szDecimals: 5 },
          { name: "ETH", szDecimals: 4 },
        ],
      }
    }

    async clearinghouseState(_address: string) {
      return { balance: "1000", positions: [] }
    }

    async userState(_address: string) {
      return { assetPositions: [] }
    }

    async openOrders(_address: string) {
      return []
    }
  }

  class MockExchangeClient {
    // biome-ignore lint/suspicious/noExplicitAny: Mock types for testing
    wallet: any
    transport: MockHttpTransport
    // biome-ignore lint/suspicious/noExplicitAny: Mock types for testing
    constructor({ wallet, transport }: { wallet: any; transport: MockHttpTransport }) {
      this.wallet = wallet
      this.transport = transport
    }

    // biome-ignore lint/suspicious/noExplicitAny: Mock types for testing
    async order(_args: any) {
      return { orderId: "12345", status: "success" }
    }

    // biome-ignore lint/suspicious/noExplicitAny: Mock types for testing
    async cancel(_args: any) {
      return { status: "cancelled" }
    }

    // biome-ignore lint/suspicious/noExplicitAny: Mock types for testing
    async cancelByCloid(_args: any) {
      return { status: "cancelled" }
    }

    // biome-ignore lint/suspicious/noExplicitAny: Mock types for testing
    async usdSend(_args: any) {
      return { txHash: "0xabc123", status: "success" }
    }
  }

  return {
    HttpTransport: MockHttpTransport,
    InfoClient: MockInfoClient,
    ExchangeClient: MockExchangeClient,
  }
})

// Mock viem/accounts
mock.module("viem/accounts", () => {
  return {
    privateKeyToAccount: jest.fn((_privateKey: string) => ({
      address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb8",
      signTypedData: jest.fn().mockImplementation((data) => {
        // Return different signatures for different data to make tests pass
        const dataStr = JSON.stringify(data)
        return Promise.resolve(`0x${Buffer.from(dataStr).toString("hex").slice(0, 130)}`)
      }),
      signMessage: jest.fn().mockImplementation(({ message }) => {
        // Return different signatures for different messages to make tests pass
        const hash = Buffer.from(message).toString("hex")
        return Promise.resolve(`0x${hash.padEnd(130, "0")}`)
      }),
    })),
  }
})

// Mock the config module
mock.module("../config/environment.js", () => {
  return {
    config: {
      get hyperliquidEndpoint() {
        return process.env.HYPERLIQUID_ENDPOINT || "https://api.hyperliquid.xyz"
      },
      get hyperliquidNetwork() {
        return process.env.HYPERLIQUID_NETWORK || "mainnet"
      },
    },
  }
})

// Import after mocking
import { handleHyperliquidTool } from "./hyperliquid-handlers.js"

describe("handleHyperliquidTool", () => {
  const testAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb8"
  const testPrivateKey = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset environment
    delete process.env.HYPERLIQUID_ENDPOINT
    delete process.env.HYPERLIQUID_NETWORK
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("hl_import_wallet", () => {
    it("should import wallet successfully", async () => {
      const result = await handleHyperliquidTool({
        params: {
          name: "hl_import_wallet",
          arguments: { privateKey: testPrivateKey },
        },
        method: "tools/call",
      })

      expect(result.content[0].text).toContain("Hyperliquid wallet imported successfully")
      expect(result.content[0].text).toContain(testAddress)
    })

    it("should throw error for invalid private key", async () => {
      await expect(
        handleHyperliquidTool({
          params: {
            name: "hl_import_wallet",
            arguments: { privateKey: "invalid" },
          },
          method: "tools/call",
        }),
      ).rejects.toThrow("Invalid private key format")
    })
  })

  describe("hl_get_account_info", () => {
    it("should get account info for imported wallet", async () => {
      // First import wallet
      await handleHyperliquidTool({
        params: {
          name: "hl_import_wallet",
          arguments: { privateKey: testPrivateKey },
        },
        method: "tools/call",
      })

      const result = await handleHyperliquidTool({
        params: {
          name: "hl_get_account_info",
          arguments: {},
        },
        method: "tools/call",
      })

      // Check that result contains expected mock data
      expect(result.content[0].text).toContain("balance")
      expect(result.content[0].text).toContain("1000")
    })

    it("should get account info for specified address", async () => {
      const specifiedAddress = "0x1234567890123456789012345678901234567890"

      const result = await handleHyperliquidTool({
        params: {
          name: "hl_get_account_info",
          arguments: { address: specifiedAddress },
        },
        method: "tools/call",
      })

      // Should return mock data for any address
      expect(result.content[0].text).toContain("balance")
    })

    // Note: Testing "no wallet" is difficult with current module structure
    // The integration tests cover this scenario

    it("should work with custom endpoint from environment", async () => {
      process.env.HYPERLIQUID_ENDPOINT = "https://custom.hyperliquid.xyz"

      // Import wallet first
      await handleHyperliquidTool({
        params: {
          name: "hl_import_wallet",
          arguments: { privateKey: testPrivateKey },
        },
        method: "tools/call",
      })

      const result = await handleHyperliquidTool({
        params: {
          name: "hl_get_account_info",
          arguments: {},
        },
        method: "tools/call",
      })

      // Should still work with custom endpoint
      expect(result.content[0].text).toContain("balance")
    })
  })

  describe("hl_place_order", () => {
    it("should place order successfully", async () => {
      // Import wallet first
      await handleHyperliquidTool({
        params: {
          name: "hl_import_wallet",
          arguments: { privateKey: testPrivateKey },
        },
        method: "tools/call",
      })

      const result = await handleHyperliquidTool({
        params: {
          name: "hl_place_order",
          arguments: {
            coin: "BTC",
            isBuy: true,
            sz: 0.1,
            limitPx: 50000,
            orderType: "limit",
          },
        },
        method: "tools/call",
      })

      expect(result.content[0].text).toContain("Order placed successfully")
      expect(result.content[0].text).toContain("12345") // Mock order ID
    })

    it("should validate order parameters", async () => {
      await expect(
        handleHyperliquidTool({
          params: {
            name: "hl_place_order",
            arguments: {
              coin: "BTC",
              isBuy: true,
              sz: -1, // Invalid negative size
            },
          },
          method: "tools/call",
        }),
      ).rejects.toThrow()
    })
  })

  describe("hl_cancel_order", () => {
    it("should cancel specific order", async () => {
      // Import wallet first
      await handleHyperliquidTool({
        params: {
          name: "hl_import_wallet",
          arguments: { privateKey: testPrivateKey },
        },
        method: "tools/call",
      })

      const result = await handleHyperliquidTool({
        params: {
          name: "hl_cancel_order",
          arguments: {
            coin: "ETH",
            orderId: "order123",
          },
        },
        method: "tools/call",
      })

      expect(result.content[0].text).toContain("Order cancelled successfully")
    })

    it("should cancel all orders for coin when no orderId provided", async () => {
      // Import wallet first
      await handleHyperliquidTool({
        params: {
          name: "hl_import_wallet",
          arguments: { privateKey: testPrivateKey },
        },
        method: "tools/call",
      })

      const result = await handleHyperliquidTool({
        params: {
          name: "hl_cancel_order",
          arguments: { coin: "ETH" },
        },
        method: "tools/call",
      })

      expect(result.content[0].text).toContain("cancelled")
    })
  })

  describe("hl_get_open_orders", () => {
    it("should get open orders", async () => {
      // Import wallet first
      await handleHyperliquidTool({
        params: {
          name: "hl_import_wallet",
          arguments: { privateKey: testPrivateKey },
        },
        method: "tools/call",
      })

      const result = await handleHyperliquidTool({
        params: {
          name: "hl_get_open_orders",
          arguments: {},
        },
        method: "tools/call",
      })

      expect(result.content[0].text).toContain("[]")
    })
  })

  describe("hl_get_positions", () => {
    it("should get positions", async () => {
      // Import wallet first
      await handleHyperliquidTool({
        params: {
          name: "hl_import_wallet",
          arguments: { privateKey: testPrivateKey },
        },
        method: "tools/call",
      })

      const result = await handleHyperliquidTool({
        params: {
          name: "hl_get_positions",
          arguments: {},
        },
        method: "tools/call",
      })

      expect(result.content[0].text).toContain("[]")
    })
  })

  describe("hl_transfer", () => {
    it("should transfer USDC successfully", async () => {
      // Import wallet first
      await handleHyperliquidTool({
        params: {
          name: "hl_import_wallet",
          arguments: { privateKey: testPrivateKey },
        },
        method: "tools/call",
      })

      const result = await handleHyperliquidTool({
        params: {
          name: "hl_transfer",
          arguments: {
            destination: "0x9876543210987654321098765432109876543210",
            amount: 100,
          },
        },
        method: "tools/call",
      })

      expect(result.content[0].text).toContain("Transfer completed successfully")
    })

    it("should validate transfer amount", async () => {
      await expect(
        handleHyperliquidTool({
          params: {
            name: "hl_transfer",
            arguments: {
              destination: "0x9876543210987654321098765432109876543210",
              amount: -10, // Invalid negative amount
            },
          },
          method: "tools/call",
        }),
      ).rejects.toThrow()
    })
  })

  describe("unknown tool", () => {
    it("should throw error for unknown tool", async () => {
      await expect(
        handleHyperliquidTool({
          params: {
            name: "hl_unknown_tool",
            arguments: {},
          },
          method: "tools/call",
        }),
      ).rejects.toThrow("Unknown tool")
    })
  })
})
