import { describe, expect, test } from "bun:test"
import {
  expectToolExecutionError,
  expectToolSuccess,
  expectToolValidationError,
  setupContainer,
  TEST_ADDRESS_1,
  TEST_ADDRESS_2,
} from "./setup.js"

describe("Wallet Connection Tools Integration", () => {
  setupContainer()

  describe("connect_wallet", () => {
    test("should connect to a valid mock wallet address", async () => {
      const { text } = await expectToolSuccess(
        "connect_wallet",
        { address: TEST_ADDRESS_1 },
        /Connected to wallet: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266/,
      )
      expect(text).toContain("Chain: 31337") // Anvil chain ID
    })

    test("should validate address format", async () => {
      await expectToolValidationError(
        "connect_wallet",
        { address: "invalid-address" },
        "Invalid Ethereum address format",
      )
    })

    test("should validate address exists in mock accounts", async () => {
      await expectToolExecutionError(
        "connect_wallet",
        { address: "0x0000000000000000000000000000000000000000" },
        "is not in the list of available mock accounts",
      )
    })

    test("should reject missing address parameter", async () => {
      await expectToolValidationError("connect_wallet", {}, "expected string, received undefined")
    })
  })

  describe("disconnect_wallet", () => {
    test("should disconnect a connected wallet", async () => {
      // First connect
      await expectToolSuccess("connect_wallet", { address: TEST_ADDRESS_1 })

      // Then disconnect
      const { text } = await expectToolSuccess(
        "disconnect_wallet",
        undefined,
        "Wallet disconnected",
      )
      expect(text).toBe("Wallet disconnected")

      // Verify disconnected
      const { text: statusText } = await expectToolSuccess(
        "get_current_account",
        undefined,
        "No wallet connected",
      )
      expect(statusText).toBe("No wallet connected")
    })

    test("should handle disconnecting when no wallet connected", async () => {
      const { text } = await expectToolSuccess(
        "disconnect_wallet",
        undefined,
        "Wallet disconnected",
      )
      expect(text).toBe("Wallet disconnected")
    })
  })

  describe("get_accounts", () => {
    test("should list all available mock accounts", async () => {
      const { text } = await expectToolSuccess(
        "get_accounts",
        undefined,
        "Available mock accounts:",
      )

      // Should contain both test addresses
      expect(text).toContain(TEST_ADDRESS_1)
      expect(text).toContain(TEST_ADDRESS_2)
      expect(text).toContain("0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC")
    })
  })

  describe("get_current_account", () => {
    test("should show connected account details", async () => {
      // Connect first
      await expectToolSuccess("connect_wallet", { address: TEST_ADDRESS_1 })

      const { text } = await expectToolSuccess(
        "get_current_account",
        undefined,
        /Connected: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266/,
      )

      expect(text).toContain("Chain ID: 31337")
      expect(text).toContain("Connector: Mock Connector")
    })

    test("should show not connected when no wallet", async () => {
      const { text } = await expectToolSuccess(
        "get_current_account",
        undefined,
        "No wallet connected",
      )
      expect(text).toBe("No wallet connected")
    })
  })

  describe("get_balance", () => {
    test("should get balance of connected wallet", async () => {
      // Connect first
      await expectToolSuccess("connect_wallet", { address: TEST_ADDRESS_1 })

      const { text } = await expectToolSuccess("get_balance", undefined, /Balance: \d+(\.\d+)? ETH/)
      expect(text).toMatch(/Balance: \d+(\.\d+)? ETH/)
    })

    test("should get balance of specific address", async () => {
      const { text } = await expectToolSuccess(
        "get_balance",
        { address: TEST_ADDRESS_2 },
        /Balance: \d+(\.\d+)? ETH/,
      )
      expect(text).toMatch(/Balance: \d+(\.\d+)? ETH/)
    })

    test("should validate address format", async () => {
      await expectToolValidationError(
        "get_balance",
        { address: "not-an-address" },
        "Invalid Ethereum address format",
      )
    })

    test("should require wallet connection when no address provided", async () => {
      await expectToolExecutionError(
        "get_balance",
        undefined,
        "No address provided and no wallet connected",
      )
    })
  })

  describe("get_wallet_info", () => {
    test("should show mock wallet info by default", async () => {
      const { text } = await expectToolSuccess(
        "get_wallet_info",
        undefined,
        "Current wallet configuration:",
      )

      expect(text).toContain("Type: mock")
      expect(text).toContain("Available addresses: 3") // Default mock accounts
      expect(text).toContain(TEST_ADDRESS_1)
    })

    test("should show private key wallet info when switched", async () => {
      // Import a private key
      await expectToolSuccess("import_private_key", {
        privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
      })

      // Switch to private key mode
      await expectToolSuccess("set_wallet_type", { type: "privateKey" })

      const { text } = await expectToolSuccess(
        "get_wallet_info",
        undefined,
        "Current wallet configuration:",
      )

      expect(text).toContain("Type: privateKey")
      expect(text).toContain("Available addresses: 1")
      expect(text).toContain(TEST_ADDRESS_1)
    })
  })
})
