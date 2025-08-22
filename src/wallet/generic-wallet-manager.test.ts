import { beforeEach, describe, expect, test as it } from "bun:test"
import { privateKeyToAccount } from "viem/accounts"
import { GenericWalletManager } from "./generic-wallet-manager.js"

describe("GenericWalletManager", () => {
  let manager: GenericWalletManager
  const testPrivateKey = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
  const invalidPrivateKey = "0xinvalid"
  const shortPrivateKey = "0x1234"

  beforeEach(() => {
    manager = new GenericWalletManager()
  })

  describe("importPrivateKey", () => {
    it("should import a valid private key", async () => {
      const address = await manager.importPrivateKey(testPrivateKey)
      expect(address).toBeDefined()
      expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/)
    })

    it("should throw error for invalid private key format", async () => {
      await expect(manager.importPrivateKey(invalidPrivateKey)).rejects.toThrow(
        "Invalid private key format",
      )
    })

    it("should throw error for private key without 0x prefix", async () => {
      const keyWithoutPrefix = testPrivateKey.slice(2)
      await expect(manager.importPrivateKey(keyWithoutPrefix)).rejects.toThrow(
        "Invalid private key format",
      )
    })

    it("should throw error for private key with wrong length", async () => {
      await expect(manager.importPrivateKey(shortPrivateKey)).rejects.toThrow(
        "Invalid private key format",
      )
    })

    it("should return the same address as viem's privateKeyToAccount", async () => {
      const address = await manager.importPrivateKey(testPrivateKey)
      const expectedAccount = privateKeyToAccount(testPrivateKey as `0x${string}`)
      expect(address).toBe(expectedAccount.address)
    })
  })

  describe("getAccount", () => {
    it("should return undefined when no wallet is imported", () => {
      expect(manager.getAccount()).toBeUndefined()
    })

    it("should return account after importing private key", async () => {
      await manager.importPrivateKey(testPrivateKey)
      const account = manager.getAccount()
      expect(account).toBeDefined()
      expect(account?.address).toMatch(/^0x[a-fA-F0-9]{40}$/)
    })
  })

  describe("getAddress", () => {
    it("should return undefined when no wallet is imported", () => {
      expect(manager.getAddress()).toBeUndefined()
    })

    it("should return address after importing private key", async () => {
      const importedAddress = await manager.importPrivateKey(testPrivateKey)
      const address = manager.getAddress()
      expect(address).toBe(importedAddress)
    })
  })

  describe("hasWallet", () => {
    it("should return false when no wallet is imported", () => {
      expect(manager.hasWallet()).toBe(false)
    })

    it("should return true after importing private key", async () => {
      await manager.importPrivateKey(testPrivateKey)
      expect(manager.hasWallet()).toBe(true)
    })

    it("should return false after clearing wallet", async () => {
      await manager.importPrivateKey(testPrivateKey)
      manager.clearWallet()
      expect(manager.hasWallet()).toBe(false)
    })
  })

  describe("signMessage", () => {
    it("should throw error when no wallet is imported", async () => {
      await expect(manager.signMessage("test message")).rejects.toThrow("No wallet imported")
    })

    it("should sign message after importing private key", async () => {
      await manager.importPrivateKey(testPrivateKey)
      const signature = await manager.signMessage("test message")
      expect(signature).toBeDefined()
      expect(signature).toMatch(/^0x[a-fA-F0-9]+$/)
    })

    it("should produce consistent signatures for the same message", async () => {
      await manager.importPrivateKey(testPrivateKey)
      const message = "consistent message"
      const signature1 = await manager.signMessage(message)
      const signature2 = await manager.signMessage(message)
      expect(signature1).toBe(signature2)
    })

    it("should produce different signatures for different messages", async () => {
      await manager.importPrivateKey(testPrivateKey)
      const signature1 = await manager.signMessage("message 1")
      const signature2 = await manager.signMessage("message 2")
      expect(signature1).not.toBe(signature2)
    })
  })

  describe("signTypedData", () => {
    const typedData = {
      domain: {
        name: "Test",
        version: "1",
        chainId: 1,
        verifyingContract: "0x0000000000000000000000000000000000000000",
      },
      types: {
        Message: [
          { name: "content", type: "string" },
          { name: "nonce", type: "uint256" },
        ],
      },
      primaryType: "Message",
      message: {
        content: "Hello",
        nonce: BigInt(1),
      },
    }

    it("should throw error when no wallet is imported", async () => {
      await expect(manager.signTypedData(typedData)).rejects.toThrow("No wallet imported")
    })

    it("should sign typed data after importing private key", async () => {
      await manager.importPrivateKey(testPrivateKey)
      const signature = await manager.signTypedData(typedData)
      expect(signature).toBeDefined()
      expect(signature).toMatch(/^0x[a-fA-F0-9]+$/)
    })

    it("should produce consistent signatures for the same typed data", async () => {
      await manager.importPrivateKey(testPrivateKey)
      const signature1 = await manager.signTypedData(typedData)
      const signature2 = await manager.signTypedData(typedData)
      expect(signature1).toBe(signature2)
    })

    it("should produce different signatures for different typed data", async () => {
      await manager.importPrivateKey(testPrivateKey)
      const signature1 = await manager.signTypedData(typedData)
      const modifiedData = {
        ...typedData,
        message: { ...typedData.message, nonce: BigInt(2) },
      }
      const signature2 = await manager.signTypedData(modifiedData)
      expect(signature1).not.toBe(signature2)
    })
  })

  describe("clearWallet", () => {
    it("should clear imported wallet", async () => {
      await manager.importPrivateKey(testPrivateKey)
      expect(manager.hasWallet()).toBe(true)

      manager.clearWallet()

      expect(manager.hasWallet()).toBe(false)
      expect(manager.getAccount()).toBeUndefined()
      expect(manager.getAddress()).toBeUndefined()
    })

    it("should not throw when clearing already empty wallet", () => {
      expect(() => manager.clearWallet()).not.toThrow()
    })

    it("should prevent signing after clearing", async () => {
      await manager.importPrivateKey(testPrivateKey)
      manager.clearWallet()

      await expect(manager.signMessage("test")).rejects.toThrow("No wallet imported")
      await expect(
        manager.signTypedData({
          domain: {},
          types: {},
          primaryType: "Test",
          message: {},
        }),
      ).rejects.toThrow("No wallet imported")
    })

    it("should allow reimporting after clearing", async () => {
      await manager.importPrivateKey(testPrivateKey)
      const firstAddress = manager.getAddress()

      manager.clearWallet()

      await manager.importPrivateKey(testPrivateKey)
      const secondAddress = manager.getAddress()

      expect(secondAddress).toBe(firstAddress)
    })
  })
})
