# Wallet Tools

MCP tools for wallet connection, account management, and basic operations.

## Overview

Wallet tools provide the foundation for all blockchain interactions. They handle wallet connection, account management, balance queries, and wallet configuration. These tools are designed for AI agents like Claude Code and Cursor, where developers interact using natural language prompts.

## Tools

### get_accounts

List all available mock accounts for testing.

**Tool Name:** `mcp__wallet-agent__get_accounts`

**Parameters:** None

**Response:**
```typescript
{
  accounts: Array<{
    address: string;
    balance: string;
  }>
}
```

**Example Prompts:**
- "Show me all available mock accounts for testing"
- "List the test wallet addresses I can use"
- "What mock accounts are available with their balances?"

**Errors:**
- None - this tool always succeeds

---

### connect_wallet

Connect to a wallet using the specified address.

**Tool Name:** `mcp__wallet-agent__connect_wallet`

**Parameters:**
```typescript
{
  address: string; // Ethereum address to connect to
}
```

**Response:**
```typescript
{
  address: string;
  isConnected: boolean;
  chainId?: number;
}
```

**Example Prompts:**
- "Connect to wallet address 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
- "Please connect to the first mock account"
- "Switch to wallet 0x742d35Cc6634C0532925a3b8D7389C4e0C5F0532"

**Errors:**
- `InvalidParams`: Invalid address format
- `InvalidRequest`: Address not available in current wallet type
- `InternalError`: Connection failed

---

### disconnect_wallet

Disconnect the currently connected wallet.

**Tool Name:** `mcp__wallet-agent__disconnect_wallet`

**Parameters:** None

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

**Example Prompts:**
- "Disconnect the current wallet"
- "Please disconnect from all wallets"
- "Log out of the current account"

**Errors:**
- None - always succeeds even if no wallet connected

---

### get_current_account

Get information about the currently connected account.

**Tool Name:** `mcp__wallet-agent__get_current_account`

**Parameters:** None

**Response:**
```typescript
{
  address: string;
  isConnected: boolean;
  chainId: number;
  walletType: "mock" | "privateKey";
}
```

**Example Prompts:**
- "What wallet am I currently connected to?"
- "Show me my current account information"
- "Which address am I using and on what network?"

**Errors:**
- `InvalidRequest`: No wallet connected

---

### get_balance

Get the native token balance for an address.

**Tool Name:** `mcp__wallet-agent__get_balance`

**Parameters:**
```typescript
{
  address?: string; // Optional - defaults to connected wallet
}
```

**Response:**
```typescript
{
  balance: string; // Balance in native token units (e.g., ETH)
  address: string;
  symbol: string;  // Native token symbol (ETH, MATIC, etc.)
}
```

**Example Prompts:**
- "What's my current wallet balance?"
- "Check the ETH balance for address 0x742d35Cc6634C0532925a3b8D7389C4e0C5F0532"
- "Show me the native token balance for my connected wallet"
- "How much MATIC do I have on Polygon?"

**Errors:**
- `InvalidParams`: Invalid address format
- `InvalidRequest`: No wallet connected (when address not specified)
- `InternalError`: RPC call failed

---

### get_wallet_info

Get comprehensive wallet and chain configuration information.

**Tool Name:** `mcp__wallet-agent__get_wallet_info`

**Parameters:** None

**Response:**
```typescript
{
  isConnected: boolean;
  address?: string;
  currentChain: number;
  currentChainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  supportedChains: Array<{
    id: number;
    name: string;
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
    rpcUrl?: string;
    blockExplorerUrl?: string;
  }>;
  walletType: "mock" | "privateKey";
  availableWallets: string[];
}
```

**Example Prompts:**
- "Show me complete wallet configuration and chain information"
- "What chains are supported and which one am I on?"
- "Give me a full overview of my wallet setup"
- "What wallets are available and which type am I using?"

**Errors:**
- None - always returns current state

---

### import_private_key

Import a private key for use with real blockchain transactions.

**Tool Name:** `mcp__wallet-agent__import_private_key`

**Parameters:**
```typescript
{
  privateKey: string; // Private key (0x...), env var name, or file path
}
```

**Response:**
```typescript
{
  address: string;
  imported: boolean;
  walletType: string;
}
```

**Example Prompts:**
- "Import my private key from the WALLET_PRIVATE_KEY environment variable"
- "Load my wallet private key from the file ~/.wallet-key"
- "Import a private key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
- "Set up my production wallet using the private key from environment"

**Errors:**
- `InvalidParams`: Invalid private key format
- `InternalError`: Failed to derive address or file read error

**Security Notes:**
- Private keys are stored in memory only
- Never logged or exposed in error messages
- Cleared when wallet is disconnected

---

### list_imported_wallets

List all imported private key wallets.

**Tool Name:** `mcp__wallet-agent__list_imported_wallets`

**Parameters:** None

**Response:**
```typescript
{
  wallets: Array<{
    address: string;
    imported: string; // ISO timestamp
  }>
}
```

**Example Prompts:**
- "Show me all the private key wallets I've imported"
- "List my imported wallets with timestamps"
- "What real wallets do I have available?"

**Errors:**
- None - returns empty array if no wallets imported

---

### remove_private_key

Remove an imported private key wallet.

**Tool Name:** `mcp__wallet-agent__remove_private_key`

**Parameters:**
```typescript
{
  address: string; // Address of wallet to remove
}
```

**Response:**
```typescript
{
  removed: boolean;
  address: string;
}
```

**Example Prompts:**
- "Remove the imported wallet 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
- "Delete the private key for address 0x742d35Cc6634C0532925a3b8D7389C4e0C5F0532"
- "Clean up and remove that imported wallet"

**Errors:**
- `InvalidParams`: Invalid address format
- `InvalidRequest`: Address not found in imported wallets

---

### set_wallet_type

Switch between mock and private key wallet types.

**Tool Name:** `mcp__wallet-agent__set_wallet_type`

**Parameters:**
```typescript
{
  type: "mock" | "privateKey";
}
```

**Response:**
```typescript
{
  walletType: string;
  switched: boolean;
  availableWallets: string[];
}
```

**Example Prompts:**
- "Switch to using private key wallets instead of mock wallets"
- "Change wallet type to privateKey mode"
- "Use my real imported wallets instead of test accounts"
- "Switch back to mock wallet mode for testing"

**Errors:**
- `InvalidParams`: Invalid wallet type
- `InvalidRequest`: No private keys imported (when switching to privateKey)

## Common Workflows

### Initial Setup (Mock Wallet)
**Developer Conversation:**
```
Developer: "I need to set up a test environment for blockchain development"
AI: "I'll help you get started with a mock wallet. Let me first show you the available test accounts."
AI: [calls get_accounts tool]
AI: "I found several test accounts. Let me connect you to the first one with 10,000 ETH."
AI: [calls connect_wallet with first address]
AI: "Perfect! You're now connected to address 0xf39... on the Anvil test network. You have 10,000 ETH available for testing."
```

### Production Setup (Private Key)
**Developer Conversation:**
```
Developer: "I want to deploy to mainnet using my real wallet"
AI: "I'll help you set up your production wallet. First, let me import your private key from the environment variable."
AI: [calls import_private_key with "WALLET_PRIVATE_KEY"]
AI: "Great! Now let me switch to private key mode so we use your real wallet."
AI: [calls set_wallet_type with "privateKey"]
AI: "Perfect! You're now connected to your production wallet at address 0x742d... and ready for mainnet operations."
```

### Balance Monitoring
**Developer Conversation:**
```
Developer: "Can you check the balances for my main addresses?"
AI: "I'll check the balances for your addresses. Let me query them:"
AI: [calls get_balance for each address in parallel]
AI: "Here are your current balances:
- 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266: 10,000 ETH
- 0x70997970C51812dc3A010C7d01b50e0d17dc79C8: 5,432.1 ETH
All balances are current as of now."
```

## Error Handling

### Connection Errors
**Developer Conversation:**
```
Developer: "Connect to wallet address 0xinvalid"
AI: "I'm sorry, but '0xinvalid' is not a valid Ethereum address format. Ethereum addresses must be 42 characters long and start with '0x', followed by 40 hexadecimal characters. Could you provide a valid address?"

Developer: "Connect to 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
AI: "I'm unable to connect to that address because it's not available in your current wallet type. You're currently using private key mode, but that address is only available in mock mode. Would you like me to switch to mock mode or use a different address?"
```

### Balance Query Errors
**Developer Conversation:**
```
Developer: "Check the balance for 0xInvalidAddress"
AI: "I can't check the balance because '0xInvalidAddress' is not a valid Ethereum address format. Please provide a valid 42-character hexadecimal address starting with '0x'."

Developer: "What's the balance for 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266?"
AI: "I'm having trouble connecting to the network to fetch that balance. This could be due to RPC issues. Let me try again in a moment, or you might want to check if we're connected to the right network."
```

## Security Best Practices

### Private Key Management
**Secure Approaches:**
- ✅ "Import my private key from the WALLET_PRIVATE_KEY environment variable" - AI will securely load from environment
- ✅ "Load my wallet from the secure file at ~/.secrets/wallet-key" - AI will read from protected file system location
- ✅ "Set up my wallet using the key stored in PRODUCTION_WALLET_KEY" - Using environment variables keeps keys out of chat history

**Insecure Approaches to Avoid:**
- ❌ "Import this private key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" - Never share private keys directly in conversations
- ❌ Storing private keys in configuration files or code repositories
- ❌ Copying private keys in plain text messages or documentation

### Wallet Validation
**Developer Conversation:**
```
Developer: "Send 1 ETH to my friend"
AI: "Before I can send any transactions, let me verify you have a wallet connected."
AI: [calls get_current_account]
AI: "I see you don't have a wallet connected yet. Please connect to a wallet first, then I can help you send that transaction."
```

## Testing

### Mock Wallet Testing
**Test Scenario Prompts:**
- "Set up a test environment with mock wallets for development"
- "Connect to the first available test account and verify it has a balance"
- "Test wallet connection with multiple mock accounts"
- "Verify that mock wallets work correctly on the Anvil test network"

**Expected AI Responses:**
```
AI: "I've set up your test environment with mock wallets. You're now connected to address 0xf39... with 10,000 ETH on Anvil testnet, ready for development and testing."
```

### Private Key Testing
**Test Scenario Prompts:**
- "Import a test private key from TEST_PRIVATE_KEY environment variable"
- "Switch to private key mode and verify the wallet type changed"
- "Test that imported private keys work for signing transactions"
- "Validate that private key wallets show the correct addresses"

**Expected AI Responses:**
```
AI: "I've imported your test private key and switched to private key mode. Your wallet is now using address 0x742d... and ready for real blockchain interactions."
```

## Performance Considerations

### Batch Balance Queries
**Efficient Approach:**
- "Check the balances for all these addresses: 0xf39Fd..., 0x70997..., 0x3c44c..." - AI will query all balances in parallel for faster results

**Less Efficient Approach:**
- "What's the balance for 0xf39Fd...?" followed by "Now check 0x70997..." followed by "And also 0x3c44c..." - Each query happens sequentially, taking longer

**AI Optimization:**
When you ask for multiple balances, AI assistants will automatically batch the requests in parallel to minimize response time.

### Connection State Caching
**Optimization Tips:**
- AI assistants automatically cache wallet connection state to avoid repeated API calls
- When you ask "What's my current setup?" multiple times, the AI uses cached information for faster responses
- Cache is automatically invalidated when you change wallets or switch chains
- For real-time accuracy, you can explicitly ask "Refresh and show me my current wallet status"

## Related Tools

- [Transaction Tools](transactions.md) - Send transactions and monitor status
- [Chain Tools](chains.md) - Switch chains and manage network configuration
- [Token Tools](tokens.md) - ERC-20 and ERC-721 operations