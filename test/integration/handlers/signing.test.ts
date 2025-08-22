import { describe, expect, test } from "bun:test"
import {
  expectToolExecutionError,
  expectToolSuccess,
  expectToolValidationError,
  setupContainer,
  TEST_ADDRESS_1,
  TEST_PRIVATE_KEY,
} from "./setup.js"

describe("Signing Tools Integration", () => {
  setupContainer()

  describe("sign_message", () => {
    test("should sign a message with mock wallet", async () => {
      // Connect wallet first
      await expectToolSuccess("connect_wallet", { address: TEST_ADDRESS_1 })

      const { text } = await expectToolSuccess(
        "sign_message",
        { message: "Hello, Ethereum!" },
        "Message signed successfully",
      )

      expect(text).toContain("Signature: 0x")
      // Mock wallet returns a deterministic signature
      expect(text).toMatch(/Signature: 0x[a-fA-F0-9]{130}/)
    })

    test("should sign a message with private key wallet", async () => {
      // Import private key and switch to private key mode
      await expectToolSuccess("import_private_key", {
        privateKey: TEST_PRIVATE_KEY,
      })
      await expectToolSuccess("set_wallet_type", { type: "privateKey" })
      await expectToolSuccess("connect_wallet", { address: TEST_ADDRESS_1 })

      const { text } = await expectToolSuccess(
        "sign_message",
        { message: "Hello from private key!" },
        "Message signed successfully",
      )

      expect(text).toContain("Signature: 0x")
      expect(text).toMatch(/Signature: 0x[a-fA-F0-9]{130}/)
    })

    test("should validate message parameter", async () => {
      await expectToolValidationError("sign_message", {}, "Invalid input: expected string")
    })

    test("should require wallet connection", async () => {
      await expectToolExecutionError("sign_message", { message: "Test" }, "No wallet connected")
    })
  })

  describe("sign_typed_data", () => {
    const typedData = {
      domain: {
        name: "Test App",
        version: "1",
        chainId: 31337,
        verifyingContract: "0x0000000000000000000000000000000000000000",
      },
      types: {
        Message: [
          { name: "content", type: "string" },
          { name: "timestamp", type: "uint256" },
        ],
      },
      primaryType: "Message",
      message: {
        content: "Hello, typed data!",
        timestamp: 1234567890,
      },
    }

    test("should sign typed data with mock wallet", async () => {
      // Connect wallet first
      await expectToolSuccess("connect_wallet", { address: TEST_ADDRESS_1 })

      const { text } = await expectToolSuccess(
        "sign_typed_data",
        typedData,
        "Typed data signed successfully",
      )

      expect(text).toContain("Signature: 0x")
      expect(text).toMatch(/Signature: 0x[a-fA-F0-9]{130}/)
    })

    test("should sign typed data with private key wallet", async () => {
      // Import private key and switch to private key mode
      await expectToolSuccess("import_private_key", {
        privateKey: TEST_PRIVATE_KEY,
      })
      await expectToolSuccess("set_wallet_type", { type: "privateKey" })
      await expectToolSuccess("connect_wallet", { address: TEST_ADDRESS_1 })

      const { text } = await expectToolSuccess(
        "sign_typed_data",
        typedData,
        "Typed data signed successfully",
      )

      expect(text).toContain("Signature: 0x")
      expect(text).toMatch(/Signature: 0x[a-fA-F0-9]{130}/)
    })

    test("should validate required fields", async () => {
      await expectToolValidationError(
        "sign_typed_data",
        { domain: typedData.domain },
        "Invalid input: expected",
      )

      await expectToolValidationError(
        "sign_typed_data",
        { types: typedData.types, primaryType: typedData.primaryType },
        "Invalid input: expected record",
      )
    })

    test("should require wallet connection", async () => {
      await expectToolExecutionError("sign_typed_data", typedData, "No wallet connected")
    })

    test("should handle complex typed data", async () => {
      await expectToolSuccess("connect_wallet", { address: TEST_ADDRESS_1 })

      const complexTypedData = {
        domain: {
          name: "Complex App",
          version: "2",
          chainId: 31337,
          verifyingContract: "0x1234567890123456789012345678901234567890",
          salt: "0x1234567890123456789012345678901234567890123456789012345678901234",
        },
        types: {
          Person: [
            { name: "name", type: "string" },
            { name: "wallet", type: "address" },
          ],
          Mail: [
            { name: "from", type: "Person" },
            { name: "to", type: "Person" },
            { name: "contents", type: "string" },
            { name: "attachments", type: "bytes32[]" },
          ],
        },
        primaryType: "Mail",
        message: {
          from: {
            name: "Alice",
            wallet: TEST_ADDRESS_1,
          },
          to: {
            name: "Bob",
            wallet: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          },
          contents: "Hello Bob!",
          attachments: [
            "0x1234567890123456789012345678901234567890123456789012345678901234",
            "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd",
          ],
        },
      }

      const { text } = await expectToolSuccess(
        "sign_typed_data",
        complexTypedData,
        "Typed data signed successfully",
      )

      expect(text).toContain("Signature: 0x")
    })
  })
})
