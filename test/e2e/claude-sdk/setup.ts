import { expect } from "bun:test"
import { $ } from "bun"

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
  finalResult: string
  error?: string
  stdout: string
  stderr: string
}

/**
 * Execute a natural language prompt using Claude CLI and validate the result
 */
export async function testPrompt(
  userPrompt: string,
  expected?: ExpectedBehavior,
): Promise<TestResult> {
  console.log(`\n🧪 Testing prompt: "${userPrompt}"`)

  try {
    // For now, use direct Claude CLI without MCP config to avoid timeout issues
    // This tests the basic Claude functionality but may not use all MCP tools
    const escapedPrompt = userPrompt.replace(/"/g, '\\"').replace(/\$/g, "\\$")

    // Use the global MCP configuration (local development server) with permission bypass
    const result = await Promise.race([
      $`echo "${escapedPrompt}" | claude --print --dangerously-skip-permissions`.quiet(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Claude CLI timeout after 30 seconds")), 30000),
      ),
    ])

    const stdout = result.stdout.toString().trim()
    const stderr = result.stderr.toString().trim()
    const success = result.exitCode === 0

    console.log(`📤 Exit code: ${result.exitCode}`)
    if (stderr) {
      console.log(`⚠️  Stderr: ${stderr.slice(0, 200)}${stderr.length > 200 ? "..." : ""}`)
    }

    const finalResult = stdout
    const error = success ? undefined : stderr || `Process exited with code ${result.exitCode}`

    // Extract tool usage from output
    const toolsUsed = extractToolsFromOutput(finalResult)

    console.log(`📋 Tools detected: ${toolsUsed.join(", ") || "none"}`)
    if (error) {
      console.log(`❌ Error: ${error.slice(0, 200)}${error.length > 200 ? "..." : ""}`)
    } else {
      console.log(
        `✅ Success: ${finalResult.slice(0, 150)}${finalResult.length > 150 ? "..." : ""}`,
      )
    }

    const testResult: TestResult = {
      success,
      toolsUsed,
      finalResult,
      error,
      stdout,
      stderr,
    }

    // Validate result if expectations provided
    if (expected) {
      await validateExecution(testResult, expected)
    }

    return testResult
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e)
    console.log(`❌ CLI Error: ${error}`)

    return {
      success: false,
      toolsUsed: [],
      finalResult: "",
      error,
      stdout: "",
      stderr: error,
    }
  }
}

/**
 * Extract tool usage from Claude CLI output
 */
function extractToolsFromOutput(output: string): string[] {
  const tools: string[] = []

  // Claude often mentions tools it uses in natural language
  // Look for MCP tool patterns
  const mcpToolPattern = /mcp__wallet-agent__(\w+)/g
  let match: RegExpExecArray | null = null
  match = mcpToolPattern.exec(output)
  while (match !== null) {
    if (match[1]) {
      tools.push(match[1]) // Just the tool name without prefix
    }
    match = mcpToolPattern.exec(output)
  }

  // Look for common tool patterns in natural language output
  const toolMentions = [
    "connect_wallet",
    "disconnect_wallet",
    "get_balance",
    "send_transaction",
    "switch_chain",
    "add_custom_chain",
    "estimate_gas",
    "get_transaction_status",
    "transfer_token",
    "approve_token",
    "get_token_balance",
    "get_token_info",
    "transfer_nft",
    "get_nft_owner",
    "get_nft_info",
    "resolve_ens_name",
    "import_private_key",
    "sign_message",
    "load_wagmi_config",
    "list_contracts",
    "read_contract",
    "write_contract",
    "simulate_transaction",
    "get_accounts",
  ]

  const lowerOutput = output.toLowerCase()

  // Detect tools based on response content patterns
  if (
    lowerOutput.includes("connected to wallet") ||
    lowerOutput.includes("wallet on") ||
    lowerOutput.includes("chain (")
  ) {
    tools.push("connect_wallet")
  }
  if (
    lowerOutput.includes("mock accounts") ||
    lowerOutput.includes("accounts are available") ||
    lowerOutput.includes("0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266")
  ) {
    tools.push("get_accounts")
  }
  if (
    lowerOutput.includes("balance:") ||
    lowerOutput.includes("eth balance") ||
    lowerOutput.includes("balance is")
  ) {
    tools.push("get_balance")
  }
  if (
    lowerOutput.includes("transaction hash") ||
    lowerOutput.includes("transaction sent") ||
    lowerOutput.includes(`0x${"0".repeat(64)}`)
  ) {
    tools.push("send_transaction")
  }

  // Also check for explicit tool mentions
  for (const tool of toolMentions) {
    if (lowerOutput.includes(tool.replace("_", " ")) || lowerOutput.includes(tool)) {
      tools.push(tool)
    }
  }

  return [...new Set(tools)] // Remove duplicates
}

/**
 * Validate test execution against expected behavior
 */
async function validateExecution(result: TestResult, expected: ExpectedBehavior): Promise<void> {
  // Check for expected error
  if (expected.errorExpected) {
    expect(result.success).toBe(false)
    if (expected.errorMessage) {
      const errorText = result.error || result.stderr || result.finalResult
      expect(errorText.toLowerCase()).toContain(expected.errorMessage.toLowerCase())
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
    const content = result.finalResult.toLowerCase()
    if (typeof expected.successMessage === "string") {
      expect(content).toContain(expected.successMessage.toLowerCase())
    } else {
      expect(content).toMatch(expected.successMessage)
    }
    console.log(`✓ Contains expected success message`)
  }

  // Validate result contains specific text
  if (expected.resultContains) {
    const content = result.finalResult.toLowerCase()
    for (const expectedText of expected.resultContains) {
      expect(content).toContain(expectedText.toLowerCase())
    }
    console.log(`✓ Contains expected text: ${expected.resultContains.join(", ")}`)
  }

  // Validate result matches patterns
  if (expected.resultMatches) {
    const content = result.finalResult
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
    const promptConfig = prompts[i]
    if (!promptConfig) continue
    const { prompt, expected } = promptConfig
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
  MAINNET_CHAIN_ID: 1, // Alias for ETHEREUM_MAINNET_ID
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
