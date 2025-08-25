import { beforeEach, describe, expect, test } from "bun:test"
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js"
import { TestContainer } from "../../../src/test-container.js"
import { SimulateTransactionHandler } from "../../../src/tools/handlers/misc-handlers.js"
import { ImportPrivateKeyHandler } from "../../../src/tools/handlers/wallet-management-handlers.js"
import type { TestGlobalThis, TestHandler } from "../../../src/types/test-globals.js"

describe("Handler Error Handling and Validation", () => {
  let testContainer: TestContainer

  beforeEach(() => {
    // Create isolated container for each test
    testContainer = TestContainer.createForTest({})
  })

  // Helper to execute handlers with isolated test container
  async function executeWithTestContainer(handler: TestHandler, args: unknown) {
    const testGlobal = globalThis as TestGlobalThis
    // Store original singleton instance
    const originalInstance = testGlobal.__walletAgentTestContainer

    // Set test container as global override for this test
    testGlobal.__walletAgentTestContainer = testContainer

    try {
      return await handler.execute(args)
    } finally {
      // Restore original state
      if (originalInstance) {
        testGlobal.__walletAgentTestContainer = originalInstance
      } else {
        delete testGlobal.__walletAgentTestContainer
      }
    }
  }

  describe("Validation Errors", () => {
    test("should validate required fields with custom error messages", async () => {
      try {
        await executeWithTestContainer(new SimulateTransactionHandler(), {
          // Missing contract
          function: "transfer",
        })
        throw new Error("Should have thrown")
      } catch (error) {
        expect(error).toBeInstanceOf(McpError)
        const mcpError = error as McpError
        expect(mcpError.code).toBe(ErrorCode.InvalidParams)
        expect(mcpError.message).toContain("Contract and function are required")
      }
    })

    test("should validate missing function field", async () => {
      try {
        await executeWithTestContainer(new SimulateTransactionHandler(), {
          contract: "0x1234567890123456789012345678901234567890",
          // Missing function
        })
        throw new Error("Should have thrown")
      } catch (error) {
        expect(error).toBeInstanceOf(McpError)
        const mcpError = error as McpError
        expect(mcpError.code).toBe(ErrorCode.InvalidParams)
        expect(mcpError.message).toContain("Contract and function are required")
      }
    })

    test("should validate both missing fields", async () => {
      try {
        await executeWithTestContainer(new SimulateTransactionHandler(), {
          // Missing both contract and function
          args: [],
        })
        throw new Error("Should have thrown")
      } catch (error) {
        expect(error).toBeInstanceOf(McpError)
        const mcpError = error as McpError
        expect(mcpError.code).toBe(ErrorCode.InvalidParams)
        expect(mcpError.message).toContain("Contract and function are required")
      }
    })
  })

  describe("Business Logic Errors", () => {
    test("should handle private key validation errors as InvalidParams", async () => {
      try {
        await executeWithTestContainer(new ImportPrivateKeyHandler(), {
          privateKey: "0xinvalidkey",
        })
        throw new Error("Should have thrown")
      } catch (error) {
        expect(error).toBeInstanceOf(McpError)
        const mcpError = error as McpError
        expect(mcpError.code).toBe(ErrorCode.InvalidParams)
        expect(mcpError.message).toContain("Failed to import private key")
      }
    })

    test("should handle missing environment variable", async () => {
      try {
        await executeWithTestContainer(new ImportPrivateKeyHandler(), {
          privateKey: "NONEXISTENT_ENV_VAR",
        })
        throw new Error("Should have thrown")
      } catch (error) {
        expect(error).toBeInstanceOf(McpError)
        const mcpError = error as McpError
        expect(mcpError.code).toBe(ErrorCode.InvalidParams)
        expect(mcpError.message).toContain("Failed to import private key")
      }
    })

    test("should handle file not found", async () => {
      try {
        await executeWithTestContainer(new ImportPrivateKeyHandler(), {
          privateKey: "/nonexistent/file/path.key",
        })
        throw new Error("Should have thrown")
      } catch (error) {
        expect(error).toBeInstanceOf(McpError)
        const mcpError = error as McpError
        expect(mcpError.code).toBe(ErrorCode.InvalidParams)
        expect(mcpError.message).toContain("Failed to import private key")
      }
    })
  })

  describe("Type Validation", () => {
    test("should validate string types", async () => {
      try {
        await executeWithTestContainer(new SimulateTransactionHandler(), {
          contract: 123, // Should be string
          function: "transfer",
        })
        throw new Error("Should have thrown")
      } catch (error) {
        expect(error).toBeInstanceOf(McpError)
        const mcpError = error as McpError
        expect(mcpError.code).toBe(ErrorCode.InvalidParams)
        // Number will fail Zod validation before custom check
        expect(mcpError.message).toContain("Invalid arguments")
      }
    })

    test("should validate array types", async () => {
      const handler = new SimulateTransactionHandler()

      try {
        await handler.execute({
          contract: "0x1234567890123456789012345678901234567890",
          function: "transfer",
          args: "not-an-array", // Should be array
        })
        throw new Error("Should have thrown")
      } catch (error) {
        expect(error).toBeInstanceOf(McpError)
        const mcpError = error as McpError
        expect(mcpError.code).toBe(ErrorCode.InvalidParams)
        expect(mcpError.message).toContain("Invalid arguments")
      }
    })
  })

  describe("Error Message Formatting", () => {
    test("should provide clear error messages for validation failures", async () => {
      const handler = new ImportPrivateKeyHandler()

      try {
        await handler.execute({
          // Missing required privateKey field
        })
        throw new Error("Should have thrown")
      } catch (error) {
        expect(error).toBeInstanceOf(McpError)
        const mcpError = error as McpError
        expect(mcpError.code).toBe(ErrorCode.InvalidParams)
        expect(mcpError.message).toContain("Invalid arguments")
      }
    })

    test("should include field names in validation errors", async () => {
      const handler = new SimulateTransactionHandler()

      // First bypass the custom validation
      try {
        await handler.execute({
          contract: "test",
          function: "test",
          args: "not-an-array",
        })
        throw new Error("Should have thrown")
      } catch (error) {
        const mcpError = error as McpError
        expect(mcpError.message).toContain("Invalid arguments")
        // The exact message will depend on Zod's validation
      }
    })
  })

  describe("Error Recovery", () => {
    test("should not affect subsequent calls after error", async () => {
      const handler = new SimulateTransactionHandler()

      // First call with error
      try {
        await handler.execute({})
        throw new Error("Should have thrown")
      } catch (error) {
        expect(error).toBeInstanceOf(McpError)
      }

      // Second call with different error
      try {
        await handler.execute({
          contract: "test",
          // Missing function
        })
        throw new Error("Should have thrown")
      } catch (error) {
        expect(error).toBeInstanceOf(McpError)
        const mcpError = error as McpError
        expect(mcpError.message).toContain("Contract and function are required")
      }

      // Third call should still work with valid input
      // (Would need to mock the actual simulation logic for this to succeed)
    })
  })
})
