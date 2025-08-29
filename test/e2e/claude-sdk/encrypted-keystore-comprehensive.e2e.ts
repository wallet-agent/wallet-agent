import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import { cleanupKeystoreFiles, testEncryptedKeystorePrompt } from "./encrypted-keystore-setup.js"
import { validateResponseStructure } from "./helpers/validator.js"

// Test data
const TEST_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
const TEST_PRIVATE_KEY_2 = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
const TEST_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
const MASTER_PASSWORD = "test123456"
const NEW_PASSWORD = "newpass789"

describe("Comprehensive Encrypted Keystore E2E Tests", () => {
  beforeAll(async () => {
    console.log("🚀 Starting encrypted keystore e2e tests with storage enabled")
    await cleanupKeystoreFiles()
    // Add a small delay to ensure cleanup is complete
    await new Promise((resolve) => setTimeout(resolve, 1000))
  })

  afterAll(async () => {
    console.log("🧹 Cleaning up keystore test files")
    await cleanupKeystoreFiles()
  })

  describe("Core Keystore Operations", () => {
    test("should create encrypted keystore with master password", async () => {
      // Clean up first to ensure no existing keystore
      await cleanupKeystoreFiles()
      await new Promise((resolve) => setTimeout(resolve, 500))

      const result = await testEncryptedKeystorePrompt(
        `Create an encrypted keystore with master password "${MASTER_PASSWORD}"`,
        {
          toolsUsed: ["create_encrypted_keystore"],
          resultContains: ["created", "encrypted", "keystore", "master", "password"],
        },
      )

      expect(result.success).toBe(true)
      validateResponseStructure(result)
    }, 30000)

    test("should check keystore status after creation", async () => {
      const result = await testEncryptedKeystorePrompt("Show me the encrypted keystore status", {
        toolsUsed: ["get_keystore_status"],
        resultContains: ["keystore", "status", "unlocked"],
      })

      expect(result.success).toBe(true)
      validateResponseStructure(result)
    }, 20000)

    test("should lock the encrypted keystore", async () => {
      const result = await testEncryptedKeystorePrompt("Lock the encrypted keystore for security", {
        toolsUsed: ["lock_keystore"],
        resultContains: ["locked", "keystore", "security"],
      })

      expect(result.success).toBe(true)
      validateResponseStructure(result)
    }, 20000)

    test("should unlock keystore with correct master password", async () => {
      const result = await testEncryptedKeystorePrompt(
        `Unlock the encrypted keystore with master password "${MASTER_PASSWORD}"`,
        {
          toolsUsed: ["unlock_keystore"],
          resultContains: ["unlocked", "keystore", "master", "password"],
        },
      )

      expect(result.success).toBe(true)
      validateResponseStructure(result)
    }, 20000)

    test("should reject incorrect master password", async () => {
      // First lock the keystore
      await testEncryptedKeystorePrompt("Lock the encrypted keystore")

      const result = await testEncryptedKeystorePrompt(
        `Try to unlock keystore with wrong password "wrongpassword123"`,
        {
          errorExpected: true,
          errorMessage: "password",
        },
      )

      // Should fail with wrong password
      expect(result.success).toBe(false)
      expect(result.error?.toLowerCase()).toContain("password")
    }, 25000)
  })

  describe("Private Key Management", () => {
    test("should import private key into encrypted keystore", async () => {
      // Ensure keystore is unlocked first
      await testEncryptedKeystorePrompt(`Unlock keystore with password "${MASTER_PASSWORD}"`)

      const result = await testEncryptedKeystorePrompt(
        `Import private key ${TEST_PRIVATE_KEY} into encrypted keystore with master password "${MASTER_PASSWORD}" and label "Main Wallet"`,
        {
          toolsUsed: ["import_encrypted_private_key"],
          resultContains: ["imported", "private", "key", "encrypted", "keystore"],
        },
      )

      expect(result.success).toBe(true)
      validateResponseStructure(result)
    }, 30000)

    test("should import multiple private keys with different labels", async () => {
      const result = await testEncryptedKeystorePrompt(
        `Import private key ${TEST_PRIVATE_KEY_2} into encrypted keystore with master password "${MASTER_PASSWORD}" and label "Trading Wallet"`,
        {
          toolsUsed: ["import_encrypted_private_key"],
          resultContains: ["imported", "private", "key", "trading", "wallet"],
        },
      )

      expect(result.success).toBe(true)
      validateResponseStructure(result)
    }, 30000)

    test("should list all encrypted keys", async () => {
      const result = await testEncryptedKeystorePrompt(
        "Show me all keys stored in the encrypted keystore",
        {
          toolsUsed: ["list_encrypted_keys"],
          resultContains: ["keys", "encrypted", "keystore", "main", "wallet", "trading"],
        },
      )

      expect(result.success).toBe(true)
      expect(result.finalResult.toLowerCase()).toContain("main wallet")
      expect(result.finalResult.toLowerCase()).toContain("trading wallet")
      validateResponseStructure(result)
    }, 25000)

    test("should update key label", async () => {
      const result = await testEncryptedKeystorePrompt(
        `Update the label for address ${TEST_ADDRESS} to "Updated Main Wallet"`,
        {
          toolsUsed: ["update_key_label"],
          resultContains: ["updated", "label", "main", "wallet"],
        },
      )

      expect(result.success).toBe(true)
      validateResponseStructure(result)
    }, 25000)

    test("should verify label was updated", async () => {
      const result = await testEncryptedKeystorePrompt(
        "List all encrypted keys to verify the label update",
        {
          toolsUsed: ["list_encrypted_keys"],
          resultContains: ["updated", "main", "wallet"],
        },
      )

      expect(result.success).toBe(true)
      expect(result.finalResult.toLowerCase()).toContain("updated main wallet")
      validateResponseStructure(result)
    }, 20000)

    test("should remove a specific encrypted key", async () => {
      const result = await testEncryptedKeystorePrompt(
        `Remove the encrypted key for address ${TEST_ADDRESS} from the keystore`,
        {
          toolsUsed: ["remove_encrypted_key"],
          resultContains: ["removed", "encrypted", "key", "keystore"],
        },
      )

      expect(result.success).toBe(true)
      validateResponseStructure(result)
    }, 25000)

    test("should verify key was removed", async () => {
      const result = await testEncryptedKeystorePrompt(
        "List encrypted keys to confirm the key was removed",
        {
          toolsUsed: ["list_encrypted_keys"],
        },
      )

      expect(result.success).toBe(true)
      expect(result.finalResult.toLowerCase()).not.toContain("updated main wallet")
      validateResponseStructure(result)
    }, 20000)
  })

  describe("Advanced Security Operations", () => {
    test("should change master password", async () => {
      const result = await testEncryptedKeystorePrompt(
        `Change the keystore master password from "${MASTER_PASSWORD}" to "${NEW_PASSWORD}"`,
        {
          toolsUsed: ["change_keystore_password"],
          resultContains: ["changed", "master", "password", "keystore"],
        },
      )

      expect(result.success).toBe(true)
      validateResponseStructure(result)
    }, 30000)

    test("should verify new password works", async () => {
      // Lock the keystore first
      await testEncryptedKeystorePrompt("Lock the encrypted keystore")

      const result = await testEncryptedKeystorePrompt(
        `Unlock keystore with the new password "${NEW_PASSWORD}"`,
        {
          toolsUsed: ["unlock_keystore"],
          resultContains: ["unlocked", "keystore"],
        },
      )

      expect(result.success).toBe(true)
      validateResponseStructure(result)
    }, 25000)

    test("should reject old password after change", async () => {
      // Lock keystore
      await testEncryptedKeystorePrompt("Lock the keystore")

      const result = await testEncryptedKeystorePrompt(
        `Try to unlock with old password "${MASTER_PASSWORD}"`,
        {
          errorExpected: true,
        },
      )

      expect(result.success).toBe(false)
    }, 25000)
  })

  describe("Session Management", () => {
    test("should handle keystore lock/unlock cycle", async () => {
      // Ensure unlocked first
      await testEncryptedKeystorePrompt(`Unlock keystore with password "${NEW_PASSWORD}"`)

      // Import a key
      await testEncryptedKeystorePrompt(
        `Import private key ${TEST_PRIVATE_KEY} with password "${NEW_PASSWORD}" and label "Session Test"`,
      )

      // Lock keystore
      const lockResult = await testEncryptedKeystorePrompt("Lock the keystore for session test", {
        toolsUsed: ["lock_keystore"],
        resultContains: ["locked"],
      })
      expect(lockResult.success).toBe(true)

      // Try to use locked keystore (should fail)
      const lockedResult = await testEncryptedKeystorePrompt(
        "List encrypted keys while keystore is locked",
        {
          errorExpected: true,
        },
      )
      expect(lockedResult.success).toBe(false)

      // Unlock and use again
      const unlockResult = await testEncryptedKeystorePrompt(
        `Unlock keystore with password "${NEW_PASSWORD}"`,
        {
          toolsUsed: ["unlock_keystore"],
        },
      )
      expect(unlockResult.success).toBe(true)

      // Should work again
      const listResult = await testEncryptedKeystorePrompt(
        "Now list encrypted keys after unlocking",
        {
          toolsUsed: ["list_encrypted_keys"],
          resultContains: ["session", "test"],
        },
      )
      expect(listResult.success).toBe(true)
    }, 60000)

    test("should show correct keystore status throughout session", async () => {
      // Should be unlocked from previous test
      const unlockedStatus = await testEncryptedKeystorePrompt(
        "Check keystore status - should be unlocked",
        {
          toolsUsed: ["get_keystore_status"],
          resultContains: ["unlocked", "keystore"],
        },
      )
      expect(unlockedStatus.success).toBe(true)

      // Lock and check status
      await testEncryptedKeystorePrompt("Lock the keystore")

      const lockedStatus = await testEncryptedKeystorePrompt(
        "Check keystore status - should be locked",
        {
          toolsUsed: ["get_keystore_status"],
          resultContains: ["locked", "keystore"],
        },
      )
      expect(lockedStatus.success).toBe(true)
    }, 40000)
  })

  describe("Error Handling and Edge Cases", () => {
    test("should handle invalid private key format", async () => {
      // Ensure keystore is unlocked
      await testEncryptedKeystorePrompt(`Unlock keystore with password "${NEW_PASSWORD}"`)

      const result = await testEncryptedKeystorePrompt(
        `Try to import invalid private key "0xinvalidkey" into encrypted keystore with password "${NEW_PASSWORD}"`,
        {
          errorExpected: true,
          errorMessage: "invalid",
        },
      )

      expect(result.success).toBe(false)
      expect(result.error?.toLowerCase()).toMatch(/invalid|format/)
    }, 25000)

    test("should handle weak master password", async () => {
      // Clean up existing keystore first
      await cleanupKeystoreFiles()

      const result = await testEncryptedKeystorePrompt('Create keystore with weak password "123"', {
        errorExpected: true,
      })

      // Should reject weak password
      expect(result.success).toBe(false)
    }, 20000)

    test("should handle non-existent key removal", async () => {
      // Create new keystore for this test
      await testEncryptedKeystorePrompt(`Create keystore with password "${MASTER_PASSWORD}"`)

      const result = await testEncryptedKeystorePrompt(
        `Try to remove non-existent key with address "0x1234567890123456789012345678901234567890"`,
        {
          errorExpected: true,
        },
      )

      expect(result.success).toBe(false)
    }, 25000)
  })

  describe("Complete Workflow Integration", () => {
    test("should execute complete encrypted keystore workflow", async () => {
      // Clean slate
      await cleanupKeystoreFiles()

      // 1. Create keystore
      const createResult = await testEncryptedKeystorePrompt(
        `Create new encrypted keystore with master password "${MASTER_PASSWORD}"`,
      )
      expect(createResult.success).toBe(true)

      // 2. Import first key
      const import1Result = await testEncryptedKeystorePrompt(
        `Import private key ${TEST_PRIVATE_KEY} with password "${MASTER_PASSWORD}" and label "Primary Wallet"`,
      )
      expect(import1Result.success).toBe(true)

      // 3. Import second key
      const import2Result = await testEncryptedKeystorePrompt(
        `Import private key ${TEST_PRIVATE_KEY_2} with password "${MASTER_PASSWORD}" and label "Secondary Wallet"`,
      )
      expect(import2Result.success).toBe(true)

      // 4. List all keys
      const listResult = await testEncryptedKeystorePrompt("List all encrypted keys")
      expect(listResult.success).toBe(true)
      expect(listResult.finalResult.toLowerCase()).toContain("primary wallet")
      expect(listResult.finalResult.toLowerCase()).toContain("secondary wallet")

      // 5. Update a label
      const updateResult = await testEncryptedKeystorePrompt(
        `Update label for ${TEST_ADDRESS} to "Main Primary Wallet"`,
      )
      expect(updateResult.success).toBe(true)

      // 6. Change password
      const passwordResult = await testEncryptedKeystorePrompt(
        `Change master password from "${MASTER_PASSWORD}" to "${NEW_PASSWORD}"`,
      )
      expect(passwordResult.success).toBe(true)

      // 7. Lock keystore
      const lockResult = await testEncryptedKeystorePrompt("Lock the keystore")
      expect(lockResult.success).toBe(true)

      // 8. Unlock with new password
      const unlockResult = await testEncryptedKeystorePrompt(
        `Unlock keystore with new password "${NEW_PASSWORD}"`,
      )
      expect(unlockResult.success).toBe(true)

      // 9. Verify everything still works
      const finalListResult = await testEncryptedKeystorePrompt("List all keys to verify workflow")
      expect(finalListResult.success).toBe(true)
      expect(finalListResult.finalResult.toLowerCase()).toContain("main primary wallet")

      console.log("✅ Complete encrypted keystore workflow executed successfully!")
    }, 120000)
  })
})
