/**
 * Storage management tool handlers (consolidated)
 */

import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js"
import { getContainer } from "../../container.js"
import { createStateBackup, hasStateToMigrate, migrateToStorage } from "../../storage/migration.js"
import type { UserPreferences } from "../../storage/types.js"
import { createUserFriendlyError } from "../../utils/error-messages.js"

interface InitStorageArgs {
  force?: boolean
  clearCache?: boolean
}

interface GetStorageInfoArgs {
  detailed?: boolean
  export?: boolean
  exportFormat?: "json" | "yaml"
  includePreferences?: boolean
}

interface ManageStoragePreferencesArgs extends Partial<UserPreferences> {
  action?: "get" | "update"
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
    const clearCache = args?.clearCache || false

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

    // Clear cache if requested
    if (clearCache) {
      await storageManager.clearCache()
    }

    const info = await storageManager.getStorageInfo()

    return {
      content: [
        {
          type: "text",
          text: `✅ Storage initialized successfully!${clearCache ? " (Cache cleared)" : ""}

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

export async function handleGetStorageInfo(args?: GetStorageInfoArgs) {
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
    const detailed = args?.detailed || false
    const shouldExport = args?.export || false
    const exportFormat = args?.exportFormat || "json"
    const includePreferences = args?.includePreferences !== false

    const info = await storageManager.getStorageInfo()
    const config = await storageManager.readConfig()

    const sizeFormatted = info.totalSize ? `${(info.totalSize / 1024).toFixed(2)} KB` : "Unknown"

    let response = `📁 Storage Information

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
}`

    // Add detailed directory layout if requested
    if (detailed) {
      const layout = storageManager.getLayout()
      response += `

**Directory Structure:**
${Object.entries(info.directories)
  .map(
    ([name, dir]) =>
      `- ${name}/: ${dir.exists ? "✅" : "❌"} ${dir.writable ? "(writable)" : "(read-only)"}`,
  )
  .join("\\n")}

**Detailed Layout:**
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

All directories are created with 0o700 permissions (owner read/write/execute only) for security.`
    }

    // Add export data if requested
    if (shouldExport) {
      const exportData = {
        version: config.version,
        exportedAt: new Date().toISOString(),
        ...(includePreferences && { preferences: config.preferences }),
      }

      let formattedOutput: string

      if (exportFormat === "yaml") {
        // Simple YAML formatting
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

      response += `

📤 **Storage Configuration Export**

**Format:** ${exportFormat.toUpperCase()}
**Includes Preferences:** ${includePreferences ? "Yes" : "No"}
**Exported At:** ${exportData.exportedAt}

\`\`\`${exportFormat}
${formattedOutput}
\`\`\`

You can save this configuration and use it to restore settings on another system or as a backup.`
    }

    return {
      content: [
        {
          type: "text",
          text: response,
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

export async function handleManageStoragePreferences(args?: ManageStoragePreferencesArgs) {
  const container = getContainer()
  const storageManager = container.getStorageManager()

  if (!storageManager) {
    throw new McpError(
      ErrorCode.InternalError,
      "Storage is not available. Cannot manage preferences without persistent storage.",
    )
  }

  try {
    const action = args?.action || "get"

    if (action === "get") {
      const config = await storageManager.readConfig()

      return {
        content: [
          {
            type: "text",
            text: `⚙️ Current Storage Preferences

${
  config.preferences
    ? Object.entries(config.preferences)
        .map(([key, value]) => `- **${key}**: ${value}`)
        .join("\\n")
    : "- No preferences set"
}

To update preferences, use: \`manage_storage_preferences({ action: "update", ... })\``,
          },
        ],
      }
    }

    if (action === "update") {
      // Extract preference fields from args (exclude action field)
      const { action: _action, ...preferences } = args || {}

      if (Object.keys(preferences).length === 0) {
        throw new McpError(
          ErrorCode.InvalidParams,
          "No preferences provided for update. Include at least one preference field.",
        )
      }

      await storageManager.updatePreferences(preferences)
      const config = await storageManager.readConfig()

      return {
        content: [
          {
            type: "text",
            text: `✅ Preferences updated successfully!

**Updated preferences:**
${Object.entries(preferences)
  .map(([key, value]) => `- **${key}**: ${value}`)
  .join("\\n")}

**Current preferences:**
${
  config.preferences
    ? Object.entries(config.preferences)
        .map(([key, value]) => `- **${key}**: ${value}`)
        .join("\\n")
    : "- No preferences set"
}

Changes will take effect immediately and persist across sessions.`,
          },
        ],
      }
    }

    throw new McpError(
      ErrorCode.InvalidParams,
      `Invalid action: ${action}. Must be "get" or "update".`,
    )
  } catch (error) {
    if (error instanceof McpError) {
      throw error
    }
    throw new McpError(
      ErrorCode.InternalError,
      createUserFriendlyError(error, "managing preferences"),
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
