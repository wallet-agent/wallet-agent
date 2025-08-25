import { beforeEach, describe, expect, test } from "bun:test"
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js"
import { getAllChains } from "../../../src/chains.js"
import {
  AddCustomChainHandler,
  RemoveCustomChainHandler,
  UpdateCustomChainHandler,
} from "../../../src/tools/handlers/chain-handlers.js"
import { TestContainer } from "../../../src/test-container.js"

describe("Chain Handlers", () => {
  let testContainer: TestContainer

  beforeEach(() => {
    // Create isolated container for each test
    testContainer = TestContainer.createForTest({})
  })

  // Helper to execute handlers with isolated test container
  async function executeWithTestContainer(handler: any, args: unknown) {
    // Store original singleton instance
    const originalInstance = (globalThis as any).__walletAgentTestContainer

    // Set test container as global override for this test
    ;(globalThis as any).__walletAgentTestContainer = testContainer

    try {
      return await handler.execute(args)
    } finally {
      // Restore original state
      if (originalInstance) {
        ;(globalThis as any).__walletAgentTestContainer = originalInstance
      } else {
        delete (globalThis as any).__walletAgentTestContainer
      }
    }
  }

  describe("AddCustomChainHandler", () => {
    test("should have correct name and description", () => {
      const handler = new AddCustomChainHandler()
      expect(handler.name).toBe("add_custom_chain")
      expect(handler.description).toBe("Add a custom EVM-compatible blockchain network")
    })

    test("should add custom chain successfully", async () => {
      const result = await executeWithTestContainer(new AddCustomChainHandler(), {
        chainId: 99999,
        name: "Test Chain",
        rpcUrl: "https://test.example.com",
        nativeCurrency: {
          name: "Test Token",
          symbol: "TEST",
          decimals: 18,
        },
      })

      expect(result.content[0].text).toContain("Custom chain added successfully")
      expect(result.content[0].text).toContain("Chain ID: 99999")
      expect(result.content[0].text).toContain("Name: Test Chain")

      // Verify chain was added to test container
      const chains = testContainer.chainAdapter.getAllChains()
      const addedChain = chains.find((c) => c.id === 99999)
      expect(addedChain).toBeDefined()
      expect(addedChain?.name).toBe("Test Chain")
    })

    test("should validate required fields", async () => {
      try {
        await executeWithTestContainer(new AddCustomChainHandler(), {
          chainId: 99998,
          name: "Test Chain",
          // Missing rpcUrl and nativeCurrency
        })
        throw new Error("Should have thrown")
      } catch (error) {
        expect((error as Error).message).toContain("Invalid arguments")
      }
    })

    test("should validate RPC URL format", async () => {
      try {
        await executeWithTestContainer(new AddCustomChainHandler(), {
          chainId: 99997,
          name: "Test Chain",
          rpcUrl: "not-a-url",
          nativeCurrency: {
            name: "Test Token",
            symbol: "TEST",
            decimals: 18,
          },
        })
        throw new Error("Should have thrown")
      } catch (error) {
        expect((error as Error).message).toContain("Invalid arguments")
      }
    })

    test("should reject duplicate chain ID", async () => {
      // Add first chain
      await executeWithTestContainer(new AddCustomChainHandler(), {
        chainId: 99996,
        name: "Test Chain",
        rpcUrl: "https://test.example.com",
        nativeCurrency: {
          name: "Test Token",
          symbol: "TEST",
          decimals: 18,
        },
      })

      // Try to add duplicate
      try {
        await executeWithTestContainer(new AddCustomChainHandler(), {
          chainId: 99996,
          name: "Another Chain",
          rpcUrl: "https://another.example.com",
          nativeCurrency: {
            name: "Another Token",
            symbol: "ANOTHER",
            decimals: 18,
          },
        })
        throw new Error("Should have thrown")
      } catch (error) {
        expect((error as Error).message).toContain("Chain with ID 99996 already exists")
      }
    })
  })

  describe("UpdateCustomChainHandler", () => {
    beforeEach(async () => {
      // Add a chain to update
      await executeWithTestContainer(new AddCustomChainHandler(), {
        chainId: 88888,
        name: "Original Chain",
        rpcUrl: "https://original.example.com",
        nativeCurrency: {
          name: "Original Token",
          symbol: "ORIG",
          decimals: 18,
        },
      })
    })

    test("should have correct name and description", () => {
      const handler = new UpdateCustomChainHandler()
      expect(handler.name).toBe("update_custom_chain")
      expect(handler.description).toBe("Update an existing custom chain's configuration")
    })

    test("should update chain name", async () => {
      const result = await executeWithTestContainer(new UpdateCustomChainHandler(), {
        chainId: 88888,
        name: "Updated Chain",
      })

      expect(result.content[0].text).toContain("Custom chain 88888 updated successfully")
      expect(result.content[0].text).toContain("Name: Updated Chain")

      // Verify update
      const chains = testContainer.chainAdapter.getAllChains()
      const updatedChain = chains.find((c) => c.id === 88888)
      expect(updatedChain?.name).toBe("Updated Chain")
    })

    test("should update RPC URL", async () => {
      const result = await executeWithTestContainer(new UpdateCustomChainHandler(), {
        chainId: 88888,
        rpcUrl: "https://updated.example.com",
      })

      expect(result.content[0].text).toContain("Custom chain 88888 updated successfully")
      expect(result.content[0].text).toContain("RPC URL: https://updated.example.com")
    })

    test("should update multiple properties", async () => {
      const result = await executeWithTestContainer(new UpdateCustomChainHandler(), {
        chainId: 88888,
        name: "Multi Update",
        rpcUrl: "https://multi.example.com",
        nativeCurrency: {
          name: "New Token",
          symbol: "NEW",
          decimals: 18,
        },
      })

      expect(result.content[0].text).toContain("Name: Multi Update")
      expect(result.content[0].text).toContain("RPC URL: https://multi.example.com")
      expect(result.content[0].text).toContain("Native Currency: NEW")
    })

    test("should handle non-existent chain", async () => {
      try {
        await executeWithTestContainer(new UpdateCustomChainHandler(), {
          chainId: 77777,
          name: "Doesn't Exist",
        })
        throw new Error("Should have thrown")
      } catch (error) {
        expect(error).toBeInstanceOf(McpError)
        const mcpError = error as McpError
        expect(mcpError.code).toBe(ErrorCode.InvalidParams)
        expect(mcpError.message).toContain("Custom chain with ID 77777 not found")
      }
    })
  })

  describe("RemoveCustomChainHandler", () => {
    beforeEach(async () => {
      // Add a chain to remove
      await executeWithTestContainer(new AddCustomChainHandler(), {
        chainId: 66666,
        name: "To Remove",
        rpcUrl: "https://remove.example.com",
        nativeCurrency: {
          name: "Remove Token",
          symbol: "REM",
          decimals: 18,
        },
      })
    })

    test("should have correct name and description", () => {
      const handler = new RemoveCustomChainHandler()
      expect(handler.name).toBe("remove_custom_chain")
      expect(handler.description).toBe("Remove a previously added custom chain")
    })

    test("should remove custom chain successfully", async () => {
      // Verify chain exists
      let chains = testContainer.chainAdapter.getAllChains()
      expect(chains.find((c) => c.id === 66666)).toBeDefined()

      const result = await executeWithTestContainer(new RemoveCustomChainHandler(), {
        chainId: 66666,
      })

      expect(result.content[0].text).toBe("Custom chain 66666 removed successfully.")

      // Verify chain was removed
      chains = testContainer.chainAdapter.getAllChains()
      expect(chains.find((c) => c.id === 66666)).toBeUndefined()
    })

    test("should handle removing non-existent chain", async () => {
      try {
        await executeWithTestContainer(new RemoveCustomChainHandler(), { chainId: 55555 })
        throw new Error("Should have thrown")
      } catch (error) {
        expect((error as Error).message).toContain("Custom chain with ID 55555 not found")
      }
    })

    test("should prevent removing built-in chain", async () => {
      try {
        await executeWithTestContainer(new RemoveCustomChainHandler(), { chainId: 1 }) // Mainnet
        throw new Error("Should have thrown")
      } catch (error) {
        expect((error as Error).message).toContain("Cannot remove built-in chain")
      }
    })
  })
})
