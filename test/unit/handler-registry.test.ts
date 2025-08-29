import { beforeEach, describe, expect, test } from "bun:test"
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js"
import { z } from "zod"
import {
  BaseToolHandler,
  HandlerRegistry,
  type ToolResponse,
} from "../../src/tools/handler-registry.js"

/**
 * Test handler implementation for testing
 */
class TestHandler extends BaseToolHandler {
  async execute(args: unknown) {
    const typedArgs = args as { shouldFail?: boolean; message?: string }
    if (typedArgs?.shouldFail) {
      throw new Error(typedArgs.message || "Test error")
    }
    return this.createTextResponse(typedArgs?.message || "Test successful")
  }

  // Public test methods to access protected functionality
  public testCreateTextResponse(text: string): ToolResponse {
    return this.createTextResponse(text)
  }

  public testValidateArgs<T>(schema: z.ZodSchema<T>, args: unknown): T {
    return this.validateArgs(schema, args)
  }
}

describe("HandlerRegistry", () => {
  let registry: HandlerRegistry

  beforeEach(() => {
    registry = new HandlerRegistry()
  })

  describe("register", () => {
    test("should register a single handler", () => {
      const handler = new TestHandler("test_handler", "Test handler")
      registry.register(handler)

      expect(registry.has("test_handler")).toBe(true)
      expect(registry.get("test_handler")).toBe(handler)
    })

    test("should throw error when registering duplicate handler", () => {
      const handler1 = new TestHandler("test_handler", "Test handler 1")
      const handler2 = new TestHandler("test_handler", "Test handler 2")

      registry.register(handler1)

      expect(() => registry.register(handler2)).toThrow("Handler already registered: test_handler")
    })
  })

  describe("registerAll", () => {
    test("should register multiple handlers", () => {
      const handlers = [
        new TestHandler("handler1", "Handler 1"),
        new TestHandler("handler2", "Handler 2"),
        new TestHandler("handler3", "Handler 3"),
      ]

      registry.registerAll(handlers)

      expect(registry.has("handler1")).toBe(true)
      expect(registry.has("handler2")).toBe(true)
      expect(registry.has("handler3")).toBe(true)
    })

    test("should throw error if any handler is duplicate", () => {
      const handler1 = new TestHandler("handler1", "Handler 1")
      const handler2 = new TestHandler("handler2", "Handler 2")
      const handler3 = new TestHandler("handler1", "Duplicate handler")

      expect(() => registry.registerAll([handler1, handler2, handler3])).toThrow(
        "Handler already registered: handler1",
      )

      // First handler should be registered, but not the duplicate
      expect(registry.has("handler1")).toBe(true)
      expect(registry.has("handler2")).toBe(true)
    })
  })

  describe("has", () => {
    test("should return true for registered handler", () => {
      registry.register(new TestHandler("test_handler", "Test"))
      expect(registry.has("test_handler")).toBe(true)
    })

    test("should return false for unregistered handler", () => {
      expect(registry.has("nonexistent")).toBe(false)
    })
  })

  describe("get", () => {
    test("should return registered handler", () => {
      const handler = new TestHandler("test_handler", "Test")
      registry.register(handler)

      expect(registry.get("test_handler")).toBe(handler)
    })

    test("should return undefined for unregistered handler", () => {
      expect(registry.get("nonexistent")).toBeUndefined()
    })
  })

  describe("getNames", () => {
    test("should return empty array when no handlers registered", () => {
      expect(registry.getNames()).toEqual([])
    })

    test("should return all registered handler names", () => {
      registry.registerAll([
        new TestHandler("handler1", "Handler 1"),
        new TestHandler("handler2", "Handler 2"),
        new TestHandler("handler3", "Handler 3"),
      ])

      const names = registry.getNames()
      expect(names).toHaveLength(3)
      expect(names).toContain("handler1")
      expect(names).toContain("handler2")
      expect(names).toContain("handler3")
    })
  })

  describe("execute", () => {
    beforeEach(() => {
      registry.register(new TestHandler("test_handler", "Test handler"))
    })

    test("should execute registered handler successfully", async () => {
      const request = {
        params: {
          name: "test_handler",
          arguments: { message: "Hello, world!" },
        },
        method: "tools/call" as const,
      }

      const result = await registry.execute(request)

      expect(result).toEqual({
        content: [
          {
            type: "text",
            text: "Hello, world!",
          },
        ],
      })
    })

    test("should throw MethodNotFound for unknown handler", async () => {
      const request = {
        params: {
          name: "unknown_handler",
          arguments: {},
        },
        method: "tools/call" as const,
      }

      try {
        await registry.execute(request)
        throw new Error("Should have thrown")
      } catch (error) {
        expect(error).toBeInstanceOf(McpError)
        const mcpError = error as McpError
        expect(mcpError.code).toBe(ErrorCode.MethodNotFound)
        expect(mcpError.message).toContain("Unknown tool: unknown_handler")
      }
    })

    test("should handle missing arguments gracefully", async () => {
      const request = {
        params: {
          name: "test_handler",
          // No arguments provided
        },
        method: "tools/call" as const,
      }

      const result = await registry.execute(request)

      expect(result).toEqual({
        content: [
          {
            type: "text",
            text: "Test successful",
          },
        ],
      })
    })

    test("should re-throw MCP errors as-is", async () => {
      // Create a handler that throws an MCP error
      class McpErrorHandler extends BaseToolHandler {
        async execute(): Promise<ToolResponse> {
          throw new McpError(ErrorCode.InvalidParams, "Invalid parameters")
        }
      }

      registry.register(new McpErrorHandler("mcp_error_handler", "MCP error handler"))

      const request = {
        params: {
          name: "mcp_error_handler",
          arguments: {},
        },
        method: "tools/call" as const,
      }

      try {
        await registry.execute(request)
        throw new Error("Should have thrown")
      } catch (error) {
        expect(error).toBeInstanceOf(McpError)
        const mcpError = error as McpError
        expect(mcpError.code).toBe(ErrorCode.InvalidParams)
        expect(mcpError.message).toContain("Invalid parameters")
      }
    })

    test("should wrap non-MCP errors as InternalError", async () => {
      const request = {
        params: {
          name: "test_handler",
          arguments: { shouldFail: true, message: "Something went wrong" },
        },
        method: "tools/call" as const,
      }

      try {
        await registry.execute(request)
        throw new Error("Should have thrown")
      } catch (error) {
        expect(error).toBeInstanceOf(McpError)
        const mcpError = error as McpError
        expect(mcpError.code).toBe(ErrorCode.InternalError)
        expect(mcpError.message).toContain("Tool execution failed: Something went wrong")
      }
    })
  })
})

describe("BaseToolHandler", () => {
  describe("createTextResponse", () => {
    test("should create properly formatted response", () => {
      const handler = new TestHandler("test", "Test handler")
      const response = handler.testCreateTextResponse("Hello, world!")

      expect(response).toEqual({
        content: [
          {
            type: "text",
            text: "Hello, world!",
          },
        ],
      })
    })
  })

  describe("validateArgs", () => {
    test("should validate arguments successfully", () => {
      const handler = new TestHandler("test", "Test handler")
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      })

      const result = handler.testValidateArgs(schema, { name: "John", age: 30 })

      expect(result).toEqual({ name: "John", age: 30 })
    })

    test("should throw InvalidParams error for invalid arguments", () => {
      const handler = new TestHandler("test", "Test handler")
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      })

      try {
        handler.testValidateArgs(schema, { name: "John", age: "thirty" })
        throw new Error("Should have thrown")
      } catch (error) {
        expect(error).toBeInstanceOf(McpError)
        const mcpError = error as McpError
        expect(mcpError.code).toBe(ErrorCode.InvalidParams)
        expect(mcpError.message).toContain("Invalid arguments")
      }
    })

    test("should include validation details in error message", () => {
      const handler = new TestHandler("test", "Test handler")
      const schema = z.object({
        email: z.string().email("Invalid email format"),
        age: z.number().min(18, "Must be at least 18"),
      })

      try {
        handler.testValidateArgs(schema, { email: "not-an-email", age: 15 })
        throw new Error("Should have thrown")
      } catch (error) {
        const mcpError = error as McpError
        expect(mcpError.message).toContain("Invalid email format")
        expect(mcpError.message).toContain("Must be at least 18")
      }
    })

    test("should re-throw non-Zod errors", () => {
      const handler = new TestHandler("test", "Test handler")

      // Create a schema that throws a non-Zod error
      const schema = {
        parse: () => {
          throw new Error("Unexpected error")
        },
      } as unknown as z.ZodSchema

      expect(() => handler.testValidateArgs(schema, {})).toThrow("Unexpected error")
    })
  })
})

// zod is already imported at the top
