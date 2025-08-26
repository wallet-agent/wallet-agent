/**
 * Migration utilities for moving from in-memory to persistent storage
 */

import { writeFile } from "node:fs/promises"
import { join } from "node:path"
import type { Address, Chain } from "viem"
import { createLogger } from "../logger.js"
import type { StorageManager } from "./storage-manager.js"
import type { MigrationResult } from "./types.js"

const logger = createLogger("migration")

export interface StateToMigrate {
  customChains?: Map<number, Chain>
  privateKeyWallets?: Map<Address, `0x${string}`>
  contractABIs?: Map<string, unknown>
  preferences?: Record<string, unknown>
}

/**
 * Migrate in-memory state to persistent storage
 */
export async function migrateToStorage(
  storageManager: StorageManager,
  state: StateToMigrate,
): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    migratedItems: [],
    errors: [],
  }

  try {
    // Ensure storage is initialized
    if (!storageManager.isInitialized()) {
      await storageManager.initialize()
    }

    const layout = storageManager.getLayout()

    // Migrate custom chains
    if (state.customChains && state.customChains.size > 0) {
      try {
        const chainsData = Array.from(state.customChains.values()).map((chain) => ({
          id: chain.id,
          name: chain.name,
          nativeCurrency: chain.nativeCurrency,
          rpcUrls: chain.rpcUrls,
          blockExplorers: chain.blockExplorers,
          contracts: chain.contracts,
          testnet: chain.testnet,
        }))

        const chainsPath = join(layout.networksDir, "custom-chains.json")
        await writeFile(chainsPath, JSON.stringify(chainsData, null, 2), { mode: 0o600 })

        result.migratedItems.push(`${state.customChains.size} custom chains`)
        logger.info(`Migrated ${state.customChains.size} custom chains`)
      } catch (error) {
        const errorMsg = `Failed to migrate custom chains: ${error instanceof Error ? error.message : String(error)}`
        result.errors.push(errorMsg)
        logger.error(errorMsg)
      }
    }

    // Migrate private key wallets (encrypted)
    if (state.privateKeyWallets && state.privateKeyWallets.size > 0) {
      try {
        // For security, we'll store wallet addresses only, not private keys
        // Private keys should be re-imported by user when needed
        const walletAddresses = Array.from(state.privateKeyWallets.keys())
        const walletsData = {
          imported: walletAddresses,
          note: "Private keys not migrated for security. Please re-import using import_private_key tool.",
          migratedAt: new Date().toISOString(),
        }

        const walletsPath = join(layout.walletsDir, "imported-wallets.json")
        await writeFile(walletsPath, JSON.stringify(walletsData, null, 2), { mode: 0o600 })

        result.migratedItems.push(
          `${state.privateKeyWallets.size} wallet addresses (keys require re-import)`,
        )
        logger.info(`Migrated ${state.privateKeyWallets.size} wallet addresses`)
      } catch (error) {
        const errorMsg = `Failed to migrate wallet addresses: ${error instanceof Error ? error.message : String(error)}`
        result.errors.push(errorMsg)
        logger.error(errorMsg)
      }
    }

    // Migrate contract ABIs
    if (state.contractABIs && state.contractABIs.size > 0) {
      try {
        const contractsData = Object.fromEntries(state.contractABIs)
        const contractsPath = join(layout.contractsDir, "cached-abis.json")
        await writeFile(contractsPath, JSON.stringify(contractsData, null, 2), { mode: 0o600 })

        result.migratedItems.push(`${state.contractABIs.size} contract ABIs`)
        logger.info(`Migrated ${state.contractABIs.size} contract ABIs`)
      } catch (error) {
        const errorMsg = `Failed to migrate contract ABIs: ${error instanceof Error ? error.message : String(error)}`
        result.errors.push(errorMsg)
        logger.error(errorMsg)
      }
    }

    // Update preferences if provided
    if (state.preferences && Object.keys(state.preferences).length > 0) {
      try {
        await storageManager.updatePreferences(state.preferences)
        result.migratedItems.push(`${Object.keys(state.preferences).length} user preferences`)
        logger.info(`Migrated ${Object.keys(state.preferences).length} preferences`)
      } catch (error) {
        const errorMsg = `Failed to migrate preferences: ${error instanceof Error ? error.message : String(error)}`
        result.errors.push(errorMsg)
        logger.error(errorMsg)
      }
    }

    // Create migration record
    const migrationRecord = {
      migratedAt: new Date().toISOString(),
      migratedItems: result.migratedItems,
      errors: result.errors,
      fromVersion: "in-memory",
      toVersion: "persistent-storage",
    }

    const migrationPath = join(layout.baseDir, "migration-history.json")
    await writeFile(migrationPath, JSON.stringify([migrationRecord], null, 2), { mode: 0o600 })

    if (result.errors.length > 0) {
      result.success = false
    }

    logger.info(
      `Migration completed: ${result.migratedItems.length} items migrated, ${result.errors.length} errors`,
    )
  } catch (error) {
    result.success = false
    const errorMsg = `Migration failed: ${error instanceof Error ? error.message : String(error)}`
    result.errors.push(errorMsg)
    logger.error(errorMsg)
  }

  return result
}

/**
 * Check if there's in-memory state that can be migrated
 */
export function hasStateToMigrate(state: StateToMigrate): boolean {
  return Boolean(
    (state.customChains && state.customChains.size > 0) ||
      (state.privateKeyWallets && state.privateKeyWallets.size > 0) ||
      (state.contractABIs && state.contractABIs.size > 0) ||
      (state.preferences && Object.keys(state.preferences).length > 0),
  )
}

/**
 * Create a backup of current in-memory state
 */
export async function createStateBackup(
  storageManager: StorageManager,
  state: StateToMigrate,
): Promise<string> {
  const layout = storageManager.getLayout()
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const backupPath = join(layout.baseDir, `state-backup-${timestamp}.json`)

  const backupData = {
    createdAt: new Date().toISOString(),
    customChains: state.customChains ? Array.from(state.customChains.entries()) : [],
    privateKeyWallets: state.privateKeyWallets ? Array.from(state.privateKeyWallets.keys()) : [],
    contractABIs: state.contractABIs ? Array.from(state.contractABIs.entries()) : [],
    preferences: state.preferences || {},
  }

  await writeFile(backupPath, JSON.stringify(backupData, null, 2), { mode: 0o600 })
  logger.info(`State backup created: ${backupPath}`)

  return backupPath
}
