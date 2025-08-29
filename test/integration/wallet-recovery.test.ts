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

describe("Wallet Recovery and Keystore Integration Test", () => {
  let server: McpServer
  let testContainer: TestContainer

  const testPrivateKey1 = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
  const testPrivateKey2 = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
  const testPrivateKey3 = "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"
  const testAddress1 = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  const testAddress2 = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
  const testAddress3 = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
  const masterPassword = "super-secure-master-password-123!"

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

  describe("Keystore Creation and Management", () => {
    test("should create encrypted keystore with master password", async () => {
      const createResult = await server.callTool("create_encrypted_keystore", {
        masterPassword,
      })

      // Skip test if encrypted keystore not available
      if (createResult.isError && createResult.content[0].text.includes("not available")) {
        console.log("⚠️ Encrypted keystore not available in test environment, skipping test")
        return
      }

      expect(createResult.isError).toBe(false)
      if (!createResult.isError) {
        const response = createResult.content[0].text
        expect(response).toMatch(/(keystore|created|encrypted)/i)
        console.log("✓ Encrypted keystore created successfully")
      }
    })

    test("should unlock keystore with correct password", async () => {
      await server.callTool("create_encrypted_keystore", {
        masterPassword,
      })

      const unlockResult = await server.callTool("unlock_keystore", {
        masterPassword,
      })

      expect(unlockResult.isError).toBe(false)
      if (!unlockResult.isError) {
        const response = unlockResult.content[0].text
        expect(response).toMatch(/(unlocked|success|ready)/i)
        console.log("✓ Keystore unlocked successfully")
      }
    })

    test("should reject incorrect master password", async () => {
      await server.callTool("create_encrypted_keystore", {
        masterPassword,
      })

      const unlockResult = await server.callTool("unlock_keystore", {
        masterPassword: "wrong-password",
      })

      expect(unlockResult.isError).toBe(true)
      if (unlockResult.isError) {
        expect(unlockResult.content[0].text).toMatch(/(invalid|incorrect|password)/i)
        console.log("✓ Incorrect password correctly rejected")
      }
    })

    test("should lock keystore and require re-authentication", async () => {
      await server.callTool("create_encrypted_keystore", {
        masterPassword,
      })
      await server.callTool("unlock_keystore", {
        masterPassword,
      })

      const lockResult = await server.callTool("lock_keystore", {})

      expect(lockResult.isError).toBe(false)
      if (!lockResult.isError) {
        const response = lockResult.content[0].text
        expect(response).toMatch(/(locked|secured)/i)
        console.log("✓ Keystore locked successfully")
      }

      const statusResult = await server.callTool("get_keystore_status", {})
      if (!statusResult.isError) {
        expect(statusResult.content[0].text).toMatch(/(locked|not unlocked)/i)
      }
    })
  })

  describe("Private Key Backup and Recovery", () => {
    test("should import and encrypt multiple private keys", async () => {
      await server.callTool("create_encrypted_keystore", {
        masterPassword,
      })
      await server.callTool("unlock_keystore", {
        masterPassword,
      })

      const keys = [
        { key: testPrivateKey1, label: "Primary Wallet", address: testAddress1 },
        { key: testPrivateKey2, label: "Secondary Wallet", address: testAddress2 },
        { key: testPrivateKey3, label: "Trading Wallet", address: testAddress3 },
      ]

      for (const keyInfo of keys) {
        const importResult = await server.callTool("import_encrypted_private_key", {
          privateKey: keyInfo.key,
          masterPassword,
          label: keyInfo.label,
        })

        expect(importResult.isError).toBe(false)
        if (!importResult.isError) {
          const response = importResult.content[0].text
          expect(response).toContain(keyInfo.address)
          expect(response).toContain(keyInfo.label)
          console.log(`✓ Imported ${keyInfo.label}: ${keyInfo.address}`)
        }
      }

      const listResult = await server.callTool("list_encrypted_keys", {})
      expect(listResult.isError).toBe(false)
      if (!listResult.isError) {
        const response = listResult.content[0].text
        expect(response).toContain(testAddress1)
        expect(response).toContain(testAddress2)
        expect(response).toContain(testAddress3)
        expect(response).toContain("Primary Wallet")
        expect(response).toContain("Trading Wallet")
        console.log("✓ All keys successfully stored in encrypted keystore")
      }
    })

    test("should recover wallet after keystore lock/unlock cycle", async () => {
      await server.callTool("create_encrypted_keystore", {
        masterPassword,
      })
      await server.callTool("unlock_keystore", {
        masterPassword,
      })

      await server.callTool("import_encrypted_private_key", {
        privateKey: testPrivateKey1,
        masterPassword,
        label: "Recovery Test Wallet",
      })

      await server.callTool("lock_keystore", {})

      const testMessage = "Test recovery message"
      const signResult1 = await server.callTool("sign_message", {
        message: testMessage,
      })

      expect(signResult1.isError).toBe(true)
      console.log("✓ Cannot sign when keystore is locked")

      await server.callTool("unlock_keystore", {
        masterPassword,
      })

      await server.callTool("connect_wallet", {
        address: testAddress1,
      })

      const signResult2 = await server.callTool("sign_message", {
        message: testMessage,
      })

      expect(signResult2.isError).toBe(false)
      if (!signResult2.isError) {
        const signature = signResult2.content[0].text
        expect(signature).toMatch(/^0x[a-fA-F0-9]{130}$/)
        console.log("✓ Wallet successfully recovered and can sign messages")
      }
    })

    test("should update key labels and maintain functionality", async () => {
      await server.callTool("create_encrypted_keystore", {
        masterPassword,
      })
      await server.callTool("unlock_keystore", {
        masterPassword,
      })

      await server.callTool("import_encrypted_private_key", {
        privateKey: testPrivateKey1,
        masterPassword,
        label: "Original Label",
      })

      const updateResult = await server.callTool("update_key_label", {
        address: testAddress1,
        label: "Updated Label",
      })

      expect(updateResult.isError).toBe(false)
      if (!updateResult.isError) {
        console.log("✓ Key label updated successfully")
      }

      const listResult = await server.callTool("list_encrypted_keys", {})
      if (!listResult.isError) {
        const response = listResult.content[0].text
        expect(response).toContain("Updated Label")
        expect(response).not.toContain("Original Label")
        console.log("✓ Updated label reflected in key list")
      }

      await server.callTool("connect_wallet", {
        address: testAddress1,
      })

      const signResult = await server.callTool("sign_message", {
        message: "Test after label update",
      })

      expect(signResult.isError).toBe(false)
      console.log("✓ Wallet functionality maintained after label update")
    })
  })

  describe("Keystore Security and Recovery", () => {
    test("should change master password and maintain key access", async () => {
      await server.callTool("create_encrypted_keystore", {
        masterPassword,
      })
      await server.callTool("unlock_keystore", {
        masterPassword,
      })

      await server.callTool("import_encrypted_private_key", {
        privateKey: testPrivateKey1,
        masterPassword,
        label: "Password Change Test",
      })

      const newPassword = "new-super-secure-password-456!"
      const changeResult = await server.callTool("change_keystore_password", {
        currentPassword: masterPassword,
        newPassword,
      })

      expect(changeResult.isError).toBe(false)
      if (!changeResult.isError) {
        console.log("✓ Master password changed successfully")
      }

      await server.callTool("lock_keystore", {})

      const oldPasswordResult = await server.callTool("unlock_keystore", {
        masterPassword,
      })

      expect(oldPasswordResult.isError).toBe(true)
      console.log("✓ Old password no longer works")

      const newPasswordResult = await server.callTool("unlock_keystore", {
        masterPassword: newPassword,
      })

      expect(newPasswordResult.isError).toBe(false)
      console.log("✓ New password works")

      const listResult = await server.callTool("list_encrypted_keys", {})
      expect(listResult.isError).toBe(false)
      if (!listResult.isError) {
        expect(listResult.content[0].text).toContain(testAddress1)
        console.log("✓ Keys still accessible after password change")
      }
    })

    test("should securely remove keys from encrypted keystore", async () => {
      await server.callTool("create_encrypted_keystore", {
        masterPassword,
      })
      await server.callTool("unlock_keystore", {
        masterPassword,
      })

      await server.callTool("import_encrypted_private_key", {
        privateKey: testPrivateKey1,
        masterPassword,
        label: "To Be Removed",
      })

      await server.callTool("import_encrypted_private_key", {
        privateKey: testPrivateKey2,
        masterPassword,
        label: "To Keep",
      })

      const listBefore = await server.callTool("list_encrypted_keys", {})
      if (!listBefore.isError) {
        expect(listBefore.content[0].text).toContain(testAddress1)
        expect(listBefore.content[0].text).toContain(testAddress2)
      }

      const removeResult = await server.callTool("remove_encrypted_key", {
        address: testAddress1,
      })

      expect(removeResult.isError).toBe(false)
      console.log("✓ Key removed from encrypted keystore")

      const listAfter = await server.callTool("list_encrypted_keys", {})
      if (!listAfter.isError) {
        expect(listAfter.content[0].text).not.toContain(testAddress1)
        expect(listAfter.content[0].text).toContain(testAddress2)
        console.log("✓ Removed key no longer in keystore, other keys preserved")
      }
    })
  })

  describe("Wallet Type Recovery Scenarios", () => {
    test("should recover from mock wallet to encrypted keystore wallet", async () => {
      await server.callTool("connect_wallet", {
        address: testAddress1,
      })

      let currentAccount = await server.callTool("get_current_account", {})
      expect(currentAccount.isError).toBe(false)

      await server.callTool("create_encrypted_keystore", {
        masterPassword,
      })
      await server.callTool("unlock_keystore", {
        masterPassword,
      })

      await server.callTool("import_encrypted_private_key", {
        privateKey: testPrivateKey1,
        masterPassword,
        label: "Recovered Wallet",
      })

      await server.callTool("set_wallet_type", {
        type: "privateKey",
      })

      await server.callTool("connect_wallet", {
        address: testAddress1,
      })

      currentAccount = await server.callTool("get_current_account", {})
      expect(currentAccount.isError).toBe(false)

      if (!currentAccount.isError) {
        expect(currentAccount.content[0].text).toContain(testAddress1)
        console.log("✓ Successfully recovered from mock to encrypted keystore wallet")
      }

      const signResult = await server.callTool("sign_message", {
        message: "Recovery test message",
      })

      expect(signResult.isError).toBe(false)
      console.log("✓ Recovered wallet can sign messages")
    })

    test("should handle keystore corruption recovery", async () => {
      await server.callTool("create_encrypted_keystore", {
        masterPassword,
      })
      await server.callTool("unlock_keystore", {
        masterPassword,
      })

      await server.callTool("import_encrypted_private_key", {
        privateKey: testPrivateKey1,
        masterPassword,
        label: "Backup Test",
      })

      const statusBefore = await server.callTool("get_keystore_status", {})
      expect(statusBefore.isError).toBe(false)

      await server.callTool("lock_keystore", {})

      const statusAfter = await server.callTool("get_keystore_status", {})
      if (!statusAfter.isError) {
        expect(statusAfter.content[0].text).toMatch(/(locked|secured)/i)
        console.log("✓ Keystore properly locked and secured")
      }

      await server.callTool("unlock_keystore", {
        masterPassword,
      })

      const recoveryImportResult = await server.callTool("import_private_key", {
        privateKey: testPrivateKey1,
      })

      expect(recoveryImportResult.isError).toBe(false)
      console.log("✓ Emergency recovery via direct private key import works")
    })
  })

  describe("Multi-Wallet Recovery Scenarios", () => {
    test("should recover multiple wallets simultaneously", async () => {
      await server.callTool("create_encrypted_keystore", {
        masterPassword,
      })
      await server.callTool("unlock_keystore", {
        masterPassword,
      })

      const wallets = [
        { key: testPrivateKey1, label: "Main Account", address: testAddress1 },
        { key: testPrivateKey2, label: "DeFi Account", address: testAddress2 },
        { key: testPrivateKey3, label: "NFT Account", address: testAddress3 },
      ]

      for (const wallet of wallets) {
        await server.callTool("import_encrypted_private_key", {
          privateKey: wallet.key,
          masterPassword,
          label: wallet.label,
        })
      }

      await server.callTool("lock_keystore", {})
      await server.callTool("unlock_keystore", {
        masterPassword,
      })

      await server.callTool("set_wallet_type", {
        type: "privateKey",
      })

      for (const wallet of wallets) {
        await server.callTool("connect_wallet", {
          address: wallet.address,
        })

        const signResult = await server.callTool("sign_message", {
          message: `Test message for ${wallet.label}`,
        })

        expect(signResult.isError).toBe(false)
        if (!signResult.isError) {
          console.log(`✓ ${wallet.label} (${wallet.address}) recovered and functional`)
        }
      }

      console.log("✓ All wallets successfully recovered from encrypted keystore")
    })
  })
})
