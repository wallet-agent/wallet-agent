import { describe, test } from "bun:test"
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

describe("Debug Claude Code SDK", () => {
  test("should connect to Claude Code SDK", async () => {
    console.log("🔍 Testing basic Claude Code SDK connectivity")

    try {
      const messages: ClaudeMessage[] = []
      let responseReceived = false

      // Test with a simple prompt that doesn't require MCP tools
      for await (const message of query({
        prompt: "What MCP tools are available? List them briefly.",
        options: {
          maxTurns: 1,
          mcpConfig: {
            configs: [
              "/Users/blockshane/github.com/wallet-agent/wallet-agent/test/e2e/claude-sdk/mcp-config.json",
            ],
          },
        },
      })) {
        console.log("📨 Received message:", message)
        messages.push(message)
        responseReceived = true
        break // Just get the first response
      }

      console.log("✅ Successfully connected to Claude Code SDK")
      console.log("📋 Total messages received:", messages.length)
      console.log("🎯 Response received:", responseReceived)
    } catch (error) {
      console.error("❌ Failed to connect to Claude Code SDK:", error)
      throw error
    }
  }, 10000) // 10 second timeout
})
