# Quick Start

Let's get hands-on with WalletAgent! This guide will walk you through your first Web3 operations using prompts.

## Your First 10 Minutes with WalletAgent

Follow along with these examples to understand how WalletAgent works. All commands use safe mock wallets - no real funds involved!

### Step 1: Check Your Setup

First, let's verify WalletAgent is working:

```
Get wallet info
```

**Expected Output:**
```
🔧 Wallet Configuration
- Type: Mock (safe for testing)  
- Available Accounts: 3
- Current Chain: Anvil (Chain ID: 31337)
- Native Currency: ETH

💡 You're in mock mode - perfect for learning!
```

{% hint style="info" %}
**Mock Mode**: WalletAgent starts in mock mode by default. This uses pre-configured test wallets that are completely safe for learning and development.
{% endhint %}

### Step 2: Connect to a Wallet

Connect to one of the pre-configured test wallets:

```
Connect to 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

**Expected Output:**
```
✅ Connected to wallet successfully!

📍 Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
⛓️ Chain: Anvil (Chain ID: 31337)  
💰 Balance: 10000.0 ETH

Ready for Web3 operations.
```

**What just happened?**
- You connected to a mock wallet with 10,000 test ETH
- The wallet is on the Anvil local testnet (Chain ID 31337)
- You're ready to send transactions!

### Step 3: Check Your Balance

Verify your wallet balance:

```
Check my balance
```

**Expected Output:**
```
💰 Balance: 10000.0 ETH
📍 Address: 0xf39Fd...2266
⛓️ Chain: Anvil (31337)
```

### Step 4: Send Your First Transaction

Send some test ETH to another address:

```
Send 1 ETH to 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

**Expected Output:**
```
Transaction Sent Successfully

📍 From: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
📍 To: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
💰 Amount: 1.0 ETH
⛽ Gas Used: 21000
🔗 Hash: 0xabc123...

✅ Transaction confirmed in block 1234
```

**Congratulations.** You just sent your first Web3 transaction using prompts.

### Step 5: Switch Chains

WalletAgent supports multiple blockchain networks. Let's switch to Polygon:

```
Switch to Polygon
```

**Expected Output:**
```
🔄 Switched to Polygon successfully!

⛓️ Chain: Polygon (Chain ID: 137)
💰 Balance: 10000.0 POL
🌐 RPC: https://polygon-rpc.com

💡 Native currency is now POL instead of ETH
```

## Understanding the Commands

Let's break down what makes WalletAgent special:

### Prompt Interface

Instead of complex function calls, you use everyday language:

```
❌ Complex: Technical function calls with parameters
✅ Simple: "Send 100 USDC to my friend's address"
```

### Intelligent Context

WalletAgent remembers your state:
- Current wallet connection
- Active blockchain network  
- Recent transactions
- Available tokens and contracts

### Rich Feedback  

Every operation provides detailed, helpful information:
- Transaction hashes and block confirmations
- Gas costs and optimization tips
- Error explanations with debugging help
- Next step suggestions

## Exploring Token Operations

Let's try some token operations. First, switch back to Anvil which has pre-configured test tokens:

```
Switch to Anvil
```

### Check Token Balance

```
Get my USDC balance
```

**Expected Output:**
```  
💰 Token Balance: 1000.0 USDC
📍 Token: USDC (0x1234...)
📍 Wallet: 0xf39Fd...2266
⛓️ Chain: Anvil (31337)

💡 USDC is a mock token for testing
```

### Transfer Tokens

```
Transfer 100 USDC to 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

**Expected Output:**
```
🎯 Token Transfer Successful!

📍 Token: USDC
💰 Amount: 100.0 USDC
📍 From: 0xf39Fd...2266  
📍 To: 0x70997...79C8
🔗 Hash: 0xdef456...

✅ Transfer confirmed!
```

## Smart Contract Interaction

One of WalletAgent's most powerful features is contract interaction. Let's explore:

### Load Contract Configuration

If you have contract configuration files:

```
Load my contract configuration for AI interactions
```

### Simulate Contract Calls

Test contract functions without spending gas:

```
Simulate balanceOf function for USDC with account 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

**Expected Output:**
```
🧪 Contract Simulation: USDC.balanceOf()

✅ Status: Success
📤 Return Value: 900000000 (900.0 USDC)
⛽ Estimated Gas: 0 (simulation)

💡 Next Steps:
- Function call would succeed if executed
- No gas cost for simulations
```

This is **very useful** for development - you can test any contract function without spending gas or affecting blockchain state.

### Step 7: Hyperliquid Support (Optional)

For users interested in decentralized trading, WalletAgent includes Hyperliquid integration for perpetual futures:

```
Import my Hyperliquid wallet using private key
```

**Expected Output:**
```
✅ Hyperliquid wallet imported successfully!

📍 Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
🏛️ Exchange: Hyperliquid (Testnet)
💼 Ready for perpetual futures trading

Next steps:
- Check account balance and positions
- View current market prices  
- Place your first trading order
```

**Try Some Trading Commands:**
```
Show my Hyperliquid account balance and positions
Get current mid prices for BTC and ETH on Hyperliquid
Place a small test order: buy 0.001 BTC at market price
```

{% hint style="info" %}
**Professional Trading**: Hyperliquid tools enable institutional-grade perpetual futures trading with AI assistance. Always start with small amounts on testnet!
{% endhint %}

## What You've Learned

In just 10 minutes, you've learned to:

- ✅ Connect to wallets using prompts
- ✅ Send transactions between addresses  
- ✅ Switch between different blockchain networks
- ✅ Transfer tokens with simple commands
- ✅ Simulate smart contract calls

## Essential Command Patterns

Here are the key patterns you'll use constantly:

### Wallet Management
```
Connect to [address]
Check my balance  
Get current account
Switch to [chain name]
```

### Transactions
```
Send [amount] ETH to [address]
Transfer [amount] [token] to [address]
Get transaction status [hash]
```

### Contract Operations  
```
Simulate [function] for [contract] with [args]
Read contract [contract] function [function]
Write contract [contract] function [function] with args [args]
```

### Information & Analysis
```
Get [token] balance
List available contracts
Analyze [contract] capabilities
What chains are supported?
```

## Mock vs Real Wallets

You've been using **mock wallets** - completely safe test accounts. When you're ready for testnet development, you can switch to **real wallets**:

{% hint style="warning" %}
**Only use testnets!** Never use real wallets with mainnet funds. WalletAgent is beta software.
{% endhint %}

### Mock Wallets (Current)
- ✅ Completely safe for learning
- ✅ Pre-funded with test tokens
- ✅ No setup required
- ❌ Can't interact with real testnets

### Real Wallets (Advanced)  
- ✅ Works with testnets like Sepolia
- ✅ Real blockchain interactions
- ✅ Enterprise-grade encrypted private key storage
- ⚠️ Requires testnet ETH for gas

#### Quick Encrypted Key Setup

For maximum security, use WalletAgent's encrypted keystore:

**1. Create Encrypted Keystore:**
```
Create encrypted keystore for secure testnet operations
```

**2. Import Your Testnet Private Key:**
```
Import private key with label 'Sepolia Testing'
```

**3. Switch to Encrypted Mode:**
```
Switch to private key wallet mode
Connect to my encrypted wallet address
```

**4. Verify Setup:**
```
Check keystore status
Get current account information
```

Now you can perform real blockchain operations with maximum security!

## Next Steps

You now have the basics! Here's where to go next:

### For Users
👉 **[User Guide](../user-guide/)** - Learn all wallet operations in detail

### For Developers  
👉 **[Developer Guide](../developer-guide/)** - Smart contract development and testing

### For Advanced Users
👉 **[Advanced Topics](../advanced/)** - Real wallets, private keys, and advanced features

## Quick Reference

### Test Wallet Addresses
```
0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266  # Main test wallet
0x70997970C51812dc3A010C7d01b50e0d17dc79C8  # Secondary wallet  
0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC  # Third wallet
```

### Supported Chains
```
Anvil (31337)     # Local development
Ethereum (1)      # Mainnet (view-only)
Sepolia (11155111) # Ethereum testnet
Polygon (137)     # Polygon mainnet
```

### Essential Commands
```
Get wallet info          # Check current status
Connect to [address]     # Switch wallets
Switch to [chain]        # Change networks  
Send [amount] to [addr]  # Transfer ETH/native token
Get [token] balance      # Check token balance
```

---

**Congratulations.** You've completed the WalletAgent quick start. You're now ready to explore the full capabilities of Web3 development with WalletAgent.