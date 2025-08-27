/**
 * MCP tool handlers for encrypted key management
 */

import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js"
import type { Address } from "viem"
import { z } from "zod"
import { getContainer } from "../../container.js"
import type { EncryptedKeyStoreManager } from "../../storage/encrypted-key-store.js"
import { resolvePrivateKeyInput } from "../../wallet-manager.js"
import { BaseToolHandler, type ToolResponse } from "../handler-registry.js"

/**
 * Get the encrypted key store manager from container
 */
function getKeyStore(): EncryptedKeyStoreManager {
  const container = getContainer()
  const keyStore = container.getEncryptedKeyStore()

  if (!keyStore) {
    throw new McpError(
      ErrorCode.InternalError,
      "Encrypted key store not available. Ensure storage is properly configured.",
    )
  }

  return keyStore
}

/**
 * Create encrypted key store
 */
export class CreateEncryptedKeystoreHandler extends BaseToolHandler {
  constructor() {
    super("create_encrypted_keystore", "Create a new encrypted key store")
  }

  async execute(args: unknown): Promise<ToolResponse> {
    const { masterPassword } = this.validateArgs(
      z.object({ masterPassword: z.string().min(8) }),
      args,
    )

    try {
      const keyStore = getKeyStore()

      if (keyStore.exists()) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          "Encrypted key store already exists. Use unlock_keystore to access it.",
        )
      }

      await keyStore.createKeyStore(masterPassword)

      return this.createTextResponse(
        "✅ Encrypted key store created successfully!\n\n" +
          "Your key store is now ready to securely store private keys. The store is automatically unlocked and ready for use.\n\n" +
          "**Security Features:**\n" +
          "- AES-256-GCM encryption\n" +
          "- PBKDF2 key derivation (100,000 iterations)\n" +
          "- Unique encryption for each key\n" +
          "- Session-based access (30-minute timeout)\n" +
          "- Secure memory handling\n\n" +
          "**Next steps:**\n" +
          "- Use `import_encrypted_private_key` to add keys\n" +
          "- Use `lock_keystore` when done to secure access\n" +
          "- Remember your master password - it cannot be recovered!",
      )
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to create encrypted key store: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }
}

/**
 * Unlock encrypted key store
 */
export class UnlockKeystoreHandler extends BaseToolHandler {
  constructor() {
    super("unlock_keystore", "Unlock encrypted key store")
  }

  async execute(args: unknown): Promise<ToolResponse> {
    const { masterPassword } = this.validateArgs(z.object({ masterPassword: z.string() }), args)

    try {
      const keyStore = getKeyStore()

      if (!keyStore.exists()) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          "No encrypted key store found. Use create_encrypted_keystore first.",
        )
      }

      await keyStore.unlock(masterPassword)
      const sessionInfo = keyStore.getSessionInfo()

      return this.createTextResponse(
        `🔓 Key store unlocked successfully!\n\n` +
          `Session timeout: ${Math.round(sessionInfo.timeoutMs / 1000 / 60)} minutes\n\n` +
          `You can now:\n` +
          `- Import private keys with \`import_encrypted_private_key\`\n` +
          `- List keys with \`list_encrypted_keys\`\n` +
          `- Use keys for wallet operations\n\n` +
          `**Security reminder:** The store will automatically lock after ${Math.round(sessionInfo.timeoutMs / 1000 / 60)} minutes of inactivity.`,
      )
    } catch (error) {
      if (error instanceof McpError) throw error

      // Handle common error cases
      const errorMsg = error instanceof Error ? error.message : String(error)
      if (errorMsg.includes("Invalid master password")) {
        throw new McpError(ErrorCode.InvalidParams, "❌ Invalid master password")
      }

      throw new McpError(ErrorCode.InternalError, `Failed to unlock key store: ${errorMsg}`)
    }
  }
}

/**
 * Lock encrypted key store
 */
export class LockKeystoreHandler extends BaseToolHandler {
  constructor() {
    super("lock_keystore", "Lock encrypted key store")
  }

  async execute(_args: unknown): Promise<ToolResponse> {
    try {
      const keyStore = getKeyStore()
      keyStore.lock()

      return this.createTextResponse(
        "🔒 Key store locked successfully!\n\n" +
          "All decrypted keys have been cleared from memory. Use `unlock_keystore` with your master password to access keys again.",
      )
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to lock key store: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }
}

/**
 * Import encrypted private key
 */
export class ImportEncryptedPrivateKeyHandler extends BaseToolHandler {
  constructor() {
    super("import_encrypted_private_key", "Import private key into encrypted store")
  }

  async execute(args: unknown): Promise<ToolResponse> {
    const { privateKey, masterPassword, label } = this.validateArgs(
      z.object({
        privateKey: z.string(),
        masterPassword: z.string(),
        label: z.string().optional(),
      }),
      args,
    )

    try {
      const keyStore = getKeyStore()

      if (!keyStore.isSessionValid()) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          "Key store is locked. Use unlock_keystore first.",
        )
      }

      // Resolve private key from input (env var, file, or direct key)
      const resolvedPrivateKey = resolvePrivateKeyInput(privateKey)

      // Import the key with encryption
      const address = await keyStore.importPrivateKey(resolvedPrivateKey, masterPassword, label)

      return this.createTextResponse(
        `🔐 Private key imported successfully!\n\n` +
          `Address: ${address}\n` +
          `Label: ${label || "No label"}\n\n` +
          `The private key has been encrypted and securely stored. You can now use this address for wallet operations.`,
      )
    } catch (error) {
      if (error instanceof McpError) throw error

      const errorMsg = error instanceof Error ? error.message : String(error)
      if (errorMsg.includes("already exists")) {
        throw new McpError(
          ErrorCode.InvalidParams,
          "A key for this address is already stored in the encrypted key store",
        )
      }

      throw new McpError(
        ErrorCode.InternalError,
        `Failed to import encrypted private key: ${errorMsg}`,
      )
    }
  }
}

/**
 * List encrypted keys
 */
export class ListEncryptedKeysHandler extends BaseToolHandler {
  constructor() {
    super("list_encrypted_keys", "List encrypted keys")
  }

  async execute(_args: unknown): Promise<ToolResponse> {
    try {
      const keyStore = getKeyStore()

      if (!keyStore.isSessionValid()) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          "Key store is locked. Use unlock_keystore first.",
        )
      }

      const keys = await keyStore.listKeys()

      if (keys.length === 0) {
        return this.createTextResponse(
          "📭 No encrypted keys found.\n\n" +
            "Use `import_encrypted_private_key` to add keys to your encrypted store.",
        )
      }

      const keyList = keys
        .map((key, index) => {
          const createdDate = new Date(key.createdAt).toLocaleDateString()
          const label = key.label ? ` (${key.label})` : ""
          return `${index + 1}. ${key.address}${label}\n   Created: ${createdDate}`
        })
        .join("\n\n")

      return this.createTextResponse(
        `🔑 Encrypted Keys (${keys.length} total):\n\n${keyList}\n\n` +
          `**Security Note:** Private keys are encrypted and never displayed. Use these addresses with wallet operations.`,
      )
    } catch (error) {
      if (error instanceof McpError) throw error

      throw new McpError(
        ErrorCode.InternalError,
        `Failed to list encrypted keys: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }
}

/**
 * Remove encrypted key
 */
export class RemoveEncryptedKeyHandler extends BaseToolHandler {
  constructor() {
    super("remove_encrypted_key", "Remove encrypted key")
  }

  async execute(args: unknown): Promise<ToolResponse> {
    const { address } = this.validateArgs(z.object({ address: z.string() }), args)

    try {
      const keyStore = getKeyStore()

      if (!keyStore.isSessionValid()) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          "Key store is locked. Use unlock_keystore first.",
        )
      }

      const removed = await keyStore.removePrivateKey(address as Address)

      if (!removed) {
        throw new McpError(ErrorCode.InvalidParams, `No encrypted key found for address ${address}`)
      }

      return this.createTextResponse(
        `🗑️ Encrypted key removed successfully!\n\n` +
          `Address: ${address}\n\n` +
          `The private key has been securely deleted from the encrypted store and cleared from memory.`,
      )
    } catch (error) {
      if (error instanceof McpError) throw error

      throw new McpError(
        ErrorCode.InternalError,
        `Failed to remove encrypted key: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }
}

/**
 * Update key label
 */
export class UpdateKeyLabelHandler extends BaseToolHandler {
  constructor() {
    super("update_key_label", "Update key label")
  }

  async execute(args: unknown): Promise<ToolResponse> {
    const { address, label } = this.validateArgs(
      z.object({
        address: z.string(),
        label: z.string(),
      }),
      args,
    )

    try {
      const keyStore = getKeyStore()

      if (!keyStore.isSessionValid()) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          "Key store is locked. Use unlock_keystore first.",
        )
      }

      await keyStore.updateKeyLabel(address as Address, label)

      return this.createTextResponse(
        `🏷️ Key label updated successfully!\n\nAddress: ${address}\nNew label: ${label}`,
      )
    } catch (error) {
      if (error instanceof McpError) throw error

      const errorMsg = error instanceof Error ? error.message : String(error)
      if (errorMsg.includes("No key found")) {
        throw new McpError(ErrorCode.InvalidParams, `No encrypted key found for address ${address}`)
      }

      throw new McpError(ErrorCode.InternalError, `Failed to update key label: ${errorMsg}`)
    }
  }
}

/**
 * Change keystore password
 */
export class ChangeKeystorePasswordHandler extends BaseToolHandler {
  constructor() {
    super("change_keystore_password", "Change keystore master password")
  }

  async execute(args: unknown): Promise<ToolResponse> {
    const { currentPassword, newPassword } = this.validateArgs(
      z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(8),
      }),
      args,
    )

    try {
      const keyStore = getKeyStore()

      if (!keyStore.isSessionValid()) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          "Key store is locked. Use unlock_keystore first.",
        )
      }

      await keyStore.changeMasterPassword(currentPassword, newPassword)

      return this.createTextResponse(
        "🔐 Master password changed successfully!\n\n" +
          "All encrypted keys have been re-encrypted with the new password. The key store remains unlocked.\n\n" +
          "**Security reminder:** Keep your new password secure - it cannot be recovered if lost!",
      )
    } catch (error) {
      if (error instanceof McpError) throw error

      const errorMsg = error instanceof Error ? error.message : String(error)
      if (errorMsg.includes("Invalid password") || errorMsg.includes("bad decrypt")) {
        throw new McpError(ErrorCode.InvalidParams, "❌ Current password is incorrect")
      }

      throw new McpError(ErrorCode.InternalError, `Failed to change master password: ${errorMsg}`)
    }
  }
}

/**
 * Get keystore status
 */
export class GetKeystoreStatusHandler extends BaseToolHandler {
  constructor() {
    super("get_keystore_status", "Get keystore status")
  }

  async execute(_args: unknown): Promise<ToolResponse> {
    try {
      const keyStore = getKeyStore()
      const sessionInfo = keyStore.getSessionInfo()

      const exists = keyStore.exists()
      const isUnlocked = sessionInfo.isUnlocked

      let statusText = `🔐 **Encrypted Key Store Status**\n\n`

      if (!exists) {
        statusText +=
          "❌ **Status:** Not created\n\nUse `create_encrypted_keystore` to set up secure key storage."
      } else if (!isUnlocked) {
        statusText +=
          "🔒 **Status:** Locked\n\nUse `unlock_keystore` with your master password to access keys."
      } else {
        const timeLeft = Math.round(sessionInfo.timeUntilTimeout / 1000 / 60)
        const keyCount = (await keyStore.listKeys()).length

        statusText += `🔓 **Status:** Unlocked\n\n`
        statusText += `**Keys stored:** ${keyCount}\n`
        statusText += `**Session timeout:** ${timeLeft} minutes remaining\n`
        statusText += `**Session length:** ${Math.round(sessionInfo.timeoutMs / 1000 / 60)} minutes total\n\n`
        statusText += `The store will automatically lock in ${timeLeft} minutes of inactivity.`
      }

      return this.createTextResponse(statusText)
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get keystore status: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }
}

/**
 * Export all encrypted key management handlers
 */
export const encryptedKeyHandlers = [
  new CreateEncryptedKeystoreHandler(),
  new UnlockKeystoreHandler(),
  new LockKeystoreHandler(),
  new ImportEncryptedPrivateKeyHandler(),
  new ListEncryptedKeysHandler(),
  new RemoveEncryptedKeyHandler(),
  new UpdateKeyLabelHandler(),
  new ChangeKeystorePasswordHandler(),
  new GetKeystoreStatusHandler(),
]
