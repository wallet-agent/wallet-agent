# Chain Tools

MCP tools for blockchain network management and multi-chain operations with AI agents.

## Overview

Chain tools enable AI agents to manage blockchain networks and switch between supported chains through prompts. These tools support multi-chain development and operations with built-in networks.

## Tools

### switch_chain

Switch to a different blockchain network.

**Tool Name:** `mcp__wallet-agent__switch_chain`

**What you provide:**
- Chain ID number for the blockchain network you want to switch to

**What the AI returns:**
- Confirmation of successful chain switch
- New chain ID you're now connected to
- Human-readable chain name
- Native currency information (name, symbol, decimal places)
- Network connection status

**Example Prompts:**
- "Switch to Ethereum mainnet"
- "Change to Polygon network (chain ID 137)"
- "Switch to the Sepolia testnet"
- "Move to chain ID 31337 for local testing (Anvil)"

**AI Agent Response:**
The AI agent will switch to the specified blockchain network and confirm the change, showing the new network name and native currency information.

**Errors:**
- `InvalidParams`: Invalid or unsupported chain ID
- `InternalError`: Network switch failed

---


### get_wallet_info

Get comprehensive wallet and chain configuration information.

**Tool Name:** `mcp__wallet-agent__get_wallet_info`

**Parameters:** None

**What the AI returns:**
- Current wallet connection status
- Connected wallet address (if connected)
- Active chain ID and human-readable name
- Native currency details for the current chain
- Complete list of all supported chains (both built-in and any configured chains)
- Current wallet type (mock for testing or privateKey for real transactions)
- List of available wallet addresses you can connect to

**Example Prompts:**
- "Show me my current wallet and chain information"
- "What blockchain am I connected to right now?"
- "List all available chains I can switch to"
- "Display my wallet configuration and supported networks"

**AI Agent Response:**
The AI agent will provide a comprehensive overview of the current wallet connection, active blockchain network, native currency, and all available chains.

**Errors:**
- None - always returns current state

## Common Workflows

### Multi-Chain Development Setup
**Developer:** "Set up my development environment for Ethereum mainnet, Polygon, and Anvil for local testing"

**AI Agent Response:** The AI will:
1. Confirm available chains: "Ethereum mainnet, Polygon, and Anvil are all available"
2. Current status: "All networks ready for development"
3. Summary: "Development environment ready with built-in chain support"

### Chain Switching for Operations
**Developer:** "Switch to Polygon, check my USDC balance, then switch back to Ethereum"

**AI Agent Response:** The AI will:
1. Switch: "Switched to Polygon network"
2. Check balance: "Polygon USDC balance: 500.00"
3. Switch back: "Switched to Ethereum mainnet"
4. Final status: "Back on Ethereum mainnet"

### Network Information
**Developer:** "Show me all available networks for development"

**AI Agent Response:** The AI will display all built-in networks including Anvil (local development), Ethereum mainnet, Sepolia testnet, and Polygon, along with their chain IDs and native currencies.

### Network Troubleshooting
**Developer:** "I'm having issues connecting to Polygon. Help me troubleshoot"

**AI Agent Response:** The AI will:
1. Check current config: "Currently on Polygon (Chain ID: 137)"
2. Test connectivity: "Testing network connectivity..."
3. Suggest alternatives: "Try switching to Anvil for local development while Polygon resolves"

## Multi-Chain Operations

### Cross-Chain Balance Monitoring
**Developer:** "Check my ETH balance on Ethereum, Polygon POL, and Arbitrum ETH"

**AI Agent Response:** The AI will switch between networks and report:
- Ethereum: 2.5 ETH
- Polygon: 150.0 POL  
- Arbitrum: 1.8 ETH

### Chain-Specific Contract Deployment
**Developer:** "Deploy my contract to Sepolia testnet first, then mainnet"

**AI Agent Response:** The AI will:
1. Switch to Sepolia: "Switched to Sepolia testnet"
2. Deploy: "Contract deployed at 0xabc123..."
3. Test: "Contract functions working correctly"
4. Switch to mainnet: "Ready for mainnet deployment"

### Gas Cost Comparison
**Developer:** "Compare gas costs for the same transaction on Ethereum and Polygon"

**AI Agent Response:** The AI will estimate on both chains:
- Ethereum: ~45K gas (~$15.50 at current prices)
- Polygon: ~45K gas (~$0.02 at current prices)
- Recommendation: "Polygon is 99.9% cheaper for this operation"

### Development Chain Management
**Developer:** "Set up separate chains for development, staging, and production"

**AI Agent Response:** The AI will configure:
1. Development: Local Anvil (31337)
2. Staging: Sepolia testnet (11155111)  
3. Production: Ethereum mainnet (1)
4. Summary: "Three-tier environment ready"

## Advanced Chain Configuration

### Network Status Checking
**Developer:** "Check the status of all available networks"

**AI Agent Response:** The AI will test connectivity to all built-in networks and report their operational status.

### Environment-Specific Networks
**Developer:** "What networks should I use for development vs production?"

**AI Agent Response:** The AI will recommend:
- Development: Anvil (local) for fast testing
- Staging: Sepolia testnet for integration testing  
- Production: Ethereum mainnet or Polygon based on requirements

### Performance Comparison
**Developer:** "Compare transaction costs across available networks"

**AI Agent Response:** The AI will show gas costs and transaction speeds for operations across Ethereum, Polygon, and other available networks.

### Network Validation
**Developer:** "Verify I can connect to all supported networks"

**AI Agent Response:** The AI will:
1. Test Anvil: "Local development network ready"
2. Check Ethereum: "Ethereum mainnet accessible"
3. Verify testnets: "Sepolia testnet operational"
4. Test Polygon: "Polygon network responding normally"

## Security and Best Practices

### Network Security
**Developer:** "Ensure I'm using secure connections to all networks"

**AI Agent Response:** "All built-in networks are pre-configured with secure HTTPS endpoints. Anvil uses localhost for local development, which is safe for testing."

### Network Safety
**Developer:** "How do I avoid accidentally using mainnet during development?"

**AI Agent Response:** The AI will explain the safety features and recommend starting with Anvil for development, then Sepolia for testnet testing before any mainnet operations.

### Development Isolation
**Developer:** "Set up a safe development environment that won't affect real funds"

**AI Agent Response:** The AI will guide you to use Anvil (local) with mock wallets for completely safe development, isolated from any real networks.

## Error Handling and Recovery

### Network Connectivity Issues
**Developer:** "Polygon network seems to be down. What should I do?"

**AI Agent Response:** The AI will:
1. Test network connectivity
2. Check network status
3. Suggest alternatives like switching to Anvil for continued development
4. Provide updates on network recovery

### Chain Switch Issues
**Developer:** "I can't switch to Ethereum mainnet"

**AI Agent Response:** The AI will troubleshoot the connection, test network accessibility, and suggest alternative networks if there are connectivity issues.

### Development Continuity
**Developer:** "How can I continue development when external networks are unavailable?"

**AI Agent Response:** The AI will guide you to use Anvil for local development, which works offline and provides the same development experience.

## Performance Monitoring

### Network Performance Testing
**Developer:** "Test the performance of all available networks"

**AI Agent Response:** The AI will test response times for built-in networks and provide performance comparisons to help choose the best network for your use case.

### Gas Price Monitoring
**Developer:** "Compare gas prices across Ethereum and Polygon"

**AI Agent Response:** The AI will provide real-time gas price comparisons between supported networks and recommend the most cost-effective option for your transactions.

### Network Health Monitoring
**Developer:** "Check if all supported networks are healthy and responsive"

**AI Agent Response:** The AI will test connectivity and responsiveness for all built-in networks and report their operational status.

## Related Tools

- [Wallet Tools](wallet.md) - Wallet connection works across all chains
- [Contract Tools](contracts.md) - Multi-chain contract deployment and interaction
- [Transaction Tools](transactions.md) - Chain-specific transaction operations  
- [Token Tools](tokens.md) - Token operations on different chains