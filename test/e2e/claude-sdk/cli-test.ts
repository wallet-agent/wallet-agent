import { test, describe } from "bun:test"
import { testPrompt } from "./setup.js"

describe("CLI-based Claude Code Testing", () => {
  test("should connect to wallet via CLI", async () => {
    const result = await testPrompt(
      "Connect to wallet 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      {
        toolsUsed: ["connect_wallet"],
        resultContains: ["connected", "wallet"]
      }
    )

    console.log("CLI Test Result:", result)
  }, 45000) // 45 second timeout

  test("should get available accounts", async () => {
    const result = await testPrompt(
      "What wallet accounts are available?",
      {
        toolsUsed: ["get_accounts"],
        resultContains: ["accounts", "available"]
      }
    )

    console.log("Accounts Test Result:", result)
  }, 45000)
})