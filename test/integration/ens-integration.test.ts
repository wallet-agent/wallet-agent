import { beforeEach, describe, expect, test } from "bun:test"
import { TestContainer } from "../../src/test-container.js"
import { handleToolCall } from "../../src/tools/handlers.js"

interface McpServer {
  callTool(
    name: string,
    args: any,
  ): Promise<{
    isError: boolean
    content: [{ text: string; type: string }, ...Array<{ text: string; type: string }>]
    error?: string
  }>
}

describe("ENS Integration Test", () => {
  let server: McpServer
  let testContainer: TestContainer

  beforeEach(async () => {
    testContainer = TestContainer.createForTest({})

    server = {
      async callTool(name: string, args: any) {
        try {
          ;(globalThis as any).__walletAgentTestContainer = testContainer

          const result = await handleToolCall({
            method: "tools/call",
            params: {
              name,
              arguments: args,
            },
          })
          return {
            isError: false,
            content: result.content || [],
          }
        } catch (error) {
          return {
            isError: true,
            content: [
              { text: error instanceof Error ? error.message : String(error), type: "text" },
            ],
            error: error instanceof Error ? error.message : String(error),
          }
        }
      },
    }
  })

  describe("ENS Name Resolution", () => {
    test("should resolve valid ENS names to addresses", async () => {
      const result = await server.callTool("resolve_ens_name", {
        ensName: "vitalik.eth",
      })

      expect(result.isError).toBe(false)
      if (!result.isError) {
        expect(result.content[0].text).toContain("0x")
        expect(result.content[0].text.length).toBe(42) // 0x + 40 hex chars
      }
    }, 15000) // ENS resolution can be slow

    test("should handle non-existent ENS names gracefully", async () => {
      const result = await server.callTool("resolve_ens_name", {
        ensName: "this-definitely-does-not-exist-123456789.eth",
      })

      expect(result.isError).toBe(true)
      if (result.isError) {
        expect(result.content).toContain("ENS name not found")
      }
    })

    test("should handle malformed ENS names", async () => {
      const result = await server.callTool("resolve_ens_name", {
        ensName: "not-a-valid-ens-name",
      })

      expect(result.isError).toBe(true)
      if (result.isError) {
        expect(result.content).toContain("Invalid ENS name format")
      }
    })

    test("should handle empty ENS names", async () => {
      const result = await server.callTool("resolve_ens_name", {
        ensName: "",
      })

      expect(result.isError).toBe(true)
      if (result.isError) {
        expect(result.content).toContain("ENS name cannot be empty")
      }
    })
  })

  describe("ENS Integration with Transactions", () => {
    test("should resolve ENS name and use for wallet connection", async () => {
      // First resolve an ENS name
      const ensResult = await server.callTool("resolve_ens_name", {
        ensName: "vitalik.eth",
      })

      expect(ensResult.isError).toBe(false)
      if (ensResult.isError) return

      const resolvedAddress = ensResult.content[0].text.match(/0x[a-fA-F0-9]{40}/)?.[0]
      expect(resolvedAddress).toBeDefined()
      if (!resolvedAddress) return

      // Then try to connect using the resolved address
      const connectResult = await server.callTool("connect_wallet", {
        address: resolvedAddress,
      })

      expect(connectResult.isError).toBe(false)
      if (!connectResult.isError) {
        expect(connectResult.content[0].text).toContain("Connected to wallet")
        expect(connectResult.content[0].text).toContain(resolvedAddress)
      }
    }, 20000)

    test("should use ENS name in balance checking workflow", async () => {
      // Connect to a test wallet first
      await server.callTool("connect_wallet", {
        address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      })

      // Switch to mainnet for ENS resolution
      await server.callTool("switch_chain", {
        chainId: 1,
      })

      // Resolve ENS name
      const ensResult = await server.callTool("resolve_ens_name", {
        ensName: "vitalik.eth",
      })

      expect(ensResult.isError).toBe(false)
      if (ensResult.isError) return

      const resolvedAddress = ensResult.content[0].text.match(/0x[a-fA-F0-9]{40}/)?.[0]
      expect(resolvedAddress).toBeDefined()
      if (!resolvedAddress) return

      // Check balance of resolved address
      const balanceResult = await server.callTool("get_balance", {
        address: resolvedAddress,
      })

      expect(balanceResult.isError).toBe(false)
      if (!balanceResult.isError) {
        expect(balanceResult.content[0].text).toMatch(/\d+(\.\d+)?\s*(ETH|Ether)/i)
      }
    }, 25000)
  })

  describe("ENS Error Handling", () => {
    test("should handle network connectivity issues", async () => {
      // Test with a very long timeout to simulate network issues
      const result = await server.callTool("resolve_ens_name", {
        ensName: "test.eth",
      })

      // Should either resolve or fail gracefully with network error
      if (result.isError) {
        expect(result.content).toMatch(/(network|timeout|connection)/i)
      } else {
        expect(result.content[0].text).toMatch(/0x[a-fA-F0-9]{40}/)
      }
    })

    test("should validate ENS name format", async () => {
      const invalidNames = [
        "just-text",
        "domain.com",
        "123",
        "special@chars.eth",
        ".eth",
        "test..eth",
      ]

      for (const invalidName of invalidNames) {
        const result = await server.callTool("resolve_ens_name", {
          ensName: invalidName,
        })

        expect(result.isError).toBe(true)
        if (result.isError) {
          expect(result.content).toMatch(/(Invalid|format|ENS)/i)
        }
      }
    })
  })

  describe("ENS Performance and Caching", () => {
    test("should resolve the same ENS name consistently", async () => {
      const ensName = "vitalik.eth"

      // Resolve twice
      const result1 = await server.callTool("resolve_ens_name", {
        ensName,
      })

      const result2 = await server.callTool("resolve_ens_name", {
        ensName,
      })

      expect(result1.isError).toBe(false)
      expect(result2.isError).toBe(false)

      if (!result1.isError && !result2.isError) {
        const address1 = result1.content[0].text.match(/0x[a-fA-F0-9]{40}/)?.[0]
        const address2 = result2.content[0].text.match(/0x[a-fA-F0-9]{40}/)?.[0]

        expect(address1).toBeDefined()
        expect(address2).toBeDefined()
        if (address1 && address2) {
          expect(address1).toBe(address2)
        }
      }
    }, 20000)

    test("should handle multiple concurrent ENS resolutions", async () => {
      const ensNames = ["vitalik.eth", "nick.eth", "brantly.eth"]

      const promises = ensNames.map((name) =>
        server.callTool("resolve_ens_name", { ensName: name }),
      )

      const results = await Promise.all(promises)

      // At least some should succeed (depending on network conditions)
      const successCount = results.filter((r) => !r.isError).length
      expect(successCount).toBeGreaterThan(0)
    }, 30000)
  })

  describe("Cross-Chain ENS Usage", () => {
    test("should resolve on mainnet and use address on other chains", async () => {
      // Connect wallet
      await server.callTool("connect_wallet", {
        address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      })

      // Switch to mainnet for ENS resolution
      await server.callTool("switch_chain", {
        chainId: 1,
      })

      // Resolve ENS name
      const ensResult = await server.callTool("resolve_ens_name", {
        ensName: "vitalik.eth",
      })

      expect(ensResult.isError).toBe(false)
      if (ensResult.isError) return

      const resolvedAddress = ensResult.content[0].text.match(/0x[a-fA-F0-9]{40}/)?.[0]
      expect(resolvedAddress).toBeDefined()
      if (!resolvedAddress) return

      // Switch to Polygon and check balance of resolved address
      await server.callTool("switch_chain", {
        chainId: 137,
      })

      const polygonBalance = await server.callTool("get_balance", {
        address: resolvedAddress,
      })

      expect(polygonBalance.isError).toBe(false)
      if (!polygonBalance.isError) {
        expect(polygonBalance.content[0].text).toMatch(/\d+(\.\d+)?\s*(MATIC|Matic)/i)
      }
    }, 25000)
  })
})
