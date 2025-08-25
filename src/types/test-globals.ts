/**
 * TypeScript declarations for test infrastructure
 */

import type { TestContainer } from "../test-container.js"
import type { ToolHandler } from "../tools/handler-registry.js"

declare global {
  // Global test container override for test isolation
  var __walletAgentTestContainer: TestContainer | undefined
}

/**
 * Interface for test-safe global access to test container
 */
export interface TestGlobalThis {
  __walletAgentTestContainer?: TestContainer
}

/**
 * Type-safe helper for accessing global test container
 */
export function getTestGlobalThis(): TestGlobalThis {
  return globalThis as TestGlobalThis
}

/**
 * Helper type for test handlers that may not have full type information
 */
export interface TestHandler extends ToolHandler {
  execute(args: unknown): Promise<{ content: Array<{ type: string; text: string }> }>
}
