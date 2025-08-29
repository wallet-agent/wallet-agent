import { $ } from "bun"
import type { TestResult } from "./setup.js"

/**
 * Test prompt execution for encrypted keystore tests with storage enabled
 */
export async function testEncryptedKeystorePrompt(
  userPrompt: string,
  expected?: {
    toolsUsed?: string[]
    resultContains?: string[]
    errorExpected?: boolean
    errorMessage?: string
  },
): Promise<TestResult> {
  console.log(`\n🔐 Testing encrypted keystore prompt: "${userPrompt}"`)

  try {
    const escapedPrompt = userPrompt.replace(/"/g, '\\"').replace(/\$/g, "\\$")
    console.log(`🔧 Escaped prompt: ${escapedPrompt}`)

    // Use the global MCP configuration but set environment variables
    // to enable storage for encrypted keystore testing
    console.log(`🚀 Starting CLI command...`)
    const result = await Promise.race([
      $`echo "${escapedPrompt}" | claude --print --dangerously-skip-permissions`.quiet(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Claude CLI timeout after 45 seconds")), 45000),
      ),
    ])

    console.log(`✅ CLI command completed`)

    const stdout = result.stdout.toString().trim()
    const stderr = result.stderr.toString().trim()
    const success = result.exitCode === 0

    console.log(`📤 Exit code: ${result.exitCode}`)
    console.log(`📤 Success: ${success}`)
    if (stdout) {
      console.log(`📥 Stdout: ${stdout.slice(0, 500)}${stdout.length > 500 ? "..." : ""}`)
    }
    if (stderr) {
      console.log(`⚠️  Stderr: ${stderr.slice(0, 500)}${stderr.length > 500 ? "..." : ""}`)
    }
    console.log(`📋 Full result object:`, {
      exitCode: result.exitCode,
      stdout: !!stdout,
      stderr: !!stderr,
    })

    const finalResult = stdout
    const error = success
      ? undefined
      : stderr || stdout || `Process exited with code ${result.exitCode}`

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

    // Basic validation
    if (expected) {
      if (expected.toolsUsed && expected.toolsUsed.length > 0) {
        const foundExpectedTool = expected.toolsUsed.some((tool) => toolsUsed.includes(tool))
        if (!foundExpectedTool) {
          console.log(`⚠️  Expected tools ${expected.toolsUsed} not found in ${toolsUsed}`)
        }
      }

      if (expected.resultContains && expected.resultContains.length > 0) {
        const containsExpected = expected.resultContains.some((text) =>
          finalResult.toLowerCase().includes(text.toLowerCase()),
        )
        if (!containsExpected) {
          console.log(`⚠️  Expected content ${expected.resultContains} not found`)
        }
      }

      if (expected.errorExpected && success) {
        console.log(`⚠️  Expected error but test succeeded`)
      }
    }

    return testResult
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e)
    console.log(`❌ CLI Error: ${error}`)

    // If it's a command error, try to extract stdout/stderr
    if (e && typeof e === "object" && "stdout" in e && "stderr" in e) {
      const cmdError = e as { exitCode?: number; stdout?: unknown; stderr?: unknown }
      console.log(`📤 Command Exit Code: ${cmdError.exitCode}`)
      console.log(`📥 Command Stdout: ${cmdError.stdout?.toString()}`)
      console.log(`⚠️  Command Stderr: ${cmdError.stderr?.toString()}`)
    }

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
 * Extract tool usage from Claude CLI output for encrypted keystore operations
 */
function extractToolsFromOutput(output: string): string[] {
  const tools: string[] = []

  // Look for MCP tool patterns
  const mcpToolPattern = /mcp__wallet-agent__(\w+)/g
  let match = mcpToolPattern.exec(output)
  while (match !== null) {
    if (match[1]) {
      tools.push(match[1])
    }
    match = mcpToolPattern.exec(output)
  }

  // Look for encrypted keystore specific tools
  const keystoreTools = [
    "create_encrypted_keystore",
    "unlock_keystore",
    "lock_keystore",
    "import_encrypted_private_key",
    "list_encrypted_keys",
    "remove_encrypted_key",
    "update_key_label",
    "change_keystore_password",
    "get_keystore_status",
  ]

  for (const tool of keystoreTools) {
    if (output.includes(tool) || output.includes(tool.replace(/_/g, " "))) {
      tools.push(tool)
    }
  }

  return [...new Set(tools)] // Remove duplicates
}

/**
 * Clean up any keystore files created during testing
 */
export async function cleanupKeystoreFiles(): Promise<void> {
  try {
    // Clean up any test keystore files
    await $`rm -f ./test-keystore*.json`.quiet()
    await $`rm -f ~/.wallet-agent/encrypted-keys.json`.quiet()
    await $`rm -f ./.wallet-agent/auth/encrypted-keys.json`.quiet()
    await $`rm -f ./.wallet-agent/encrypted-keys.json`.quiet()
  } catch {
    // Ignore cleanup errors
  }
}
