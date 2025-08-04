# Using Real Wallets with MCP Wallet Server

## Overview

This MCP server now supports real EVM wallets through private key import. This allows you to:
- Sign real transactions
- Interact with any EVM-compatible chain
- Use your existing EVM accounts

## How It Works

### The Challenge
- **MetaMask** and browser wallets require a browser environment (`window.ethereum`)
- MCP servers run in Node.js without browser access
- Direct MetaMask integration isn't possible

### The Solution: Private Key Import
We've implemented private key wallet support that works natively in Node.js:

1. **Import your private key** using the `import_private_key` tool
2. **Switch to private key mode** with `set_wallet_type`
3. **Use normally** - all operations work with your real wallet on any EVM chain

## Usage Guide

### 1. Import a Private Key

```bash
# Example private key (DO NOT USE - this is public)
import_private_key privateKey="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
```

Response:
```
Private key imported successfully
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

Use 'set_wallet_type' with type "privateKey" to use this wallet.
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

All existing tools work with real wallets:
- `sign_message` - Creates real signatures
- `send_transaction` - Sends real transactions
- `get_balance` - Checks real balances

## Security Considerations

### ⚠️ CRITICAL SECURITY WARNINGS

1. **Never share your private key**
2. **Never commit private keys to git**
3. **Use environment variables for production**
4. **Consider using a dedicated wallet for testing**

### Best Practices

```bash
# Use environment variables
export WALLET_PRIVATE_KEY="0x..."
```

Then in your code:
```typescript
const privateKey = process.env.WALLET_PRIVATE_KEY;
```

## Available Tools

### Wallet Management
- `import_private_key` - Import a private key
- `list_imported_wallets` - Show all imported wallets
- `remove_private_key` - Remove an imported wallet
- `set_wallet_type` - Switch between mock/private key
- `get_wallet_info` - Show current configuration

### Standard Operations
All standard tools work with real wallets:
- `connect_wallet`
- `sign_message`
- `sign_typed_data`
- `send_transaction`
- `get_balance`

## Technical Implementation

### Architecture
```
MCP Server (Node.js)
    ↓
Private Key Wallet (Viem)
    ↓
EVM RPC (HTTP)
    ↓
EVM Blockchain
```

### Key Components

1. **wallet-manager.ts** - Manages private keys and wallet clients
2. **chains.ts** - Extended to support wallet types and multiple EVM chains
3. **signing.ts** - Updated to use private key wallets
4. **transactions.ts** - Works with both mock and real wallets on any EVM chain

## Limitations

1. **No Hardware Wallet Support** - Requires private key access
2. **No Browser Extension Support** - MetaMask not directly usable
3. **Single Account at a Time** - Connect one wallet per session

## Future Enhancements

### WalletConnect Integration
- Would allow QR code connections
- No private key exposure
- Requires WalletConnect Cloud project

### Browser Bridge
- WebSocket connection to browser
- Could enable MetaMask usage
- More complex architecture

## Example: Complete Flow

```bash
# 1. Import private key
import_private_key privateKey="0x..."

# 2. Switch to private key mode
set_wallet_type type="privateKey"

# 3. Connect wallet
connect_wallet address="0x..."

# 4. Check balance
get_balance

# 5. Sign a message
sign_message message="Hello from MCP!"

# 6. Send transaction (be careful on mainnet!)
send_transaction to="0x..." value="0.001"
```

## Troubleshooting

### "No private keys imported"
- Run `import_private_key` first
- Check with `list_imported_wallets`

### "Invalid private key format"
- Must start with "0x"
- Must be 66 characters total (0x + 64 hex)

### Transaction Failures
- Check account balance
- Verify gas prices
- Ensure correct network