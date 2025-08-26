/**
 * Global Storage Manager
 *
 * Manages persistent storage at ~/.wallet-agent/ with proper security
 * and cross-platform compatibility.
 */

import { existsSync } from "node:fs"
import { access, chmod, mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises"
import { homedir } from "node:os"
import { join } from "node:path"
import type { GlobalConfig, StorageInfo, StorageLayout, UserPreferences } from "./types.js"
import { DEFAULT_CONFIG, STORAGE_VERSION } from "./types.js"

export class StorageManager {
  private layout: StorageLayout
  private initialized = false

  constructor(baseDir?: string) {
    const storageBaseDir = baseDir || join(homedir(), ".wallet-agent")

    this.layout = {
      baseDir: storageBaseDir,
      configPath: join(storageBaseDir, "config.json"),
      authDir: join(storageBaseDir, "auth"),
      walletsDir: join(storageBaseDir, "wallets"),
      networksDir: join(storageBaseDir, "networks"),
      contractsDir: join(storageBaseDir, "contracts"),
      addressBookDir: join(storageBaseDir, "addressbook"),
      cacheDir: join(storageBaseDir, "cache"),
      templatesDir: join(storageBaseDir, "templates"),
    }
  }

  /**
   * Initialize the storage system
   * Creates all necessary directories with proper permissions
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return
    }

    try {
      // Create base directory with restricted permissions (owner only)
      await this.ensureDirectory(this.layout.baseDir, 0o700)

      // Create all subdirectories
      const subdirs = [
        this.layout.authDir,
        this.layout.walletsDir,
        this.layout.networksDir,
        this.layout.contractsDir,
        this.layout.addressBookDir,
        this.layout.cacheDir,
        this.layout.templatesDir,
      ]

      for (const dir of subdirs) {
        await this.ensureDirectory(dir, 0o700)
      }

      // Initialize config file if it doesn't exist
      if (!existsSync(this.layout.configPath)) {
        await this.writeConfig(DEFAULT_CONFIG)
      } else {
        // Verify and fix permissions on existing config
        await chmod(this.layout.configPath, 0o600)

        // Validate and potentially upgrade config
        const config = await this.readConfig()
        if (config.version !== STORAGE_VERSION) {
          await this.migrateConfig(config)
        }
      }

      this.initialized = true
    } catch (error) {
      throw new Error(
        `Failed to initialize storage: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Get storage information and status
   */
  async getStorageInfo(): Promise<StorageInfo> {
    const info: StorageInfo = {
      initialized: this.initialized,
      baseDir: this.layout.baseDir,
      configExists: existsSync(this.layout.configPath),
      permissions: {
        readable: false,
        writable: false,
      },
      directories: {},
    }

    try {
      // Check base directory permissions
      await access(this.layout.baseDir, 4) // R_OK
      info.permissions.readable = true

      await access(this.layout.baseDir, 2) // W_OK
      info.permissions.writable = true
    } catch {
      // Permissions not available
    }

    // Check each directory
    const dirPaths = {
      auth: this.layout.authDir,
      wallets: this.layout.walletsDir,
      networks: this.layout.networksDir,
      contracts: this.layout.contractsDir,
      addressbook: this.layout.addressBookDir,
      cache: this.layout.cacheDir,
      templates: this.layout.templatesDir,
    }

    for (const [name, path] of Object.entries(dirPaths)) {
      info.directories[name] = {
        exists: existsSync(path),
        writable: false,
      }

      if (info.directories[name].exists) {
        try {
          await access(path, 2) // W_OK
          info.directories[name].writable = true
        } catch {
          // Not writable
        }
      }
    }

    // Calculate total size
    if (existsSync(this.layout.baseDir)) {
      info.totalSize = await this.calculateDirectorySize(this.layout.baseDir)
    }

    return info
  }

  /**
   * Read global configuration
   */
  async readConfig(): Promise<GlobalConfig> {
    try {
      const content = await readFile(this.layout.configPath, "utf-8")
      const config = JSON.parse(content) as GlobalConfig

      // Validate config structure
      if (!config.version || typeof config.version !== "string") {
        throw new Error("Invalid config: missing or invalid version")
      }

      return config
    } catch (error) {
      if (error instanceof Error && error.message.includes("ENOENT")) {
        // Config doesn't exist, return default
        return DEFAULT_CONFIG
      }
      throw new Error(
        `Failed to read config: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Write global configuration
   */
  async writeConfig(config: GlobalConfig): Promise<void> {
    try {
      const updatedConfig = {
        ...config,
        lastModified: new Date().toISOString(),
      }

      const content = JSON.stringify(updatedConfig, null, 2)
      await writeFile(this.layout.configPath, content, { mode: 0o600 })
    } catch (error) {
      throw new Error(
        `Failed to write config: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(preferences: Partial<UserPreferences>): Promise<void> {
    const config = await this.readConfig()
    config.preferences = {
      ...config.preferences,
      ...preferences,
    }
    await this.writeConfig(config)
  }

  /**
   * Clear cache directory
   */
  async clearCache(): Promise<void> {
    if (!existsSync(this.layout.cacheDir)) {
      return
    }

    try {
      const files = await readdir(this.layout.cacheDir)
      for (const file of files) {
        const filePath = join(this.layout.cacheDir, file)
        const stats = await stat(filePath)

        if (stats.isFile()) {
          await writeFile(filePath, "", { mode: 0o600 })
        }
      }
    } catch (error) {
      throw new Error(
        `Failed to clear cache: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Get storage layout paths
   */
  getLayout(): StorageLayout {
    return { ...this.layout }
  }

  /**
   * Check if storage is initialized
   */
  isInitialized(): boolean {
    return this.initialized
  }

  /**
   * Ensure directory exists with proper permissions
   */
  protected async ensureDirectory(path: string, mode: number): Promise<void> {
    try {
      await mkdir(path, { recursive: true, mode })
    } catch (error) {
      // If directory exists, just fix permissions
      if (error instanceof Error && error.message.includes("EEXIST")) {
        await chmod(path, mode)
      } else {
        throw error
      }
    }
  }

  /**
   * Migrate configuration to current version
   */
  private async migrateConfig(oldConfig: GlobalConfig): Promise<void> {
    // Future: Implement version-specific migrations here
    const newConfig: GlobalConfig = {
      ...DEFAULT_CONFIG,
      ...oldConfig,
      version: STORAGE_VERSION,
      lastModified: new Date().toISOString(),
    }

    // Create backup before migration
    const backupPath = `${this.layout.configPath}.backup.${Date.now()}`
    const oldContent = await readFile(this.layout.configPath, "utf-8")
    await writeFile(backupPath, oldContent, { mode: 0o600 })

    await this.writeConfig(newConfig)
  }

  /**
   * Calculate directory size recursively
   */
  private async calculateDirectorySize(dirPath: string): Promise<number> {
    let totalSize = 0

    try {
      const items = await readdir(dirPath)

      for (const item of items) {
        const itemPath = join(dirPath, item)
        const stats = await stat(itemPath)

        if (stats.isDirectory()) {
          totalSize += await this.calculateDirectorySize(itemPath)
        } else {
          totalSize += stats.size
        }
      }
    } catch {
      // Ignore errors when calculating size
    }

    return totalSize
  }
}
