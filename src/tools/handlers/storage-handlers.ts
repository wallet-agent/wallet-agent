/**
 * Storage management tool handler registry (consolidated)
 */

import type { ToolHandler } from "../handler-registry.js"
import {
  handleGetStorageInfo,
  handleInitStorage,
  handleManageStoragePreferences,
  handleMigrateToStorage,
} from "./storage.js"

export const storageHandlers: ToolHandler[] = [
  {
    name: "init_storage",
    description: "Initialize the global storage system with optional cache clearing",
    execute: handleInitStorage,
  },
  {
    name: "get_storage_info",
    description: "Get storage information with optional detailed view and export functionality",
    execute: handleGetStorageInfo,
  },
  {
    name: "manage_storage_preferences",
    description: "View or update user preferences in storage",
    execute: handleManageStoragePreferences,
  },
  {
    name: "migrate_to_storage",
    description: "Migrate in-memory state to persistent storage",
    execute: handleMigrateToStorage,
  },
]
