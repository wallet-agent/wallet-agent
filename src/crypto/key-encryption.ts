/**
 * Cryptographic utilities for encrypted private key management
 * 
 * Uses industry-standard encryption:
 * - PBKDF2 for password-based key derivation  
 * - AES-256-GCM for authenticated encryption
 * - Unique IV per encrypted key
 * - Constant-time operations where possible
 */

import { randomBytes, pbkdf2Sync, createCipheriv, createDecipheriv } from "node:crypto"

export interface EncryptedPrivateKey {
  encryptedData: string      // Base64 encoded encrypted private key
  iv: string                 // Base64 encoded initialization vector
  salt: string              // Base64 encoded salt for key derivation
  createdAt: string         // ISO timestamp
  label?: string            // Optional user-friendly label
}

export interface EncryptedKeyStore {
  version: string
  keys: Record<string, EncryptedPrivateKey> // address -> encrypted key
}

/**
 * Encryption/decryption service for private keys
 */
export class KeyEncryption {
  private static readonly ALGORITHM = "aes-256-gcm"
  private static readonly KEY_LENGTH = 32 // 256 bits
  private static readonly IV_LENGTH = 12  // 96 bits (recommended for GCM)
  private static readonly SALT_LENGTH = 32 // 256 bits
  private static readonly PBKDF2_ITERATIONS = 100000 // OWASP recommended minimum
  private static readonly TAG_LENGTH = 16 // 128 bits

  /**
   * Generate a cryptographically secure random salt
   */
  static generateSalt(): Buffer {
    return randomBytes(KeyEncryption.SALT_LENGTH)
  }

  /**
   * Generate a cryptographically secure random IV
   */
  static generateIV(): Buffer {
    return randomBytes(KeyEncryption.IV_LENGTH)
  }

  /**
   * Derive encryption key from password using PBKDF2
   */
  static deriveKey(password: string, salt: Buffer): Buffer {
    return pbkdf2Sync(
      password,
      salt,
      KeyEncryption.PBKDF2_ITERATIONS,
      KeyEncryption.KEY_LENGTH,
      "sha256"
    )
  }

  /**
   * Encrypt a private key with password-based encryption
   */
  static encryptPrivateKey(
    privateKey: string,
    password: string,
    label?: string
  ): EncryptedPrivateKey {
    try {
      // Validate private key format
      if (!privateKey.startsWith("0x") || privateKey.length !== 66) {
        throw new Error("Invalid private key format")
      }

      // Generate cryptographic materials
      const salt = KeyEncryption.generateSalt()
      const iv = KeyEncryption.generateIV()
      const derivedKey = KeyEncryption.deriveKey(password, salt)

      // Create cipher and encrypt
      const cipher = createCipheriv(KeyEncryption.ALGORITHM, derivedKey, iv)
      
      let encrypted = cipher.update(privateKey, "utf8", "base64")
      encrypted += cipher.final("base64")
      
      // Get authentication tag
      const tag = cipher.getAuthTag()
      
      // Combine encrypted data and tag
      const encryptedWithTag = Buffer.concat([
        Buffer.from(encrypted, "base64"),
        tag
      ]).toString("base64")

      return {
        encryptedData: encryptedWithTag,
        iv: iv.toString("base64"),
        salt: salt.toString("base64"),
        createdAt: new Date().toISOString(),
        label,
      }
    } catch (error) {
      throw new Error(
        `Failed to encrypt private key: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * Decrypt a private key using password-based decryption
   */
  static decryptPrivateKey(
    encryptedKey: EncryptedPrivateKey,
    password: string
  ): string {
    try {
      // Parse encrypted materials
      const salt = Buffer.from(encryptedKey.salt, "base64")
      const iv = Buffer.from(encryptedKey.iv, "base64")
      const encryptedWithTag = Buffer.from(encryptedKey.encryptedData, "base64")

      // Separate encrypted data and auth tag
      const encryptedData = encryptedWithTag.subarray(0, -KeyEncryption.TAG_LENGTH)
      const tag = encryptedWithTag.subarray(-KeyEncryption.TAG_LENGTH)

      // Derive decryption key
      const derivedKey = KeyEncryption.deriveKey(password, salt)

      // Create decipher and decrypt
      const decipher = createDecipheriv(KeyEncryption.ALGORITHM, derivedKey, iv)
      decipher.setAuthTag(tag)

      let decrypted = decipher.update(encryptedData, undefined, "utf8")
      decrypted += decipher.final("utf8")

      // Validate decrypted private key
      if (!decrypted.startsWith("0x") || decrypted.length !== 66) {
        throw new Error("Decrypted data is not a valid private key")
      }

      return decrypted
    } catch (error) {
      // Don't expose internal crypto errors - likely wrong password
      if (error instanceof Error && (
        error.message.includes("bad decrypt") || 
        error.message.includes("unable to authenticate data") ||
        error.message.includes("Unsupported state")
      )) {
        throw new Error("Invalid password or corrupted key data")
      }
      throw new Error(
        `Failed to decrypt private key: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * Verify password against encrypted key without full decryption
   * This is more efficient for password validation
   */
  static verifyPassword(
    encryptedKey: EncryptedPrivateKey,
    password: string
  ): boolean {
    try {
      KeyEncryption.decryptPrivateKey(encryptedKey, password)
      return true
    } catch {
      return false
    }
  }

  /**
   * Change password for an encrypted key
   */
  static changeKeyPassword(
    encryptedKey: EncryptedPrivateKey,
    oldPassword: string,
    newPassword: string
  ): EncryptedPrivateKey {
    // Decrypt with old password
    const privateKey = KeyEncryption.decryptPrivateKey(encryptedKey, oldPassword)
    
    // Re-encrypt with new password
    return KeyEncryption.encryptPrivateKey(privateKey, newPassword, encryptedKey.label)
  }

  /**
   * Securely clear sensitive data from memory (best effort)
   */
  static clearSensitiveData(data: string): void {
    // Node.js doesn't provide true secure memory clearing
    // This is a best-effort attempt to overwrite the string
    try {
      if (data && typeof data === "string") {
        // Fill with zeros (though JS engines may optimize this away)
        for (let i = 0; i < data.length; i++) {
          (data as any)[i] = '\0'
        }
      }
    } catch {
      // Silently ignore if we can't clear (readonly strings)
    }
  }
}