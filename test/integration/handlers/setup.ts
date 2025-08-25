import { beforeEach, expect } from "bun:test"
import type { CallToolRequest } from "@modelcontextprotocol/sdk/types.js"
import { TestContainer } from "../../../src/test-container.js"
import { handleToolCall } from "../../../src/tools/handlers.js"
import type { TestGlobalThis } from "../../../src/types/test-globals.js"
import "../../setup-transport.js"

// Test addresses
export const TEST_ADDRESS_1 = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
export const TEST_ADDRESS_2 = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
export const TEST_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

// Current test container - each test gets its own isolated instance
let currentTestContainer: TestContainer

// Helper to setup isolated container for each test
export function setupContainer() {
  beforeEach(async () => {
    // Create a fresh container for each test - no shared state
    currentTestContainer = TestContainer.createForTest({})

    // Ensure wallet starts disconnected and in mock mode
    if (currentTestContainer.walletEffects.getCurrentAccount().isConnected) {
      await currentTestContainer.walletEffects.disconnectWallet()
    }
    currentTestContainer.walletEffects.setWalletType("mock")
  })
}

// Helper to get the current test container
export function getTestContainer(): TestContainer {
  if (!currentTestContainer) {
    throw new Error("Test container not initialized. Call setupContainer() in beforeEach.")
  }
  return currentTestContainer
}

// Helper to create a tool request
export function createToolRequest(name: string, args?: Record<string, unknown>): CallToolRequest {
  return {
    method: "tools/call",
    params: {
      name,
      arguments: args,
    },
  }
}

// Helper to extract text from tool response
export function extractResponseText(response: {
  content?: Array<{ type: string; text?: string }>
}): string {
  return response.content?.[0]?.text || ""
}

// Helper to test successful tool execution with isolated container
export async function expectToolSuccess(
  toolName: string,
  args: Record<string, unknown> | undefined,
  expectedTextPattern?: RegExp | string,
) {
  const request = createToolRequest(toolName, args)
  const response = await handleToolCallWithContainer(request)
  const text = extractResponseText(response)

  if (expectedTextPattern) {
    if (typeof expectedTextPattern === "string") {
      expect(text).toContain(expectedTextPattern)
    } else {
      expect(text).toMatch(expectedTextPattern)
    }
  }

  return { response, text }
}

// Test-specific tool handler that uses isolated container
async function handleToolCallWithContainer(request: CallToolRequest) {
  const container = getTestContainer()
  const testGlobal = globalThis as TestGlobalThis

  // Store original test container override
  const originalInstance = testGlobal.__walletAgentTestContainer

  // Set test container as global override for this tool call
  testGlobal.__walletAgentTestContainer = container

  try {
    return await handleToolCall(request)
  } finally {
    // Restore original state
    if (originalInstance) {
      testGlobal.__walletAgentTestContainer = originalInstance
    } else {
      delete testGlobal.__walletAgentTestContainer
    }
  }
}

// Helper to test tool validation errors
export async function expectToolValidationError(
  toolName: string,
  args: Record<string, unknown> | undefined,
  expectedError?: string,
) {
  const request = createToolRequest(toolName, args)

  try {
    await handleToolCallWithContainer(request)
    throw new Error("Expected validation error but tool succeeded")
  } catch (error) {
    const err = error as { code?: number; message?: string }
    expect(err.code).toBe(-32602) // InvalidParams
    if (expectedError && err.message) {
      expect(err.message).toContain(expectedError)
    }
  }
}

// Helper to test tool execution errors
export async function expectToolExecutionError(
  toolName: string,
  args: Record<string, unknown> | undefined,
  expectedError?: string,
) {
  const request = createToolRequest(toolName, args)

  try {
    await handleToolCallWithContainer(request)
    throw new Error("Expected execution error but tool succeeded")
  } catch (error) {
    if (expectedError) {
      const err = error as { message?: string }
      if (err.message) {
        expect(err.message).toContain(expectedError)
      }
    }
  }
}
