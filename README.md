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

### ERC-20 Token Operations
- `transfer_token` - Transfer tokens (supports symbols like "USDC")
- `approve_token` - Approve token spending
- `get_token_balance` - Check token balance
- `get_token_info` - Get token name, symbol, decimals

### ERC-721 NFT Operations
- `transfer_nft` - Transfer NFTs
- `get_nft_owner` - Check NFT ownership
- `get_nft_info` - Get NFT metadata

### Available Resources
- `wallet://state` - Current wallet connection state
- `wallet://chains` - List of supported blockchain networks

## Using Real Wallets

This server supports real wallet operations through private key import for **development and testing purposes**.

### Security-First Approach for Claude Code

⚠️ **CRITICAL SECURITY CONSIDERATIONS**

When using this tool with Claude Code, **NEVER** directly paste private keys into the chat. Instead:

#### Option 1: Environment Variables (Recommended)
1. Set your private key as an environment variable:
   ```bash
   export WALLET_PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
   ```

2. Use natural language to request key import:
   - "Import the private key from WALLET_PRIVATE_KEY environment variable"
   - "Load my wallet from the environment"

#### Option 2: Secure File Approach
1. Store your private key in a secure file outside your project:
   ```bash
   echo "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" > ~/.wallet-private-key
   chmod 600 ~/.wallet-private-key
   ```

2. Request import via natural language:
   - "Import private key from ~/.wallet-private-key"
   - "Load my wallet key from the secure file"

#### Option 3: Interactive Prompt (Future Enhancement)
The tool should be enhanced to support secure private key entry through masked input prompts, avoiding exposure in Claude Code conversations entirely.

### Basic Workflow

Once your private key is securely loaded:

1. **Switch to Private Key Mode**
   - "Switch to private key wallet mode"

2. **Connect Your Wallet**  
   - "Connect to my wallet address"

3. **Use As Normal**
   - All operations now use your real wallet on any EVM chain!

### What Gets Logged vs. What Doesn't

✅ **Safe to appear in Claude Code chat:**
- Wallet addresses (public)
- Transaction hashes (public)
- Network information
- Tool execution results

❌ **NEVER should appear in chat:**
- Private keys
- Seed phrases
- Any secret cryptographic material

### Security Warnings

⚠️ **CRITICAL SECURITY WARNINGS**
- **NEVER** share or commit private keys
- **NEVER** paste private keys directly into Claude Code conversations  
- Use **dedicated test wallets** with minimal funds for development
- Private keys are stored **in memory only** and cleared on exit
- Monitor your wallet activity and revoke access if compromised
- Consider using testnets (Sepolia, Anvil) for development

### MCP Security Context

As noted in the [Claude Code MCP documentation](https://docs.anthropic.com/en/docs/claude-code/mcp), users should "use third party MCP servers at your own risk." This tool:

- Runs locally on your machine (not a remote server)
- Stores private keys only in memory
- Never sends private keys over the network
- Logs only public transaction data

However, **you are responsible** for secure key management and should audit the code before using with valuable assets.

## Custom Chains

Add any EVM-compatible blockchain using natural language with Claude Code:

**Popular Networks:**
- "Add Base mainnet to my supported chains"
- "Add Arbitrum One with chain ID 42161"
- "Add Polygon network for DeFi development"

**Layer 2 & Testnets:**
- "Add Optimism mainnet with proper explorer"
- "Add Sepolia testnet for contract testing"
- "Add Mumbai testnet for Polygon development"

**Local Development:**
- "Add my local Hardhat network on localhost:8545"
- "Add Anvil chain with chain ID 31337"
- "Add my custom testnet at https://my-rpc.example.com"

**Example Response:**
```
✅ Custom chain added successfully!

Chain ID: 8453
Name: Base
RPC URL: https://mainnet.base.org
Native Currency: ETH (18 decimals)
Block Explorer: https://basescan.org

The chain is now available for use. You can switch to it with 'switch_chain'.
```

**Then switch and use immediately:**
- "Switch to Base network"
- "Check my balance on Base"
- "Send 0.1 ETH to 0x... on Base"

## Example Usage

### Basic Flow
1. "List the available accounts"
2. "Connect to address 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
3. "Check my current balance"
4. "Sign the message 'Hello Web3!'"
5. "Switch to Polygon network"
6. "Send 0.5 MATIC to 0x70997970C51812dc3A010C7d01b50e0d17dc79C8"

### Real Wallet Flow (Secure)
1. "Import private key from environment variable WALLET_PRIVATE_KEY"
2. "Set wallet type to privateKey"  
3. "Connect to my wallet address"
4. "Check balance on mainnet"
5. "Sign a message for authentication"

### Smart Contract Interaction
1. "Load Wagmi config from ./src/generated.ts"
2. "List available contracts"
3. "Read contract MyToken function balanceOf args: ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266']"
4. "Write contract MyToken function transfer args: ['0x70997970C51812dc3A010C7d01b50e0d17dc79C8', '1000000000000000000']"

### Token Operations (Built-in Support)
1. "Transfer 100 USDC to 0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
2. "Get token balance USDC"
3. "Approve token USDT spender 0xDEX_ADDRESS amount max"
4. "Get token info DAI"

### NFT Operations
1. "Transfer NFT 0xNFT_ADDRESS to 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 tokenId 123"
2. "Get NFT owner 0xNFT_ADDRESS tokenId 123"
3. "Get NFT info MyNFTContract tokenId 456"

Works seamlessly with both Wagmi CLI's generated code and built-in contract support!

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