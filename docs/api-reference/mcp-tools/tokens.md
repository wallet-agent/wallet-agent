# Token Tools

MCP tools for ERC-20 token and ERC-721 NFT operations with AI agents.

## Overview

Token tools enable AI assistants to interact with ERC-20 tokens and ERC-721 NFTs through natural language prompts. These tools handle token transfers, balance queries, approvals, and NFT operations.

## ERC-20 Token Tools

### transfer_token

Transfer ERC-20 tokens to another address.

**Tool Name:** `mcp__wallet-agent__transfer_token`

**Parameters:**
```typescript
{
  token: string;        // Token contract name, symbol, or address
  to: string;          // Recipient address
  amount: string;      // Amount in token units (e.g., "100" for 100 USDC)
}
```

**Response:**
```typescript
{
  txHash: string;      // Transaction hash
  from: string;        // Sender address
  to: string;         // Recipient address
  amount: string;     // Amount transferred
  token: string;      // Token identifier used
  symbol: string;     // Token symbol
  decimals: number;   // Token decimals
}
```

**Example Prompts:**
- "Send 100 USDC to Alice at 0x742d35Cc6634C0532925a3b8D7389C4e0C5F0532"
- "Transfer 50 tokens to Bob's address"
- "Send 1000 of my MyToken to 0x742d35Cc6634C0532925a3b8D7389C4e0C5F0532"
- "Transfer 25.5 DAI to that address"

**AI Agent Response:**
The AI agent will execute the token transfer, wait for confirmation, and report the transaction details including the transaction hash and final balances.

**Errors:**
- `InvalidParams`: Invalid token, address, or amount
- `InvalidRequest`: Insufficient token balance or allowance
- `InternalError`: Transaction failed

---

### approve_token

Approve another address to spend ERC-20 tokens on your behalf.

**Tool Name:** `mcp__wallet-agent__approve_token`

**Parameters:**
```typescript
{
  token: string;        // Token contract name, symbol, or address
  spender: string;      // Address to approve for spending
  amount: string;       // Amount to approve ("max" for unlimited)
}
```

**Response:**
```typescript
{
  txHash: string;      // Transaction hash
  owner: string;       // Token owner (your address)
  spender: string;     // Approved spender address
  amount: string;      // Approved amount
  token: string;       // Token identifier
  symbol: string;      // Token symbol
}
```

**Example Prompts:**
- "Approve the DEX contract to spend 500 USDC"
- "Give unlimited approval to 0x742d35... for my DAI tokens"
- "Approve 1000 MyToken for the staking contract"
- "Set approval for 250 tokens to that contract address"

**AI Agent Response:**
The AI agent will set the token approval, confirm the transaction, and report the approved amount and spender details.

**Errors:**
- `InvalidParams`: Invalid token, spender address, or amount
- `InvalidRequest`: Token not found or wallet not connected
- `InternalError`: Transaction failed

---

### get_token_balance

Get the ERC-20 token balance for an address.

**Tool Name:** `mcp__wallet-agent__get_token_balance`

**Parameters:**
```typescript
{
  token: string;        // Token contract name, symbol, or address
  address?: string;     // Address to check (defaults to connected wallet)
}
```

**Response:**
```typescript
{
  balance: string;      // Token balance in human-readable format
  balanceRaw: string;   // Raw balance (with full decimals)
  address: string;      // Address checked
  token: string;        // Token identifier
  symbol: string;       // Token symbol
  decimals: number;     // Token decimals
}
```

**Example Prompts:**
- "Check my USDC balance"
- "How many DAI tokens do I have?"
- "What's Alice's balance of MyToken at 0x742d35...?"
- "Show me the token balance for that address"

**AI Agent Response:**
The AI agent will query the token balance and display it in a human-readable format, such as "You have 1,234.56 USDC".

**Errors:**
- `InvalidParams`: Invalid token or address
- `InvalidRequest`: Token not found
- `InternalError`: Balance query failed

---

### get_token_info

Get metadata information about an ERC-20 token.

**Tool Name:** `mcp__wallet-agent__get_token_info`

**Parameters:**
```typescript
{
  token: string;        // Token contract name, symbol, or address
}
```

**Response:**
```typescript
{
  name: string;         // Token name
  symbol: string;       // Token symbol
  decimals: number;     // Decimal places
  address: string;      // Contract address
  totalSupply?: string; // Total supply (if available)
}
```

**Example Prompts:**
- "Tell me about the USDC token"
- "What are the details of MyToken?"
- "Show me information about token at 0x742d35..."
- "Get the name, symbol, and decimals for this token"

**AI Agent Response:**
The AI agent will display comprehensive token information including name, symbol, decimals, and total supply in a formatted overview.

**Errors:**
- `InvalidParams`: Invalid token identifier
- `InvalidRequest`: Token not found or not a valid ERC-20
- `InternalError`: Token info query failed

## ERC-721 NFT Tools

### transfer_nft

Transfer an ERC-721 NFT to another address.

**Tool Name:** `mcp__wallet-agent__transfer_nft`

**Parameters:**
```typescript
{
  nft: string;          // NFT contract name or address
  to: string;          // Recipient address
  tokenId: string;     // Token ID to transfer
}
```

**Response:**
```typescript
{
  txHash: string;      // Transaction hash
  from: string;        // Sender address
  to: string;         // Recipient address
  tokenId: string;    // Token ID transferred
  nft: string;        // NFT contract identifier
  name?: string;      // Collection name
}
```

**Example Prompts:**
- "Transfer NFT #123 to Alice at 0x742d35..."
- "Send my CryptoPunk #456 to Bob's address"
- "Transfer token ID 789 from MyNFT collection to that address"
- "Give NFT #101 to 0x742d35Cc6634C0532925a3b8D7389C4e0C5F0532"

**AI Agent Response:**
The AI agent will execute the NFT transfer, verify ownership, complete the transaction, and confirm the new owner.

**Errors:**
- `InvalidParams`: Invalid NFT contract, recipient, or token ID
- `InvalidRequest`: You don't own this NFT or NFT doesn't exist
- `InternalError`: Transfer transaction failed

---

### get_nft_owner

Get the current owner of an ERC-721 NFT.

**Tool Name:** `mcp__wallet-agent__get_nft_owner`

**Parameters:**
```typescript
{
  nft: string;          // NFT contract name or address
  tokenId: string;     // Token ID to check
}
```

**Response:**
```typescript
{
  owner: string;        // Current owner address
  tokenId: string;     // Token ID
  nft: string;         // NFT contract identifier
  exists: boolean;     // Whether the token exists
}
```

**Example Prompts:**
- "Who owns CryptoPunk #123?"
- "Check the owner of NFT #456 in MyNFT collection"
- "Find out who has token ID 789"
- "Show me the current owner of that NFT"

**AI Agent Response:**
The AI agent will query the NFT ownership and display the current owner's address, along with verification that the token exists.

**Errors:**
- `InvalidParams`: Invalid NFT contract or token ID
- `InvalidRequest`: Token doesn't exist
- `InternalError`: Ownership query failed

---

### get_nft_info

Get metadata information about an ERC-721 NFT.

**Tool Name:** `mcp__wallet-agent__get_nft_info`

**Parameters:**
```typescript
{
  nft: string;          // NFT contract name or address
  tokenId?: string;     // Token ID (optional for collection info)
}
```

**Response:**
```typescript
{
  name: string;         // Collection name
  symbol: string;       // Collection symbol
  address: string;      // Contract address
  tokenId?: string;     // Token ID (if specified)
  tokenURI?: string;    // Metadata URI (if token ID provided)
  owner?: string;       // Current owner (if token ID provided)
}
```

**Example Prompts:**
- "Tell me about the CryptoPunks collection"
- "Get information about NFT #123 in MyNFT"
- "Show me details for token ID 456"
- "What's the metadata URI for this NFT?"

**AI Agent Response:**
The AI agent will provide comprehensive NFT information including collection details, and if a specific token ID is provided, individual token metadata and ownership information.

**Errors:**
- `InvalidParams`: Invalid NFT contract or token ID format
- `InvalidRequest`: Collection or token doesn't exist
- `InternalError`: NFT info query failed

## Common Workflows

### Token Balance Check and Transfer
**Developer:** "Check my USDC balance, then send 100 USDC to Alice at 0x742d35..."

**AI Agent Response:** The AI will:
1. Check balance: "You have 1,500.00 USDC"
2. Execute transfer: "Sending 100 USDC to Alice..."
3. Confirm: "Transfer complete! Transaction: 0xabc123... Your new balance: 1,400.00 USDC"

### Token Approval Workflow
**Developer:** "Approve the Uniswap router to spend 500 DAI, then check the allowance"

**AI Agent Response:** The AI will:
1. Set approval: "Approving 500 DAI for Uniswap router..."
2. Confirm: "Approval set! Transaction: 0xdef456..."
3. Verify: "Current allowance: 500.00 DAI"

### NFT Ownership Verification and Transfer
**Developer:** "Check if I own CryptoPunk #123, and if so, transfer it to Bob"

**AI Agent Response:** The AI will:
1. Check ownership: "You are the owner of CryptoPunk #123"
2. Execute transfer: "Transferring CryptoPunk #123 to Bob..."
3. Confirm: "Transfer complete! Transaction: 0xghi789... Bob is now the owner"

### Token Information Discovery
**Developer:** "I have a token at address 0x742d35..., tell me what it is and check my balance"

**AI Agent Response:** The AI will:
1. Get token info: "This is MyToken (MTK) with 18 decimals"
2. Check balance: "You have 2,500.00 MTK tokens"

## Multi-Chain Token Operations

### Cross-Chain Balance Checking
**Developer:** "Check my USDC balance on both Ethereum and Polygon"

**AI Agent Response:** The AI will switch between chains and report:
- Ethereum USDC: 1,000.00
- Polygon USDC: 500.00

### Chain-Specific Token Operations
**Developer:** "Switch to Polygon and transfer 100 MATIC-USDC to Alice"

**AI Agent Response:** The AI will switch to Polygon network and execute the USDC transfer using the Polygon deployment.

## Advanced Token Operations

### Maximum Approvals
**Developer:** "Give unlimited approval to the staking contract for my reward tokens"

**AI Agent Response:** "Setting unlimited approval for RewardToken to staking contract... This will allow the contract to spend any amount of your tokens without additional approvals."

### Token Allowance Management
**Developer:** "Check how much USDC the DEX is approved to spend, then increase it by 200"

**AI Agent Response:** The AI will check current allowance and increase it by the specified amount.

### Batch Token Operations
**Developer:** "Check my balances for USDC, DAI, and WETH all at once"

**AI Agent Response:** The AI will query all three balances simultaneously and display:
- USDC: 1,000.00
- DAI: 2,500.00  
- WETH: 5.75

## Error Handling and Recovery

### Insufficient Balance Scenarios
**Developer:** "Transfer 1000 USDC to Alice"
**AI Response:** "You only have 500 USDC available. Would you like to transfer your full balance instead?"

### Approval Issues
**Developer:** "Why did my token transfer fail?"
**AI Response:** "The transfer failed because you haven't approved the contract to spend your tokens. Would you like me to set the approval first?"

### NFT Ownership Issues
**Developer:** "Transfer my CryptoPunk #123 to Bob"
**AI Response:** "You don't currently own CryptoPunk #123. The current owner is 0x456... Would you like me to check which CryptoPunks you do own?"

## Security Considerations

### Safe Token Operations
- Always verify token contract addresses before large transfers
- Use caution with unlimited approvals
- Double-check recipient addresses for transfers
- Understand that token transfers are irreversible

### NFT Security
- Verify NFT authenticity and collection contracts
- Be cautious of fake or duplicate collections
- Confirm ownership before attempting transfers
- Understand NFT marketplace fees and royalties

## Performance Optimization

### Efficient Token Queries
**Developer:** "Check all my token balances for USDC, DAI, WETH, and UNI"

**AI Agent Response:** The AI will batch these queries for optimal performance and display all balances together.

### Smart Approval Management
**Developer:** "Set up approvals for DEX trading with optimal gas usage"

**AI Agent Response:** The AI will analyze your intended trading patterns and set appropriate approval amounts to minimize future gas costs.

## Related Tools

- [Wallet Tools](wallet.md) - Wallet connection required for all token operations
- [Contract Tools](contracts.md) - Direct contract interaction for custom tokens
- [Transaction Tools](transactions.md) - Transaction monitoring and gas estimation
- [Chain Tools](chains.md) - Multi-chain token support