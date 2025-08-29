import { describe, expect, test } from "bun:test"
import { spawn } from "bun"

describe("Direct MCP Server Test", () => {
  test("should start MCP server and respond to initialization", async () => {
    console.log("🔍 Testing MCP server directly via stdio")

    const server = spawn({
      cmd: ["bun", "run", "src/cli.ts"],
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

    if (server.stdin) {
      server.stdin.write(`${JSON.stringify(initMessage)}\n`)
      server.stdin.end()
    }

    // Read response
    let output = ""

    // Set timeout for response
    const timeout = new Promise<string>((resolve) => setTimeout(() => resolve(""), 5000))

    const readOutput = new Promise<string>((resolve, reject) => {
      ;(async () => {
        let data = ""
        if (server.stdout) {
          try {
            const reader = server.stdout.getReader()
            const decoder = new TextDecoder()

            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              const chunk = decoder.decode(value, { stream: true })
              data += chunk
              if (data.includes("\n")) {
                reader.releaseLock()
                resolve(data)
                return
              }
            }
            reader.releaseLock()
            resolve(data)
          } catch (error) {
            reject(error)
          }
        } else {
          resolve("")
        }
      })()
    })

    try {
      output = await Promise.race([readOutput, timeout])

      if (output) {
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
