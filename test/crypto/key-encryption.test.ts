import { describe, expect, test } from "bun:test"
import { KeyEncryption } from "../../src/crypto/key-encryption.js"

describe("KeyEncryption", () => {
  const testPrivateKey = "0x1234567890123456789012345678901234567890123456789012345678901234"
  const testPassword = "testPassword123"
  const testLabel = "My Test Key"

  describe("generateSalt", () => {
    test("should generate 32-byte salt", () => {
      const salt = KeyEncryption.generateSalt()
      expect(salt).toHaveLength(32)
    })

    test("should generate different salts", () => {
      const salt1 = KeyEncryption.generateSalt()
      const salt2 = KeyEncryption.generateSalt()
      expect(salt1.equals(salt2)).toBe(false)
    })
  })

  describe("generateIV", () => {
    test("should generate 12-byte IV", () => {
      const iv = KeyEncryption.generateIV()
      expect(iv).toHaveLength(12)
    })

    test("should generate different IVs", () => {
      const iv1 = KeyEncryption.generateIV()
      const iv2 = KeyEncryption.generateIV()
      expect(iv1.equals(iv2)).toBe(false)
    })
  })

  describe("deriveKey", () => {
    test("should derive 32-byte key", () => {
      const salt = KeyEncryption.generateSalt()
      const derivedKey = KeyEncryption.deriveKey(testPassword, salt)
      expect(derivedKey).toHaveLength(32)
    })

    test("should derive same key for same password and salt", () => {
      const salt = KeyEncryption.generateSalt()
      const key1 = KeyEncryption.deriveKey(testPassword, salt)
      const key2 = KeyEncryption.deriveKey(testPassword, salt)
      expect(key1.equals(key2)).toBe(true)
    })

    test("should derive different keys for different salts", () => {
      const salt1 = KeyEncryption.generateSalt()
      const salt2 = KeyEncryption.generateSalt()
      const key1 = KeyEncryption.deriveKey(testPassword, salt1)
      const key2 = KeyEncryption.deriveKey(testPassword, salt2)
      expect(key1.equals(key2)).toBe(false)
    })
  })

  describe("encryptPrivateKey", () => {
    test("should encrypt private key successfully", () => {
      const encrypted = KeyEncryption.encryptPrivateKey(testPrivateKey, testPassword, testLabel)
      
      expect(encrypted.encryptedData).toBeDefined()
      expect(encrypted.iv).toBeDefined()
      expect(encrypted.salt).toBeDefined()
      expect(encrypted.createdAt).toBeDefined()
      expect(encrypted.label).toBe(testLabel)
      
      // Verify base64 encoding
      expect(() => Buffer.from(encrypted.encryptedData, "base64")).not.toThrow()
      expect(() => Buffer.from(encrypted.iv, "base64")).not.toThrow()
      expect(() => Buffer.from(encrypted.salt, "base64")).not.toThrow()
    })

    test("should reject invalid private key format", () => {
      expect(() => {
        KeyEncryption.encryptPrivateKey("invalid-key", testPassword)
      }).toThrow("Invalid private key format")
    })

    test("should encrypt without label", () => {
      const encrypted = KeyEncryption.encryptPrivateKey(testPrivateKey, testPassword)
      expect(encrypted.label).toBeUndefined()
    })

    test("should produce different encrypted data for same key", () => {
      const encrypted1 = KeyEncryption.encryptPrivateKey(testPrivateKey, testPassword)
      const encrypted2 = KeyEncryption.encryptPrivateKey(testPrivateKey, testPassword)
      
      expect(encrypted1.encryptedData).not.toBe(encrypted2.encryptedData)
      expect(encrypted1.iv).not.toBe(encrypted2.iv)
      expect(encrypted1.salt).not.toBe(encrypted2.salt)
    })
  })

  describe("decryptPrivateKey", () => {
    test("should decrypt private key successfully", () => {
      const encrypted = KeyEncryption.encryptPrivateKey(testPrivateKey, testPassword, testLabel)
      const decrypted = KeyEncryption.decryptPrivateKey(encrypted, testPassword)
      
      expect(decrypted).toBe(testPrivateKey)
    })

    test("should fail with wrong password", () => {
      const encrypted = KeyEncryption.encryptPrivateKey(testPrivateKey, testPassword)
      
      expect(() => {
        KeyEncryption.decryptPrivateKey(encrypted, "wrongPassword")
      }).toThrow("Invalid password or corrupted key data")
    })

    test("should fail with corrupted encrypted data", () => {
      const encrypted = KeyEncryption.encryptPrivateKey(testPrivateKey, testPassword)
      
      // Corrupt the encrypted data
      const corrupted = {
        ...encrypted,
        encryptedData: "corrupted-data"
      }
      
      expect(() => {
        KeyEncryption.decryptPrivateKey(corrupted, testPassword)
      }).toThrow()
    })

    test("should fail with corrupted IV", () => {
      const encrypted = KeyEncryption.encryptPrivateKey(testPrivateKey, testPassword)
      
      // Corrupt the IV
      const corrupted = {
        ...encrypted,
        iv: "corrupted-iv"
      }
      
      expect(() => {
        KeyEncryption.decryptPrivateKey(corrupted, testPassword)
      }).toThrow()
    })
  })

  describe("verifyPassword", () => {
    test("should return true for correct password", () => {
      const encrypted = KeyEncryption.encryptPrivateKey(testPrivateKey, testPassword)
      const isValid = KeyEncryption.verifyPassword(encrypted, testPassword)
      
      expect(isValid).toBe(true)
    })

    test("should return false for wrong password", () => {
      const encrypted = KeyEncryption.encryptPrivateKey(testPrivateKey, testPassword)
      const isValid = KeyEncryption.verifyPassword(encrypted, "wrongPassword")
      
      expect(isValid).toBe(false)
    })
  })

  describe("changeKeyPassword", () => {
    test("should change password successfully", () => {
      const oldPassword = testPassword
      const newPassword = "newPassword456"
      
      const encrypted = KeyEncryption.encryptPrivateKey(testPrivateKey, oldPassword, testLabel)
      const reencrypted = KeyEncryption.changeKeyPassword(encrypted, oldPassword, newPassword)
      
      // Should be able to decrypt with new password
      const decrypted = KeyEncryption.decryptPrivateKey(reencrypted, newPassword)
      expect(decrypted).toBe(testPrivateKey)
      
      // Should preserve label
      expect(reencrypted.label).toBe(testLabel)
      
      // Should fail with old password
      expect(() => {
        KeyEncryption.decryptPrivateKey(reencrypted, oldPassword)
      }).toThrow()
    })

    test("should fail with wrong old password", () => {
      const encrypted = KeyEncryption.encryptPrivateKey(testPrivateKey, testPassword)
      
      expect(() => {
        KeyEncryption.changeKeyPassword(encrypted, "wrongPassword", "newPassword")
      }).toThrow()
    })
  })

  describe("security properties", () => {
    test("should use different salt and IV for each encryption", () => {
      const encrypted1 = KeyEncryption.encryptPrivateKey(testPrivateKey, testPassword)
      const encrypted2 = KeyEncryption.encryptPrivateKey(testPrivateKey, testPassword)
      
      expect(encrypted1.salt).not.toBe(encrypted2.salt)
      expect(encrypted1.iv).not.toBe(encrypted2.iv)
      expect(encrypted1.encryptedData).not.toBe(encrypted2.encryptedData)
    })

    test("should produce authenticated encryption", () => {
      const encrypted = KeyEncryption.encryptPrivateKey(testPrivateKey, testPassword)
      
      // Tampering with encrypted data should be detected
      const tamperedData = Buffer.from(encrypted.encryptedData, "base64")
      tamperedData[0] = tamperedData[0]! ^ 1 // Flip one bit
      
      const tampered = {
        ...encrypted,
        encryptedData: tamperedData.toString("base64")
      }
      
      expect(() => {
        KeyEncryption.decryptPrivateKey(tampered, testPassword)
      }).toThrow()
    })

    test("should handle edge case private keys", () => {
      const edgeCases = [
        "0x0000000000000000000000000000000000000000000000000000000000000001", // Minimum
        "0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364140", // Near maximum
      ]
      
      for (const privateKey of edgeCases) {
        const encrypted = KeyEncryption.encryptPrivateKey(privateKey, testPassword)
        const decrypted = KeyEncryption.decryptPrivateKey(encrypted, testPassword)
        expect(decrypted).toBe(privateKey)
      }
    })
  })
})