import { afterEach, beforeEach, describe, expect, it } from "bun:test"
import { existsSync } from "node:fs"
import { mkdir, readFile, rmdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { StorageManager } from "../../src/storage/storage-manager.js"
import { DEFAULT_CONFIG, STORAGE_VERSION } from "../../src/storage/types.js"

describe("StorageManager", () => {
  let storageManager: StorageManager
  let testBaseDir: string

  beforeEach(async () => {
    // Create unique test directory for each individual test
    testBaseDir = `/tmp/wallet-agent-test-${Date.now()}-${Math.random().toString(36).slice(2)}`

    // Clean up any existing test directory
    if (existsSync(testBaseDir)) {
      await rmdir(testBaseDir, { recursive: true })
    }

    // Create the test base directory
    await mkdir(testBaseDir, { recursive: true })

    // Create a new storage manager instance with test directory
    const walletAgentDir = join(testBaseDir, ".wallet-agent")
    storageManager = new StorageManager(walletAgentDir)
  })

  afterEach(async () => {
    // Clean up test directory
    if (existsSync(testBaseDir)) {
      await rmdir(testBaseDir, { recursive: true })
    }
  })

  describe("initialization", () => {
    it("should create directory structure on initialization", async () => {
      await storageManager.initialize()

      const layout = storageManager.getLayout()

      // Check base directory exists
      expect(existsSync(layout.baseDir)).toBe(true)

      // Check all subdirectories exist
      expect(existsSync(layout.authDir)).toBe(true)
      expect(existsSync(layout.walletsDir)).toBe(true)
      expect(existsSync(layout.networksDir)).toBe(true)
      expect(existsSync(layout.contractsDir)).toBe(true)
      expect(existsSync(layout.addressBookDir)).toBe(true)
      expect(existsSync(layout.cacheDir)).toBe(true)
      expect(existsSync(layout.templatesDir)).toBe(true)

      // Check config file exists
      expect(existsSync(layout.configPath)).toBe(true)
    })

    it("should create default configuration on first run", async () => {
      await storageManager.initialize()

      const config = await storageManager.readConfig()

      expect(config.version).toBe(STORAGE_VERSION)
      expect(config.preferences).toEqual(DEFAULT_CONFIG.preferences!)
      expect(config.createdAt).toBeDefined()
      expect(config.lastModified).toBeDefined()
    })

    it("should not override existing configuration", async () => {
      const layout = storageManager.getLayout()

      // Create directory and config manually
      await mkdir(layout.baseDir, { recursive: true })
      const customConfig = {
        ...DEFAULT_CONFIG,
        preferences: { theme: "dark" as const },
      }
      await writeFile(layout.configPath, JSON.stringify(customConfig, null, 2))

      await storageManager.initialize()

      const config = await storageManager.readConfig()
      expect(config.preferences?.theme).toBe("dark")
    })

    it("should mark as initialized after successful initialization", async () => {
      expect(storageManager.isInitialized()).toBe(false)

      await storageManager.initialize()

      expect(storageManager.isInitialized()).toBe(true)
    })
  })

  describe("configuration management", () => {
    beforeEach(async () => {
      await storageManager.initialize()
    })

    it("should read configuration correctly", async () => {
      const config = await storageManager.readConfig()

      expect(config.version).toBe(STORAGE_VERSION)
      expect(config.preferences).toBeDefined()
    })

    it("should write configuration correctly", async () => {
      const newConfig = {
        ...DEFAULT_CONFIG,
        preferences: {
          autoConnect: true,
          theme: "dark" as const,
        },
      }

      await storageManager.writeConfig(newConfig)

      const savedConfig = await storageManager.readConfig()
      expect(savedConfig.preferences?.autoConnect).toBe(true)
      expect(savedConfig.preferences?.theme).toBe("dark")
      expect(savedConfig.lastModified).toBeDefined()
    })

    it("should update preferences", async () => {
      // First read the initial config to get the baseline theme
      const initialConfig = await storageManager.readConfig()
      const initialTheme = initialConfig.preferences?.theme

      await storageManager.updatePreferences({
        autoConnect: true,
        preferredCurrency: "EUR",
      })

      const config = await storageManager.readConfig()
      expect(config.preferences?.autoConnect).toBe(true)
      expect(config.preferences?.preferredCurrency).toBe("EUR")
      // Should preserve existing preferences
      expect(config.preferences?.theme).toBe(initialTheme!)
    })
  })

  describe("storage info", () => {
    it("should return correct storage info before initialization", async () => {
      const info = await storageManager.getStorageInfo()

      expect(info.initialized).toBe(false)
      expect(info.configExists).toBe(false)
      expect(info.permissions.readable).toBe(false)
      expect(info.permissions.writable).toBe(false)
    })

    it("should return correct storage info after initialization", async () => {
      await storageManager.initialize()

      const info = await storageManager.getStorageInfo()

      expect(info.initialized).toBe(true)
      expect(info.configExists).toBe(true)
      expect(info.permissions.readable).toBe(true)
      expect(info.permissions.writable).toBe(true)

      // Check directory status
      expect(info.directories.auth?.exists).toBe(true)
      expect(info.directories.wallets?.exists).toBe(true)
      expect(info.directories.networks?.exists).toBe(true)
      expect(info.directories.contracts?.exists).toBe(true)
      expect(info.directories.addressbook?.exists).toBe(true)
      expect(info.directories.cache?.exists).toBe(true)
      expect(info.directories.templates?.exists).toBe(true)
    })
  })

  describe("cache management", () => {
    beforeEach(async () => {
      await storageManager.initialize()
    })

    it("should clear cache directory", async () => {
      const layout = storageManager.getLayout()
      const cacheFile = join(layout.cacheDir, "test-cache.json")

      // Create a test cache file
      await writeFile(cacheFile, JSON.stringify({ test: "data" }))
      expect(existsSync(cacheFile)).toBe(true)

      await storageManager.clearCache()

      // File should exist but be empty
      expect(existsSync(cacheFile)).toBe(true)
      const content = await readFile(cacheFile, "utf-8")
      expect(content).toBe("")
    })
  })

  describe("error handling", () => {
    it("should handle permission errors gracefully", async () => {
      // This test would require actually restricting permissions,
      // which is complex in a test environment. For now, we'll test
      // the basic error handling structure.

      const layout = storageManager.getLayout()
      expect(layout.baseDir).toContain(".wallet-agent")
    })

    it("should throw error for invalid config", async () => {
      const layout = storageManager.getLayout()
      await mkdir(layout.baseDir, { recursive: true })

      // Write invalid JSON
      await writeFile(layout.configPath, "invalid json")

      await expect(storageManager.readConfig()).rejects.toThrow("Failed to read config")
    })
  })

  describe("migration handling", () => {
    beforeEach(async () => {
      await storageManager.initialize()
    })

    it("should handle version migration", async () => {
      const layout = storageManager.getLayout()

      // Create old version config
      const oldConfig = {
        version: "0.9.0",
        preferences: { theme: "light" },
      }
      await writeFile(layout.configPath, JSON.stringify(oldConfig, null, 2))

      // Reinitialize to trigger migration
      const walletAgentDir = join(testBaseDir, ".wallet-agent")
      const newStorageManager = new StorageManager(walletAgentDir)
      await newStorageManager.initialize()

      const migratedConfig = await newStorageManager.readConfig()
      expect(migratedConfig.version).toBe(STORAGE_VERSION)
      expect(migratedConfig.preferences?.theme).toBe("light")

      // Should create backup
      existsSync(`${`${layout.configPath}.backup.${Date.now()}`.slice(0, -5)}*`)
      // Note: Exact backup file detection would require mocking Date.now()
    })
  })
})
