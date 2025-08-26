# Wallet Agent

![WalletAgent](https://wallet-agent.ai/og-image.png)

[![CI](https://github.com/wallet-agent/wallet-agent/actions/workflows/ci.yml/badge.svg)](https://github.com/wallet-agent/wallet-agent/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/wallet-agent/wallet-agent/graph/badge.svg)](https://codecov.io/gh/wallet-agent/wallet-agent)

MCP server enabling Web3 wallet interactions in AI tools such as Claude Code and Cursor, with support for mock wallets during testing and real wallets via private-key import.

> ⚠️ **WARNING: Beta Software** 
> 
> This is beta software under active development. **DO NOT use on mainnet or with wallets containing real funds.** This software has not been audited and may contain bugs that could result in loss of funds. Use only on testnets or local development environments.

## Quick Start

### Claude Code

```bash
claude mcp add wallet-agent bunx wallet-agent@latest
```

Verify with `/mcp` in Claude Code.

### Cursor

Add to your `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "wallet-agent": {
      "command": "bunx",
      "args": ["wallet-agent"]
    }
  }
}
```

Then restart Cursor.

## Usage Examples

### Basic Flow
```
"Connect to 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
"Check my balance"
"Send 0.1 ETH to shanev.eth"
"Switch to Polygon"
```

### Token Operations
```
"Transfer 100 USDC to 0x..."
"Get my DOGE balance"
"Approve USDC spending for 0xDEX..."
```

## Supported Chains

### Built-in Chains
Wallet Agent includes the following chains by default:
- **Anvil** (Local, Chain ID: 31337) - Default chain for local development
- **Ethereum Mainnet** (Chain ID: 1) - Using public RPC
- **Sepolia** (Chain ID: 11155111) - Ethereum testnet
- **Polygon** (Chain ID: 137) - Polygon PoS mainnet

⚠️ **Note**: Built-in chains use public RPC endpoints which may have rate limits. For production use, consider adding custom chains with your own RPC endpoints.

### Custom Chain Support
Add any EVM-compatible chain with the `add_custom_chain` tool:
- Local development networks (Anvil, Hardhat, Ganache)
- Layer 2 networks (Base, Arbitrum, Optimism)
- Alternative L1s (BNB Chain, Avalanche)
- Private/enterprise networks

## Available Tools

### Wallet Management
- `connect_wallet` - Connect to a wallet using the specified address
- `disconnect_wallet` - Disconnect the currently connected wallet
- `get_accounts` - Get the list of available mock accounts
- `get_current_account` - Get the currently connected account information
- `get_wallet_info` - Get current wallet configuration info
- `get_balance` - Get the balance of an address

### Transaction Operations
- `send_transaction` - Send a transaction
- `estimate_gas` - Estimate gas for a transaction before sending
- `get_transaction_status` - Get the status of a transaction by its hash
- `get_transaction_receipt` - Get detailed receipt of a mined transaction
- `simulate_transaction` - Simulate a contract transaction before sending

### Signing
- `sign_message` - Sign a message with the connected wallet
- `sign_typed_data` - Sign EIP-712 typed data

### Chain Management
- `switch_chain` - Switch to a different chain
- `add_custom_chain` - Add a custom EVM-compatible blockchain network
- `update_custom_chain` - Update an existing custom chain's configuration
- `remove_custom_chain` - Remove a previously added custom chain

### Token Operations (ERC-20)
- `transfer_token` - Transfer ERC-20 tokens to another address
- `approve_token` - Approve ERC-20 token spending
- `get_token_balance` - Get ERC-20 token balance
- `get_token_info` - Get ERC-20 token information (name, symbol, decimals)

### NFT Operations (ERC-721)
- `transfer_nft` - Transfer an ERC-721 NFT to another address
- `get_nft_owner` - Get the owner of an ERC-721 NFT
- `get_nft_info` - Get ERC-721 NFT information (name, symbol, tokenURI)

### Contract Operations
- `load_wagmi_config` - Load contract ABIs from a Wagmi-generated file
- `list_contracts` - List all available contracts from Wagmi config
- `read_contract` - Read from a smart contract using Wagmi-generated ABIs
- `write_contract` - Write to a smart contract using Wagmi-generated ABIs

### Private Key Management
- `import_private_key` - Import a private key from environment variable or file
- `list_imported_wallets` - List all imported private key wallets
- `remove_private_key` - Remove an imported private key
- `set_wallet_type` - Switch between mock and private key wallets

### ENS
- `resolve_ens_name` - Resolve an ENS name to an Ethereum address (mainnet only)

## User Instructions

Customize wallet behavior using natural language instructions! Create an `instructions.md` file to personalize how Wallet Agent operates.

### Global Instructions
Create `~/.wallet-agent/instructions.md` for user-wide preferences:

```markdown
# My Wallet Instructions

## Gas Settings
- Always use "fast" gas prices for DEX trades
- Use "standard" gas for simple transfers  
- Warn me if gas cost exceeds $20

## Security Rules
- Never approve unlimited token allowances
- Always simulate high-value transactions first
- Require confirmation for new contracts

## Multi-chain Preferences
- Prefer Polygon for small transfers (<$100)
- Use Arbitrum for DeFi to save fees
- Default to mainnet for large transfers (>$1000)
```

### Project Instructions
Create `.wallet-agent/instructions.md` in your project for context-specific behavior:

```markdown
# Project Instructions

## For This DApp
- Use conservative gas settings
- Always simulate before executing
- Show detailed transaction breakdowns
- Prefer Layer 2 networks when possible
```

### How It Works
- AI agents automatically read your instructions via the `wallet://instructions` MCP resource
- **Project instructions override global instructions** for maximum flexibility
- Instructions are written in plain English - no code required!
- Supports gas preferences, security rules, multi-chain settings, error handling, and more

### Example Customizations
- **Gas Strategy**: "Use slow gas for non-urgent transactions"
- **Security**: "Always double-check recipient addresses"  
- **Multi-chain**: "Prefer Polygon for transfers under $50"
- **Error Handling**: "Auto-retry failed transactions with 10% higher gas"
- **Display**: "Show both ETH and USD values for all transactions"

The AI agent will automatically apply your preferences when performing wallet operations!

## Real Wallets (Development Only)

⚠️ **NEVER paste private keys in chat!**

### Option 1: Environment Variable
```bash
# When adding server
claude mcp add wallet-agent bunx wallet-agent -e WALLET_PRIVATE_KEY=0x...

# Or in shell
export WALLET_PRIVATE_KEY="0x..."
```
Then: "Import private key from WALLET_PRIVATE_KEY"

### Option 2: Secure File
```bash
echo "0x..." > ~/.wallet-key
chmod 600 ~/.wallet-key
```
Then: "Import private key from ~/.wallet-key"

### Workflow
1. "Set wallet type to privateKey"
2. "Connect to my wallet"
3. Use normally

## Mock Accounts

Pre-configured for testing:
- `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
- `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`

## Development

```bash
git clone https://github.com/wallet-agent/wallet-agent.git
cd wallet-agent
bun install
bun run dev
```

For local testing:
```bash
claude mcp add wallet-agent bun /path/to/wallet-agent/dist/index.ts
```

### Testing

See the [Testing Guide](test/README.md) for comprehensive testing documentation, including:
- Running tests in mock and real blockchain modes
- Testing with Anvil
- Writing new tests
- CI/CD integration

## Security

- Private keys stored in memory only
- No network transmission of secrets
- Use testnets for development
- Audit code before mainnet use
