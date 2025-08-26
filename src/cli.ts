#!/usr/bin/env node
import { join } from "node:path"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { createLogger } from "./logger.js"
import { createMcpServer } from "./server.js"
import { ProjectStorageManager, StorageResolver } from "./storage/project-storage.js"

const logger = createLogger("cli")

// Parse command line arguments
const args = process.argv.slice(2)
const command = args[0]

/**
 * Display CLI help
 */
function showHelp() {
  console.log(`
Wallet Agent MCP Server

USAGE:
  wallet-agent [COMMAND]

COMMANDS:
  server            Start the MCP server (default)
  help, --help      Show this help message

PROJECT STORAGE:
  The MCP server automatically detects if you're in a project directory
  and will use project-scoped storage at ./.wallet-agent/ if available.
  
  If no project storage is found, it will create and use project storage
  automatically in the current directory when the server starts.

EXAMPLES:
  wallet-agent                      # Start MCP server (default)
  wallet-agent server               # Start MCP server

For more information, visit: https://github.com/wallet-agent/wallet-agent
`)
}

/**
 * Start the MCP server
 */
async function startServer() {
  try {
    // Check if we're in a project context and auto-initialize if needed
    const projectPath = StorageResolver.findProjectStorage()
    if (projectPath) {
      logger.info(`Starting in project context: ${StorageResolver.getProjectRoot(projectPath)}`)
    } else {
      // No project storage found - create it automatically in current directory
      const currentDir = process.cwd()
      const newProjectPath = join(currentDir, ".wallet-agent")

      logger.info("No project storage found, creating project storage automatically...")
      try {
        await ProjectStorageManager.initializeProject(newProjectPath)
        logger.info(`Auto-initialized project storage at ${newProjectPath}`)
      } catch (_error) {
        logger.warn("Failed to auto-initialize project storage, falling back to global storage")
      }
    }

    const server = createMcpServer()
    const transport = new StdioServerTransport()
    await server.connect(transport)
    console.error("MCP Wallet server started")
  } catch (error) {
    console.error("Failed to start server:", error)
    process.exit(1)
  }
}

/**
 * Main CLI handler
 */
async function main() {
  switch (command) {
    case "server":
      await startServer()
      break

    case "help":
    case "--help":
    case "-h":
      showHelp()
      break

    case undefined:
      // Default to server
      await startServer()
      break

    default:
      console.error(`❌ Unknown command: ${command}`)
      showHelp()
      process.exit(1)
  }
}

// Handle process termination gracefully
process.on("SIGINT", () => {
  console.error("\\nShutting down wallet-agent...")
  process.exit(0)
})

process.on("SIGTERM", () => {
  console.error("\\nShutting down wallet-agent...")
  process.exit(0)
})

main().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})
