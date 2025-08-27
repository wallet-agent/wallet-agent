# MCP Tools

Model Context Protocol (MCP) tools for AI agent integration with WalletAgent.

## Overview

WalletAgent provides a comprehensive set of MCP tools that enable AI agents to interact with Ethereum-compatible blockchains. These tools are designed for safe, reliable blockchain operations with built-in validation and error handling.

## Tool Categories

### [Wallet Tools](wallet.md)
Core wallet management and connection tools.

- `get_accounts` - List available mock accounts
- `connect_wallet` - Connect to a wallet using address
- `disconnect_wallet` - Disconnect current wallet
- `get_current_account` - Get connected account info
- `get_balance` - Get native token balance
- `get_wallet_info` - Get current wallet configuration
- `import_private_key` - Import a private key wallet
- `set_wallet_type` - Switch between mock and private key wallets

### [Transaction Tools](transactions.md)
Transaction creation, monitoring, and utilities.

- `send_transaction` - Send native token transactions
- `estimate_gas` - Estimate gas for transactions
- `get_transaction_status` - Check transaction status
- `get_transaction_receipt` - Get detailed transaction receipt
- `simulate_transaction` - Simulate contract transactions
- `sign_message` - Sign arbitrary messages
- `sign_typed_data` - Sign EIP-712 typed data

### [Contract Tools](contracts.md)
Smart contract interaction and management.

- `load_wagmi_config` - Load Wagmi-generated contract configuration
- `list_contracts` - List available contracts
- `read_contract` - Read from smart contracts
- `write_contract` - Write to smart contracts

### [Token Tools](tokens.md)
ERC-20 and ERC-721 token operations.

**ERC-20 Operations:**
- `transfer_token` - Transfer ERC-20 tokens
- `approve_token` - Approve token spending
- `get_token_balance` - Get token balance
- `get_token_info` - Get token metadata

**ERC-721 Operations:**
- `transfer_nft` - Transfer NFTs
- `get_nft_owner` - Get NFT owner
- `get_nft_info` - Get NFT metadata

### [Chain Tools](chains.md)
Blockchain network management and switching.

- `switch_chain` - Switch between supported blockchains
- `get_wallet_info` - Get current chain and wallet information

### [Encrypted Key Tools](encrypted-keys.md)
Enterprise-grade encrypted private key management.

- `create_encrypted_keystore` - Create encrypted key store with master password
- `unlock_keystore` - Unlock encrypted key store for operations
- `lock_keystore` - Lock encrypted key store for security
- `get_keystore_status` - Get keystore status and session information
- `import_encrypted_private_key` - Import private key into encrypted store
- `list_encrypted_keys` - List all keys in encrypted store
- `remove_encrypted_key` - Remove key from encrypted store
- `update_key_label` - Update label/name for encrypted key
- `change_keystore_password` - Change master password for keystore

### [Testing Tools](testing.md)
Development and testing utilities.

- `simulate_transaction` - Test transactions before execution
- `estimate_gas` - Gas estimation for planning
- `get_transaction_receipt` - Detailed transaction analysis

## Tool Naming Convention

All MCP tools follow the pattern:
```
mcp__wallet-agent__<tool_name>
```

Examples:
- `mcp__wallet-agent__connect_wallet`
- `mcp__wallet-agent__send_transaction`
- `mcp__wallet-agent__read_contract`

## Common Parameters

### Address Format
All Ethereum addresses must be valid 40-character hex strings:
- Example: `0x742d35Cc6634C0532925a3b8D7389C4e0C5F0532`

### Amount Format
Token amounts are specified as strings in the token's base unit:
- `1.5` for 1.5 ETH
- `1000` for 1000 tokens
- `0.001` for 0.001 ETH

### Chain ID Format
Chain IDs are specified as integers:
- `1` for Ethereum Mainnet
- `137` for Polygon
- `31337` for Anvil Local

## Response Format

All tools return responses in a consistent format:

### Success Response
Tools return structured data including:
- `address` - Wallet or contract addresses
- `balance` - Token balances as strings
- `txHash` - Transaction hashes for submitted transactions
- Additional tool-specific fields

### Error Response
Error responses include:
- `error.code` - Standard MCP error code
- `error.message` - Human-readable error description
- `error.data` - Optional additional error details

## Error Codes

| Code | Name | Description |
|------|------|-------------|
| -32602 | InvalidParams | Invalid or missing parameters |
| -32600 | InvalidRequest | Missing prerequisites (wallet not connected) |
| -32603 | InternalError | Execution error (network, contract revert) |
| -32601 | MethodNotFound | Unknown tool name |

## Authentication Setup

### Mock Wallet Setup
For development and testing, you can use mock wallets:

1. **"Show me the available test accounts"**
   - The AI will list mock accounts with their addresses and balances

2. **"Connect to the first test account"**
   - The AI will connect to a mock wallet for testing

3. **"Check my wallet balance"**
   - The AI will show your current balance after connection

### Private Key Wallet Setup
For real blockchain operations:

1. **"Import my private key from environment variable WALLET_PRIVATE_KEY"**
   - The AI will securely import your private key from an environment variable

2. **"Switch to using real wallets instead of mock wallets"**
   - The AI will change the wallet mode to use imported private keys

3. **"Show me my current account information"**
   - The AI will display your connected account details

## Security Considerations

### Private Key Handling
- Private keys are stored in memory only
- Never logged or exposed in error messages
- Automatically cleared when disconnecting

### Parameter Validation
- All addresses are validated for proper format
- Amounts are checked for valid numeric format
- Chain IDs are verified against supported chains

### Network Security
- HTTPS RPC endpoints recommended for production
- Built-in retry logic for network failures
- Rate limiting protection

## Common Workflows

### Basic Transaction
**"Send 0.1 ETH to 0x742d35Cc6634C0532925a3b8D7389C4e0C5F0532"**
- The AI will connect your wallet, send the transaction, and provide the transaction hash

**"Check the status of transaction 0x123abc..."**
- The AI will monitor the transaction and show you the receipt when it's mined

### Contract Interaction
**"Load the smart contract configuration from ./src/generated.ts"**
- The AI will load your Wagmi-generated contract ABIs and addresses

**"Read the current number from the Counter contract"**
- The AI will call the read-only function and show you the current value

**"Call the increment function on the Counter contract"**
- The AI will send a transaction to write to the contract and provide the transaction hash

### Token Operations
**"Check my USDC balance"**
- The AI will show your current USDC token balance

**"Transfer 100 USDC to 0x742d35Cc6634C0532925a3b8D7389C4e0C5F0532"**
- The AI will send the token transfer transaction and provide confirmation

### Multi-Chain Operations
**"Switch to Polygon network"**
- The AI will change to Polygon for subsequent operations

**"Switch to Sepolia testnet"** 
- The AI will change to Sepolia testnet for testing

**"Check my balance on Polygon"**
- The AI will show your balance using POL (Polygon's native currency)

## Testing and Development

### Test Environment Setup
**"Switch to mock wallet mode for testing"**
- The AI will configure the system to use test accounts instead of real wallets

**"Connect to a test account with some balance"**
- The AI will connect to a mock account with test funds for development

### Transaction Simulation
**"Simulate calling the riskyFunction on MyContract before actually doing it"**
- The AI will test the transaction to see if it would succeed or fail

**"If the simulation looks good, go ahead and call the riskyFunction for real"**
- The AI will execute the actual transaction only if the simulation was successful

## Error Handling Best Practices

### Retry Logic
**"Try sending that transaction again if it fails due to network issues"**
- The AI will automatically retry failed transactions up to 3 times with exponential backoff
- Only network errors (code -32603) are retried, not validation errors

### Graceful Degradation
**"If you can't get my balance, just show 0 instead of failing"**
- The AI will provide fallback values when non-critical operations fail
- Warnings are shown but the workflow continues

## Performance Optimization

### Batch Operations
**"Check my ETH balance, USDC balance, and who owns NFT #1 from MyNFT contract all at once"**
- The AI will execute multiple independent operations in parallel for faster results
- Saves time by not waiting for each operation to complete sequentially

### Cache Management
The AI automatically optimizes performance by:
- Caching contract addresses and ABIs after first load
- Reusing RPC connections for the same blockchain
- Clearing caches when you switch configurations or chains

## Integration Examples

### Claude Code Integration
When using Claude Code, interact with the wallet through prompts:

**"What's my current balance?"**
- Claude Code directly calls the wallet tools and shows your balance

**"Send 0.1 ETH to 0x742d35Cc6634C0532925a3b8D7389C4e0C5F0532"**
- Claude Code handles the transaction and provides the transaction hash

### Custom AI Agent Integration
For custom AI implementations:
- Connect to the MCP server using standard MCP protocol
- Tools are called with the prefix `mcp__wallet-agent__`
- All operations follow the same conversational interface patterns

## Troubleshooting

### Common Issues

1. **Wallet Not Connected**
   - Error: "No wallet connected"
   - Solution: Ask the AI to "Connect to a wallet first"

2. **Invalid Chain**
   - Error: "Chain not supported"
   - Solution: Ask the AI to "Add support for chain ID X" or "Switch to a supported chain"

3. **Contract Not Found**
   - Error: "Contract not loaded"
   - Solution: Tell the AI to "Load the contract configuration from my generated file"

4. **Insufficient Balance**
   - Error: "Insufficient funds"
   - Solution: Ask the AI to "Check my balance first" before attempting transactions

### Common Troubleshooting Requests

**"Why did my transaction fail?"**
- The AI will check the transaction status and explain the failure reason

**"Show me detailed information about transaction 0x123abc..."**
- The AI will retrieve the full transaction receipt with gas usage and events

**"What's wrong with my wallet connection?"**
- The AI will check your wallet status and suggest fixes

## Next Steps

Explore specific tool categories:
- **[Wallet Tools →](wallet.md)**
- **[Transaction Tools →](transactions.md)**
- **[Contract Tools →](contracts.md)**
- **[Token Tools →](tokens.md)**
- **[Chain Tools →](chains.md)**
- **[Encrypted Key Tools →](encrypted-keys.md)**
- **[Testing Tools →](testing.md)**