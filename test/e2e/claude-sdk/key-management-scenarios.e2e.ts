import { beforeAll, describe, expect, test } from "bun:test"
import { validateResponseStructure } from "./helpers/validator.js"
import { setupClaudeSDKTests, TEST_DATA, testPrompt, testWorkflow } from "./setup.js"

describe("Key Management Operations via Natural Language", () => {
  beforeAll(() => {
    setupClaudeSDKTests()
  })

  describe("Private Key Management", () => {
    test("should import private key from environment variable", async () => {
      const result = await testPrompt(
        "Import private key from environment variable WALLET_PRIVATE_KEY",
        {
          toolsUsed: ["import_private_key"],
          resultContains: ["imported", "private", "key"],
        },
      )

      validateResponseStructure(result)
    })

    test("should import private key from file path", async () => {
      const result = await testPrompt("Import private key from file ~/.wallet-private-key", {
        toolsUsed: ["import_private_key"],
        resultContains: ["imported", "private", "key"],
      })

      validateResponseStructure(result)
    })

    test("should import private key directly", async () => {
      const result = await testPrompt(
        "Import this private key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        {
          toolsUsed: ["import_private_key"],
          resultContains: ["imported", "private", "key"],
        },
      )

      validateResponseStructure(result)
    })

    test("should list imported private key wallets", async () => {
      // First import a key
      await testPrompt(
        "Import private key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
      )

      const result = await testPrompt("Show me all imported private key wallets", {
        toolsUsed: ["list_imported_wallets"],
        resultContains: ["imported", "wallets", "private", "key"],
      })

      validateResponseStructure(result)
    })

    test("should remove imported private key", async () => {
      // First import a key
      await testPrompt(
        "Import private key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
      )

      const result = await testPrompt(`Remove imported wallet ${TEST_DATA.WALLET_ADDRESS_1}`, {
        toolsUsed: ["remove_private_key"],
        resultContains: ["removed", "private", "key"],
      })

      validateResponseStructure(result)
    })

    test("should switch between wallet types", async () => {
      const walletTypeFlow = [
        {
          prompt: "Switch to mock wallet mode",
          expected: {
            toolsUsed: ["set_wallet_type"],
            resultContains: ["mock", "wallet", "mode"],
          },
        },
        {
          prompt: "Switch to private key wallet mode",
          expected: {
            toolsUsed: ["set_wallet_type"],
            resultContains: ["private", "key", "mode"],
          },
        },
      ]

      const results = await testWorkflow("Wallet Type Switching", walletTypeFlow)
      results.forEach((result) => validateResponseStructure(result))
    })
  })

  describe("Encrypted Keystore Operations", () => {
    test("should create encrypted keystore", async () => {
      const result = await testPrompt(
        "Create an encrypted keystore with password 'test123' for private key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        {
          toolsUsed: ["create_encrypted_keystore"],
          resultContains: ["encrypted", "keystore", "created"],
        },
      )

      validateResponseStructure(result)
    })

    test("should import from encrypted keystore", async () => {
      // First create a keystore
      const keystoreResult = await testPrompt(
        "Create encrypted keystore with password 'test123' for private key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
      )

      // Verify keystore was created successfully
      expect(keystoreResult.success).toBe(true)

      // Extract keystore from result (simplified for test)
      const result = await testPrompt(
        "Import wallet from encrypted keystore with password 'test123'",
        {
          toolsUsed: ["import_from_encrypted_keystore"],
          resultContains: ["imported", "keystore", "encrypted"],
        },
      )

      validateResponseStructure(result)
    })

    test("should export to encrypted keystore", async () => {
      // First import a private key
      await testPrompt(
        "Import private key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
      )

      const result = await testPrompt(
        "Export current wallet to encrypted keystore with password 'export123'",
        {
          toolsUsed: ["export_to_encrypted_keystore"],
          resultContains: ["exported", "keystore", "encrypted"],
        },
      )

      validateResponseStructure(result)
    })

    test("should save keystore to file", async () => {
      // First create a keystore
      await testPrompt(
        "Create encrypted keystore with password 'test123' for private key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
      )

      const result = await testPrompt("Save the keystore to file ./test-keystore.json", {
        toolsUsed: ["save_keystore_to_file"],
        resultContains: ["saved", "keystore", "file"],
      })

      validateResponseStructure(result)
    })

    test("should load keystore from file", async () => {
      const result = await testPrompt(
        "Load keystore from file ./test-keystore.json and import with password 'test123'",
        {
          toolsUsed: ["load_keystore_from_file", "import_from_encrypted_keystore"],
          resultContains: ["loaded", "keystore", "imported"],
        },
      )

      validateResponseStructure(result)
    })
  })

  describe("Mnemonic Operations", () => {
    test("should generate mnemonic phrase", async () => {
      const result = await testPrompt("Generate a new 12-word mnemonic phrase", {
        toolsUsed: ["generate_mnemonic"],
        resultContains: ["mnemonic", "generated", "words"],
      })

      validateResponseStructure(result)
    })

    test("should generate mnemonic with different word counts", async () => {
      const wordCounts = ["12", "15", "18", "21", "24"]

      for (const count of wordCounts) {
        const result = await testPrompt(`Generate a ${count}-word mnemonic phrase`, {
          toolsUsed: ["generate_mnemonic"],
          resultContains: ["mnemonic", count, "words"],
        })

        validateResponseStructure(result)
      }
    })

    test("should import wallet from mnemonic", async () => {
      // First generate a mnemonic
      const mnemonicResult = await testPrompt("Generate a 12-word mnemonic phrase")

      // Verify mnemonic generation
      expect(mnemonicResult.success).toBe(true)

      const result = await testPrompt(
        "Import wallet from mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'",
        {
          toolsUsed: ["import_from_mnemonic"],
          resultContains: ["imported", "mnemonic", "wallet"],
        },
      )

      validateResponseStructure(result)
    })

    test("should import from mnemonic with derivation path", async () => {
      const result = await testPrompt(
        "Import wallet from mnemonic 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about' using derivation path m/44'/60'/0'/0/1",
        {
          toolsUsed: ["import_from_mnemonic"],
          resultContains: ["imported", "mnemonic", "derivation", "path"],
        },
      )

      validateResponseStructure(result)
    })

    test("should validate mnemonic phrase", async () => {
      const result = await testPrompt(
        "Validate this mnemonic phrase: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'",
        {
          toolsUsed: ["validate_mnemonic"],
          resultContains: ["valid", "mnemonic", "phrase"],
        },
      )

      validateResponseStructure(result)
    })

    test("should validate invalid mnemonic", async () => {
      const result = await testPrompt(
        "Validate this mnemonic: 'invalid word sequence that is not a real mnemonic phrase'",
        {
          toolsUsed: ["validate_mnemonic"],
          errorExpected: true,
          errorMessage: "invalid",
        },
      )

      validateResponseStructure(result)
    })
  })

  describe("HD Wallet Operations", () => {
    test("should derive address from mnemonic", async () => {
      const result = await testPrompt(
        "Derive address from mnemonic 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about' at index 0",
        {
          toolsUsed: ["derive_address_from_mnemonic"],
          resultContains: ["derived", "address", "mnemonic"],
        },
      )

      validateResponseStructure(result)
    })

    test("should derive multiple addresses", async () => {
      const result = await testPrompt(
        "Derive addresses 0 through 4 from mnemonic 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'",
        {
          toolsUsed: ["derive_address_from_mnemonic"],
          resultContains: ["derived", "addresses", "multiple"],
        },
      )

      validateResponseStructure(result)
    })

    test("should derive with custom derivation path", async () => {
      const result = await testPrompt(
        "Derive address using custom path m/44'/60'/1'/0/0 from mnemonic 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'",
        {
          toolsUsed: ["derive_address_from_mnemonic"],
          resultContains: ["derived", "custom", "path"],
        },
      )

      validateResponseStructure(result)
    })
  })

  describe("Message Signing Operations", () => {
    test("should sign message with private key", async () => {
      // First import a private key
      await testPrompt(
        "Import private key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
      )
      await testPrompt(`Connect to wallet ${TEST_DATA.WALLET_ADDRESS_1}`)

      const result = await testPrompt("Sign this message: 'Hello, blockchain!'", {
        toolsUsed: ["sign_message"],
        resultContains: ["signed", "message", "signature"],
      })

      validateResponseStructure(result)
    })

    test("should sign EIP-712 typed data", async () => {
      await testPrompt(
        "Import private key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
      )
      await testPrompt(`Connect to wallet ${TEST_DATA.WALLET_ADDRESS_1}`)

      const typedDataPrompt = `
        Sign this EIP-712 typed data:
        Domain: {"name": "TestDApp", "version": "1", "chainId": 31337}
        Types: {"EIP712Domain": [{"name": "name", "type": "string"}]}
        PrimaryType: "EIP712Domain"
        Message: {"name": "TestDApp"}
      `

      const result = await testPrompt(typedDataPrompt, {
        toolsUsed: ["sign_typed_data"],
        resultContains: ["signed", "typed", "data", "eip-712"],
      })

      validateResponseStructure(result)
    })
  })

  describe("Complete Key Management Workflows", () => {
    test("should execute complete key import and usage workflow", async () => {
      const keyWorkflow = [
        {
          prompt: "Generate a new 12-word mnemonic phrase",
          expected: {
            toolsUsed: ["generate_mnemonic"],
            resultContains: ["mnemonic", "generated"],
          },
        },
        {
          prompt: "Import wallet from the generated mnemonic at index 0",
          expected: {
            toolsUsed: ["import_from_mnemonic"],
            resultContains: ["imported", "mnemonic"],
          },
        },
        {
          prompt: "Switch to private key wallet mode",
          expected: {
            toolsUsed: ["set_wallet_type"],
            resultContains: ["private", "key"],
          },
        },
        {
          prompt: "Show all imported wallets",
          expected: {
            toolsUsed: ["list_imported_wallets"],
            resultContains: ["imported", "wallets"],
          },
        },
        {
          prompt: "Create encrypted keystore backup with password 'backup123'",
          expected: {
            toolsUsed: ["export_to_encrypted_keystore"],
            resultContains: ["exported", "keystore"],
          },
        },
      ]

      const results = await testWorkflow("Complete Key Management Workflow", keyWorkflow)
      results.forEach((result) => validateResponseStructure(result))
    })

    test("should handle secure key rotation workflow", async () => {
      const rotationWorkflow = [
        {
          prompt:
            "Import current private key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
          expected: {
            toolsUsed: ["import_private_key"],
            resultContains: ["imported"],
          },
        },
        {
          prompt: "Export current wallet to encrypted keystore backup",
          expected: {
            toolsUsed: ["export_to_encrypted_keystore"],
            resultContains: ["exported", "backup"],
          },
        },
        {
          prompt: "Generate new mnemonic for key rotation",
          expected: {
            toolsUsed: ["generate_mnemonic"],
            resultContains: ["mnemonic", "new"],
          },
        },
        {
          prompt: "Import new wallet from the generated mnemonic",
          expected: {
            toolsUsed: ["import_from_mnemonic"],
            resultContains: ["imported", "new"],
          },
        },
        {
          prompt: "Remove the old private key wallet",
          expected: {
            toolsUsed: ["remove_private_key"],
            resultContains: ["removed", "old"],
          },
        },
      ]

      const results = await testWorkflow("Secure Key Rotation", rotationWorkflow)
      results.forEach((result) => validateResponseStructure(result))
    })

    test("should handle multi-wallet management", async () => {
      const multiWalletFlow = [
        {
          prompt:
            "Import first wallet: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
          expected: { toolsUsed: ["import_private_key"] },
        },
        {
          prompt:
            "Import second wallet from mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'",
          expected: { toolsUsed: ["import_from_mnemonic"] },
        },
        {
          prompt: "List all imported wallets to see both",
          expected: {
            toolsUsed: ["list_imported_wallets"],
            resultContains: ["wallets", "multiple"],
          },
        },
        {
          prompt: "Switch between the two wallets for testing",
          expected: {
            toolsUsed: ["connect_wallet"],
            resultContains: ["switched", "wallet"],
          },
        },
      ]

      const results = await testWorkflow("Multi-Wallet Management", multiWalletFlow)
      results.forEach((result) => validateResponseStructure(result))
    })
  })

  describe("Error Handling Scenarios", () => {
    test("should handle invalid private key format", async () => {
      const result = await testPrompt("Import private key: 0xinvalidkey", {
        errorExpected: true,
        errorMessage: "invalid",
      })

      validateResponseStructure(result)
    })

    test("should handle invalid mnemonic phrase", async () => {
      const result = await testPrompt(
        "Import wallet from invalid mnemonic: 'not a real mnemonic phrase at all'",
        {
          errorExpected: true,
          errorMessage: "invalid",
        },
      )

      validateResponseStructure(result)
    })

    test("should handle wrong keystore password", async () => {
      // Create a keystore first
      await testPrompt(
        "Create encrypted keystore with password 'correct123' for private key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
      )

      const result = await testPrompt("Import from keystore with wrong password 'wrong123'", {
        errorExpected: true,
        errorMessage: "password",
      })

      validateResponseStructure(result)
    })

    test("should handle missing environment variable", async () => {
      const result = await testPrompt(
        "Import private key from environment variable NONEXISTENT_KEY",
        {
          errorExpected: true,
          errorMessage: "not found",
        },
      )

      validateResponseStructure(result)
    })

    test("should handle invalid derivation path", async () => {
      const result = await testPrompt(
        "Derive address using invalid path 'not/a/valid/path' from mnemonic 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'",
        {
          errorExpected: true,
          errorMessage: "invalid",
        },
      )

      validateResponseStructure(result)
    })
  })

  describe("Natural Language Variations", () => {
    test("should understand various import phrasings", async () => {
      const importPhrases = [
        "Import private key",
        "Add private key",
        "Load private key",
        "Use private key",
        "Install private key",
      ]

      for (const phrase of importPhrases) {
        const result = await testPrompt(
          `${phrase}: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`,
          {
            toolsUsed: ["import_private_key"],
            resultContains: ["imported", "private", "key"],
          },
        )

        validateResponseStructure(result)
      }
    })

    test("should understand various mnemonic phrasings", async () => {
      const mnemonicPhrases = [
        "Generate seed phrase",
        "Create recovery phrase",
        "Make mnemonic words",
        "Generate BIP39 phrase",
        "Create wallet seed",
      ]

      for (const phrase of mnemonicPhrases) {
        const result = await testPrompt(`${phrase} with 12 words`, {
          toolsUsed: ["generate_mnemonic"],
          resultContains: ["mnemonic", "generated"],
        })

        validateResponseStructure(result)
      }
    })

    test("should understand various signing phrasings", async () => {
      await testPrompt(
        "Import private key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
      )
      await testPrompt(`Connect to wallet ${TEST_DATA.WALLET_ADDRESS_1}`)

      const signingPhrases = [
        "Sign this message",
        "Create signature for",
        "Digitally sign",
        "Authenticate message",
        "Cryptographically sign",
      ]

      for (const phrase of signingPhrases) {
        const result = await testPrompt(`${phrase}: 'Test message'`, {
          toolsUsed: ["sign_message"],
          resultContains: ["signed", "signature"],
        })

        validateResponseStructure(result)
      }
    })

    test("should understand keystore operation phrasings", async () => {
      const keystorePhrases = [
        "Create encrypted wallet backup",
        "Generate secure keystore",
        "Make password-protected wallet",
        "Export encrypted wallet file",
        "Create secure wallet backup",
      ]

      for (const phrase of keystorePhrases) {
        const result = await testPrompt(
          `${phrase} with password 'test123' for private key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`,
          {
            toolsUsed: ["create_encrypted_keystore"],
            resultContains: ["encrypted", "keystore"],
          },
        )

        validateResponseStructure(result)
      }
    })
  })

  describe("Security and Best Practices", () => {
    test("should handle secure key generation workflow", async () => {
      const secureFlow = `
        Generate a secure new wallet for me: create a 24-word mnemonic phrase, 
        import the wallet from it, create an encrypted keystore backup with 
        a strong password, and then verify everything worked correctly.
      `

      const result = await testPrompt(secureFlow, {
        toolsUsed: [
          "generate_mnemonic",
          "import_from_mnemonic",
          "export_to_encrypted_keystore",
          "list_imported_wallets",
        ],
        resultContains: ["secure", "mnemonic", "encrypted", "backup"],
      })

      validateResponseStructure(result)
    })

    test("should demonstrate key backup and recovery", async () => {
      const backupRecoveryFlow = [
        {
          prompt: "Generate a 12-word mnemonic and import the wallet",
          expected: {
            toolsUsed: ["generate_mnemonic", "import_from_mnemonic"],
            resultContains: ["generated", "imported"],
          },
        },
        {
          prompt: "Create multiple backups: encrypted keystore and save to file",
          expected: {
            toolsUsed: ["export_to_encrypted_keystore", "save_keystore_to_file"],
            resultContains: ["backup", "keystore", "saved"],
          },
        },
        {
          prompt: "Remove the wallet to simulate loss",
          expected: {
            toolsUsed: ["remove_private_key"],
            resultContains: ["removed"],
          },
        },
        {
          prompt: "Recover the wallet from the saved keystore file",
          expected: {
            toolsUsed: ["load_keystore_from_file", "import_from_encrypted_keystore"],
            resultContains: ["recovered", "imported"],
          },
        },
      ]

      const results = await testWorkflow("Backup and Recovery Process", backupRecoveryFlow)
      results.forEach((result) => validateResponseStructure(result))
    })
  })
})
