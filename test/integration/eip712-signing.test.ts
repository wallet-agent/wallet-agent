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

describe("EIP-712 Typed Data Signing Integration Test", () => {
  let server: McpServer
  let testContainer: TestContainer

  const testAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  const testPrivateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

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

    await server.callTool("import_private_key", {
      privateKey: testPrivateKey,
    })
  })

  describe("Standard EIP-712 Signing", () => {
    test("should sign EIP-712 permit data", async () => {
      const domain = {
        name: "MyToken",
        version: "1",
        chainId: 31337,
        verifyingContract: "0x1234567890123456789012345678901234567890",
      }

      const types = {
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      }

      const message = {
        owner: testAddress,
        spender: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        value: "1000000000000000000",
        nonce: 0,
        deadline: Math.floor(Date.now() / 1000) + 3600,
      }

      const result = await server.callTool("sign_typed_data", {
        domain,
        types,
        primaryType: "Permit",
        message,
      })

      expect(result.isError).toBe(false)
      if (!result.isError) {
        const response = result.content[0].text
        expect(response).toContain("0x")
        expect(response).toMatch(/^0x[a-fA-F0-9]{130}$/)
        console.log("✓ EIP-712 permit signature:", `${response.substring(0, 20)}...`)
      }
    })

    test("should sign EIP-712 mail message", async () => {
      const domain = {
        name: "Ether Mail",
        version: "1",
        chainId: 31337,
        verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
      }

      const types = {
        Person: [
          { name: "name", type: "string" },
          { name: "wallet", type: "address" },
        ],
        Mail: [
          { name: "from", type: "Person" },
          { name: "to", type: "Person" },
          { name: "contents", type: "string" },
        ],
      }

      const message = {
        from: {
          name: "Alice",
          wallet: testAddress,
        },
        to: {
          name: "Bob",
          wallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        },
        contents: "Hello, Bob!",
      }

      const result = await server.callTool("sign_typed_data", {
        domain,
        types,
        primaryType: "Mail",
        message,
      })

      expect(result.isError).toBe(false)
      if (!result.isError) {
        const response = result.content[0].text
        expect(response).toContain("0x")
        expect(response).toMatch(/^0x[a-fA-F0-9]{130}$/)
        console.log("✓ EIP-712 mail signature:", `${response.substring(0, 20)}...`)
      }
    })

    test("should sign EIP-712 order data", async () => {
      const domain = {
        name: "Exchange",
        version: "2",
        chainId: 31337,
        verifyingContract: "0x1234567890123456789012345678901234567890",
      }

      const types = {
        Order: [
          { name: "maker", type: "address" },
          { name: "taker", type: "address" },
          { name: "makerAsset", type: "address" },
          { name: "takerAsset", type: "address" },
          { name: "makerAmount", type: "uint256" },
          { name: "takerAmount", type: "uint256" },
          { name: "expiry", type: "uint256" },
          { name: "salt", type: "uint256" },
        ],
      }

      const message = {
        maker: testAddress,
        taker: "0x0000000000000000000000000000000000000000",
        makerAsset: "0xA0b86a33E6441e66534d3a976f30F73A5ea52e97",
        takerAsset: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        makerAmount: "1000000000000000000",
        takerAmount: "2000000000000000000",
        expiry: Math.floor(Date.now() / 1000) + 86400,
        salt: "12345",
      }

      const result = await server.callTool("sign_typed_data", {
        domain,
        types,
        primaryType: "Order",
        message,
      })

      expect(result.isError).toBe(false)
      if (!result.isError) {
        const response = result.content[0].text
        expect(response).toContain("0x")
        expect(response).toMatch(/^0x[a-fA-F0-9]{130}$/)
        console.log("✓ EIP-712 order signature:", `${response.substring(0, 20)}...`)
      }
    })
  })

  describe("EIP-712 Error Handling", () => {
    test("should handle missing domain", async () => {
      const result = await server.callTool("sign_typed_data", {
        types: { Test: [{ name: "value", type: "uint256" }] },
        primaryType: "Test",
        message: { value: "123" },
      })

      expect(result.isError).toBe(true)
      if (result.isError) {
        expect(result.content[0].text).toMatch(/(domain|required)/i)
      }
    })

    test("should handle invalid types", async () => {
      const result = await server.callTool("sign_typed_data", {
        domain: { name: "Test", version: "1", chainId: 31337 },
        types: {},
        primaryType: "NonExistent",
        message: {},
      })

      expect(result.isError).toBe(true)
      if (result.isError) {
        expect(result.content[0].text).toMatch(/(type|invalid|not found)/i)
      }
    })

    test("should handle mismatched message structure", async () => {
      const result = await server.callTool("sign_typed_data", {
        domain: { name: "Test", version: "1", chainId: 31337 },
        types: {
          Test: [{ name: "requiredField", type: "string" }],
        },
        primaryType: "Test",
        message: {
          wrongField: "value",
        },
      })

      expect(result.isError).toBe(true)
      if (result.isError) {
        expect(result.content[0].text).toMatch(/(message|structure|field)/i)
      }
    })

    test("should handle no wallet connected", async () => {
      await server.callTool("disconnect_wallet", {})

      const result = await server.callTool("sign_typed_data", {
        domain: { name: "Test", version: "1", chainId: 31337 },
        types: { Test: [{ name: "value", type: "uint256" }] },
        primaryType: "Test",
        message: { value: "123" },
      })

      expect(result.isError).toBe(true)
      if (result.isError) {
        expect(result.content[0].text).toMatch(/(wallet|connect|not connected)/i)
      }
    })
  })

  describe("EIP-712 Cross-chain Signing", () => {
    test("should sign with different chain IDs", async () => {
      const baseTypedData = {
        types: {
          Test: [{ name: "value", type: "uint256" }],
        },
        primaryType: "Test",
        message: { value: "123" },
      }

      const chains = [1, 137, 42161]
      const signatures = []

      for (const chainId of chains) {
        const result = await server.callTool("sign_typed_data", {
          domain: {
            name: "CrossChainTest",
            version: "1",
            chainId,
          },
          ...baseTypedData,
        })

        expect(result.isError).toBe(false)
        if (!result.isError) {
          const signature = result.content[0].text
          signatures.push(signature)
          console.log(`✓ Chain ${chainId} signature:`, `${signature.substring(0, 20)}...`)
        }
      }

      expect(signatures.length).toBe(3)
      expect(new Set(signatures).size).toBe(3)
    })
  })
})
