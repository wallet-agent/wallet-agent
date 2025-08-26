/**
 * Storage management tool handler registry
 */

import type { ToolHandler } from "../handler-registry.js"
import {
  handleClearStorageCache,
  handleExportStorageConfig,
  handleGetStorageInfo,
  handleGetStorageLayout,
  handleInitStorage,
  handleMigrateToStorage,
  handleUpdateStoragePreferences,
} from "./storage.js"

export const storageHandlers: ToolHandler[] = [
  {
    name: "init_storage",
    description: "Initialize the global storage system",
    execute: handleInitStorage,
  },
  {
    name: "get_storage_info",
    description: "Get information about the storage system",
    execute: handleGetStorageInfo,
  },
  {
    name: "update_storage_preferences",
    description: "Update user preferences in storage",
    execute: handleUpdateStoragePreferences,
  },
  {
    name: "clear_storage_cache",
    description: "Clear all cached data from storage",
    execute: handleClearStorageCache,
  },
  {
    name: "export_storage_config",
    description: "Export storage configuration",
    execute: handleExportStorageConfig,
  },
  {
    name: "get_storage_layout",
    description: "Get storage directory layout",
    execute: handleGetStorageLayout,
  },
  {
    name: "migrate_to_storage",
    description: "Migrate in-memory state to persistent storage",
    execute: handleMigrateToStorage,
  },
]
