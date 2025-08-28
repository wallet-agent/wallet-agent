import { expect } from "bun:test"
import { query } from "@anthropic-ai/claude-code"

/**
 * Claude SDK message types
 */
interface ClaudeMessage {
  type: string
  subtype?: string
  result?: string
  message?: {
    content?: Array<{
      type: string
      name?: string
      text?: string
    }>
  }
}

/**
 * Expected behavior for test prompt validation
 */
export interface ExpectedBehavior {
  toolsUsed?: string[]
  successMessage?: string | RegExp
  resultContains?: string[]
  resultMatches?: RegExp[]
  errorExpected?: boolean
  errorMessage?: string
}

/**
 * Result from a test prompt execution
 */
export interface TestResult {
  success: boolean
  toolsUsed: string[]
  messages: ClaudeMessage[]
  finalResult: string
  error?: string
}

/**
 * Execute a natural language prompt and validate the result
 */
export async function testPrompt(
  userPrompt: string,
  expected?: ExpectedBehavior,
): Promise<TestResult> {
  console.log(`\n🧪 Testing prompt: "${userPrompt}"`)

  const messages: ClaudeMessage[] = []
  let finalResult = ""
  let error: string | undefined

  try {
    // Execute the prompt using Claude Code SDK
    for await (const message of query({
      prompt: userPrompt,
      options: {
        maxTurns: 5,
        systemPrompt: `You are testing the wallet-agent MCP server. 
        Use the available MCP tools to complete the user's request. 
        Be thorough and provide detailed feedback about what you did.
        If you encounter errors, explain them clearly.`,
        mcpConfig: {
          configs: [
            "/Users/blockshane/github.com/wallet-agent/wallet-agent/test/e2e/claude-sdk/mcp-config.json",
          ],
        },
        allowedTools: undefined,
      },
    })) {
      messages.push(message)

      // Extract final result
      if (message.type === "result") {
        if (message.subtype === "success") {
          finalResult = message.result || ""
        } else if (
          message.subtype === "error_during_execution" ||
          message.subtype === "error_max_turns"
        ) {
          error = message.result || "Execution error"
        }
      }
    }
  } catch (e) {
    error = e instanceof Error ? e.message : String(e)
  }

  // Extract tool calls from messages
  const toolsUsed = extractToolCalls(messages)

  console.log(`📋 Tools used: ${toolsUsed.join(", ") || "none"}`)
  if (error) {
    console.log(`❌ Error: ${error}`)
  } else {
    console.log(`✅ Success: ${finalResult.slice(0, 100)}${finalResult.length > 100 ? "..." : ""}`)
  }

  const result: TestResult = {
    success: !error,
    toolsUsed,
    messages,
    finalResult,
    error,
  }

  // Validate result if expectations provided
  if (expected) {
    await validateExecution(result, expected)
  }

  return result
}

/**
 * Extract tool calls from Claude SDK messages
 */
function extractToolCalls(messages: ClaudeMessage[]): string[] {
  const tools: string[] = []

  for (const message of messages) {
    if (message.type === "assistant" && message.message?.content) {
      for (const content of message.message.content) {
        if (content.type === "tool_use" && content.name) {
          tools.push(content.name)
        }
      }
    }
  }

  return [...new Set(tools)] // Remove duplicates
}

/**
 * Extract text content from messages
 */
function extractContent(messages: ClaudeMessage[]): string {
  let content = ""

  for (const message of messages) {
    if (message.type === "result") {
      content += message.result || ""
    } else if (message.type === "assistant" && message.message?.content) {
      for (const part of message.message.content) {
        if (part.type === "text") {
          content += part.text || ""
        }
      }
    }
  }

  return content
}

/**
 * Validate test execution against expected behavior
 */
async function validateExecution(result: TestResult, expected: ExpectedBehavior): Promise<void> {
  // Check for expected error
  if (expected.errorExpected) {
    expect(result.success).toBe(false)
    if (expected.errorMessage) {
      expect(result.error).toContain(expected.errorMessage)
    }
    return
  }

  // Check for success
  expect(result.success).toBe(true)
  expect(result.error).toBeUndefined()

  // Validate tools used
  if (expected.toolsUsed) {
    for (const expectedTool of expected.toolsUsed) {
      expect(result.toolsUsed).toContain(expectedTool)
    }
    console.log(`✓ Used expected tools: ${expected.toolsUsed.join(", ")}`)
  }

  // Validate success message
  if (expected.successMessage) {
    const content = extractContent(result.messages).toLowerCase()
    if (typeof expected.successMessage === "string") {
      expect(content).toContain(expected.successMessage.toLowerCase())
    } else {
      expect(content).toMatch(expected.successMessage)
    }
    console.log(`✓ Contains expected success message`)
  }

  // Validate result contains specific text
  if (expected.resultContains) {
    const content = extractContent(result.messages).toLowerCase()
    for (const expectedText of expected.resultContains) {
      expect(content).toContain(expectedText.toLowerCase())
    }
    console.log(`✓ Contains expected text: ${expected.resultContains.join(", ")}`)
  }

  // Validate result matches patterns
  if (expected.resultMatches) {
    const content = extractContent(result.messages)
    for (const pattern of expected.resultMatches) {
      expect(content).toMatch(pattern)
    }
    console.log(`✓ Matches expected patterns`)
  }
}

/**
 * Test a sequence of prompts as a workflow
 */
export async function testWorkflow(
  name: string,
  prompts: Array<{
    prompt: string
    expected?: ExpectedBehavior
  }>,
): Promise<TestResult[]> {
  console.log(`\n🔄 Starting workflow: ${name}`)

  const results: TestResult[] = []

  for (let i = 0; i < prompts.length; i++) {
    const { prompt, expected } = prompts[i]
    console.log(`\n📍 Step ${i + 1}/${prompts.length}`)

    const result = await testPrompt(prompt, expected)
    results.push(result)

    // Stop workflow if step fails
    if (!result.success) {
      console.log(`❌ Workflow "${name}" failed at step ${i + 1}`)
      break
    }
  }

  if (results.every((r) => r.success)) {
    console.log(`✅ Workflow "${name}" completed successfully`)
  }

  return results
}

/**
 * Common test data and addresses
 */
export const TEST_DATA = {
  // Mock wallet addresses from setup
  WALLET_ADDRESS_1: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  WALLET_ADDRESS_2: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",

  // Test amounts
  SMALL_ETH_AMOUNT: "0.001",
  MEDIUM_ETH_AMOUNT: "0.1",
  LARGE_ETH_AMOUNT: "1.0",

  // Common chain IDs
  ANVIL_CHAIN_ID: 31337,
  ETHEREUM_MAINNET_ID: 1,
  SEPOLIA_CHAIN_ID: 11155111,
  POLYGON_CHAIN_ID: 137,

  // Test ENS names (these need to resolve on mainnet)
  ENS_NAMES: ["vitalik.eth", "shanev.eth"],

  // Common token symbols
  TOKEN_SYMBOLS: ["USDC", "USDT", "WETH", "DAI"],
} as const

/**
 * Setup function for test suites
 */
export function setupClaudeSDKTests() {
  console.log("🚀 Setting up Claude SDK E2E Tests")
  console.log(`📊 Using test data: ${Object.keys(TEST_DATA).length} constants`)
}
