/**
 * MCP tool definitions for storage management (consolidated)
 */

import type { Tool } from "@modelcontextprotocol/sdk/types.js"

export const storageTools: Tool[] = [
  {
    name: "init_storage",
    description: "Initialize the global storage system at ~/.wallet-agent/",
    inputSchema: {
      type: "object",
      properties: {
        force: {
          type: "boolean",
          description: "Force initialization even if storage already exists (default: false)",
          default: false,
        },
        clearCache: {
          type: "boolean",
          description: "Clear all cached data during initialization (default: false)",
          default: false,
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "get_storage_info",
    description:
      "Get information about the global storage system with optional detailed view and export",
    inputSchema: {
      type: "object",
      properties: {
        detailed: {
          type: "boolean",
          description: "Include detailed directory layout information (default: false)",
          default: false,
        },
        export: {
          type: "boolean",
          description: "Export storage configuration for backup (default: false)",
          default: false,
        },
        exportFormat: {
          type: "string",
          enum: ["json", "yaml"],
          description: "Export format when export=true (default: json)",
          default: "json",
        },
        includePreferences: {
          type: "boolean",
          description: "Include user preferences in export when export=true (default: true)",
          default: true,
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "manage_storage_preferences",
    description: "View or update user preferences in global storage",
    inputSchema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["get", "update"],
          description: "Action to perform: get current preferences or update them",
          default: "get",
        },
        autoConnect: {
          type: "boolean",
          description: "Whether to automatically connect to last used wallet",
        },
        defaultGasPrice: {
          type: "string",
          description: "Default gas price for transactions",
        },
        maxGasLimit: {
          type: "number",
          description: "Maximum gas limit for transactions",
        },
        preferredCurrency: {
          type: "string",
          description: "Preferred currency for displaying values (e.g., USD, EUR)",
        },
        theme: {
          type: "string",
          enum: ["light", "dark", "auto"],
          description: "UI theme preference",
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "migrate_to_storage",
    description:
      "Migrate existing in-memory state (wallets, chains, preferences) to persistent storage",
    inputSchema: {
      type: "object",
      properties: {
        createBackup: {
          type: "boolean",
          description: "Create a backup before migration (default: true)",
          default: true,
        },
        force: {
          type: "boolean",
          description: "Force migration even if storage already contains data (default: false)",
          default: false,
        },
      },
      additionalProperties: false,
    },
  },
]
