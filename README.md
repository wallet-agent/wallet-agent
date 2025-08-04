# MCP Wallet Server

An MCP (Model Context Protocol) server that enables AI coding tools like Claude Code and Cursor to interact with Web3 wallets on any EVM-compatible blockchain. Supports both mock wallets for testing and real wallets via private key import.

## Features

- **Wallet Connection**: Connect and disconnect mock or real wallets
- **Account Management**: List available accounts and get current account info
- **Message Signing**: Sign plain messages and EIP-712 typed data
- **Transaction Handling**: Send transactions with native token transfers and contract interactions
- **Chain Management**: Switch between different EVM networks (Mainnet, Sepolia, Polygon, Anvil, and custom chains)
- **Balance Checking**: Query native token balances for any address
- **Resource Access**: Get wallet state and supported chains info
- **Real Wallet Support**: Import private keys for real blockchain interactions

## Quick Start

Run directly without installation:

```bash
npx mcp-wallet
# or
bunx mcp-wallet
```

## Installation

For local development:

```bash
bun install
bun run build
```

## Usage

### For Claude Code

#### Option 1: Using npx (Recommended)

Add the MCP server to Claude Code:
```bash
claude mcp add mcp-wallet npx mcp-wallet
```

#### Option 2: Using bunx

```bash
claude mcp add mcp-wallet bunx mcp-wallet
```

#### Option 3: Local Installation

1. Clone and build the project:
   ```bash
   git clone https://github.com/shanev/mcp-wallet.git
   cd mcp-wallet
   bun install
   bun run build
   ```

2. Add to Claude Code:
   ```bash
   claude mcp add mcp-wallet bun /path/to/mcp-wallet/dist/index.ts
   ```

The server will be available immediately. You can verify it's running with the `/mcp` command in Claude Code.

### Available Tools

- `connect_wallet`: Connect to a wallet using a mock address
- `disconnect_wallet`: Disconnect the current wallet
- `get_accounts`: List all available mock accounts
- `get_current_account`: Get current connection status
- `sign_message`: Sign a plain text message
- `sign_typed_data`: Sign EIP-712 typed data
- `send_transaction`: Send ETH or interact with contracts
- `switch_chain`: Change the active blockchain network (supports Mainnet, Sepolia, Polygon, and Anvil local testnet)
- `get_balance`: Check ETH balance of an address
- `add_custom_chain`: Add a custom blockchain network with RPC endpoint

### Available Resources

- `wallet://state`: Current wallet connection state
- `wallet://chains`: List of supported blockchain networks (including custom chains)

## Custom Chains

You can add custom blockchain networks using the `add_custom_chain` tool. This is useful for:
- Private networks
- Local test networks (other than Anvil)
- EVM-compatible chains not included by default
- Custom RPC endpoints for existing chains

Example:
```javascript
// Add a custom network
await add_custom_chain({
  chainId: 1337,
  name: "Local Network",
  rpcUrl: "http://localhost:8545",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18
  },
  blockExplorerUrl: "http://localhost:4000" // optional
});

// Switch to the custom network
await switch_chain({ chainId: 1337 });
```

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
