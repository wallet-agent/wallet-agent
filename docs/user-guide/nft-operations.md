# NFT Operations

Learn how to manage Non-Fungible Tokens (NFTs) including transfers, ownership verification, and metadata retrieval using WalletAgent.

## Understanding NFTs

### What are NFTs?

Non-Fungible Tokens (NFTs) are unique digital assets on the blockchain. Unlike ERC-20 tokens which are interchangeable, each NFT has:

- **Unique Token ID** - Distinguishes it from other NFTs
- **Ownership Record** - Stored on blockchain
- **Metadata** - Description, image, properties
- **Smart Contract** - Defines behavior and rules

### Common NFT Standards

| Standard | Description | Use Cases |
|----------|-------------|-----------|
| **ERC-721** | Single unique tokens | Art, collectibles, domain names |
| **ERC-1155** | Multi-token standard | Gaming items, batch operations |
| **ERC-998** | Composable NFTs | NFTs that can own other tokens |

## Checking NFT Ownership

### Get NFT Owner

Check who owns a specific NFT:

```
Get owner of NFT token ID 42 from MyNFTCollection
```

**Example Output:**
```
👤 NFT Ownership

🎨 Collection: MyNFTCollection
🆔 Token ID: 42
📍 Owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
📍 Contract: 0x1234567890abcdef...

✅ You own this NFT!
💡 Ready for transfer or marketplace listing
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
🎨 NFT Transfer Successful!

📦 Collection: MyNFTCollection
🆔 Token ID: 42
📍 From: 0xf39Fd...2266
📍 To: 0x70997...79C8

🔗 Transaction: 0xabc123def456...
⛽ Gas Used: 85,000
💸 Gas Fee: 0.001785 ETH

✅ NFT ownership transferred successfully!
💡 New owner can now manage this NFT
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
🎨 NFT Information

📋 Basic Details:
- Collection: MyNFTCollection
- Token ID: 42
- Standard: ERC-721
- Contract: 0x1234567890abcdef...

📍 Ownership:
- Current Owner: 0xf39Fd...2266  
- Minted: 2024-01-15 10:30:45

🔗 Metadata:
- Name: "Awesome Digital Art #42"
- Description: "A unique piece of digital art..."
- Image: https://metadata.example.com/images/42.png
- Attributes:
  - Background: Blue
  - Eyes: Green  
  - Rarity: Common

🌐 External Links:
- OpenSea: https://opensea.io/assets/...
- Website: https://mynftcollection.com/42
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

## NFT Marketplace Operations

### Approve NFT for Trading

Allow marketplace contracts to transfer your NFTs:

```
Approve NFT MyNFTCollection for OpenSea marketplace
```

**Example Output:**
```
✅ NFT Collection Approved for Trading

🎨 Collection: MyNFTCollection
📍 Operator: OpenSea Marketplace (0x1E0049783F008A0085193E00003D00cd54003c71)
🔑 Approval: All tokens in collection

🔗 Transaction: 0xdef456abc789...
⛽ Gas Used: 46,000

💡 OpenSea can now transfer any NFT from this collection on your behalf
⚠️ Only approve trusted marketplaces!
```

### Check NFT Approvals

See which contracts can transfer your NFTs:

```
Check NFT approvals for MyNFTCollection
```

**Example Output:**
```
🔍 NFT Approval Status

🎨 Collection: MyNFTCollection
👤 Owner: 0xf39Fd...2266

✅ Approved Operators:
- OpenSea: 0x1E0049783F008A0085193E00003D00cd54003c71
  - Approved: All tokens
  - Since: 1 hour ago
  
- LooksRare: 0x59728544B08AB483533076417FbBB2fD0B17CE3a  
  - Approved: All tokens
  - Since: 2 days ago

💡 These contracts can transfer your NFTs from this collection
```

### Revoke NFT Approvals

Remove marketplace permissions for security:

```
Revoke NFT approval for MyNFTCollection from OpenSea
```

**Example Output:**
```
🛡️ NFT Approval Revoked

🎨 Collection: MyNFTCollection
📍 Operator: OpenSea (0x1E0049783F008A0085193E00003D00cd54003c71)
🔑 Previous Status: Approved (all tokens)
🔑 New Status: Not approved

🔗 Transaction: 0x123abc456def...

✅ OpenSea can no longer transfer your NFTs
💡 Your NFTs are now protected from this marketplace
```

## Advanced NFT Operations

### NFT Batch Operations (ERC-1155)

For gaming and multi-token collections:

```
Get balance of token ID 1 from GameItems for my address
Transfer 5 units of token ID 1 from GameItems to 0x7099
```

**Example Output:**
```
🎮 Gaming Token Balance

🎯 Collection: GameItems (ERC-1155)
🆔 Token ID: 1 (Magic Sword)
📍 Owner: 0xf39Fd...2266
💰 Balance: 3 items

📊 Item Details:
- Name: Magic Sword +5
- Type: Weapon
- Rarity: Rare
- Transferable: Yes

💡 You can transfer up to 3 of these items
```

### NFT Enumeration

List NFTs owned by an address:

```
List all NFTs owned by 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 in MyNFTCollection
```

**Example Output:**
```
🎨 NFT Portfolio

👤 Owner: 0xf39Fd...2266
🎯 Collection: MyNFTCollection

🖼️ Owned NFTs:
1. Token ID: 42
   - Name: "Awesome Digital Art #42"
   - Rarity: Common
   
2. Token ID: 156  
   - Name: "Awesome Digital Art #156"
   - Rarity: Rare

3. Token ID: 789
   - Name: "Awesome Digital Art #789"  
   - Rarity: Epic

📊 Portfolio Summary:
- Total NFTs: 3
- Floor Value: ~2.5 ETH
- Rarest: Epic (Token #789)
```

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