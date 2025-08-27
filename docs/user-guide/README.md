# User Guide

Welcome to the Wallet Agent User Guide! This comprehensive guide covers everything you need to know about using Wallet Agent for Web3 operations through natural language commands.

## What You'll Learn

This guide covers all the essential operations you can perform with Wallet Agent:

- 🔐 **[Basic Operations](basic-operations.md)** - Wallet connection, balance checking, account management
- 💸 **[Transactions](transactions.md)** - Sending ETH, gas management, transaction monitoring
- 🪙 **[Token Operations](token-operations.md)** - ERC-20 transfers, approvals, balance management
- 🎨 **[NFT Operations](nft-operations.md)** - ERC-721 transfers, metadata, collections
- ⛓️ **[Chain Management](chain-management.md)** - Multi-chain support, custom networks
- 🛡️ **[Security](security.md)** - Best practices, private key management, safety tips

## Who This Guide Is For

This guide is perfect for:

- **Web3 Beginners** - New to blockchain and want to learn safely
- **Developers** - Building DApps and need efficient Web3 operations  
- **DeFi Users** - Managing tokens and interacting with protocols
- **NFT Enthusiasts** - Collecting and managing digital assets
- **Researchers** - Testing and analyzing blockchain interactions

## How to Use This Guide

### Start Here
If you're new to Wallet Agent, begin with [Basic Operations](basic-operations.md) to understand fundamental concepts.

### Find What You Need
Use the navigation menu or search to find specific operations. Each section includes:
- Step-by-step instructions
- Example commands
- Expected outputs
- Common troubleshooting

### Practice Safely
All examples use mock wallets by default - completely safe for learning and experimentation.

{% hint style="info" %}
**Learning Tip**: Try each command as you read. Wallet Agent's mock mode makes it safe to experiment!
{% endhint %}

## Command Style Guide

Wallet Agent understands natural language, but here are patterns that work well:

### Action + Object + Details
```
Send 1 ETH to 0x742d35Cc...
Transfer 100 USDC to my friend's address
Check my DOGE balance
```

### Questions
```
What's my current balance?
Which chains are supported?  
How much gas will this transaction cost?
```

### Requests
```
Switch to Polygon network
Connect to my main wallet
Show me available contracts
```

## Understanding Outputs

Wallet Agent provides rich, detailed responses. Here's how to read them:

### Success Indicators
- ✅ **Green checkmarks** - Operations completed successfully
- 📊 **Status updates** - Major milestones achieved
- 📈 **Status updates** - Progress indicators

### Information Displays
- 📍 **Addresses** - Wallet and contract addresses
- 💰 **Balances** - Token and ETH amounts
- ⛓️ **Chain info** - Network details
- 🔗 **Transaction hashes** - Blockchain references

### Warnings and Errors
- ⚠️ **Yellow warnings** - Important notices, non-blocking issues
- ❌ **Red errors** - Failed operations, blocking issues
- 🚨 **Security alerts** - Safety-related warnings

### Helpful Guidance
- 💡 **Tips** - Optimization suggestions
- 📚 **Next steps** - What to do after current operation
- 🔧 **Troubleshooting** - How to fix common issues

## Safety Features

Wallet Agent includes multiple safety features to protect you:

### Mock Mode Default
- Starts in safe mock mode automatically
- No real funds at risk during learning
- Pre-configured test scenarios

### Transaction Previews
- Shows exactly what will happen before execution
- Includes gas costs and recipients
- Opportunity to cancel before sending

### Validation Checks
- Verifies addresses and amounts
- Warns about unusual operations
- Prevents common mistakes

### Clear Feedback
- Detailed success/failure messages
- Specific error explanations
- Actionable troubleshooting steps

## Quick Reference

### Essential Commands

**Wallet Management**
```
Get wallet info
Connect to [address]
Check my balance
Switch to [chain]
```

**Transactions**
```
Send [amount] ETH to [address]
Get transaction status [hash]
Estimate gas for [operation]
```

**Tokens**
```
Transfer [amount] [token] to [address]
Get [token] balance
Approve [token] spending for [address]
```

**Information**
```
What chains are supported?
List available accounts
Show me recent transactions
```

### Test Wallet Addresses
```
0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266  # Main test wallet (10,000 ETH)
0x70997970C51812dc3A010C7d01b50e0d17dc79C8  # Secondary wallet
0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC  # Third wallet
```

### Supported Networks
```
Anvil (31337)      # Local development - default
Ethereum (1)       # Mainnet - view only
Sepolia (11155111) # Ethereum testnet  
Polygon (137)      # Polygon mainnet
```

## Getting Help

### Within This Guide
- Each section has troubleshooting tips
- Look for "Common Issues" boxes
- Check the FAQ section for quick answers

### Interactive Help
```
Help me with [specific operation]
What can I do with Wallet Agent?
Show me examples of [operation type]
```

### External Resources
- **[FAQ](../resources/faq.md)** - Frequently asked questions
- **[Troubleshooting](../resources/troubleshooting.md)** - Problem-solving guide
- **[GitHub Issues](https://github.com/wallet-agent/wallet-agent/issues)** - Bug reports and feature requests

## What's Next?

Ready to dive in? Here's your learning path:

### Beginner Path
1. **[Basic Operations](basic-operations.md)** - Start here!
2. **[Transactions](transactions.md)** - Learn to send ETH
3. **[Security](security.md)** - Understand safety practices

### Intermediate Path  
1. **[Token Operations](token-operations.md)** - Work with ERC-20 tokens
2. **[Chain Management](chain-management.md)** - Multi-chain operations
3. **[NFT Operations](nft-operations.md)** - Manage digital collectibles

### Advanced Path
1. **[Developer Guide](../developer-guide/)** - Smart contract development
2. **[Advanced Topics](../advanced/)** - Real wallets and customization
3. **[API Reference](../api-reference/)** - Complete tool documentation

---

Let's start with the basics and build your Web3 skills step by step.

👉 **[Continue to Basic Operations →](basic-operations.md)**