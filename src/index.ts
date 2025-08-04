#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMcpServer } from "./server.js";

// Start the server
async function main() {
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Wallet server started");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
