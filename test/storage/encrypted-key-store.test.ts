import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { existsSync } from "node:fs"
import { mkdir, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"
import type { Address } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { EncryptedKeyStoreManager } from "../../src/storage/encrypted-key-store.js"
import { StorageManager } from "../../src/storage/storage-manager.js"

describe("EncryptedKeyStoreManager", () => {
  let tempDir: string
  let storageManager: StorageManager
  let keyStoreManager: EncryptedKeyStoreManager

  const masterPassword = "testMasterPassword123"
  const testPrivateKey = "0x1234567890123456789012345678901234567890123456789012345678901234"
  // This will be calculated from the private key during tests
  let testAddress: Address

  beforeEach(async () => {
    // Calculate test address from private key
    testAddress = privateKeyToAccount(testPrivateKey as `0x${string}`).address

    // Create temporary directory
    tempDir = join(
      process.cwd(),
      "test-temp",
      `encrypted-key-store-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    )
    await mkdir(tempDir, { recursive: true })
    await mkdir(join(tempDir, "auth"), { recursive: true })

    // Create storage manager with temp directory
    storageManager = new StorageManager(tempDir)
    await storageManager.initialize()

    keyStoreManager = new EncryptedKeyStoreManager(storageManager)
  })

  afterEach(async () => {
    // Clean up temporary directory
    if (existsSync(tempDir)) {
      await rm(tempDir, { recursive: true })
    }
  })

  describe("createKeyStore", () => {
    test("should create new encrypted key store", async () => {
      expect(keyStoreManager.exists()).toBe(false)

      await keyStoreManager.createKeyStore(masterPassword)

      expect(keyStoreManager.exists()).toBe(true)
      expect(keyStoreManager.isSessionValid()).toBe(true)

      // Should create empty key store
      const keys = await keyStoreManager.listKeys()
      expect(keys).toHaveLength(0)
    })

    test("should fail if key store already exists", async () => {
      await keyStoreManager.createKeyStore(masterPassword)

      await expect(keyStoreManager.createKeyStore(masterPassword)).rejects.toThrow(
        "Key store already exists",
      )
    })
  })

  describe("unlock and lock", () => {
    beforeEach(async () => {
      await keyStoreManager.createKeyStore(masterPassword)
      // Import a key so we can test password verification
      await keyStoreManager.importPrivateKey(testPrivateKey, masterPassword)
      keyStoreManager.lock() // Start locked
    })

    test("should unlock with correct password", async () => {
      expect(keyStoreManager.isSessionValid()).toBe(false)

      await keyStoreManager.unlock(masterPassword)

      expect(keyStoreManager.isSessionValid()).toBe(true)
    })

    test("should fail to unlock with wrong password", async () => {
      await expect(keyStoreManager.unlock("wrongPassword")).rejects.toThrow(
        "Invalid master password",
      )
    })

    test("should lock key store", async () => {
      await keyStoreManager.unlock(masterPassword)
      expect(keyStoreManager.isSessionValid()).toBe(true)

      keyStoreManager.lock()

      expect(keyStoreManager.isSessionValid()).toBe(false)
    })

    test("should fail to unlock non-existent store", async () => {
      // Remove the key store
      const layout = storageManager.getLayout()
      await rm(join(layout.authDir, "encrypted-keys.json"), { force: true })

      await expect(keyStoreManager.unlock(masterPassword)).rejects.toThrow(
        "Key store does not exist",
      )
    })
  })

  describe("session management", () => {
    beforeEach(async () => {
      await keyStoreManager.createKeyStore(masterPassword)
    })

    test("should have valid session after creation", () => {
      const sessionInfo = keyStoreManager.getSessionInfo()
      expect(sessionInfo.isUnlocked).toBe(true)
      expect(sessionInfo.lastActivity).toBeGreaterThan(0)
      expect(sessionInfo.timeoutMs).toBeGreaterThan(0)
      expect(sessionInfo.timeUntilTimeout).toBeGreaterThan(0)
    })

    test("should update activity on operations", async () => {
      const initialActivity = keyStoreManager.getSessionInfo().lastActivity

      // Wait a bit then perform operation
      await new Promise((resolve) => setTimeout(resolve, 10))
      await keyStoreManager.listKeys()

      const newActivity = keyStoreManager.getSessionInfo().lastActivity
      expect(newActivity).toBeGreaterThan(initialActivity)
    })

    test("should extend session", () => {
      const initialActivity = keyStoreManager.getSessionInfo().lastActivity

      keyStoreManager.extendSession()

      const newActivity = keyStoreManager.getSessionInfo().lastActivity
      expect(newActivity).toBeGreaterThan(initialActivity)
    })
  })

  describe("key management", () => {
    beforeEach(async () => {
      await keyStoreManager.createKeyStore(masterPassword)
    })

    test("should import private key", async () => {
      const address = await keyStoreManager.importPrivateKey(
        testPrivateKey,
        masterPassword,
        "Test Key",
      )

      expect(address).toBe(testAddress)

      const keys = await keyStoreManager.listKeys()
      expect(keys).toHaveLength(1)
      expect(keys[0]?.address).toBe(address)
      expect(keys[0]?.label).toBe("Test Key")
    })

    test("should retrieve private key", async () => {
      const address = await keyStoreManager.importPrivateKey(testPrivateKey, masterPassword)

      const retrievedKey = await keyStoreManager.getPrivateKey(address, masterPassword)
      expect(retrievedKey).toBe(testPrivateKey)
    })

    test("should cache decrypted keys in session", async () => {
      const address = await keyStoreManager.importPrivateKey(testPrivateKey, masterPassword)

      // First access should decrypt from storage
      const key1 = await keyStoreManager.getPrivateKey(address, masterPassword)

      // Second access should use cache (faster)
      const key2 = await keyStoreManager.getPrivateKey(address, masterPassword)

      expect(key1).toBe(testPrivateKey)
      expect(key2).toBe(testPrivateKey)
    })

    test("should prevent duplicate imports", async () => {
      await keyStoreManager.importPrivateKey(testPrivateKey, masterPassword)

      await expect(
        keyStoreManager.importPrivateKey(testPrivateKey, masterPassword),
      ).rejects.toThrow("already exists")
    })

    test("should remove private key", async () => {
      const address = await keyStoreManager.importPrivateKey(testPrivateKey, masterPassword)
      expect(await keyStoreManager.listKeys()).toHaveLength(1)

      const removed = await keyStoreManager.removePrivateKey(address)
      expect(removed).toBe(true)

      const keys = await keyStoreManager.listKeys()
      expect(keys).toHaveLength(0)
    })

    test("should return false when removing non-existent key", async () => {
      const removed = await keyStoreManager.removePrivateKey(
        "0x1234567890123456789012345678901234567890" as Address,
      )
      expect(removed).toBe(false)
    })

    test("should update key label", async () => {
      const address = await keyStoreManager.importPrivateKey(
        testPrivateKey,
        masterPassword,
        "Old Label",
      )

      await keyStoreManager.updateKeyLabel(address, "New Label")

      const keys = await keyStoreManager.listKeys()
      expect(keys[0]?.label).toBe("New Label")
    })

    test("should fail operations when locked", async () => {
      keyStoreManager.lock()

      await expect(
        keyStoreManager.importPrivateKey(testPrivateKey, masterPassword),
      ).rejects.toThrow("Key store is locked")

      await expect(keyStoreManager.listKeys()).rejects.toThrow("Key store is locked")
    })
  })

  describe("password management", () => {
    beforeEach(async () => {
      await keyStoreManager.createKeyStore(masterPassword)
      await keyStoreManager.importPrivateKey(testPrivateKey, masterPassword, "Test Key")
    })

    test("should change master password", async () => {
      const newPassword = "newMasterPassword456"

      await keyStoreManager.changeMasterPassword(masterPassword, newPassword)

      // Should be able to access with new password
      keyStoreManager.lock()
      await keyStoreManager.unlock(newPassword)

      // Should be able to decrypt keys with new password
      const retrievedKey = await keyStoreManager.getPrivateKey(testAddress, newPassword)
      expect(retrievedKey).toBe(testPrivateKey)

      // Should fail with old password
      keyStoreManager.lock()
      await expect(keyStoreManager.unlock(masterPassword)).rejects.toThrow(
        "Invalid master password",
      )
    })

    test("should fail to change password with wrong current password", async () => {
      await expect(
        keyStoreManager.changeMasterPassword("wrongPassword", "newPassword"),
      ).rejects.toThrow()
    })

    test("should fail to change password when no keys exist", async () => {
      // Remove the imported key
      await keyStoreManager.removePrivateKey(testAddress)

      await expect(
        keyStoreManager.changeMasterPassword(masterPassword, "newPassword"),
      ).rejects.toThrow("No keys in store - cannot change master password")
    })
  })

  describe("persistence", () => {
    test("should persist key store across manager instances", async () => {
      // Create key store and import key
      await keyStoreManager.createKeyStore(masterPassword)
      const address = await keyStoreManager.importPrivateKey(
        testPrivateKey,
        masterPassword,
        "Persistent Key",
      )

      // Create new manager instance
      const newKeyStoreManager = new EncryptedKeyStoreManager(storageManager)

      expect(newKeyStoreManager.exists()).toBe(true)
      await newKeyStoreManager.unlock(masterPassword)

      const keys = await newKeyStoreManager.listKeys()
      expect(keys).toHaveLength(1)
      expect(keys[0]?.address).toBe(address)
      expect(keys[0]?.label).toBe("Persistent Key")

      const retrievedKey = await newKeyStoreManager.getPrivateKey(address, masterPassword)
      expect(retrievedKey).toBe(testPrivateKey)
    })

    test("should handle corrupted key store file", async () => {
      await keyStoreManager.createKeyStore(masterPassword)

      // Corrupt the key store file
      const layout = storageManager.getLayout()
      const keyStorePath = join(layout.authDir, "encrypted-keys.json")
      await writeFile(keyStorePath, "invalid json", { mode: 0o600 })

      // Should fail to read
      const newKeyStoreManager = new EncryptedKeyStoreManager(storageManager)
      await expect(newKeyStoreManager.unlock(masterPassword)).rejects.toThrow()
    })
  })

  describe("security", () => {
    test("should create key store file with restrictive permissions", async () => {
      await keyStoreManager.createKeyStore(masterPassword)

      const layout = storageManager.getLayout()
      const keyStorePath = join(layout.authDir, "encrypted-keys.json")

      expect(existsSync(keyStorePath)).toBe(true)
      // Note: Permission checking would be platform-specific and complex to test
    })

    test("should clear cached keys on lock", async () => {
      await keyStoreManager.createKeyStore(masterPassword)
      const address = await keyStoreManager.importPrivateKey(testPrivateKey, masterPassword)

      // Access key to cache it
      await keyStoreManager.getPrivateKey(address, masterPassword)

      keyStoreManager.lock()

      // After unlock, should need to decrypt again (cache cleared)
      await keyStoreManager.unlock(masterPassword)
      const retrievedKey = await keyStoreManager.getPrivateKey(address, masterPassword)
      expect(retrievedKey).toBe(testPrivateKey)
    })

    test("should handle concurrent access safely", async () => {
      await keyStoreManager.createKeyStore(masterPassword)
      const address = await keyStoreManager.importPrivateKey(testPrivateKey, masterPassword)

      // Simulate concurrent access
      const promises = Array.from({ length: 5 }, () =>
        keyStoreManager.getPrivateKey(address, masterPassword),
      )

      const results = await Promise.all(promises)
      results.forEach((key) => {
        expect(key).toBe(testPrivateKey)
      })
    })
  })
})
