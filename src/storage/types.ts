/**
 * Type definitions for the global storage system
 */

export interface GlobalConfig {
  version: string
  defaultChainId?: number
  preferences?: UserPreferences
  createdAt: string
  lastModified: string
}

export interface UserPreferences {
  autoConnect?: boolean
  defaultGasPrice?: string
  maxGasLimit?: number
  preferredCurrency?: string
  theme?: "light" | "dark" | "auto"
}

export interface StorageLayout {
  baseDir: string
  configPath: string
  authDir: string
  walletsDir: string
  networksDir: string
  contractsDir: string
  addressBookDir: string
  cacheDir: string
  templatesDir: string
  instructionsPath: string
}

export interface StorageInfo {
  initialized: boolean
  baseDir: string
  configExists: boolean
  permissions: {
    readable: boolean
    writable: boolean
  }
  directories: {
    [key: string]: {
      exists: boolean
      writable: boolean
    }
  }
  totalSize?: number
}

export interface MigrationResult {
  success: boolean
  migratedItems: string[]
  errors: string[]
  backupPath?: string
}

export const STORAGE_VERSION = "1.0.0"

export const DEFAULT_CONFIG: GlobalConfig = {
  version: STORAGE_VERSION,
  preferences: {
    autoConnect: false,
    preferredCurrency: "USD",
    theme: "auto",
  },
  createdAt: new Date().toISOString(),
  lastModified: new Date().toISOString(),
}
