# MCP Wallet Server

An MCP (Model Context Protocol) server that enables AI coding tools like Cursor and Claude Code to interact with Web3 wallets. Built using Wagmi's mock wallet connector for safe, deterministic wallet operations without requiring a real browser extension.

## Features

- **Wallet Connection**: Connect and disconnect mock wallets
- **Account Management**: List available accounts and get current account info
- **Message Signing**: Sign plain messages and EIP-712 typed data
- **Transaction Handling**: Send transactions with ETH transfers and contract interactions
- **Chain Management**: Switch between different networks (Mainnet, Sepolia, Polygon)
- **Balance Checking**: Query ETH balances for any address
- **Resource Access**: Get wallet state and supported chains info

## Installation

```bash
bun install
```

## Building

```bash
bun run build
```

## Usage

### For Claude Desktop

1. Build the project:
   ```bash
   bun run build
   ```

2. Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json`):
   ```json
   {
     "mcpServers": {
       "mcp-wallet": {
         "command": "node",
         "args": ["/path/to/mcp-wallet/dist/index.js"]
       }
     }
   }
   ```

3. Restart Claude Desktop

### Available Tools

- `connect_wallet`: Connect to a wallet using a mock address
- `disconnect_wallet`: Disconnect the current wallet
- `get_accounts`: List all available mock accounts
- `get_current_account`: Get current connection status
- `sign_message`: Sign a plain text message
- `sign_typed_data`: Sign EIP-712 typed data
- `send_transaction`: Send ETH or interact with contracts
- `switch_chain`: Change the active blockchain network
- `get_balance`: Check ETH balance of an address

### Available Resources

- `wallet://state`: Current wallet connection state
- `wallet://chains`: List of supported blockchain networks

## Mock Accounts

The server includes three pre-configured mock accounts:
- `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
- `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`

## Development

Run in development mode:
```bash
bun run dev
```

## Why Not Dappwright / Synpress?

While these are excellent for E2E testing with real MetaMask browser extensions, this MCP server takes a different approach:

- **No Browser Required**: Uses Wagmi's mock connector for lightweight, headless operation
- **MCP Native**: Built specifically for the Model Context Protocol
- **Deterministic**: Mock wallets provide consistent, predictable behavior
- **Fast**: No browser automation overhead

This makes it ideal for AI-assisted development where you need quick, reliable wallet interactions without the complexity of browser automation.
