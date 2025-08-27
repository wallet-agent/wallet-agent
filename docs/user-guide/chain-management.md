# Chain Management

Master multi-chain operations including switching networks, working with built-in chains, and understanding cross-chain considerations.

## Understanding Blockchain Networks

### What are Blockchain Networks?

Blockchain networks (or "chains") are independent blockchain systems that:

- **Process Transactions** - Each chain validates and records transactions
- **Store State** - Account balances, contract data, NFTs
- **Use Native Currency** - ETH, POL, BNB, etc. for gas fees
- **Run Smart Contracts** - DApps and protocols specific to each chain

### EVM Compatibility

WalletAgent supports **EVM-compatible** chains that:
- Use Ethereum Virtual Machine
- Support Ethereum-style addresses (0x...)
- Allow Solidity smart contracts
- Use similar transaction formats

## Supported Chains

### Built-in Chains

WalletAgent includes these chains by default:

| Chain | Chain ID | Native Currency | Purpose |
|-------|----------|----------------|---------|
| **Anvil** | 31337 | ETH | Local development |
| **Ethereum** | 1 | ETH | Mainnet (view-only) |
| **Sepolia** | 11155111 | ETH | Ethereum testnet |
| **Polygon** | 137 | POL | Polygon PoS mainnet |

### Chain Details

**Anvil (Default Chain)**
```
Get current chain info
```

**Example Output:**
```
⛓️ Current Chain: Anvil

🔧 Details:
- Chain ID: 31337
- Native Currency: ETH (18 decimals)
- Network Type: Local Development
- RPC: http://localhost:8545
- Block Explorer: Local only

💡 Perfect for testing and development
✅ Mock wallets have unlimited ETH here
```

## Switching Chains

### Switch by Name

Change to any supported chain:

```
Switch to Polygon
```

**Example Output:**
```
🔄 Switched to Polygon successfully!

⛓️ Chain: Polygon (Chain ID: 137)  
💰 Balance: 10000.0 POL
🌐 RPC: https://polygon-rpc.com
🔍 Explorer: https://polygonscan.com

📊 Network Status:
- Gas Price: ~30 gwei
- Block Time: ~2.4 seconds
- Confirmation Time: ~5 seconds

💡 Native currency is now POL instead of ETH
```

### Switch by Chain ID

Use numeric chain identifiers:

```
Switch to chain 11155111
```

### Switch Back to Default

Return to Anvil for testing:

```
Switch to Anvil
```

**Example Output:**
```
🔄 Switched back to Anvil

⛓️ Chain: Anvil (Chain ID: 31337)
💰 Balance: 9999.0 ETH  
🌐 RPC: http://localhost:8545

✅ Back to safe testing environment
💡 Unlimited funds and instant transactions
```

## Current Chain Information

### Get Chain Status

Check your current network:

```
What chain am I on?
```

**Example Output:**
```
📍 Current Network Status

⛓️ Chain: Polygon (Chain ID: 137)
💰 Native Currency: POL
🏠 Your Balance: 10000.0 POL

🌐 Network Details:
- Network Type: Layer 2 Scaling Solution
- Block Time: ~2 seconds
- Average Gas Price: 30 gwei
- Current Block: 52,847,291

⏱️ Connected: 5 minutes ago
✅ Network is healthy and operational
```

### List All Supported Chains

See available networks:

```
What chains are supported?
```

**Example Output:**
```
🌐 Supported Blockchain Networks

🔧 Development:
- Anvil (31337) - Local development chain ✅ Current

🌍 Mainnet:
- Ethereum (1) - Ethereum mainnet  
- Polygon (137) - Polygon PoS mainnet

🧪 Testnet:  
- Sepolia (11155111) - Ethereum testnet


💡 Use "Switch to [chain name]" to change networks
💡 Built-in networks are ready to use without setup
```

## Built-in Chain Support

### Supported Networks

WalletAgent includes built-in support for major EVM networks:

- **Anvil** (Chain ID: 31337) - Local development network with unlimited test funds
- **Ethereum** (Chain ID: 1) - Ethereum mainnet (view-only for safety)
- **Sepolia** (Chain ID: 11155111) - Ethereum testnet
- **Polygon** (Chain ID: 137) - Polygon PoS mainnet

These networks are pre-configured and ready to use without additional setup.

## Network Information

### Get Network Details

Check information about available networks:

```
Get current chain info
```

**Example Output:**
```
📊 Current Network Information

⛓️ Chain: Polygon (Chain ID: 137)
💰 Native Currency: POL (18 decimals)
🌐 Network Type: Layer 2 Scaling Solution
📈 Block Time: ~2 seconds

✅ Network is operational and ready for transactions
```

## Multi-Chain Operations

### Balance Checking Across Chains

Check balances on different networks:

```
Switch to Ethereum
Check my balance
Switch to Polygon  
Check my balance
Switch to Anvil
Check my balance
```

This shows how the same wallet address can have different balances on each chain.

### Token Management Across Chains

Understand how tokens work on different chains:

```
Switch to Ethereum
Get my USDC balance

Switch to Polygon
Get my USDC balance
```

**Important**: USDC on Ethereum ≠ USDC on Polygon
- Different contract addresses
- Require bridging to move between chains
- May have different names (USDC vs USDC.e)

### Cross-Chain Considerations

{% hint style="warning" %}
**Cross-Chain Limitations**: 
- Cannot send tokens directly between chains
- Each chain has separate native currencies
- Gas fees paid in chain's native token
- Smart contracts exist independently per chain
{% endhint %}

## Chain-Specific Features

### Gas Management by Chain

Each chain has different gas characteristics:

| Chain | Gas Token | Typical Cost | Speed |
|-------|-----------|--------------|-------|
| Ethereum | ETH | High ($5-50+) | 12 sec blocks |
| Polygon | POL | Very Low ($0.01) | 2 sec blocks |
| Anvil | ETH | Free | Instant |
| Sepolia | ETH | Free (testnet) | 12 sec blocks |

### Network-Specific Operations

**Ethereum Features:**
- ENS domain resolution
- Highest security and decentralization
- Most DeFi protocols

**Polygon Features:**  
- Extremely low fees
- Fast transactions
- Gaming and NFT focus

**Anvil Features:**
- Instant transactions
- Unlimited test funds
- Perfect for development

## Error Handling

### Common Chain Errors

**Chain Not Supported**
```
❌ Chain "Fantom" not found

🔍 Available Chains:
- Anvil (31337)
- Ethereum (1)
- Sepolia (11155111)  
- Polygon (137)

🔧 Solutions:
- Use supported chain: "Switch to Polygon"
- Try available networks: "Switch to Sepolia" or "Switch to Anvil"
- Check spelling: "Switch to Ethereum"
```

**RPC Connection Failed**
```
❌ Failed to connect to Polygon network

🌐 RPC: https://polygon-rpc.com
🔧 Issue: Network timeout or RPC down

💡 Solutions:
- Try again: "Switch to Polygon"  
- Use different RPC: "Update Polygon RPC to https://matic-mainnet.chainstacklabs.com"
- Switch to working chain: "Switch to Anvil"
```

**Insufficient Gas for Chain**
```
❌ Insufficient POL for gas

💰 Required: ~0.01 POL
💰 Available: 0.0 POL  
⛓️ Chain: Polygon

🔧 Solutions:
- Get testnet POL: Use Polygon faucet
- Switch chains: "Switch to Anvil" (free gas)
- Use different wallet: "Connect to wallet with POL"
```

### Chain Switching Issues

**Wallet Not Connected**
```
❌ Cannot switch chains: No wallet connected

🔧 Solution:
1. Connect wallet: "Connect to 0xf39F..."
2. Then switch: "Switch to Polygon"

💡 Wallet connection is required for chain operations
```

**Unsupported Chain**
```
❌ Requested chain is not supported

🔧 Supported Networks:
- Anvil (31337) - Local development
- Ethereum (1) - Mainnet (view-only)
- Sepolia (11155111) - Ethereum testnet
- Polygon (137) - Polygon mainnet

💡 Use one of the supported networks for your operations
```

## Best Practices

### Chain Selection Strategy

1. **Development**: Start with Anvil
   ```
   Switch to Anvil
   ```

2. **Testing**: Use appropriate testnets
   ```
   Switch to Sepolia  # For Ethereum testing
   ```

3. **Production**: Use mainnet only when ready
   ```
   Switch to Polygon  # Lower fees for users
   ```

### Multi-Chain Portfolio Management

1. **Track Balances**: Regularly check all chains
2. **Gas Planning**: Keep native tokens for fees
3. **Bridge Strategy**: Plan token movement between chains
4. **Security**: Verify chain configuration before transactions

### Network Safety

1. **Test First**: Always test on Anvil or testnet before mainnet
2. **Verify Network**: Confirm you're on the intended network
3. **Start Small**: Try small operations before large transactions
4. **Monitor Status**: Check network health before important operations

## Advanced Features

### Network Performance

Built-in networks are configured with reliable RPC endpoints:

- **Anvil**: Local network with instant transactions
- **Built-in Networks**: Pre-configured with reliable public endpoints
- **Load Balancing**: Automatic failover to backup endpoints when needed
- **Optimized**: Performance-tuned for common operations

### Chain Monitoring

Check network health and statistics:

```
Get Polygon network status
```

**Example Output:**
```
📊 Polygon Network Status

⛓️ Chain: Polygon (137)
🌐 Network: Polygon PoS ✅ Healthy

📈 Network Metrics:
- Current Block: 52,847,456
- Average Block Time: 2.3 seconds  
- Gas Price: 32 gwei
- Network Utilization: 67%

🔗 Recent Blocks:
- 52847456: 156 transactions
- 52847455: 203 transactions
- 52847454: 178 transactions

✅ Network operating normally
```

## Troubleshooting

### Connection Issues

**Network Timeout**: Try alternative network
```
"Switch to Anvil for immediate testing"
"Try Sepolia testnet instead"
```

**Chain Not Responding**: Use backup network
```
"Switch to Anvil for local testing"
"Try different supported network"
```

### Network Problems

**Network Unavailable**: Switch to working network
```
"Get current network status"
"Switch to Anvil for continued development"
```

**Connection Issues**: Use local development
```
"Switch to Anvil for offline development"
"Check network connectivity"
```

## Next Steps

Now that you understand chain management, explore advanced topics:

👉 **[Security →](security.md)** - Multi-chain security practices
👉 **[Developer Guide →](../developer-guide/)** - Building multi-chain applications
👉 **[Advanced Topics →](../advanced/)** - Custom chain development

### Practice Exercises

1. **Chain Switching**
   - Switch between all supported chains
   - Compare balances and gas costs
   - Practice network information retrieval

2. **Development Workflow**
   - Start development on Anvil
   - Test on Sepolia testnet
   - Compare mainnet networks

3. **Multi-Chain Strategy**
   - Plan token distribution across chains
   - Compare transaction costs
   - Understand bridge requirements

---

You now have comprehensive knowledge of multi-chain operations! ⛓️