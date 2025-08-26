/**
 * Storage management tool handlers
 */

import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js"
import { getContainer } from "../../container.js"
import { createStateBackup, hasStateToMigrate, migrateToStorage } from "../../storage/migration.js"
import type { UserPreferences } from "../../storage/types.js"
import { createUserFriendlyError } from "../../utils/error-messages.js"

interface InitStorageArgs {
  force?: boolean
}

interface UpdateStoragePreferencesArgs extends Partial<UserPreferences> {}

interface ClearStorageCacheArgs {
  confirm: boolean
}

interface ExportStorageConfigArgs {
  includePreferences?: boolean
  format?: "json" | "yaml"
}

interface MigrateToStorageArgs {
  createBackup?: boolean
  force?: boolean
}

export async function handleInitStorage(args?: InitStorageArgs) {
  const container = getContainer()
  const storageManager = container.getStorageManager()

  if (!storageManager) {
    throw new McpError(
      ErrorCode.InternalError,
      "Storage is not available. Storage may be disabled or failed to initialize.",
    )
  }

  try {
    const force = args?.force || false

    if (!force && storageManager.isInitialized()) {
      const info = await storageManager.getStorageInfo()
      return {
        content: [
          {
            type: "text",
            text: `Storage already initialized at ${info.baseDir}
Status: ${info.initialized ? "✅ Initialized" : "❌ Not initialized"}
Config exists: ${info.configExists ? "Yes" : "No"}
Writable: ${info.permissions.writable ? "Yes" : "No"}

Use force: true to reinitialize.`,
          },
        ],
      }
    }

    await storageManager.initialize()
    const info = await storageManager.getStorageInfo()

    return {
      content: [
        {
          type: "text",
          text: `✅ Storage initialized successfully!

Base directory: ${info.baseDir}
Config file: ${info.configExists ? "Created" : "Already exists"}
Permissions: ${info.permissions.writable ? "Writable" : "Read-only"}

Directory structure:
${Object.entries(info.directories)
  .map(
    ([name, dir]) =>
      `- ${name}/: ${dir.exists ? "✅" : "❌"} ${dir.writable ? "(writable)" : "(read-only)"}`,
  )
  .join("\\n")}

Storage is now ready for use.`,
        },
      ],
    }
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      createUserFriendlyError(error, "storage initialization"),
    )
  }
}

export async function handleGetStorageInfo() {
  const container = getContainer()
  const storageManager = container.getStorageManager()

  if (!storageManager) {
    return {
      content: [
        {
          type: "text",
          text: `❌ Storage not available

Storage is currently disabled or failed to initialize. The wallet-agent is running with in-memory storage only.

To enable storage:
1. Ensure you have write permissions to your home directory
2. Check that there are no permission issues with ~/.wallet-agent/
3. Restart the wallet-agent`,
        },
      ],
    }
  }

  try {
    const info = await storageManager.getStorageInfo()
    const config = await storageManager.readConfig()

    const sizeFormatted = info.totalSize ? `${(info.totalSize / 1024).toFixed(2)} KB` : "Unknown"

    return {
      content: [
        {
          type: "text",
          text: `📁 Storage Information

**Status:** ${info.initialized ? "✅ Initialized" : "❌ Not initialized"}
**Base Directory:** ${info.baseDir}
**Config File:** ${info.configExists ? "✅ Exists" : "❌ Missing"}
**Permissions:** ${info.permissions.readable ? "✅ Readable" : "❌ Not readable"} | ${info.permissions.writable ? "✅ Writable" : "❌ Not writable"}
**Total Size:** ${sizeFormatted}

**Configuration:**
- Version: ${config.version}
- Created: ${config.createdAt}
- Last Modified: ${config.lastModified}

**User Preferences:**
${
  config.preferences
    ? Object.entries(config.preferences)
        .map(([key, value]) => `- ${key}: ${value}`)
        .join("\\n")
    : "- No preferences set"
}

**Directory Structure:**
${Object.entries(info.directories)
  .map(
    ([name, dir]) =>
      `- ${name}/: ${dir.exists ? "✅" : "❌"} ${dir.writable ? "(writable)" : "(read-only)"}`,
  )
  .join("\\n")}`,
        },
      ],
    }
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      createUserFriendlyError(error, "getting storage info"),
    )
  }
}

export async function handleUpdateStoragePreferences(args: UpdateStoragePreferencesArgs) {
  const container = getContainer()
  const storageManager = container.getStorageManager()

  if (!storageManager) {
    throw new McpError(
      ErrorCode.InternalError,
      "Storage is not available. Cannot update preferences without persistent storage.",
    )
  }

  try {
    await storageManager.updatePreferences(args)
    const config = await storageManager.readConfig()

    return {
      content: [
        {
          type: "text",
          text: `✅ Preferences updated successfully!

Current preferences:
${
  config.preferences
    ? Object.entries(config.preferences)
        .map(([key, value]) => `- ${key}: ${value}`)
        .join("\\n")
    : "- No preferences set"
}

Changes will take effect immediately and persist across sessions.`,
        },
      ],
    }
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      createUserFriendlyError(error, "updating preferences"),
    )
  }
}

export async function handleClearStorageCache(args: ClearStorageCacheArgs) {
  if (!args.confirm) {
    throw new McpError(
      ErrorCode.InvalidParams,
      "Must confirm cache clearing by setting confirm: true",
    )
  }

  const container = getContainer()
  const storageManager = container.getStorageManager()

  if (!storageManager) {
    throw new McpError(
      ErrorCode.InternalError,
      "Storage is not available. Cannot clear cache without persistent storage.",
    )
  }

  try {
    await storageManager.clearCache()

    return {
      content: [
        {
          type: "text",
          text: `✅ Cache cleared successfully!

All cached data has been removed from ~/.wallet-agent/cache/
This includes:
- Contract ABIs cache
- Network metadata cache  
- Transaction history cache
- Other temporary data

The cache will be rebuilt as needed during normal operation.`,
        },
      ],
    }
  } catch (error) {
    throw new McpError(ErrorCode.InternalError, createUserFriendlyError(error, "clearing cache"))
  }
}

export async function handleExportStorageConfig(args?: ExportStorageConfigArgs) {
  const container = getContainer()
  const storageManager = container.getStorageManager()

  if (!storageManager) {
    throw new McpError(
      ErrorCode.InternalError,
      "Storage is not available. Cannot export configuration without persistent storage.",
    )
  }

  try {
    const config = await storageManager.readConfig()
    const includePreferences = args?.includePreferences !== false
    const format = args?.format || "json"

    const exportData = {
      version: config.version,
      exportedAt: new Date().toISOString(),
      ...(includePreferences && { preferences: config.preferences }),
    }

    let formattedOutput: string

    if (format === "yaml") {
      // Simple YAML formatting (could use a proper YAML library in the future)
      formattedOutput = Object.entries(exportData)
        .map(([key, value]) => {
          if (typeof value === "object" && value !== null) {
            const nested = Object.entries(value)
              .map(([k, v]) => `  ${k}: ${JSON.stringify(v)}`)
              .join("\\n")
            return `${key}:\\n${nested}`
          }
          return `${key}: ${JSON.stringify(value)}`
        })
        .join("\\n")
    } else {
      formattedOutput = JSON.stringify(exportData, null, 2)
    }

    return {
      content: [
        {
          type: "text",
          text: `📤 Storage Configuration Export

**Format:** ${format.toUpperCase()}
**Includes Preferences:** ${includePreferences ? "Yes" : "No"}
**Exported At:** ${exportData.exportedAt}

\`\`\`${format}
${formattedOutput}
\`\`\`

You can save this configuration and use it to restore settings on another system or as a backup.`,
        },
      ],
    }
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      createUserFriendlyError(error, "exporting configuration"),
    )
  }
}

export async function handleGetStorageLayout() {
  const container = getContainer()
  const storageManager = container.getStorageManager()

  if (!storageManager) {
    throw new McpError(
      ErrorCode.InternalError,
      "Storage is not available. Cannot get layout without persistent storage.",
    )
  }

  try {
    const layout = storageManager.getLayout()

    return {
      content: [
        {
          type: "text",
          text: `📂 Storage Directory Layout

**Base Directory:** ${layout.baseDir}

**Configuration:**
- Config file: ${layout.configPath}

**Data Directories:**
- Authentication: ${layout.authDir}
- Wallets: ${layout.walletsDir}
- Networks: ${layout.networksDir}
- Contracts: ${layout.contractsDir}
- Address Book: ${layout.addressBookDir}
- Cache: ${layout.cacheDir}
- Templates: ${layout.templatesDir}

**Directory Structure:**
\`\`\`
${layout.baseDir}/
├── config.json
├── auth/
├── wallets/
├── networks/
├── contracts/
├── addressbook/
├── cache/
└── templates/
\`\`\`

All directories are created with 0o700 permissions (owner read/write/execute only) for security.`,
        },
      ],
    }
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      createUserFriendlyError(error, "getting storage layout"),
    )
  }
}

export async function handleMigrateToStorage(args?: MigrateToStorageArgs) {
  const container = getContainer()
  const storageManager = container.getStorageManager()

  if (!storageManager) {
    throw new McpError(
      ErrorCode.InternalError,
      "Storage is not available. Cannot migrate to persistent storage.",
    )
  }

  try {
    const createBackup = args?.createBackup !== false
    const force = args?.force || false

    // Collect current in-memory state
    const state = {
      customChains: container.customChains,
      privateKeyWallets: container.privateKeyWallets,
      // TODO: Add contract ABIs and preferences when available
    }

    // Check if there's anything to migrate
    if (!hasStateToMigrate(state)) {
      return {
        content: [
          {
            type: "text",
            text: `📦 No State to Migrate

No in-memory state found that needs migration:
- Custom chains: ${state.customChains.size} (${state.customChains.size === 0 ? "none" : "available"})
- Private key wallets: ${state.privateKeyWallets.size} (${state.privateKeyWallets.size === 0 ? "none" : "available"})

Your current state is already using persistent storage or there's nothing to migrate.`,
          },
        ],
      }
    }

    // Check if storage already contains data and force is not set
    const storageInfo = await storageManager.getStorageInfo()
    if (!force && storageInfo.initialized && storageInfo.configExists) {
      return {
        content: [
          {
            type: "text",
            text: `⚠️  Storage Already Initialized

Storage already contains configuration data. Found:
- Custom chains: ${state.customChains.size} in memory
- Private key wallets: ${state.privateKeyWallets.size} in memory

To proceed with migration and potentially overwrite existing data, use:
\`\`\`
migrate_to_storage({ force: true })
\`\`\`

Or first check existing storage with:
\`\`\`
get_storage_info()
\`\`\``,
          },
        ],
      }
    }

    let backupPath: string | undefined

    // Create backup if requested
    if (createBackup) {
      backupPath = await createStateBackup(storageManager, state)
    }

    // Perform migration
    const result = await migrateToStorage(storageManager, state)

    const statusText = result.success
      ? "✅ Migration Completed Successfully!"
      : "⚠️  Migration Completed with Errors"

    const migrationSummary = `🔄 State Migration Summary

**Status:** ${statusText}

**Migrated Items:**
${
  result.migratedItems.length > 0
    ? result.migratedItems.map((item) => `- ✅ ${item}`).join("\\n")
    : "- No items were migrated"
}

${
  result.errors.length > 0
    ? `**Errors:**\\n${result.errors.map((error) => `- ❌ ${error}`).join("\\n")}\\n`
    : ""
}

${backupPath ? `**Backup Created:** ${backupPath}\\n` : ""}

**Next Steps:**
1. Use \`get_storage_info()\` to verify migration
2. Restart the wallet-agent to use persistent storage
3. Re-import private keys if needed (they were not migrated for security)

Your data is now stored persistently at ~/.wallet-agent/ and will survive between sessions.`

    return {
      content: [
        {
          type: "text",
          text: migrationSummary,
        },
      ],
    }
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      createUserFriendlyError(error, "migrating to storage"),
    )
  }
}
