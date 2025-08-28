# Token Operations

ERC-20 token operations: transfers, approvals, balance management, and token information retrieval.


## Checking Token Balances

### Get Token Balance

Check your balance of any ERC-20 token:

```
Get my USDC balance
```

**Example Output:**
```
Token Balance:
Amount: 1000.0 USDC
Raw: 1000000000
Decimals: 6
```

### Check Multiple Token Balances

```
Show me all my token balances
```

**Example Output:**
```
Token Balance:
Amount: 1000.0 USDC
Raw: 1000000000
Decimals: 6
```

### Get Token Information

Learn about any token contract:

```
Get USDC token info
```

**Example Output:**
```
Token Information:
Name: USD Coin
Symbol: USDC
Decimals: 6
```

## Token Transfers

### Basic Token Transfer

Send tokens to another address:

```
Transfer 100 USDC to 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

**Example Output:**
```
Token transfer successful
Transaction hash: 0xabc123def456...
Token: USDC
To: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Amount: 100.0
```

### Transfer Using Token Address

You can also specify tokens by contract address:

```
Transfer 50 tokens at 0xA0b86991c431B... to 0x7099
```

### Transfer Maximum Amount

Send all available tokens:

```
Transfer all USDC to 0x3C44
```

**Example Output:**
```
💰 Maximum Token Transfer

📊 Calculation:
- Current USDC Balance: 1000.0 USDC  
- Amount to Transfer: 1000.0 USDC
- Gas Fee: ~0.001365 ETH (paid in ETH)

Transferring all 1000.0 USDC...
```

{% hint style="info" %}
**Gas Fees**: Token transfers require ETH for gas fees, even when transferring other tokens. Always keep some ETH in your wallet for gas.
{% endhint %}

## Token Approvals

### Understanding Approvals

Token approvals allow other addresses (usually smart contracts) to spend your tokens on your behalf. This is essential for:

- **DEX Trading** - Allowing exchanges to trade your tokens
- **DeFi Protocols** - Lending, borrowing, yield farming
- **NFT Marketplaces** - Using tokens to buy NFTs

### Approve Token Spending

Allow a contract to spend your tokens:

```
Approve 1000 USDC spending for 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984
```

**Example Output:**
```
Token approval successful
Transaction hash: 0xdef456abc789...
Token: USDC
Spender: 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984
Amount: 1000
```

### Unlimited Approval

Grant unlimited spending permission:

```
Approve unlimited USDC spending for 0x1f9840
```

**Example Output:**
```
Token approval successful
Transaction hash: 0x789abc123def...
Token: USDC
Spender: 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984
Amount: max
```
- Consider revoking approval when done

💡 Use "Revoke USDC approval for 0x1f9840" to remove this permission
```

{% hint style="warning" %}
**Security Warning**: Unlimited approvals are convenient but risky. Only grant unlimited approvals to contracts you absolutely trust, and revoke them when no longer needed.
{% endhint %}

### Revoke Token Approvals

Revoke approval by setting amount to 0:

```
Approve 0 USDC spending for 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984
```

**Example Output:**
```
Token approval successful
Transaction hash: 0x123abc456def...
Token: USDC
Spender: 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984
Amount: 0
```

## Multi-Chain Token Operations

### Different Tokens per Chain

Tokens exist independently on each blockchain:

| Chain | Popular Tokens |
|-------|---------------|
| Ethereum | USDC, USDT, DAI, UNI, AAVE |
| Polygon | USDC.e, USDT, DAI, POL, WETH |
| Sepolia | Test versions of above tokens |

### Switch Chains for Token Operations

```
Switch to Polygon
Get my USDC balance
Transfer 100 USDC to 0x7099
```

**Chain-Specific Considerations:**
- **Gas Fees**: Paid in native token (ETH on Ethereum, POL on Polygon)
- **Token Addresses**: Same token has different addresses on different chains
- **Bridge Requirements**: Moving tokens between chains requires bridge services

## Advanced Token Operations

### Token Swapping Preparation

Prepare tokens for DEX trading by approving router contracts:

```
Approve 1000 USDC spending for Uniswap V3 Router
```

### Token Allowance Management

Check all approvals for a token:

```
Show all USDC approvals for my wallet
```

Batch revoke multiple approvals:

```
Revoke all USDC approvals
```

### Token Analytics

Get detailed token metrics:

```
Analyze USDC token contract
```

**Example Output:**
```
🔬 Token Analysis: USDC

📊 Contract Metrics:
- Total Supply: 40,502,123,456 USDC
- Holders: 1,234,567 addresses
- Transfers: 15,678,901 total

🔍 Features Detected:
- ✅ Standard ERC-20 implementation
- ✅ Pausable (admin can pause transfers)
- ✅ Blacklistable (admin can block addresses)
- ❌ Not mintable by public

🛡️ Security:
- Audited by multiple firms
- Centralized issuance model
- Regulatory compliance features
```

## Token Development & Testing

### Add Custom Tokens

Add tokens not automatically detected:

```
Add custom token at 0x123abc... with symbol TEST and 18 decimals
```

### Test Token Faucets

In mock mode, get unlimited test tokens:

```
Get test USDC from faucet
Get 1000 DAI from faucet
```

**Mock Token Features:**
- Unlimited supply for testing
- No rate limits or restrictions
- Automatically refilled balances
- Support for all common token standards

## Error Handling

### Common Token Errors

**Insufficient Token Balance**
```
❌ Token Transfer Failed: Insufficient Balance

💰 Required: 1500.0 USDC
💰 Available: 1000.0 USDC
💰 Shortfall: 500.0 USDC

🔧 Solutions:
- Reduce amount: "Transfer 900 USDC to 0x7099"
- Get more tokens: "Get test USDC from faucet" (mock mode)
- Check different wallet: "Connect to 0x3C44"
```

**Insufficient ETH for Gas**
```
❌ Token Transfer Failed: Insufficient ETH for Gas

💰 Required ETH: 0.002 ETH (for gas)
💰 Available ETH: 0.001 ETH
💰 Shortfall: 0.001 ETH

🔧 Solutions:
- Get more ETH: "Get test ETH from faucet"
- Use different wallet: "Connect to wallet with ETH"
- Reduce gas price: "Transfer with slow gas"
```

**Token Not Found**
```
❌ Token "UNKNOWN" not found

🔍 Searched for: UNKNOWN token
⛓️ Chain: Anvil (31337)

🔧 Solutions:
- Check spelling: Common tokens are USDC, USDT, DAI
- Use contract address: "Transfer 100 tokens at 0x123abc..."
- Add custom token: "Add token 0x123abc... with symbol UNKNOWN"
- List available: "Show available tokens"
```

**Approval Required**
```
❌ Token Transfer Failed: Approval Required

📋 Issue: Contract needs approval to spend your tokens
📍 Token: USDC
📍 Contract: 0x1f9840...F984
💰 Requested: 1000.0 USDC

🔧 Solution:
"Approve 1000 USDC spending for 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"
```

## Security Best Practices

### Token Approval Safety

1. **Minimal Approvals**: Only approve what you need
   ```
   ❌ Approve unlimited USDC for DEX
   ✅ Approve 1000 USDC for DEX
   ```

2. **Trusted Contracts**: Only approve well-known, audited contracts
3. **Regular Cleanup**: Revoke unused approvals periodically
4. **Monitor Activity**: Check approval transactions regularly

### Token Transfer Safety

1. **Verify Addresses**: Double-check recipient addresses
   ```
   "Confirm address 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 is correct"
   ```

2. **Test Small Amounts**: Send small amounts first for new recipients
   ```
   "Transfer 1 USDC to test the address first"
   ```

3. **Check Network**: Ensure you're on the correct chain
   ```
   "What chain am I on before sending tokens?"
   ```

### Mock vs Real Mode Considerations

**Mock Mode (Safe Testing)**:
- ✅ Unlimited token supplies
- ✅ No real money at risk
- ✅ Practice complex operations safely

**Real Mode (Testnet Only)**:
- ⚠️ Limited testnet token supplies
- ⚠️ Real gas costs (testnet ETH)
- ❌ **Never use mainnet tokens**

## Troubleshooting

### Token Not Showing

**Check Network**: Ensure you're on the correct chain
```
"What network am I on?"
"Switch to Ethereum"
```

**Verify Address**: Confirm token contract address
```
"Get token info for 0xA0b86991c431B..."
"Add custom token 0xA0b86991c431B..."
```

### Transfer Failures

**Gas Issues**: Most common cause
```
"Check my ETH balance for gas"
"Estimate gas for token transfer"
```

**Approval Issues**: Required for many token operations
```
"Check USDC approval for 0x1f9840..."
"Approve USDC spending for contract"
```

### Balance Discrepancies

**Network Confusion**: Same tokens on different chains
```
"What chain shows my USDC balance?"
"Switch to Polygon to check USDC.e"
```

**Transaction Pending**: Recent transactions not yet confirmed
```
"Check pending transactions"
"Get transaction status 0xabc123..."
```

## Next Steps

Now that you understand token operations, explore related features:

👉 **[NFT Operations →](nft-operations.md)** - Manage digital collectibles
👉 **[Chain Management →](chain-management.md)** - Multi-chain token strategies  
👉 **[Security →](security.md)** - Advanced token security practices

### Practice Exercises

1. **Basic Token Operations**
   - Check balances of different tokens
   - Transfer tokens between test wallets
   - Practice token information retrieval

2. **Approval Management**
   - Grant approvals to test contracts
   - Check current approval amounts
   - Practice revoking approvals for security

3. **Multi-Chain Tokens**
   - Switch chains and check token balances
   - Compare same tokens on different networks
   - Understand gas requirements per chain

---

You now have comprehensive knowledge of ERC-20 token operations! 🪙