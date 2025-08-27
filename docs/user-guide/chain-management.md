# Chain Management

Master multi-chain operations including switching networks, adding custom chains, and understanding cross-chain considerations.

## Understanding Blockchain Networks

### What are Blockchain Networks?

Blockchain networks (or "chains") are independent blockchain systems that:

- **Process Transactions** - Each chain validates and records transactions
- **Store State** - Account balances, contract data, NFTs
- **Use Native Currency** - ETH, POL, BNB, etc. for gas fees
- **Run Smart Contracts** - DApps and protocols specific to each chain

### EVM Compatibility

Wallet Agent supports **EVM-compatible** chains that:
- Use Ethereum Virtual Machine
- Support Ethereum-style addresses (0x...)
- Allow Solidity smart contracts
- Use similar transaction formats

## Supported Chains

### Built-in Chains

Wallet Agent includes these chains by default:

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
- RPC Endpoint: https://polygon-rpc.com
- Block Explorer: https://polygonscan.com  
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

📊 Custom Chains: 0 added

💡 Use "Switch to [chain name]" to change networks
💡 Add custom chains with "Add custom chain" command
```

## Adding Custom Chains

### Add EVM-Compatible Chain

Add any EVM chain to Wallet Agent:

```
Add custom chain with name "Base" chain ID 8453 RPC "https://mainnet.base.org" and currency ETH
```

**Example Output:**
```
✅ Custom Chain Added Successfully!

⛓️ Chain: Base  
🆔 Chain ID: 8453
🌐 RPC: https://mainnet.base.org
💰 Native Currency: ETH (18 decimals)

📊 Chain Details:
- Block Explorer: https://basescan.org
- Network Type: Layer 2 (Optimistic Rollup)
- Parent Chain: Ethereum

🔄 Available Commands:
- "Switch to Base" - Change to this chain
- "Update Base chain settings" - Modify configuration
- "Remove Base chain" - Delete if no longer needed

💡 Base chain is now available for all operations!
```

### Add with Block Explorer

Include block explorer for better transaction tracking:

```
Add custom chain "Arbitrum" ID 42161 RPC "https://arb1.arbitrum.io/rpc" currency ETH explorer "https://arbiscan.io"
```

### Advanced Chain Configuration

Add chain with detailed configuration:

```json
Add custom chain with config:
{
  "name": "Optimism",
  "chainId": 10,
  "rpcUrl": "https://mainnet.optimism.io",
  "nativeCurrency": {
    "name": "Ether", 
    "symbol": "ETH",
    "decimals": 18
  },
  "blockExplorerUrl": "https://optimistic.etherscan.io"
}
```

## Managing Custom Chains

### Update Chain Configuration

Modify existing custom chain settings:

```
Update Base chain RPC to "https://base-mainnet.g.alchemy.com/v2/YOUR-API-KEY"
```

**Example Output:**
```
🔄 Chain Configuration Updated

⛓️ Chain: Base (8453)
🔧 Updated: RPC endpoint
🌐 Old RPC: https://mainnet.base.org  
🌐 New RPC: https://base-mainnet.g.alchemy.com/v2/YOUR-API-KEY

✅ Changes applied successfully
💡 New RPC will be used for all Base operations
🔄 Consider switching chains to test the new endpoint
```

### Remove Custom Chains

Delete chains you no longer need:

```
Remove Base chain
```

**Example Output:**
```
🗑️ Custom Chain Removed

⛓️ Chain: Base (8453)  
📊 Status: Removed from configuration

⚠️ Impact:
- Can no longer switch to Base
- Base transactions will not work
- Custom chain data cleared

💡 You can re-add Base anytime with "Add custom chain" command
✅ Built-in chains (Ethereum, Polygon, etc.) are unaffected
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
- Add custom chain: "Add custom chain Fantom..."
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

**Custom Chain Invalid**
```
❌ Custom chain configuration invalid

📋 Issues Found:
- Chain ID already exists (137 = Polygon)
- Invalid RPC URL format
- Missing native currency details

🔧 Solutions:
- Use unique chain ID: "Add chain ID 1337"
- Fix RPC format: "https://rpc.example.com"
- Specify currency: "currency ETH with 18 decimals"
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

### Custom Chain Safety

1. **Trusted RPC**: Use reputable RPC providers
2. **Verify Chain ID**: Ensure correct network
3. **Test First**: Try small operations before large ones
4. **Documentation**: Keep track of custom chain purposes

## Advanced Features

### RPC Endpoint Management

Use custom RPC endpoints for better performance:

```
Update Ethereum RPC to "https://eth-mainnet.g.alchemy.com/v2/YOUR-KEY"
```

Benefits of custom RPC:
- Higher rate limits
- Better reliability  
- Advanced features (archive data, etc.)
- Dedicated support

### Chain Monitoring

Check network health and statistics:

```
Get Polygon network status
```

**Example Output:**
```
📊 Polygon Network Status

⛓️ Chain: Polygon (137)
🌐 RPC: https://polygon-rpc.com ✅ Healthy

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

**RPC Timeout**: Switch to different endpoint
```
"Update [chain] RPC to [backup-rpc]"
"Switch to Anvil temporarily"
```

**Chain Not Responding**: Try alternative chain
```
"Switch to Ethereum instead of Polygon"
"Use Anvil for immediate testing"
```

### Configuration Problems

**Invalid Chain Data**: Verify configuration
```
"Get [chain] chain info"
"Remove and re-add custom chain"
```

**Conflicting Chain IDs**: Use unique identifiers
```
"List all chains to check for conflicts"
"Use different chain ID for custom chain"
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

2. **Custom Chains**
   - Add a test custom chain
   - Update chain configuration
   - Remove unused custom chains

3. **Multi-Chain Strategy**
   - Plan token distribution across chains
   - Compare transaction costs
   - Understand bridge requirements

---

You now have comprehensive knowledge of multi-chain operations! ⛓️