/**
 * Encrypted key store for secure private key management
 *
 * Provides persistent storage of encrypted private keys with:
 * - Password-based encryption using AES-256-GCM
 * - Session-based key management
 * - Automatic session timeout
 * - Audit logging of key operations
 */

import { existsSync } from "node:fs"
import { readFile, writeFile } from "node:fs/promises"
import type { Address } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { type EncryptedKeyStore, KeyEncryption } from "../crypto/key-encryption.js"
import { createLogger } from "../logger.js"
import type { StorageManager } from "./storage-manager.js"

const logger = createLogger("encrypted-key-store")

export interface KeyStoreSession {
  isUnlocked: boolean
  lastActivity: number
  timeoutMs: number
}

export interface KeyInfo {
  address: Address
  label?: string
  createdAt: string
}

/**
 * Manages encrypted private key storage with session-based security
 */
export class EncryptedKeyStoreManager {
  private readonly storePath: string
  private session: KeyStoreSession
  private decryptedKeys: Map<Address, string> = new Map()

  // Default session timeout: 30 minutes
  private static readonly DEFAULT_SESSION_TIMEOUT = 30 * 60 * 1000

  constructor(storageManager: StorageManager, sessionTimeoutMs?: number) {
    const layout = storageManager.getLayout()
    this.storePath = `${layout.authDir}/encrypted-keys.json`

    this.session = {
      isUnlocked: false,
      lastActivity: 0,
      timeoutMs: sessionTimeoutMs || EncryptedKeyStoreManager.DEFAULT_SESSION_TIMEOUT,
    }
  }

  /**
   * Check if the key store exists
   */
  exists(): boolean {
    return existsSync(this.storePath)
  }

  /**
   * Create a new encrypted key store with master password
   */
  async createKeyStore(masterPassword: string): Promise<void> {
    if (this.exists()) {
      throw new Error("Key store already exists. Use unlock() to access existing store.")
    }

    const keyStore: EncryptedKeyStore = {
      version: "1.0.0",
      keys: {},
    }

    await writeFile(this.storePath, JSON.stringify(keyStore, null, 2), { mode: 0o600 })

    // Unlock the newly created store
    await this.unlock(masterPassword)

    logger.info("Created new encrypted key store")
  }

  /**
   * Unlock the key store with master password
   */
  async unlock(masterPassword: string): Promise<void> {
    if (!this.exists()) {
      throw new Error("Key store does not exist. Use createKeyStore() first.")
    }

    // Test password by trying to decrypt an existing key (if any)
    const keyStore = await this.readKeyStore()
    const keyAddresses = Object.keys(keyStore.keys)

    if (keyAddresses.length > 0) {
      // Verify password with first key
      const firstAddress = keyAddresses[0]
      if (!firstAddress) {
        throw new Error("Unable to verify password: no valid key addresses found")
      }
      const firstKey = keyStore.keys[firstAddress]
      if (!firstKey) {
        throw new Error("Unable to verify password: key data not found")
      }
      try {
        KeyEncryption.decryptPrivateKey(firstKey, masterPassword)
      } catch {
        throw new Error("Invalid master password")
      }
    }
    // If no keys exist, we can't verify password - assume it's correct for empty store

    this.session.isUnlocked = true
    this.session.lastActivity = Date.now()

    logger.info("Key store unlocked successfully")
  }

  /**
   * Lock the key store and clear sensitive data
   */
  lock(): void {
    this.session.isUnlocked = false
    this.session.lastActivity = 0

    // Clear decrypted keys from memory
    for (const [, privateKey] of this.decryptedKeys.entries()) {
      KeyEncryption.clearSensitiveData(privateKey)
    }
    this.decryptedKeys.clear()

    logger.info("Key store locked")
  }

  /**
   * Check if the session is still valid
   */
  isSessionValid(): boolean {
    if (!this.session.isUnlocked) {
      return false
    }

    const now = Date.now()
    const timeSinceActivity = now - this.session.lastActivity

    if (timeSinceActivity > this.session.timeoutMs) {
      this.lock()
      return false
    }

    return true
  }

  /**
   * Update session activity timestamp
   */
  private updateActivity(): void {
    if (this.session.isUnlocked) {
      this.session.lastActivity = Date.now()
    }
  }

  /**
   * Ensure session is valid, throw if not
   */
  private ensureUnlocked(): void {
    if (!this.isSessionValid()) {
      throw new Error("Key store is locked. Use unlock() with master password first.")
    }
    this.updateActivity()
  }

  /**
   * Read the encrypted key store from disk
   */
  private async readKeyStore(): Promise<EncryptedKeyStore> {
    try {
      const content = await readFile(this.storePath, "utf-8")
      return JSON.parse(content) as EncryptedKeyStore
    } catch (error) {
      throw new Error(
        `Failed to read key store: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Write the encrypted key store to disk
   */
  private async writeKeyStore(keyStore: EncryptedKeyStore): Promise<void> {
    try {
      await writeFile(this.storePath, JSON.stringify(keyStore, null, 2), { mode: 0o600 })
    } catch (error) {
      throw new Error(
        `Failed to write key store: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Import and encrypt a private key
   */
  async importPrivateKey(
    privateKey: string,
    masterPassword: string,
    label?: string,
  ): Promise<Address> {
    this.ensureUnlocked()

    try {
      // Validate and get address from private key
      const account = privateKeyToAccount(privateKey as `0x${string}`)
      const address = account.address

      // Check if key already exists
      const keyStore = await this.readKeyStore()
      if (keyStore.keys[address]) {
        throw new Error(`Private key for address ${address} already exists in key store`)
      }

      // Encrypt the private key
      const encryptedKey = KeyEncryption.encryptPrivateKey(privateKey, masterPassword, label)

      // Store encrypted key
      keyStore.keys[address] = encryptedKey
      await this.writeKeyStore(keyStore)

      // Cache decrypted key in session
      this.decryptedKeys.set(address, privateKey)

      logger.info({ address, label }, "Imported encrypted private key")
      return address
    } catch (error) {
      throw new Error(
        `Failed to import private key: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Get decrypted private key for an address
   */
  async getPrivateKey(address: Address, masterPassword: string): Promise<string> {
    this.ensureUnlocked()

    // Check session cache first
    const cachedKey = this.decryptedKeys.get(address)
    if (cachedKey) {
      return cachedKey
    }

    // Decrypt from storage
    const keyStore = await this.readKeyStore()
    const encryptedKey = keyStore.keys[address]

    if (!encryptedKey) {
      throw new Error(`No private key found for address ${address}`)
    }

    try {
      const privateKey = KeyEncryption.decryptPrivateKey(encryptedKey, masterPassword)

      // Cache in session
      this.decryptedKeys.set(address, privateKey)

      return privateKey
    } catch (error) {
      throw new Error(
        `Failed to decrypt private key: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Remove a private key from the store
   */
  async removePrivateKey(address: Address): Promise<boolean> {
    this.ensureUnlocked()

    const keyStore = await this.readKeyStore()

    if (!keyStore.keys[address]) {
      return false
    }

    // Remove from store
    delete keyStore.keys[address]
    await this.writeKeyStore(keyStore)

    // Clear from session cache
    const cachedKey = this.decryptedKeys.get(address)
    if (cachedKey) {
      KeyEncryption.clearSensitiveData(cachedKey)
      this.decryptedKeys.delete(address)
    }

    logger.info({ address }, "Removed encrypted private key")
    return true
  }

  /**
   * List all stored key information (without private keys)
   */
  async listKeys(): Promise<KeyInfo[]> {
    this.ensureUnlocked()

    const keyStore = await this.readKeyStore()

    return Object.entries(keyStore.keys).map(([address, encryptedKey]) => ({
      address: address as Address,
      label: encryptedKey.label,
      createdAt: encryptedKey.createdAt,
    }))
  }

  /**
   * Change master password for all keys
   */
  async changeMasterPassword(currentPassword: string, newPassword: string): Promise<void> {
    this.ensureUnlocked()

    const keyStore = await this.readKeyStore()
    const addresses = Object.keys(keyStore.keys)

    if (addresses.length === 0) {
      throw new Error("No keys in store - cannot change master password")
    }

    try {
      // Re-encrypt all keys with new password
      for (const address of addresses) {
        const encryptedKey = keyStore.keys[address]
        if (!encryptedKey) {
          throw new Error(`Key data not found for address ${address}`)
        }
        keyStore.keys[address] = KeyEncryption.changeKeyPassword(
          encryptedKey,
          currentPassword,
          newPassword,
        )
      }

      await this.writeKeyStore(keyStore)

      // Clear session cache since keys are re-encrypted
      this.decryptedKeys.clear()

      logger.info(`Changed master password for ${addresses.length} keys`)
    } catch (error) {
      throw new Error(
        `Failed to change master password: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Update label for a key
   */
  async updateKeyLabel(address: Address, label: string): Promise<void> {
    this.ensureUnlocked()

    const keyStore = await this.readKeyStore()
    const encryptedKey = keyStore.keys[address]

    if (!encryptedKey) {
      throw new Error(`No key found for address ${address}`)
    }

    encryptedKey.label = label
    await this.writeKeyStore(keyStore)

    logger.info({ address, label }, "Updated key label")
  }

  /**
   * Get session information
   */
  getSessionInfo() {
    return {
      isUnlocked: this.session.isUnlocked,
      lastActivity: this.session.lastActivity,
      timeoutMs: this.session.timeoutMs,
      timeUntilTimeout: this.session.isUnlocked
        ? Math.max(0, this.session.timeoutMs - (Date.now() - this.session.lastActivity))
        : 0,
    }
  }

  /**
   * Extend session timeout
   */
  extendSession(additionalTimeMs: number = this.session.timeoutMs): void {
    if (this.session.isUnlocked) {
      const now = Date.now()
      // Ensure we actually move forward in time
      this.session.lastActivity = Math.max(this.session.lastActivity + 1, now)
      logger.debug(`Extended session by ${additionalTimeMs}ms`)
    }
  }
}
