# Chain Tools

MCP tools for blockchain network management and multi-chain operations with AI agents.

## Overview

Chain tools enable AI assistants to manage blockchain networks, switch between chains, and configure custom EVM-compatible networks through natural language prompts. These tools support multi-chain development and operations.

## Tools

### switch_chain

Switch to a different blockchain network.

**Tool Name:** `mcp__wallet-agent__switch_chain`

**Parameters:**
```typescript
{
  chainId: number;      // Chain ID to switch to
}
```

**Response:**
```typescript
{
  chainId: number;      // Current chain ID
  chainName: string;    // Human-readable chain name
  nativeCurrency: {
    name: string;       // Currency name
    symbol: string;     // Currency symbol
    decimals: number;   // Decimal places
  };
  switched: boolean;    // Whether switch was successful
}
```

**Example Prompts:**
- "Switch to Ethereum mainnet"
- "Change to Polygon network (chain ID 137)"
- "Switch to the Sepolia testnet"
- "Move to chain ID 31337 for local testing"
- "Switch to Arbitrum"

**AI Agent Response:**
The AI agent will switch to the specified blockchain network and confirm the change, showing the new network name and native currency information.

**Errors:**
- `InvalidParams`: Invalid or unsupported chain ID
- `InternalError`: Network switch failed

---

### add_custom_chain

Add a custom EVM-compatible blockchain network.

**Tool Name:** `mcp__wallet-agent__add_custom_chain`

**Parameters:**
```typescript
{
  chainId: number;      // Unique chain ID
  name: string;         // Network name
  rpcUrl: string;       // RPC endpoint URL
  nativeCurrency: {     // Native currency configuration
    name: string;       // Currency name
    symbol: string;     // Currency symbol
    decimals: number;   // Decimal places (usually 18)
  };
  blockExplorerUrl?: string; // Optional block explorer URL
}
```

**Response:**
```typescript
{
  chainId: number;
  name: string;
  added: boolean;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrl: string;
  blockExplorerUrl?: string;
}
```

**Example Prompts:**
- "Add Avalanche C-Chain with RPC https://api.avax.network/ext/bc/C/rpc"
- "Set up a custom chain called 'MyChain' with ID 1234 and RPC https://rpc.mychain.com"
- "Add Fantom Opera network with native token FTM"
- "Configure BNB Smart Chain with chain ID 56"
- "Add my local development chain running on localhost:8545"

**AI Agent Response:**
The AI agent will add the custom chain configuration and confirm it's available for use, showing all the configured parameters.

**Errors:**
- `InvalidParams`: Invalid chain configuration (missing required fields, invalid URLs)
- `InternalError`: Failed to add chain

---

### update_custom_chain

Update configuration for an existing custom chain.

**Tool Name:** `mcp__wallet-agent__update_custom_chain`

**Parameters:**
```typescript
{
  chainId: number;      // Chain ID to update
  name?: string;        // New network name (optional)
  rpcUrl?: string;      // New RPC endpoint URL (optional)
  nativeCurrency?: {    // New currency configuration (optional)
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorerUrl?: string; // New block explorer URL (optional)
}
```

**Response:**
```typescript
{
  chainId: number;
  updated: boolean;
  changes: string[];    // List of updated fields
}
```

**Example Prompts:**
- "Update chain ID 1234 to use RPC endpoint https://new-rpc.mychain.com"
- "Change the name of my custom chain to 'Production Chain'"
- "Update the block explorer URL for chain 1234"
- "Switch my development chain to use the new RPC server"

**AI Agent Response:**
The AI agent will update the specified chain configuration and report which fields were changed.

**Errors:**
- `InvalidParams`: Invalid chain ID or configuration parameters
- `InvalidRequest`: Chain ID not found in custom chains
- `InternalError`: Update failed

---

### remove_custom_chain

Remove a previously added custom chain.

**Tool Name:** `mcp__wallet-agent__remove_custom_chain`

**Parameters:**
```typescript
{
  chainId: number;      // Chain ID to remove
}
```

**Response:**
```typescript
{
  chainId: number;
  removed: boolean;
  chainName: string;    // Name of removed chain
}
```

**Example Prompts:**
- "Remove the custom chain with ID 1234"
- "Delete my test chain configuration"
- "Remove the old development chain"
- "Clean up unused custom chains"

**AI Agent Response:**
The AI agent will remove the custom chain and confirm the removal. Note that built-in chains (Mainnet, Polygon, etc.) cannot be removed.

**Errors:**
- `InvalidParams`: Invalid chain ID
- `InvalidRequest`: Chain not found or is a built-in chain
- `InternalError`: Removal failed

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
**Developer:** "Set up my development environment for Ethereum mainnet, Polygon, and my local test chain"

**AI Agent Response:** The AI will:
1. Confirm built-in chains: "Ethereum mainnet and Polygon are already available"
2. Add custom chain: "Adding your local test chain with ID 31337..."
3. Summary: "Development environment ready with 3 chains available"

### Chain Switching for Operations
**Developer:** "Switch to Polygon, check my USDC balance, then switch back to Ethereum"

**AI Agent Response:** The AI will:
1. Switch: "Switched to Polygon network"
2. Check balance: "Polygon USDC balance: 500.00"
3. Switch back: "Switched to Ethereum mainnet"
4. Final status: "Back on Ethereum mainnet"

### Custom Network Integration
**Developer:** "Add the Arbitrum Nova network with chain ID 42170"

**AI Agent Response:** The AI will configure Arbitrum Nova with the correct RPC endpoint, native currency (ETH), and block explorer, then confirm it's ready for use.

### Network Troubleshooting
**Developer:** "My custom chain isn't working. Help me fix the configuration"

**AI Agent Response:** The AI will:
1. Check current config: "Chain ID 1234 uses RPC https://old-rpc.example.com"
2. Test connectivity: "RPC endpoint appears unreachable"
3. Suggest fix: "Would you like to update to a different RPC endpoint?"

## Multi-Chain Operations

### Cross-Chain Balance Monitoring
**Developer:** "Check my ETH balance on Ethereum, Polygon MATIC, and Arbitrum ETH"

**AI Agent Response:** The AI will switch between networks and report:
- Ethereum: 2.5 ETH
- Polygon: 150.0 MATIC  
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

### High-Availability RPC Setup
**Developer:** "Configure my custom chain with a backup RPC endpoint"

**AI Agent Response:** The AI will set up the primary RPC and provide guidance on switching to backup endpoints if the primary fails.

### Environment-Specific Chains
**Developer:** "Use different RPC endpoints for development vs production"

**AI Agent Response:** The AI will help configure environment-specific settings and ensure the correct endpoints are used based on the current environment.

### Performance Optimization
**Developer:** "Find the fastest RPC endpoint for Polygon"

**AI Agent Response:** The AI will test multiple Polygon RPC endpoints and configure the fastest one for optimal performance.

### Custom Chain Validation
**Developer:** "Verify my custom chain configuration is correct"

**AI Agent Response:** The AI will:
1. Test RPC connectivity: "RPC endpoint responding correctly"
2. Validate chain ID: "Chain ID 1234 is unique and valid"
3. Check currency: "Native currency CUSTOM configured properly"
4. Test transactions: "Test transaction simulation successful"

## Security and Best Practices

### Secure RPC Configuration
**Developer:** "Add my production chain but ensure I'm using HTTPS endpoints"

**AI Agent Response:** "I'll configure your production chain with HTTPS RPC for security. HTTP endpoints are not recommended for production use."

### Chain ID Validation
**Developer:** "Make sure my custom chain ID doesn't conflict with existing networks"

**AI Agent Response:** The AI will verify the chain ID is unique and doesn't conflict with known blockchain networks.

### Network Isolation
**Developer:** "Set up isolated test networks that won't affect my mainnet operations"

**AI Agent Response:** The AI will configure separate test networks with clear naming and safeguards to prevent accidental mainnet transactions.

## Error Handling and Recovery

### Network Connectivity Issues
**Developer:** "My custom chain stopped working. What's wrong?"

**AI Agent Response:** The AI will diagnose:
1. Test RPC connectivity
2. Check chain configuration
3. Verify network status
4. Suggest solutions or alternative endpoints

### Chain Switch Failures
**Developer:** "I can't switch to my custom chain"

**AI Agent Response:** The AI will troubleshoot the chain configuration, test the RPC endpoint, and help resolve connection issues.

### Configuration Recovery
**Developer:** "I accidentally removed my custom chain. How do I restore it?"

**AI Agent Response:** The AI will guide you through re-adding the chain with the previous configuration parameters.

## Performance Monitoring

### Network Performance Testing
**Developer:** "Test the performance of all my configured chains"

**AI Agent Response:** The AI will test each chain's RPC response time and suggest optimizations for better performance.

### Gas Price Monitoring
**Developer:** "Monitor gas prices across Ethereum, Polygon, and Arbitrum"

**AI Agent Response:** The AI will provide real-time gas price comparisons and recommend the most cost-effective network for transactions.

### Chain Health Monitoring
**Developer:** "Check if all my configured chains are healthy and responsive"

**AI Agent Response:** The AI will test each chain's connectivity, block production, and overall health status.

## Related Tools

- [Wallet Tools](wallet.md) - Wallet connection works across all chains
- [Contract Tools](contracts.md) - Multi-chain contract deployment and interaction
- [Transaction Tools](transactions.md) - Chain-specific transaction operations  
- [Token Tools](tokens.md) - Token operations on different chains