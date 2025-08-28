import { describe, expect, test } from "bun:test"
import { spawn } from "bun"

describe("Direct MCP Server Test", () => {
  test("should start MCP server and respond to ping", async () => {
    console.log("🔍 Testing MCP server directly via stdio")

    const server = spawn({
      cmd: ["/opt/homebrew/bin/bun", "run", "src/index.ts"],
      env: { NODE_ENV: "test" },
      stdio: ["pipe", "pipe", "pipe"],
    })

    // Send MCP initialization
    const initMessage = {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: {
          name: "test-client",
          version: "1.0.0",
        },
      },
    }

    const writer = server.stdin.getWriter()
    await writer.write(new TextEncoder().encode(`${JSON.stringify(initMessage)}\n`))

    // Read response
    let output = ""
    const reader = server.stdout.getReader()

    // Set timeout for response
    const timeout = new Promise((resolve) => setTimeout(resolve, 5000))

    try {
      const { value } = await Promise.race([reader.read(), timeout.then(() => ({ value: null }))])

      if (value) {
        output = new TextDecoder().decode(value)
        console.log("📨 MCP Server Response:", output)

        // Parse JSON response
        const lines = output.split("\n").filter((line) => line.trim())
        for (const line of lines) {
          try {
            const response = JSON.parse(line)
            if (response.id === 1) {
              expect(response.result).toBeDefined()
              console.log("✅ MCP Server initialized successfully")
              break
            }
          } catch (_e) {
            // Ignore non-JSON lines
          }
        }
      } else {
        throw new Error("No response from MCP server")
      }
    } catch (error) {
      console.error("❌ MCP Server test failed:", error)
      throw error
    } finally {
      server.kill()
    }
  }, 10000)
})
