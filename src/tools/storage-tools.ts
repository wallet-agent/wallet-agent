/**
 * MCP tool definitions for storage management
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
      },
      additionalProperties: false,
    },
  },
  {
    name: "get_storage_info",
    description: "Get information about the global storage system status and configuration",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "update_storage_preferences",
    description: "Update user preferences in global storage",
    inputSchema: {
      type: "object",
      properties: {
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
    name: "clear_storage_cache",
    description: "Clear all cached data from global storage",
    inputSchema: {
      type: "object",
      properties: {
        confirm: {
          type: "boolean",
          description: "Confirm that you want to clear all cached data (required)",
          default: false,
        },
      },
      required: ["confirm"],
      additionalProperties: false,
    },
  },
  {
    name: "export_storage_config",
    description: "Export the current storage configuration for backup or sharing",
    inputSchema: {
      type: "object",
      properties: {
        includePreferences: {
          type: "boolean",
          description: "Include user preferences in export (default: true)",
          default: true,
        },
        format: {
          type: "string",
          enum: ["json", "yaml"],
          description: "Export format (default: json)",
          default: "json",
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "get_storage_layout",
    description: "Get the storage directory layout and paths",
    inputSchema: {
      type: "object",
      properties: {},
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
