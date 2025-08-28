# Basic Operations

Master the fundamental operations of WalletAgent. These are the building blocks for all Web3 interactions.

## Wallet Information

### Get Current Status

Check your current wallet configuration and status:

```
Get wallet info
```

**Example Output:**
```
Current wallet configuration:
- Type: mock
- Available addresses: 3
  - 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
  - 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
  - 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
```

This command shows:
- **Wallet Type**: Mock (safe) or Real (testnet/mainnet)
- **Available Accounts**: Number of wallets you can connect to
- **Current Chain**: Which blockchain network you're using
- **Native Currency**: The main token of the current chain (ETH, POL, etc.)

### List Available Accounts

See all wallets available for connection:

```
Get accounts
```

**Example Output:**
```
Available mock accounts:
0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
0x70997970C51812dc3A010C7d01b50e0d17dc79C8
0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
```

## Wallet Connection

### Connect to a Specific Wallet

Connect to one of the available test wallets:

```
Connect to 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

**Example Output:**
```
Connected to wallet: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Chain: 31337
```

### Connect Using Short Address

You can use just the first few characters:

```
Connect to 0xf39F
```

WalletAgent will find the matching address automatically.

### Get Current Account

Check which wallet is currently connected:

```
Get current account
```

**Example Output:**
```
Connected: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Chain ID: 31337
Connector: Mock Connector
```

## Balance Checking

### Check ETH/Native Token Balance

Get your balance on the current chain:

```
Check my balance
```

**Example Output:**
```
Balance: 10000.0 ETH
Raw: 10000000000000000000000 wei
```

### Check Specific Address Balance

Check the balance of any address:

```
Get balance of 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

**Example Output:**
```
Balance: 10000.0 ETH
Raw: 10000000000000000000000 wei
```

## Disconnecting Wallets

### Disconnect Current Wallet

Safely disconnect from the current wallet:

```
Disconnect wallet
```

**Example Output:**
```
Wallet disconnected
```

After disconnecting:
- No wallet is connected
- You can't send transactions until reconnecting
- All session data is cleared for security

## Mock Wallets

Mock wallets provide safe testing with pre-funded accounts (10,000 ETH) and test tokens (USDC, USDT, WETH, DAI). Use for development, testing, and contract interactions without risk.

{% hint style="warning" %}
**Beta Software**: Use only on testnets or local development environments.
{% endhint %}

## Common Operations

### Quick Status Check

Get a complete overview of your current state:

```
What's my current status?
```

**Example Output:**
```
📊 WalletAgent Status

👤 Account: 0xf39Fd...2266 (Connected)
💰 Balance: 9999.0 ETH  
⛓️ Chain: Anvil (31337)
🔧 Mode: Mock (Safe Testing)

📈 Recent Activity:
- Sent 1.0 ETH to 0x7099...
- Received test tokens
- Switched chains 2 times

✅ System Status: All systems operational
```

### Switch Between Wallets

Easily switch to a different wallet:

```
Connect to the second wallet
```

Or:

```
Switch to 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

**Example Output:**
```
🔄 Switched to new wallet successfully!

📍 Old Wallet: 0xf39Fd...2266
📍 New Wallet: 0x70997...79C8
💰 New Balance: 10001.0 ETH

✅ Ready for operations with new wallet
```

## Error Handling

### Common Issues and Solutions

**"No wallet connected"**
```
❌ No wallet connected

🔧 To fix this:
1. Connect to a wallet: "Connect to 0xf39F..."
2. Or list available wallets: "Get accounts"
3. Choose from available options

💡 Need help? Ask "How do I connect to a wallet?"
```

**Solution**: Connect to any available wallet first.

**"Invalid address format"**
```
❌ Invalid address format: "0x123"

🔧 Ethereum addresses must:
- Start with "0x"  
- Be exactly 42 characters long
- Use valid hexadecimal characters (0-9, a-f)

✅ Valid example: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

💡 You can use short addresses like "0xf39F" - I'll find the match!
```

**Solution**: Use proper Ethereum address format or short references.

**"Chain not supported"**
```
❌ Chain "SomeChain" not found

🔧 Supported chains:
- Anvil (31337) - Local development  
- Ethereum (1) - Mainnet view-only
- Sepolia (11155111) - Ethereum testnet
- Polygon (137) - Polygon mainnet

💡 Use one of the supported chain names above
```

**Solution**: Use supported chain names from the built-in networks.

## Best Practices

### 1. Always Start with Status Check

Before performing operations, check your status:
```
Get wallet info
```

This ensures you understand:
- Which wallet is connected
- What chain you're on  
- Available balance

### 2. Use Descriptive Commands

Instead of:
```
❌ "Balance"
```

Use:
```
✅ "Check my ETH balance"
✅ "What's my current balance?"  
✅ "Get balance of my main wallet"
```

### 3. Verify Before Important Operations

Before sending transactions or making changes:
```
"Show me my current wallet details"
"What chain am I on?"
"Double-check my balance"
```

### 4. Use Short Addresses When Possible

Instead of typing full addresses:
```
❌ Connect to 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
✅ Connect to 0xf39F
```

WalletAgent will find the match automatically.

### 5. Understand Your Mode

Always know whether you're in Mock or Real mode:
- **Mock Mode**: Safe for all experimentation
- **Real Mode**: Only for testnet operations

## Troubleshooting

### Connection Issues

**Problem**: "MCP server not responding"
**Solution**: 
1. Restart your AI agent
2. Check that WalletAgent is properly installed
3. Try: "Get wallet info" to test connection

**Problem**: "WalletAgent not found"
**Solution**:
1. Check that WalletAgent is properly configured in your AI agent
2. Restart your AI agent
3. Check MCP configuration

### Address Issues

**Problem**: "Address not found"
**Solution**:
1. Use "Get accounts" to see available addresses
2. Check address format (0x + 40 hex characters)
3. Try short address format (first 6+ characters)

**Problem**: "Invalid address"
**Solution**:
1. Verify address starts with "0x"
2. Check for typos in hex characters
3. Ensure exactly 42 characters total

### Balance Issues

**Problem**: "Balance shows 0"
**Solution**:
1. Confirm wallet is connected: "Get current account"
2. Check you're on the right chain: "Get wallet info"
3. Mock wallets should have 10,000 ETH by default

## Next Steps

Now that you understand basic operations, you're ready for more advanced features:

### Continue Learning
👉 **[Transactions →](transactions.md)** - Learn to send ETH and manage gas
👉 **[Token Operations →](token-operations.md)** - Work with ERC-20 tokens  
👉 **[Chain Management →](chain-management.md)** - Switch between networks

### Practice Scenarios

Try these practice exercises:

1. **Wallet Management**
   - Connect to each test wallet
   - Check balances of all wallets
   - Switch between wallets multiple times

2. **Information Gathering**
   - Get current status regularly
   - Practice using short addresses
   - Check balances of different addresses

3. **Error Recovery**
   - Try invalid commands to see error messages
   - Practice reconnecting after disconnection
   - Use help commands when stuck

---

You now know the fundamentals of WalletAgent. These basic operations are the foundation for all Web3 interactions.