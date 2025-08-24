import type { CallToolRequest } from "@modelcontextprotocol/sdk/types.js"
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js"
import { z } from "zod"

/**
 * Standard response format for all tool handlers
 */
export interface ToolResponse {
  content: Array<{
    type: string
    text: string
  }>
}

/**
 * Base interface for all tool handlers
 */
export interface ToolHandler {
  name: string
  description: string
  // biome-ignore lint/suspicious/noExplicitAny: MCP server expects flexible return type
  execute(args: unknown): Promise<any>
}

/**
 * Abstract base class for tool handlers with common functionality
 */
export abstract class BaseToolHandler implements ToolHandler {
  constructor(
    public readonly name: string,
    public readonly description: string,
  ) {}

  abstract execute(args: unknown): Promise<ToolResponse>

  /**
   * Helper to create a standard text response
   */
  protected createTextResponse(text: string): ToolResponse {
    return {
      content: [
        {
          type: "text",
          text,
        },
      ],
    }
  }

  /**
   * Helper to validate arguments with Zod schema and handle errors
   */
  protected validateArgs<T>(schema: z.ZodSchema<T>, args: unknown): T {
    try {
      return schema.parse(args)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new McpError(
          ErrorCode.InvalidParams,
          `Invalid arguments: ${error.issues.map((e) => e.message).join(", ")}`,
        )
      }
      throw error
    }
  }
}

/**
 * Registry for managing tool handlers
 */
export class HandlerRegistry {
  private handlers = new Map<string, ToolHandler>()

  /**
   * Register a tool handler
   */
  register(handler: ToolHandler): void {
    if (this.handlers.has(handler.name)) {
      throw new Error(`Handler already registered: ${handler.name}`)
    }
    this.handlers.set(handler.name, handler)
  }

  /**
   * Register multiple handlers at once
   */
  registerAll(handlers: ToolHandler[]): void {
    for (const handler of handlers) {
      this.register(handler)
    }
  }

  /**
   * Get a handler by name
   */
  get(name: string): ToolHandler | undefined {
    return this.handlers.get(name)
  }

  /**
   * Check if a handler exists
   */
  has(name: string): boolean {
    return this.handlers.has(name)
  }

  /**
   * Get all registered handler names
   */
  getNames(): string[] {
    return Array.from(this.handlers.keys())
  }

  /**
   * Execute a tool call using the registry
   */
  async execute(request: CallToolRequest) {
    const { name, arguments: args = {} } = request.params

    const handler = this.get(name)
    if (!handler) {
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`)
    }

    try {
      return await handler.execute(args)
    } catch (error) {
      // Re-throw MCP errors as-is
      if (error instanceof McpError) {
        throw error
      }

      // Wrap other errors
      const message = error instanceof Error ? error.message : String(error)
      throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${message}`)
    }
  }
}

// Create a singleton registry instance
export const toolRegistry = new HandlerRegistry()
