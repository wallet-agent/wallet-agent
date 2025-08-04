# Wallet Agent

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
- **Custom Chain Support**: Add any EVM-compatible blockchain with custom RPC endpoints

## Quick Start

Run directly without installation:

```bash
npx @shanev/wallet-agent
# or
bunx @shanev/wallet-agent
```

## Installation

### For Claude Code

#### Option 1: Using npx (Recommended)
```bash
claude mcp add wallet-agent npx @shanev/wallet-agent
```

#### Option 2: Using bunx
```bash
claude mcp add wallet-agent bunx @shanev/wallet-agent
```

#### Option 3: Local Installation
1. Clone and build the project:
   ```bash
   git clone https://github.com/shanev/wallet-agent.git
   cd wallet-agent
   bun install
   bun run build
   ```

2. Add to Claude Code:
   ```bash
   claude mcp add wallet-agent bun /path/to/wallet-agent/dist/index.ts
   ```

The server will be available immediately. Verify it's running with `/mcp` in Claude Code.

## Available Tools

### Wallet Management
- `connect_wallet` - Connect to a wallet address
- `disconnect_wallet` - Disconnect the current wallet
- `get_accounts` - List all available accounts (mock or imported)
- `get_current_account` - Get current connection status
- `get_wallet_info` - Show current wallet configuration

### Real Wallet Support
- `import_private_key` - Import a private key for real transactions
- `list_imported_wallets` - Show all imported wallets
- `remove_private_key` - Remove an imported wallet
- `set_wallet_type` - Switch between mock and private key wallets

### Signing & Transactions
- `sign_message` - Sign a plain text message
- `sign_typed_data` - Sign EIP-712 typed data
- `send_transaction` - Send native tokens or interact with contracts
- `get_balance` - Check native token balance of any address

### Chain Management
- `switch_chain` - Change the active blockchain network
- `add_custom_chain` - Add a custom EVM-compatible blockchain

### Smart Contract Interaction
- `load_wagmi_config` - Load contract ABIs from Wagmi-generated files
- `list_contracts` - List available contracts
- `write_contract` - Execute contract write functions
- `read_contract` - Read contract state

### Available Resources
- `wallet://state` - Current wallet connection state
- `wallet://chains` - List of supported blockchain networks

## Using Real Wallets

This server supports real wallet operations through private key import:

### 1. Import a Private Key
```bash
import_private_key privateKey="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
```

### 2. Switch to Private Key Mode
```bash
set_wallet_type type="privateKey"
```

### 3. Connect Your Wallet
```bash
connect_wallet address="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
```

### 4. Use As Normal
All operations now use your real wallet on any EVM chain!

### Security Considerations

⚠️ **CRITICAL SECURITY WARNINGS**
- Never share or commit private keys
- Use environment variables for production
- Consider using a dedicated wallet for testing
- Private keys are stored in memory only

## Custom Chains

Add any EVM-compatible blockchain:

```javascript
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

## Example Usage

### Basic Flow
1. "List the available accounts"
2. "Connect to address 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
3. "Check my current balance"
4. "Sign the message 'Hello Web3!'"
5. "Switch to Polygon network"
6. "Send 0.5 MATIC to 0x70997970C51812dc3A010C7d01b50e0d17dc79C8"

### Real Wallet Flow
1. "Import my private key" (provide key)
2. "Set wallet type to privateKey"
3. "Connect to my wallet address"
4. "Check balance on mainnet"
5. "Sign a message for authentication"

### Smart Contract Interaction
1. "Load Wagmi config from ./src/generated.ts"
2. "List available contracts"
3. "Read contract MyToken function balanceOf args: ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266']"
4. "Write contract MyToken function transfer args: ['0x70997970C51812dc3A010C7d01b50e0d17dc79C8', '1000000000000000000']"

Works seamlessly with Wagmi CLI's generated code for type-safe contract interactions!

## Mock Accounts

Three pre-configured accounts for testing:
- `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
- `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`

## Architecture

### How It Works
```
MCP Server (Node.js)
    ↓
Wagmi Core + Viem
    ↓
Mock Connector / Private Key Wallet
    ↓
EVM RPC (HTTP)
    ↓
Blockchain
```

### Why This Approach?

**Mock Wallets**: Perfect for development and testing
- No browser required
- Deterministic behavior
- Instant transaction approval

**Private Key Wallets**: For real blockchain interactions
- Works in Node.js environment
- Full control over transactions
- Compatible with all EVM chains

**Not Using Browser Wallets**: MetaMask and similar extensions require browser context which MCP servers don't have. Private key import provides a secure alternative.

## Development

```bash
# Install dependencies
bun install

# Run in development
bun run dev

# Build for production
bun run build

# Type checking
bun run typecheck

# Linting
bun run lint
```

## Troubleshooting

### "No private keys imported"
Run `import_private_key` first, then check with `list_imported_wallets`

### "Invalid private key format"
Private keys must start with "0x" and be 66 characters total

### Transaction Failures
- Check account balance
- Verify you're on the correct network
- Ensure sufficient gas for transactions

### Chain Not Supported
Use `add_custom_chain` to add any EVM-compatible network

## License

MIT