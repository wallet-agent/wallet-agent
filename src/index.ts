#!/usr/bin/env node

/**
 * Main entry point for the wallet-agent package.
 *
 * This file serves dual purpose:
 * 1. As a library: exports all core functionality
 * 2. As a CLI: when executed directly, starts the MCP server
 */

// Export all library functionality
export * from "./lib.js"

// CLI functionality when executed directly
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { createMcpServer } from "./server.js"

// Check if this file is being executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  // Running as CLI - start the MCP server
  async function main() {
    const server = createMcpServer()
    const transport = new StdioServerTransport()
    await server.connect(transport)
    console.error("MCP Wallet server started")
  }

  main().catch((error) => {
    console.error("Fatal error:", error)
    process.exit(1)
  })
}
