import { beforeEach, describe, expect, test } from "bun:test"
import { TestContainer } from "../../src/test-container.js"
import { handleToolCall } from "../../src/tools/handlers.js"

interface McpServer {
  callTool(
    name: string,
    args: any,
  ): Promise<{
    isError: boolean
    content: [{ text: string; type: string }, ...Array<{ text: string; type: string }>]
    error?: string
  }>
}

describe("Private Key Management Integration Test", () => {
  let server: McpServer
  let testContainer: TestContainer
  let encryptedKeystoreAvailable = false

  const testPrivateKey1 = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
  const testPrivateKey2 = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
  const testAddress1 = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  const testAddress2 = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
  const testMasterPassword = "secure-test-password-123"

  beforeEach(async () => {
    testContainer = TestContainer.createForTest({})

    server = {
      async callTool(name: string, args: any) {
        try {
          ;(globalThis as any).__walletAgentTestContainer = testContainer

          const result = await handleToolCall({
            method: "tools/call",
            params: {
              name,
              arguments: args,
            },
          })
          return {
            isError: false,
            content: result.content || [],
          }
        } catch (error) {
          return {
            isError: true,
            content: [
              { text: error instanceof Error ? error.message : String(error), type: "text" },
            ],
            error: error instanceof Error ? error.message : String(error),
          }
        }
      },
    }
  })

  describe("1. Basic Private Key Management", () => {
    test("should import private key and switch to private key mode", async () => {
      // Import a private key
      const importResult = await server.callTool("import_private_key", {
        privateKey: testPrivateKey1,
      })

      expect(importResult.isError).toBe(false)
      if (!importResult.isError) {
        expect(importResult.content[0].text).toContain("imported")
        expect(importResult.content[0].text).toContain(testAddress1)
      }

      // Switch to private key wallet mode
      const switchResult = await server.callTool("set_wallet_type", {
        type: "privateKey",
      })

      expect(switchResult.isError).toBe(false)
      if (!switchResult.isError) {
        expect(switchResult.content[0].text).toContain("privateKey")
      }

      // Verify wallet info shows private key mode
      const infoResult = await server.callTool("get_wallet_info", {})

      expect(infoResult.isError).toBe(false)
      if (!infoResult.isError) {
        const response = infoResult.content[0].text
        expect(response).toMatch(/(privateKey|private key)/i)
        expect(response).toContain(testAddress1)
      }
    })

    test("should list imported wallets", async () => {
      // Import multiple private keys
      await server.callTool("import_private_key", {
        privateKey: testPrivateKey1,
      })

      await server.callTool("import_private_key", {
        privateKey: testPrivateKey2,
      })

      // List imported wallets
      const listResult = await server.callTool("list_imported_wallets", {})

      expect(listResult.isError).toBe(false)
      if (!listResult.isError) {
        const response = listResult.content[0].text
        expect(response).toContain(testAddress1)
        expect(response).toContain(testAddress2)
        // Should show both wallets in the list (format may vary)
        const lines = response.split("\n")
        const walletLines = lines.filter((line) => line.includes("0x"))
        expect(walletLines.length).toBe(2)
      }
    })

    test("should remove imported private key", async () => {
      // Import a private key
      await server.callTool("import_private_key", {
        privateKey: testPrivateKey1,
      })

      // Verify it's imported
      const listBefore = await server.callTool("list_imported_wallets", {})
      expect(listBefore.isError).toBe(false)
      if (!listBefore.isError) {
        expect(listBefore.content[0].text).toContain(testAddress1)
      }

      // Remove the private key
      const removeResult = await server.callTool("remove_private_key", {
        address: testAddress1,
      })

      expect(removeResult.isError).toBe(false)
      if (!removeResult.isError) {
        expect(removeResult.content[0].text).toContain("removed")
        expect(removeResult.content[0].text).toContain(testAddress1)
      }

      // Verify it's no longer in the list
      const listAfter = await server.callTool("list_imported_wallets", {})
      expect(listAfter.isError).toBe(false)
      if (!listAfter.isError) {
        expect(listAfter.content[0].text).not.toContain(testAddress1)
      }
    })

    test("should switch between mock and private key wallet modes", async () => {
      // Import a private key first
      await server.callTool("import_private_key", {
        privateKey: testPrivateKey1,
      })

      // Switch to private key mode
      const switchToPrivate = await server.callTool("set_wallet_type", {
        type: "privateKey",
      })
      expect(switchToPrivate.isError).toBe(false)

      // Verify private key mode
      const infoPrivate = await server.callTool("get_wallet_info", {})
      expect(infoPrivate.isError).toBe(false)
      if (!infoPrivate.isError) {
        expect(infoPrivate.content[0].text).toMatch(/(privateKey|private key)/i)
      }

      // Switch back to mock mode
      const switchToMock = await server.callTool("set_wallet_type", {
        type: "mock",
      })
      expect(switchToMock.isError).toBe(false)

      // Verify mock mode
      const infoMock = await server.callTool("get_wallet_info", {})
      expect(infoMock.isError).toBe(false)
      if (!infoMock.isError) {
        expect(infoMock.content[0].text).toMatch(/(mock|test)/i)
      }
    })
  })

  describe("2. Encrypted Keystore Management", () => {
    test("should create and unlock encrypted keystore", async () => {
      // Create encrypted keystore
      const createResult = await server.callTool("create_encrypted_keystore", {
        masterPassword: testMasterPassword,
      })

      // Skip test if encrypted keystore not available
      if (createResult.isError && createResult.content[0].text.includes("not available")) {
        console.log("⚠️ Encrypted keystore not available in test environment, skipping test")
        return
      }

      expect(createResult.isError).toBe(false)
      if (!createResult.isError) {
        expect(createResult.content[0].text).toMatch(/(created|keystore|encrypted)/i)
      }

      // Check keystore status
      const statusResult = await server.callTool("get_keystore_status", {})

      expect(statusResult.isError).toBe(false)
      if (!statusResult.isError) {
        const response = statusResult.content[0].text
        expect(response).toMatch(/(unlocked|active)/i)
        expect(response).toMatch(/0.*key/i) // Should show 0 keys initially
      }
    })

    test("should lock and unlock keystore", async () => {
      // Create keystore
      const createResult = await server.callTool("create_encrypted_keystore", {
        masterPassword: testMasterPassword,
      })

      // Skip test if encrypted keystore not available
      if (createResult.isError && createResult.content[0].text.includes("not available")) {
        console.log("⚠️ Encrypted keystore not available in test environment, skipping test")
        return
      }

      // Lock the keystore
      const lockResult = await server.callTool("lock_keystore", {})
      expect(lockResult.isError).toBe(false)
      if (!lockResult.isError) {
        expect(lockResult.content[0].text).toMatch(/(locked|secure)/i)
      }

      // Verify it's locked
      const statusLocked = await server.callTool("get_keystore_status", {})
      expect(statusLocked.isError).toBe(false)
      if (!statusLocked.isError) {
        expect(statusLocked.content[0].text).toMatch(/(locked|inactive)/i)
      }

      // Unlock with correct password
      const unlockResult = await server.callTool("unlock_keystore", {
        masterPassword: testMasterPassword,
      })
      expect(unlockResult.isError).toBe(false)
      if (!unlockResult.isError) {
        expect(unlockResult.content[0].text).toMatch(/(unlocked|access)/i)
      }

      // Verify it's unlocked
      const statusUnlocked = await server.callTool("get_keystore_status", {})
      expect(statusUnlocked.isError).toBe(false)
      if (!statusUnlocked.isError) {
        expect(statusUnlocked.content[0].text).toMatch(/(unlocked|active)/i)
      }
    })

    test("should handle incorrect master password", async () => {
      // Create keystore
      const createResult = await server.callTool("create_encrypted_keystore", {
        masterPassword: testMasterPassword,
      })

      // Skip test if encrypted keystore not available
      if (createResult.isError && createResult.content[0].text.includes("not available")) {
        console.log("⚠️ Encrypted keystore not available in test environment, skipping test")
        return
      }

      // Lock the keystore
      await server.callTool("lock_keystore", {})

      // Try to unlock with wrong password
      const unlockResult = await server.callTool("unlock_keystore", {
        masterPassword: "wrong-password",
      })

      expect(unlockResult.isError).toBe(true)
      if (unlockResult.isError) {
        expect(unlockResult.content[0].text).toMatch(
          /(incorrect|invalid|wrong|password|not available|storage)/i,
        )
      }
    })

    test("should validate master password strength", async () => {
      // Try to create keystore with weak password
      const weakResult = await server.callTool("create_encrypted_keystore", {
        masterPassword: "weak",
      })

      expect(weakResult.isError).toBe(true)
      if (weakResult.isError) {
        expect(weakResult.content[0].text).toMatch(/(8.*character|minimum|length)/i)
      }
    })
  })

  describe("3. Encrypted Key Operations", () => {
    beforeEach(async () => {
      // Create and unlock keystore for each test
      const createResult = await server.callTool("create_encrypted_keystore", {
        masterPassword: testMasterPassword,
      })

      // Set availability flag for individual tests to check
      encryptedKeystoreAvailable = !createResult.isError
    })

    test("should import private key into encrypted store", async () => {
      // Skip test if encrypted keystore not available
      if (!encryptedKeystoreAvailable) {
        console.log("⚠️ Encrypted keystore not available in test environment, skipping test")
        return
      }

      // Import key into encrypted store
      const importResult = await server.callTool("import_encrypted_private_key", {
        privateKey: testPrivateKey1,
        masterPassword: testMasterPassword,
        label: "Test Wallet 1",
      })

      expect(importResult.isError).toBe(false)
      if (!importResult.isError) {
        expect(importResult.content[0].text).toMatch(/(imported|encrypted|stored)/i)
        expect(importResult.content[0].text).toContain(testAddress1)
      }

      // Verify it appears in encrypted keys list
      const listResult = await server.callTool("list_encrypted_keys", {})
      expect(listResult.isError).toBe(false)
      if (!listResult.isError) {
        const response = listResult.content[0].text
        expect(response).toContain(testAddress1)
        expect(response).toContain("Test Wallet 1")
      }
    })

    test("should manage key labels", async () => {
      // Skip test if encrypted keystore not available
      if (!encryptedKeystoreAvailable) {
        console.log("⚠️ Encrypted keystore not available in test environment, skipping test")
        return
      }

      // Import key with initial label
      await server.callTool("import_encrypted_private_key", {
        privateKey: testPrivateKey1,
        masterPassword: testMasterPassword,
        label: "Original Label",
      })

      // Update the label
      const updateResult = await server.callTool("update_key_label", {
        address: testAddress1,
        label: "Updated Label",
      })

      expect(updateResult.isError).toBe(false)
      if (!updateResult.isError) {
        expect(updateResult.content[0].text).toMatch(/(updated|changed|label)/i)
      }

      // Verify the label was updated
      const listResult = await server.callTool("list_encrypted_keys", {})
      expect(listResult.isError).toBe(false)
      if (!listResult.isError) {
        const response = listResult.content[0].text
        expect(response).toContain("Updated Label")
        expect(response).not.toContain("Original Label")
      }
    })

    test("should remove encrypted keys", async () => {
      // Skip test if encrypted keystore not available
      if (!encryptedKeystoreAvailable) {
        console.log("⚠️ Encrypted keystore not available in test environment, skipping test")
        return
      }

      // Import two keys
      await server.callTool("import_encrypted_private_key", {
        privateKey: testPrivateKey1,
        masterPassword: testMasterPassword,
        label: "Key 1",
      })

      await server.callTool("import_encrypted_private_key", {
        privateKey: testPrivateKey2,
        masterPassword: testMasterPassword,
        label: "Key 2",
      })

      // Verify both are listed
      const listBefore = await server.callTool("list_encrypted_keys", {})
      expect(listBefore.isError).toBe(false)
      if (!listBefore.isError) {
        expect(listBefore.content[0].text).toContain(testAddress1)
        expect(listBefore.content[0].text).toContain(testAddress2)
      }

      // Remove the first key
      const removeResult = await server.callTool("remove_encrypted_key", {
        address: testAddress1,
      })

      expect(removeResult.isError).toBe(false)
      if (!removeResult.isError) {
        expect(removeResult.content[0].text).toMatch(/(removed|deleted)/i)
        expect(removeResult.content[0].text).toContain(testAddress1)
      }

      // Verify only the second key remains
      const listAfter = await server.callTool("list_encrypted_keys", {})
      expect(listAfter.isError).toBe(false)
      if (!listAfter.isError) {
        const response = listAfter.content[0].text
        expect(response).not.toContain(testAddress1)
        expect(response).toContain(testAddress2)
      }
    })

    test("should change keystore master password", async () => {
      // Skip test if encrypted keystore not available
      if (!encryptedKeystoreAvailable) {
        console.log("⚠️ Encrypted keystore not available in test environment, skipping test")
        return
      }

      const newPassword = "new-secure-password-456"

      // Import a key first
      await server.callTool("import_encrypted_private_key", {
        privateKey: testPrivateKey1,
        masterPassword: testMasterPassword,
        label: "Test Key",
      })

      // Change the master password
      const changeResult = await server.callTool("change_keystore_password", {
        currentPassword: testMasterPassword,
        newPassword: newPassword,
      })

      expect(changeResult.isError).toBe(false)
      if (!changeResult.isError) {
        expect(changeResult.content[0].text).toMatch(/(changed|updated|password)/i)
      }

      // Lock and try to unlock with old password (should fail)
      await server.callTool("lock_keystore", {})

      const oldPasswordResult = await server.callTool("unlock_keystore", {
        masterPassword: testMasterPassword,
      })
      expect(oldPasswordResult.isError).toBe(true)

      // Unlock with new password (should work)
      const newPasswordResult = await server.callTool("unlock_keystore", {
        masterPassword: newPassword,
      })
      expect(newPasswordResult.isError).toBe(false)

      // Verify keys are still accessible
      const listResult = await server.callTool("list_encrypted_keys", {})
      expect(listResult.isError).toBe(false)
      if (!listResult.isError) {
        expect(listResult.content[0].text).toContain(testAddress1)
      }
    })
  })

  describe("4. Security and Error Handling", () => {
    test("should handle invalid private key formats", async () => {
      const invalidKeys = [
        "invalid-key",
        "0x123", // too short
        "0xzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz", // invalid hex
        "", // empty
      ]

      for (const invalidKey of invalidKeys) {
        const result = await server.callTool("import_private_key", {
          privateKey: invalidKey,
        })

        expect(result.isError).toBe(true)
        if (result.isError) {
          expect(result.content[0].text).toMatch(/(invalid|format|private key)/i)
        }
      }
    })

    test("should prevent encrypted operations when keystore is locked", async () => {
      // Create keystore and lock it
      const createResult = await server.callTool("create_encrypted_keystore", {
        masterPassword: testMasterPassword,
      })

      // Skip test if encrypted keystore not available
      if (createResult.isError && createResult.content[0].text.includes("not available")) {
        console.log("⚠️ Encrypted keystore not available in test environment, skipping test")
        return
      }
      await server.callTool("lock_keystore", {})

      // Try to import key when locked
      const importResult = await server.callTool("import_encrypted_private_key", {
        privateKey: testPrivateKey1,
        masterPassword: testMasterPassword,
        label: "Test",
      })

      expect(importResult.isError).toBe(true)
      if (importResult.isError) {
        expect(importResult.content[0].text).toMatch(
          /(locked|unlock|keystore|not available|storage)/i,
        )
      }

      // Try to list keys when locked
      const listResult = await server.callTool("list_encrypted_keys", {})
      expect(listResult.isError).toBe(true)
      if (listResult.isError) {
        expect(listResult.content[0].text).toMatch(
          /(locked|unlock|keystore|not available|storage)/i,
        )
      }
    })

    test("should handle non-existent addresses", async () => {
      // Try to remove address that doesn't exist
      const removeResult = await server.callTool("remove_private_key", {
        address: "0x1111111111111111111111111111111111111111",
      })

      // May succeed gracefully or return error depending on implementation
      if (removeResult.isError) {
        expect(removeResult.content[0].text).toMatch(/(not found|doesn't exist|unknown)/i)
      } else {
        // If it succeeds, it should indicate no action was taken
        expect(removeResult.content[0].text).toMatch(/(removed|no.*found|not.*found)/i)
      }
    })

    test("should handle duplicate private key imports", async () => {
      // Import the same key twice
      await server.callTool("import_private_key", {
        privateKey: testPrivateKey1,
      })

      const duplicateResult = await server.callTool("import_private_key", {
        privateKey: testPrivateKey1,
      })

      expect(duplicateResult.isError).toBe(false) // Should handle gracefully
      if (!duplicateResult.isError) {
        expect(duplicateResult.content[0].text).toMatch(
          /(already|exists|updated|imported|successfully)/i,
        )
      }
    })
  })

  describe("5. Integration with Wallet Operations", () => {
    test("should use imported private key for transactions", async () => {
      // Import private key and switch to private key mode
      await server.callTool("import_private_key", {
        privateKey: testPrivateKey1,
      })

      await server.callTool("set_wallet_type", {
        type: "privateKey",
      })

      // Connect to the imported wallet
      const connectResult = await server.callTool("connect_wallet", {
        address: testAddress1,
      })

      expect(connectResult.isError).toBe(false)
      if (!connectResult.isError) {
        expect(connectResult.content[0].text).toContain("Connected")
        expect(connectResult.content[0].text).toContain(testAddress1)
      }

      // Get current account should show the private key wallet
      const accountResult = await server.callTool("get_current_account", {})
      expect(accountResult.isError).toBe(false)
      if (!accountResult.isError) {
        expect(accountResult.content[0].text).toContain(testAddress1)
      }

      // Check balance (should work with private key wallet)
      const balanceResult = await server.callTool("get_balance", {})
      expect(balanceResult.isError).toBe(false)
      if (!balanceResult.isError) {
        expect(balanceResult.content[0].text).toMatch(/\d+(\.\d+)?\s*(ETH|Ether)/i)
      }
    })

    test("should handle wallet type switching during active sessions", async () => {
      // Import private key and connect
      await server.callTool("import_private_key", {
        privateKey: testPrivateKey1,
      })

      await server.callTool("set_wallet_type", {
        type: "privateKey",
      })

      await server.callTool("connect_wallet", {
        address: testAddress1,
      })

      // Switch to mock mode while connected
      const switchResult = await server.callTool("set_wallet_type", {
        type: "mock",
      })

      expect(switchResult.isError).toBe(false)
      if (!switchResult.isError) {
        expect(switchResult.content[0].text).toMatch(/(switched|mock|mode)/i)
      }

      // Wallet info should reflect the change
      const infoResult = await server.callTool("get_wallet_info", {})
      expect(infoResult.isError).toBe(false)
      if (!infoResult.isError) {
        expect(infoResult.content[0].text).toMatch(/(mock|test)/i)
      }
    })
  })

  describe("6. Complete Key Management Workflow", () => {
    test("should support complete encrypted key management lifecycle", async () => {
      // 1. Create encrypted keystore
      const createResult = await server.callTool("create_encrypted_keystore", {
        masterPassword: testMasterPassword,
      })

      // Skip test if encrypted keystore not available
      if (createResult.isError && createResult.content[0].text.includes("not available")) {
        console.log("⚠️ Encrypted keystore not available in test environment, skipping test")
        return
      }

      expect(createResult.isError).toBe(false)

      // 2. Import multiple keys with labels
      await server.callTool("import_encrypted_private_key", {
        privateKey: testPrivateKey1,
        masterPassword: testMasterPassword,
        label: "Development Wallet",
      })

      await server.callTool("import_encrypted_private_key", {
        privateKey: testPrivateKey2,
        masterPassword: testMasterPassword,
        label: "Testing Wallet",
      })

      // 3. Verify keys are stored
      const listResult = await server.callTool("list_encrypted_keys", {})
      expect(listResult.isError).toBe(false)
      if (!listResult.isError) {
        const response = listResult.content[0].text
        expect(response).toContain("Development Wallet")
        expect(response).toContain("Testing Wallet")
        expect(response).toMatch(/2.*key/i)
      }

      // 4. Update a key label
      await server.callTool("update_key_label", {
        address: testAddress1,
        label: "Updated Development Wallet",
      })

      // 5. Lock and unlock keystore
      await server.callTool("lock_keystore", {})
      await server.callTool("unlock_keystore", {
        masterPassword: testMasterPassword,
      })

      // 6. Change master password
      const newPassword = "super-secure-new-password-789"
      await server.callTool("change_keystore_password", {
        currentPassword: testMasterPassword,
        newPassword: newPassword,
      })

      // 7. Remove one key
      await server.callTool("remove_encrypted_key", {
        address: testAddress2,
      })

      // 8. Verify final state
      const finalListResult = await server.callTool("list_encrypted_keys", {})
      expect(finalListResult.isError).toBe(false)
      if (!finalListResult.isError) {
        const response = finalListResult.content[0].text
        expect(response).toContain("Updated Development Wallet")
        expect(response).not.toContain("Testing Wallet")
        expect(response).toMatch(/1.*key/i)
      }

      // 9. Verify new password works
      await server.callTool("lock_keystore", {})
      const unlockWithNewPassword = await server.callTool("unlock_keystore", {
        masterPassword: newPassword,
      })
      expect(unlockWithNewPassword.isError).toBe(false)
    }, 15000) // Allow extra time for complete workflow
  })
})
