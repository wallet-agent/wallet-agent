# API Reference

Complete reference documentation for Wallet Agent's tools and capabilities for AI assistant interactions.

## Overview

Wallet Agent provides blockchain functionality through natural language prompts with AI assistants:

- **[MCP Tools](mcp-tools/README.md)**: Model Context Protocol tools for conversational blockchain operations

This documentation focuses on how developers can interact with AI assistants (like Claude Code and Cursor) to perform blockchain operations using natural language prompts.

## Quick Reference

### MCP Tools

| Tool Category | Description | Key Operations |
|---------------|-------------|----------------|
| [Wallet Tools](mcp-tools/wallet.md) | Wallet connection and account management | `connect_wallet`, `get_accounts`, `get_balance` |
| [Transaction Tools](mcp-tools/transactions.md) | Transaction operations and monitoring | `send_transaction`, `get_transaction_status`, `estimate_gas` |
| [Contract Tools](mcp-tools/contracts.md) | Smart contract interaction | `read_contract`, `write_contract`, `load_wagmi_config` |
| [Token Tools](mcp-tools/tokens.md) | ERC-20 and ERC-721 operations | `transfer_token`, `get_token_balance`, `transfer_nft` |
| [Chain Tools](mcp-tools/chains.md) | Blockchain network management | `switch_chain`, `add_custom_chain`, `get_wallet_info` |
| [Testing Tools](mcp-tools/testing.md) | Development and testing utilities | `simulate_transaction`, `get_transaction_receipt` |


## Interaction Format

AI assistants interact with Wallet Agent through natural language prompts. The underlying MCP protocol handles tool calls automatically based on your conversational requests.

### Prompt Structure

When working with AI assistants, use natural language to describe blockchain operations:

**Example Prompts:**
- "Connect to wallet address 0x742d35Cc6634C0532925a3b8D7389C4e0C5F0532"
- "Check my ETH balance"
- "Send 0.1 ETH to 0x742d35Cc6634C0532925a3b8D7389C4e0C5F0532"
- "Read the number function from the Counter contract"

## Error Handling

### MCP Error Codes

| Code | Description | When Used |
|------|-------------|-----------|
| `InvalidParams` | Invalid or missing parameters | Parameter validation fails |
| `InvalidRequest` | Missing prerequisites | Wallet not connected, contract not loaded |
| `InternalError` | Unexpected execution error | Network issues, contract reverts |
| `MethodNotFound` | Unknown tool name | Tool name misspelled or not available |

### Error Response Format

When operations fail, AI assistants will receive clear error messages that explain what went wrong and how to fix it. The assistant will communicate these errors in natural language, helping you understand and resolve issues quickly.

## Setup and Security

### Wallet Types

Wallet Agent supports two wallet modes that you can request through conversational prompts:

- **Mock Wallets**: For testing and development
- **Private Key Wallets**: For real blockchain interactions

**Setup Prompts:**
- "Switch to mock wallet mode for testing"
- "Use private key wallets for real transactions"
- "Set up wallet agent to use private keys"

### Security Considerations

1. **Private Key Storage**: Private keys are stored in memory only
2. **Network Security**: Use HTTPS RPC endpoints in production
3. **Parameter Validation**: All inputs are validated before processing
4. **Error Messages**: Sensitive data is never included in error messages

## Rate Limits and Performance

### Built-in Optimizations

- **Client Caching**: RPC clients are cached per chain
- **Contract Resolution**: Contract addresses and ABIs are cached
- **Concurrent Operations**: Multiple operations can run in parallel

### Best Practices

When working with AI assistants for blockchain operations:

1. **Batch Operations**: "Perform multiple token transfers in parallel" or "Check balances for several addresses at once"
2. **Chain Management**: "Stay on Ethereum mainnet for these operations" to minimize chain switching overhead
3. **Error Handling**: AI assistants will automatically retry failed operations when appropriate
4. **Testing**: Use phrases like "use mock wallet for testing" to ensure safe development

## Version Compatibility

### MCP Protocol Version

Wallet Agent implements MCP Protocol version 2024-11-05.

### Supported Chains

| Chain | Chain ID | Native Currency | Status |
|-------|----------|-----------------|--------|
| Ethereum Mainnet | 1 | ETH | ✅ Built-in |
| Sepolia Testnet | 11155111 | ETH | ✅ Built-in |
| Polygon | 137 | MATIC | ✅ Built-in |
| Anvil Local | 31337 | ETH | ✅ Built-in |
| Custom Chains | Any | Configurable | ✅ Via `add_custom_chain` |

### Wagmi Integration

Compatible with Wagmi v2.x and Viem v2.x.

## Natural Language Examples

### Basic Wallet Operations

**Connection and Balance:**
- "Connect to wallet address 0x742d35Cc6634C0532925a3b8D7389C4e0C5F0532"
- "What's my current ETH balance?"
- "Show me the balance of address 0x123..."

**Sending Transactions:**
- "Send 0.1 ETH to 0x742d35Cc6634C0532925a3b8D7389C4e0C5F0532"
- "Transfer 0.5 ETH to that address"
- "Estimate gas for sending 1 ETH to vitalik.eth"

### Contract Interaction

**Setup and Configuration:**
- "Load the contract ABIs from ./src/generated.ts"
- "What contracts are available in the current configuration?"

**Reading Contract Data:**
- "Read the number function from the Counter contract"
- "What's the current value of the totalSupply function in the USDC contract?"
- "Check the owner of NFT token ID 123 in the MyNFT contract"

**Writing to Contracts:**
- "Call the increment function on the Counter contract"
- "Approve 100 USDC spending for the Uniswap router"
- "Transfer 50 tokens to 0x123... using the MyToken contract"

### Multi-Chain Operations

**Chain Management:**
- "Switch to Polygon network"
- "Change to Ethereum mainnet"
- "What chain am I currently connected to?"

**Custom Chain Setup:**
- "Add a custom chain with ID 1234 called 'My Chain' using RPC https://rpc.mychain.com"
- "Set up a custom blockchain with native currency 'MT' (My Token) with 18 decimals"
- "Remove the custom chain with ID 1234"

### Token Operations

**ERC-20 Tokens:**
- "Transfer 100 USDC to 0x742d35Cc6634C0532925a3b8D7389C4e0C5F0532"
- "Check my USDC balance"
- "Approve unlimited USDC spending for 0x123..."

**NFT Operations:**
- "Transfer NFT token ID 456 from MyNFT contract to 0x789..."
- "Who owns token ID 123 in the CryptoKitties contract?"
- "Get information about the MyNFT contract"

### Development and Testing

**Simulation and Testing:**
- "Simulate calling the mint function before executing it"
- "Use mock wallets for testing these operations"
- "Check the transaction receipt for hash 0xabc123..."

**Advanced Operations:**
- "Resolve ENS name vitalik.eth to an address"
- "Get the transaction status for hash 0xdef456..."
- "Show me all my open positions on Hyperliquid"

## Resources

### External Documentation

- [MCP Protocol Specification](https://modelcontextprotocol.io/specification)
- [Wagmi Documentation](https://wagmi.sh)
- [Viem Documentation](https://viem.sh)

### Community

- [GitHub Repository](https://github.com/wallet-agent/wallet-agent)
- [Issues and Bug Reports](https://github.com/wallet-agent/wallet-agent/issues)
- [Discussions](https://github.com/wallet-agent/wallet-agent/discussions)

## Navigation

- **[MCP Tools Reference →](mcp-tools/README.md)**

---

For specific tool documentation, navigate to the MCP Tools section above. Each tool includes detailed parameter descriptions, examples, and error handling information.