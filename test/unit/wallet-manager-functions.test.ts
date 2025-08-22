import { beforeEach, describe, expect, it } from "bun:test"
import { mainnet } from "viem/chains"
import { Container } from "../../src/container.js"
import {
  clearAllPrivateKeys,
  createPrivateKeyWalletClient,
  importPrivateKey,
  listImportedWallets,
} from "../../src/wallet-manager.js"

const TEST_PRIVATE_KEY_1 = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
const TEST_PRIVATE_KEY_2 = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"

describe("wallet-manager functions", () => {
  beforeEach(async () => {
    // Reset the container to ensure test isolation
    await Container.resetInstance()
  })
  describe("clearAllPrivateKeys", () => {
    it("should clear all imported private keys", () => {
      // First import some keys
      const testKey1 = TEST_PRIVATE_KEY_1
      const testKey2 = TEST_PRIVATE_KEY_2

      const address1 = importPrivateKey(testKey1)
      const address2 = importPrivateKey(testKey2)

      // Verify they're imported
      const beforeClear = listImportedWallets()
      expect(beforeClear.length).toBe(2)
      expect(beforeClear.some((w) => w.address === address1)).toBe(true)
      expect(beforeClear.some((w) => w.address === address2)).toBe(true)

      // Clear all keys
      clearAllPrivateKeys()

      // Verify they're all gone
      const afterClear = listImportedWallets()
      expect(afterClear.length).toBe(0)
    })

    it("should handle clearing when no keys are imported", () => {
      // Ensure no keys are imported
      clearAllPrivateKeys()

      expect(() => {
        clearAllPrivateKeys()
      }).not.toThrow()

      const wallets = listImportedWallets()
      expect(wallets.length).toBe(0)
    })
  })

  describe("createPrivateKeyWalletClient", () => {
    it("should create wallet client for imported private key", () => {
      // First import a key
      const testKey = TEST_PRIVATE_KEY_1
      const address = importPrivateKey(testKey)

      // Create wallet client
      const client = createPrivateKeyWalletClient(address, mainnet)

      expect(client).toBeDefined()
      expect(client.account?.address).toBe(address)
      expect(client.chain).toBe(mainnet)
    })

    it("should throw error for non-existent private key", () => {
      const nonExistentAddress = "0x9999999999999999999999999999999999999999" as const

      expect(() => {
        createPrivateKeyWalletClient(nonExistentAddress, mainnet)
      }).toThrow("No private key found for address")
    })

    it("should work with different chains", () => {
      // First import a key
      const testKey = TEST_PRIVATE_KEY_2
      const address = importPrivateKey(testKey)

      // Test with different chain
      const testChain = {
        id: 999,
        name: "Test Chain",
        nativeCurrency: { name: "Test", symbol: "TEST", decimals: 18 },
        rpcUrls: {
          default: { http: ["https://test.example.com"] },
        },
      } as const

      const client = createPrivateKeyWalletClient(address, testChain)

      expect(client.chain).toBe(testChain)
      expect(client.account?.address).toBe(address)
    })
  })
})
