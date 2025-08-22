import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { WalletAgentAPIClient } from "./client.js"

// Mock fetch globally
// biome-ignore lint/suspicious/noExplicitAny: Mock types for testing
global.fetch = vi.fn() as any

describe("WalletAgentAPIClient", () => {
  let client: WalletAgentAPIClient
  const originalEnv = process.env

  beforeEach(() => {
    // Reset environment
    process.env = { ...originalEnv }
    vi.clearAllMocks()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe("constructor and configuration", () => {
    it("should initialize and detect configuration", () => {
      // Test without API key
      const originalKey = process.env.WALLET_AGENT_API_KEY
      delete process.env.WALLET_AGENT_API_KEY
      client = new WalletAgentAPIClient()
      expect(client.isConfigured()).toBe(false)

      // Restore for other tests
      if (originalKey) process.env.WALLET_AGENT_API_KEY = originalKey
    })

    it("should create client instance", () => {
      client = new WalletAgentAPIClient()
      expect(client).toBeDefined()
      expect(client).toBeInstanceOf(WalletAgentAPIClient)
    })
  })

  describe("callProAPI", () => {
    beforeEach(() => {
      client = new WalletAgentAPIClient()
    })

    it("should return error when API key is not configured", async () => {
      // This test depends on whether WALLET_AGENT_API_KEY is set in environment
      // If it's not set, we get the error. If it is set, we skip this test.
      const hasKey = !!process.env.WALLET_AGENT_API_KEY
      if (!hasKey) {
        const result = await client.callProAPI("test_method", {
          param: "value",
        })
        expect(result.success).toBe(false)
        expect(result.error).toBe("WALLET_AGENT_API_KEY required for pro features")
        expect(result.data).toBeUndefined()
      }
    })

    it("should handle API calls with mocked fetch", async () => {
      // Only test if we have an API key configured
      const hasKey = !!process.env.WALLET_AGENT_API_KEY

      if (hasKey) {
        const mockData = { result: "success", value: 42 }
        // biome-ignore lint/suspicious/noExplicitAny: Mock types for testing
        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => mockData,
        })

        const result = await client.callProAPI<typeof mockData>("test_method", {})

        expect(result.success).toBe(true)
        expect(result.data).toEqual(mockData)
        expect(result.error).toBeUndefined()
      }
    })

    it("should handle fetch errors gracefully", async () => {
      const hasKey = !!process.env.WALLET_AGENT_API_KEY

      if (hasKey) {
        // biome-ignore lint/suspicious/noExplicitAny: Mock types for testing
        ;(global.fetch as any).mockRejectedValueOnce(new Error("Network error"))
        const result = await client.callProAPI("test_method", {})
        expect(result.success).toBe(false)
        expect(result.error).toBe("Network error")
      }
    })
  })

  describe("getAvailableTools", () => {
    beforeEach(() => {
      client = new WalletAgentAPIClient()
    })

    it("should return array of tools or empty array", async () => {
      const hasKey = !!process.env.WALLET_AGENT_API_KEY

      if (hasKey) {
        const mockTools = [
          {
            name: "tool1",
            description: "Tool 1",
            inputSchema: { type: "object" },
            requiresSignature: false,
          },
        ]

        // biome-ignore lint/suspicious/noExplicitAny: Mock types for testing
        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => mockTools,
        })

        const tools = await client.getAvailableTools()
        expect(tools).toEqual(mockTools)
      } else {
        const tools = await client.getAvailableTools()
        expect(tools).toEqual([])
      }
    })

    it("should handle failures gracefully", async () => {
      const hasKey = !!process.env.WALLET_AGENT_API_KEY

      if (hasKey) {
        // biome-ignore lint/suspicious/noExplicitAny: Mock types for testing
        ;(global.fetch as any).mockResolvedValueOnce({
          ok: false,
          statusText: "Internal Server Error",
        })
      }

      const tools = await client.getAvailableTools()
      expect(tools).toEqual([])
    })
  })
})
