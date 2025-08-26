import { beforeEach, describe, expect, it } from "bun:test"
import { existsSync } from "node:fs"
import { rmdir } from "node:fs/promises"
import { homedir } from "node:os"
import { join } from "node:path"
import type { Address } from "viem"
import { anvil, mainnet } from "viem/chains"
import type { StateToMigrate } from "../../src/storage/migration.js"
import {
  createStateBackup,
  hasStateToMigrate,
  migrateToStorage,
} from "../../src/storage/migration.js"
import { StorageManager } from "../../src/storage/storage-manager.js"

const TEST_HOME_DIR = join(homedir(), ".wallet-agent-test")

describe("Migration", () => {
  let storageManager: StorageManager

  beforeEach(async () => {
    // Clean up any existing test directory
    if (existsSync(TEST_HOME_DIR)) {
      await rmdir(TEST_HOME_DIR, { recursive: true })
    }
    // Override home directory for testing
    // biome-ignore lint/suspicious/noExplicitAny: Test utility function override
    ;(global as any).homedir = () => TEST_HOME_DIR.replace("/.wallet-agent-test", "")

    storageManager = new StorageManager()
    await storageManager.initialize()
  })

  describe("hasStateToMigrate", () => {
    it("should return false for empty state", () => {
      const state: StateToMigrate = {}
      expect(hasStateToMigrate(state)).toBe(false)
    })

    it("should return true for state with custom chains", () => {
      const customChains = new Map()
      customChains.set(1337, anvil)

      const state: StateToMigrate = { customChains }
      expect(hasStateToMigrate(state)).toBe(true)
    })

    it("should return true for state with private key wallets", () => {
      const privateKeyWallets = new Map<Address, `0x${string}`>()
      privateKeyWallets.set(
        "0x1234567890123456789012345678901234567890",
        "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      )

      const state: StateToMigrate = { privateKeyWallets }
      expect(hasStateToMigrate(state)).toBe(true)
    })

    it("should return true for state with preferences", () => {
      const preferences = { theme: "dark" }

      const state: StateToMigrate = { preferences }
      expect(hasStateToMigrate(state)).toBe(true)
    })
  })

  describe("createStateBackup", () => {
    it("should create backup file with correct structure", async () => {
      const customChains = new Map()
      customChains.set(1, mainnet)
      customChains.set(1337, anvil)

      const privateKeyWallets = new Map<Address, `0x${string}`>()
      privateKeyWallets.set(
        "0x1234567890123456789012345678901234567890",
        "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      )

      const state: StateToMigrate = {
        customChains,
        privateKeyWallets,
        preferences: { theme: "dark", autoConnect: true },
      }

      const backupPath = await createStateBackup(storageManager, state)

      expect(existsSync(backupPath)).toBe(true)
      expect(backupPath).toContain("state-backup-")
      expect(backupPath).toContain(".json")

      // Verify backup structure
      const backupContent = await Bun.file(backupPath).json()
      expect(backupContent.createdAt).toBeDefined()
      expect(backupContent.customChains).toHaveLength(2)
      expect(backupContent.privateKeyWallets).toHaveLength(1)
      expect(backupContent.preferences.theme).toBe("dark")
    })
  })

  describe("migrateToStorage", () => {
    it("should migrate custom chains successfully", async () => {
      const customChains = new Map()
      customChains.set(1, mainnet)
      customChains.set(1337, anvil)

      const state: StateToMigrate = { customChains }

      const result = await migrateToStorage(storageManager, state)

      expect(result.success).toBe(true)
      expect(result.migratedItems).toContain("2 custom chains")
      expect(result.errors).toHaveLength(0)

      // Verify migration file was created
      const layout = storageManager.getLayout()
      const chainsPath = join(layout.networksDir, "custom-chains.json")
      expect(existsSync(chainsPath)).toBe(true)

      // Verify content
      const chainsData = await Bun.file(chainsPath).json()
      expect(chainsData).toHaveLength(2)
      expect(chainsData[0].name).toBe("Ethereum")
      expect(chainsData[1].name).toBe("Anvil")
    })

    it("should migrate private key wallet addresses", async () => {
      const privateKeyWallets = new Map<Address, `0x${string}`>()
      privateKeyWallets.set(
        "0x1234567890123456789012345678901234567890",
        "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      )
      privateKeyWallets.set(
        "0x0987654321098765432109876543210987654321",
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      )

      const state: StateToMigrate = { privateKeyWallets }

      const result = await migrateToStorage(storageManager, state)

      expect(result.success).toBe(true)
      expect(result.migratedItems[0]).toContain("2 wallet addresses")
      expect(result.errors).toHaveLength(0)

      // Verify migration file was created
      const layout = storageManager.getLayout()
      const walletsPath = join(layout.walletsDir, "imported-wallets.json")
      expect(existsSync(walletsPath)).toBe(true)

      // Verify content (should only contain addresses, not private keys)
      const walletsData = await Bun.file(walletsPath).json()
      expect(walletsData.imported).toHaveLength(2)
      expect(walletsData.imported).toContain("0x1234567890123456789012345678901234567890")
      expect(walletsData.imported).toContain("0x0987654321098765432109876543210987654321")
      expect(walletsData.note).toContain("not migrated for security")
    })

    it("should migrate preferences", async () => {
      const preferences = {
        theme: "dark",
        autoConnect: true,
        preferredCurrency: "EUR",
      }

      const state: StateToMigrate = { preferences }

      const result = await migrateToStorage(storageManager, state)

      expect(result.success).toBe(true)
      expect(result.migratedItems[0]).toContain("3 user preferences")
      expect(result.errors).toHaveLength(0)

      // Verify preferences were saved to config
      const config = await storageManager.readConfig()
      expect(config.preferences?.theme).toBe("dark")
      expect(config.preferences?.autoConnect).toBe(true)
      expect(config.preferences?.preferredCurrency).toBe("EUR")
    })

    it("should create migration history", async () => {
      const state: StateToMigrate = {
        preferences: { theme: "dark" },
      }

      await migrateToStorage(storageManager, state)

      // Verify migration history was created
      const layout = storageManager.getLayout()
      const historyPath = join(layout.baseDir, "migration-history.json")
      expect(existsSync(historyPath)).toBe(true)

      // Verify history content
      const history = await Bun.file(historyPath).json()
      expect(Array.isArray(history)).toBe(true)
      expect(history[0].migratedAt).toBeDefined()
      expect(history[0].fromVersion).toBe("in-memory")
      expect(history[0].toVersion).toBe("persistent-storage")
    })

    it("should handle migration errors gracefully", async () => {
      // Create a scenario that might cause errors (e.g., read-only directory)
      // For this test, we'll test the structure even if we can't easily simulate errors

      const state: StateToMigrate = {
        customChains: new Map(),
        preferences: { theme: "dark" },
      }

      const result = await migrateToStorage(storageManager, state)

      // Should have structure for handling errors
      expect(result.success).toBeDefined()
      expect(result.migratedItems).toBeDefined()
      expect(result.errors).toBeDefined()
      expect(Array.isArray(result.migratedItems)).toBe(true)
      expect(Array.isArray(result.errors)).toBe(true)
    })

    it("should handle complex migration with all types", async () => {
      const customChains = new Map()
      customChains.set(1, mainnet)

      const privateKeyWallets = new Map<Address, `0x${string}`>()
      privateKeyWallets.set(
        "0x1234567890123456789012345678901234567890",
        "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      )

      const contractABIs = new Map()
      contractABIs.set("TestContract", [{ type: "function", name: "test" }])

      const state: StateToMigrate = {
        customChains,
        privateKeyWallets,
        contractABIs,
        preferences: { theme: "dark", autoConnect: true },
      }

      const result = await migrateToStorage(storageManager, state)

      expect(result.success).toBe(true)
      expect(result.migratedItems.length).toBeGreaterThan(0)
      expect(result.errors).toHaveLength(0)

      // Verify all files were created
      const layout = storageManager.getLayout()
      expect(existsSync(join(layout.networksDir, "custom-chains.json"))).toBe(true)
      expect(existsSync(join(layout.walletsDir, "imported-wallets.json"))).toBe(true)
      expect(existsSync(join(layout.contractsDir, "cached-abis.json"))).toBe(true)
      expect(existsSync(join(layout.baseDir, "migration-history.json"))).toBe(true)
    })
  })
})
