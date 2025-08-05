# Wallet Agent

[![CI](https://github.com/shanev/wallet-agent/actions/workflows/ci.yml/badge.svg)](https://github.com/shanev/wallet-agent/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/shanev/wallet-agent/graph/badge.svg)](https://codecov.io/gh/shanev/wallet-agent)

MCP server for Web3 wallet interactions in AI assistants like Claude Code and Cursor. Supports mock wallets for testing and real wallets via private key import.

## Quick Start

```bash
claude mcp add wallet-agent bunx @shanev/wallet-agent
```

Verify with `/mcp` in Claude Code.

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

## Usage Examples

### Basic Flow
```
"Connect to 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
"Check my balance"
"Send 0.1 ETH to 0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
"Switch to Polygon"
```

### Token Operations
```
"Transfer 100 USDC to 0x..."
"Get my USDT balance"
"Approve DAI spending for 0xDEX..."
```

### Custom Chains
```
"Add Base mainnet"
"Add local Anvil chain"
"Switch to Base"
```

## Real Wallets (Development Only)

⚠️ **NEVER paste private keys in chat!**

### Option 1: Environment Variable
```bash
# When adding server
claude mcp add wallet-agent bunx @shanev/wallet-agent -e WALLET_PRIVATE_KEY=0x...

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
git clone https://github.com/shanev/wallet-agent.git
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
