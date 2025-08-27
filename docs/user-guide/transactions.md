# Transactions

Learn how to send transactions, manage gas fees, and monitor transaction status using Wallet Agent.

## Sending ETH/Native Tokens

### Basic ETH Transfer

Send ETH to another address:

```
Send 1 ETH to 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

**Example Output:**
```
🚀 Transaction Sent Successfully!

📍 From: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
📍 To: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8  
💰 Amount: 1.0 ETH
⛽ Gas Used: 21,000
🔗 Hash: 0xabc123def456...

✅ Transaction confirmed in block 1234
💡 Transaction completed successfully!
```

### Send to Short Address

Use abbreviated addresses for convenience:

```
Send 0.5 ETH to 0x7099
```

Wallet Agent will find the matching address automatically.

### Send with Custom Gas

Specify gas parameters for better control:

```
Send 2 ETH to 0x3C44 with fast gas
```

**Gas Speed Options:**
- `slow` - Lowest cost, longer wait
- `standard` - Balanced cost and speed (default)
- `fast` - Higher cost, faster confirmation
- `fastest` - Highest cost, immediate confirmation

## Transaction Monitoring

### Get Transaction Status

Check the status of any transaction:

```
Get transaction status 0xabc123def456...
```

**Example Output:**
```
📊 Transaction Status

🔗 Hash: 0xabc123def456...
✅ Status: Confirmed (Success)
📦 Block: 1234 (15 confirmations)
⛽ Gas: 21,000 used / 21,000 limit
💰 Fee: 0.000441 ETH

📍 From: 0xf39Fd...2266
📍 To: 0x70997...79C8
💸 Value: 1.0 ETH

⏱️ Confirmed: 2 minutes ago
```

### Get Transaction Receipt

Get detailed transaction information:

```
Get transaction receipt 0xabc123def456...
```

**Example Output:**
```
📋 Transaction Receipt

🔗 Hash: 0xabc123def456...
📦 Block: 1234
📍 Position: 0 (first transaction in block)
✅ Status: Success

⛽ Gas Details:
- Used: 21,000
- Limit: 21,000  
- Price: 21 gwei
- Total Fee: 0.000441 ETH

📊 Network:
- Chain: Anvil (31337)
- Confirmations: 15
- Timestamp: 2024-01-15 10:30:45

💡 Transaction executed successfully with no reverts
```

## Gas Management

### Estimate Gas Costs

Preview gas costs before sending transactions:

```
Estimate gas for sending 1 ETH to 0x7099
```

**Example Output:**
```
⛽ Gas Estimation

💰 Transaction: Send 1.0 ETH
📍 To: 0x70997...79C8
📦 Estimated Gas: 21,000

💸 Cost Estimates:
- Slow: 0.00021 ETH (~$0.50)
- Standard: 0.000441 ETH (~$1.05)  
- Fast: 0.000672 ETH (~$1.60)
- Fastest: 0.000882 ETH (~$2.10)

💡 Standard speed recommended for most transactions
```

### Understanding Gas

**Gas Limit**: Maximum gas willing to spend
**Gas Price**: Price per gas unit (in gwei)
**Gas Used**: Actual gas consumed by transaction
**Total Fee**: Gas Used × Gas Price

{% hint style="info" %}
**Gas Tips**: 
- Simple ETH transfers use exactly 21,000 gas
- Smart contract interactions use variable gas
- Higher gas price = faster confirmation
- Unused gas is automatically refunded
{% endhint %}

## Advanced Transaction Features

### Send with Specific Gas Parameters

Fine-tune gas settings for optimal results:

```
Send 1 ETH to 0x7099 with gas limit 25000 and gas price 30 gwei
```

### Send Maximum Amount

Send all available ETH (minus gas fees):

```
Send all ETH to 0x7099
```

**Example Output:**
```
💰 Sending Maximum Amount

📊 Calculation:
- Current Balance: 10000.0 ETH
- Estimated Gas Fee: 0.000441 ETH
- Amount to Send: 9999.999559 ETH

🚀 Proceeding with maximum transfer...
```

### Transaction with Data

Include custom data in transactions:

```
Send 0.1 ETH to 0x7099 with data "0x1234abcd"
```

This is useful for:
- Smart contract function calls
- Multi-signature wallets
- Custom transaction metadata

## Transaction History

### View Recent Transactions

See your transaction history:

```
Show my recent transactions
```

**Example Output:**
```
📜 Transaction History (Last 10)

1. 🚀 Sent 1.0 ETH to 0x7099...
   ⏱️ 2 minutes ago | ✅ Confirmed
   🔗 0xabc123...

2. 📨 Received 0.5 ETH from 0x3C44...
   ⏱️ 1 hour ago | ✅ Confirmed
   🔗 0xdef456...

3. 🔄 Contract interaction: USDC Transfer
   ⏱️ 2 hours ago | ✅ Confirmed  
   🔗 0x789abc...

💡 Use "Get transaction details [hash]" for more info
```

### Filter Transaction History

View specific types of transactions:

```
Show my outgoing transactions
Show my incoming transactions  
Show my failed transactions
```

## Multi-Chain Transactions

### Native Token Names by Chain

Each blockchain has its own native token:

| Chain | Native Token | Symbol |
|-------|-------------|--------|
| Ethereum | Ether | ETH |
| Polygon | Polygon PoS | POL |
| Anvil | Ether | ETH |
| Sepolia | Sepolia Ether | ETH |

### Send on Different Chains

Switch chains and send native tokens:

```
Switch to Polygon
Send 10 POL to 0x7099
```

```
Switch to Sepolia  
Send 0.1 ETH to 0x3C44
```

### Cross-Chain Considerations

{% hint style="warning" %}
**Important**: Wallet Agent doesn't support cross-chain transfers directly. To send tokens from Ethereum to Polygon, you need:

1. Use a bridge service (like Polygon PoS Bridge)
2. Send to your own address on the destination chain
3. Never send ETH directly to Polygon addresses
{% endhint %}

## Error Handling

### Common Transaction Errors

**Insufficient Balance**
```
❌ Transaction Failed: Insufficient Balance

💰 Required: 10.5 ETH (10.0 ETH + 0.5 ETH gas)
💰 Available: 9.2 ETH  
💰 Shortfall: 1.3 ETH

🔧 Solutions:
- Reduce amount: "Send 8.7 ETH to 0x7099"
- Get more ETH: "How do I get testnet ETH?"
- Use different wallet: "Connect to 0x3C44"
```

**Gas Limit Too Low**
```
❌ Transaction Failed: Out of Gas

⛽ Gas provided: 20,000
⛽ Gas needed: ~25,000
📝 Reason: Complex contract interaction

🔧 Solutions:
- Increase gas limit: "Send with gas limit 30000"
- Use gas estimation: "Estimate gas for this transaction"
- Try default settings: Let Wallet Agent estimate automatically
```

**Network Congestion**
```
⚠️ Transaction Pending: Network Congested

⏱️ Submitted: 15 minutes ago
🔗 Hash: 0xabc123...
⛽ Gas Price: 20 gwei (below current network average of 35 gwei)

🔧 Options:
- Wait longer: Network will eventually process
- Speed up: "Replace transaction with higher gas"
- Cancel: "Cancel pending transaction"
```

### Transaction Recovery

**Replace Stuck Transaction**
```
Replace transaction 0xabc123... with higher gas price
```

**Cancel Pending Transaction**
```
Cancel transaction 0xabc123...
```

## Security Best Practices

### Before Sending Transactions

1. **Verify Recipient**: Double-check the address
   ```
   "Confirm this address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
   ```

2. **Check Amount**: Ensure correct value
   ```
   "I want to send 1.5 ETH, not 15 ETH, correct?"
   ```

3. **Confirm Network**: Verify you're on the right chain
   ```
   "What chain am I currently on?"
   ```

### Transaction Verification

Always verify transaction details before confirming:
- ✅ Recipient address is correct
- ✅ Amount is as intended  
- ✅ Gas fee is reasonable
- ✅ You're on the correct network

### Mock vs Real Considerations

**In Mock Mode (Safe)**:
- ✅ Unlimited funds for testing
- ✅ No real money at risk
- ✅ Perfect for learning transaction patterns

**In Real Mode (Testnet Only)**:
- ⚠️ Use testnet ETH only
- ⚠️ Verify addresses extra carefully
- ⚠️ Start with small amounts
- ❌ **Never use on mainnet**

## Troubleshooting

### Transaction Not Appearing

**Check Network**: Ensure you're on the correct chain
```
"What network am I on?"
"Switch to [correct network]"
```

**Verify Address**: Confirm address format and recipient
```
"Check transaction status 0x..."
"Get transaction receipt 0x..."  
```

### Transaction Failing

**Gas Issues**: Most common cause of transaction failures
```
"Estimate gas for [operation]"
"Send with higher gas limit"
```

**Balance Issues**: Insufficient funds for transaction + gas
```
"Check my balance"
"How much will gas cost?"
```

### Slow Confirmations

**Network Congestion**: Increase gas price for faster confirmation
```
"Replace transaction with fast gas"
"What's the current gas price?"
```

## Next Steps

Now that you understand transactions, explore more advanced features:

👉 **[Token Operations →](token-operations.md)** - Transfer ERC-20 tokens
👉 **[NFT Operations →](nft-operations.md)** - Manage digital collectibles
👉 **[Chain Management →](chain-management.md)** - Work across multiple networks

### Practice Exercises

1. **Basic Transfers**
   - Send various amounts between test wallets
   - Try different gas speed settings
   - Monitor transaction confirmations

2. **Gas Management**
   - Estimate gas for different operations
   - Compare gas costs across networks
   - Practice gas optimization techniques

3. **Transaction Monitoring**  
   - Track transaction status from pending to confirmed
   - View transaction receipts and details
   - Understand confirmation counts

---

You're now equipped to handle all types of transactions with confidence! 💫