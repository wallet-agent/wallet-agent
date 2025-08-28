# NFT Operations

ERC-721 and ERC-1155 NFT management including transfers, ownership verification, and metadata retrieval.


## Checking NFT Ownership

### Get NFT Owner

Check who owns a specific NFT:

```
Get owner of NFT token ID 42 from MyNFTCollection
```

**Example Output:**
```
NFT Owner:
Contract: MyNFTCollection
Token ID: 42
Owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

### Check by Contract Address

```
Get owner of token ID 123 from 0x123abc456def...
```

### Verify Your NFT Ownership

```
Do I own NFT token ID 42 from MyNFTCollection?
```

**Example Output:**
```
🔍 NFT Ownership Verification

🎨 Collection: MyNFTCollection  
🆔 Token ID: 42
👤 Current Owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
🏠 Your Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

✅ YES - You own this NFT!

📅 Ownership History:
- Minted to you: 2 hours ago
- No transfers yet

💡 This NFT is ready for any operations
```

## NFT Transfers

### Transfer NFT to Another Address

Send an NFT to a different wallet:

```
Transfer NFT token ID 42 from MyNFTCollection to 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

**Example Output:**
```
NFT transfer successful
Transaction hash: 0xabc123def456...
NFT: MyNFTCollection
Token ID: 42
To: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

### Transfer by Contract Address

```
Transfer token ID 123 from 0x123abc... to 0x70997
```

### Transfer Multiple NFTs (ERC-1155)

For multi-token contracts supporting batch transfers:

```
Transfer tokens [1, 2, 3] amounts [1, 1, 1] from GameItems to 0x7099
```

## NFT Information & Metadata

### Get NFT Information

Retrieve detailed information about an NFT:

```
Get NFT info for token ID 42 from MyNFTCollection
```

**Example Output:**
```
NFT Information:
Name: Awesome Digital Art #42
Symbol: AWESOME
Token URI: https://metadata.mynftcollection.com/42.json
```

### Get Collection Information

Learn about an entire NFT collection:

```
Get NFT collection info for MyNFTCollection
```

**Example Output:**
```
🎨 NFT Collection Information

📋 Collection: MyNFTCollection
📍 Contract: 0x1234567890abcdef...
📊 Standard: ERC-721

📈 Statistics:
- Total Supply: 10,000 NFTs
- Minted: 8,542 NFTs  
- Available: 1,458 NFTs
- Unique Holders: 3,247 addresses

🎯 Features:
- ✅ Enumerable (can list all tokens)
- ✅ Metadata support
- ❌ Not pausable
- ❌ Not burnable

🔗 Links:
- Website: https://mynftcollection.com
- Discord: https://discord.gg/...
- Twitter: @MyNFTCollection
```

### Check Token URI

Get the metadata URI for an NFT:

```
Get token URI for NFT token ID 42 from MyNFTCollection
```

**Example Output:**
```
🔗 NFT Token URI

🎨 Collection: MyNFTCollection
🆔 Token ID: 42
📍 URI: https://metadata.mynftcollection.com/42.json

📋 Metadata Preview:
{
  "name": "Awesome Digital Art #42",
  "description": "A unique piece of digital art...",
  "image": "https://images.mynftcollection.com/42.png",
  "attributes": [
    {"trait_type": "Background", "value": "Blue"},
    {"trait_type": "Eyes", "value": "Green"}
  ]
}

💡 This URI contains all the NFT's metadata and properties
```

## Available NFT Operations

WalletAgent currently supports these ERC-721 NFT operations:

1. **Transfer NFTs** - Move NFTs between addresses
2. **Check NFT Ownership** - See who owns a specific NFT
3. **Get NFT Information** - View NFT metadata and properties

{% hint style="info" %}
**Note**: NFT marketplace operations (approvals, batch operations, enumeration) are not currently implemented. Use contract interaction tools for advanced NFT operations.
{% endhint %}

## Multi-Chain NFT Management

### NFTs on Different Chains

NFTs exist independently on each blockchain:

| Chain | Popular NFT Collections |
|-------|------------------------|
| Ethereum | CryptoPunks, Bored Apes, Art Blocks |
| Polygon | Sandbox, Decentraland items |
| Sepolia | Test NFT collections |

### Cross-Chain Considerations

```
Switch to Polygon
Check my NFTs in PolygonNFTCollection
Transfer NFT token ID 123 to 0x7099
```

**Important Notes:**
- NFTs cannot be directly transferred between chains
- Same collection may exist on multiple chains (different contracts)
- Bridge services needed for cross-chain NFT movement

## Error Handling

### Common NFT Errors

**Not the Owner**
```
❌ NFT Transfer Failed: Not the Owner

🎨 Collection: MyNFTCollection
🆔 Token ID: 42
👤 Current Owner: 0x70997...79C8
👤 Your Address: 0xf39Fd...2266

🔧 Solutions:
- Verify token ID: "Get owner of token ID 42"
- Check different collection: "Get owner of token ID 42 from OtherCollection"
- Confirm your address: "Get current account"
```

**NFT Not Found**
```
❌ NFT Not Found: Token ID 999999

🎨 Collection: MyNFTCollection
🆔 Requested: 999999
📊 Collection Size: 10,000 tokens (IDs 1-10,000)

🔧 Solutions:
- Check valid range: Token IDs 1 to 10,000
- Verify collection: "Get collection info for MyNFTCollection"
- Try different token: "Get owner of token ID 42"
```

**Transfer Not Approved**
```
❌ NFT Transfer Failed: Not Approved

🎨 Collection: MyNFTCollection
🆔 Token ID: 42  
📍 Operator: 0x1E0049...003c71
🔑 Status: Not approved

🔧 Solution:
"Approve NFT MyNFTCollection for 0x1E0049783F008A0085193E00003D00cd54003c71"

💡 Or approve for all tokens: "Approve NFT MyNFTCollection for OpenSea"
```

**Insufficient Gas**
```
❌ NFT Transfer Failed: Insufficient Gas

⛽ Required: ~85,000 gas (~0.00178 ETH)
💰 Available ETH: 0.001 ETH
💰 Shortfall: 0.00078 ETH

🔧 Solutions:
- Get more ETH: "Get test ETH from faucet"
- Use different wallet: "Connect to wallet with ETH"
- Try lower gas: "Transfer with slow gas settings"
```

## NFT Security Best Practices

### Ownership Verification

Always verify ownership before operations:
```
"Do I own NFT token ID 42 before transferring?"
"Check current owner of this NFT"
```

### Marketplace Safety

1. **Trusted Platforms**: Only approve well-known marketplaces
2. **Limited Approvals**: Revoke approvals when not trading
3. **Verify Transactions**: Double-check recipient addresses

### Metadata Validation

```
"Get NFT metadata to verify authenticity"
"Check if this NFT contract is verified"
"Verify collection official website and socials"
```

### Mock vs Real Mode

**Mock Mode (Safe Learning)**:
- ✅ Test NFT collections with unlimited minting
- ✅ Practice transfers and approvals safely
- ✅ Learn marketplace interactions risk-free

**Real Mode (Testnet Only)**:
- ⚠️ Limited testnet NFT availability
- ⚠️ Real gas costs for all operations
- ❌ **Never use valuable mainnet NFTs**

## Troubleshooting

### NFT Not Displaying

**Check Network**: Ensure correct blockchain
```
"What chain am I on?"
"Switch to Ethereum to see my CryptoPunks"
```

**Verify Contract**: Confirm NFT contract address
```
"Get collection info for 0x1234..."
"Is this the official contract address?"
```

### Transfer Issues

**Ownership Problems**: Most common cause
```
"Who owns this NFT currently?"
"Did my previous transfer succeed?"
```

**Approval Issues**: Required for marketplace operations
```
"Check NFT approvals for this collection"
"Am I approved to transfer this NFT?"
```

### Metadata Loading

**URI Problems**: Metadata server issues
```
"Get token URI for this NFT"
"Is the metadata server responding?"
```

## Next Steps

Now that you understand NFT operations, explore related topics:

👉 **[Chain Management →](chain-management.md)** - Multi-chain NFT strategies
👉 **[Security →](security.md)** - NFT security best practices
👉 **[Developer Guide →](../developer-guide/)** - Create your own NFTs

### Practice Exercises

1. **Basic NFT Operations**
   - Check ownership of different NFTs
   - Practice transferring test NFTs
   - Explore NFT metadata and properties

2. **Marketplace Preparation**
   - Grant approvals to test marketplaces
   - Check current approval status
   - Practice revoking approvals

3. **Multi-Chain NFTs**
   - Switch chains and explore different collections
   - Compare same projects on different networks
   - Understand cross-chain limitations

---

You now have comprehensive knowledge of NFT operations and management! 🎨