# Wallet Agent

MCP server for Web3 wallet interactions in Claude Code. Supports mock wallets for testing and real wallets via private key import.

## Quick Start

```bash
claude mcp add wallet-agent bunx @shanev/wallet-agent
```

Verify with `/mcp` in Claude Code.

## Core Features

- **Wallets**: Connect, sign messages, send transactions
- **Chains**: Switch networks, add custom EVMs  
- **Tokens**: Transfer ERC-20/721, check balances
- **Contracts**: Read/write via Wagmi or built-in ABIs

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

## Security

- Private keys stored in memory only
- No network transmission of secrets
- Use testnets for development
- Audit code before mainnet use

## License

MIT