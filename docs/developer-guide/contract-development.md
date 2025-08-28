# Contract Development

This guide covers developing and integrating smart contracts with AI agents using the WalletAgent through prompts.

## Overview

WalletAgent enables AI-driven smart contract interaction through:
- Wagmi-generated contract configurations for AI agents
- Multi-chain deployment and interaction through prompts
- Built-in contract validation and testing through prompts
- Conversational contract method calls without coding

## Setting Up Contract Development

### 1. Generate Contract ABIs

```
Set up Wagmi CLI for contract ABI generation in my project
```

```
Create a wagmi configuration file for my Counter contract deployed at address 0x5FbDB2315678afecb367f032d93F642f64180aa3 on Anvil
```

```
Generate TypeScript types from my smart contracts using Wagmi
```

**What the AI agent will do:**
- Guide you through installing Wagmi CLI for contract configuration
- Help create a wagmi configuration file with your contract deployments
- Set up the Foundry plugin with your contract addresses
- Generate contract configuration files that the AI can use for interactions

### 2. Load Contract Configuration

```
Load my Wagmi-generated contracts into the wallet agent
```

```
Show me all the contracts available in my current configuration
```

```
Import the contract ABIs from my generated.ts file
```

## Contract Interaction Patterns

### Reading from Contracts

```
Read the current number from my Counter contract
```

```
Get the balance of address 0x742d35Cc6634C0532925a3b8D7389C4e0C5F0532 from my ERC20Token contract
```

```
Call the totalSupply function on my token contract
```
```
Check the owner of token ID 123 in my NFT contract
```

**What the AI agent will do:**
- Call the specified read function on your contract
- Handle parameter formatting automatically
- Return the result in a readable format
- Handle data type conversions for human-readable output

### Writing to Contracts

```
Increment the counter in my Counter contract
```

```
Deposit 0.1 ETH into my PayableContract with amount parameter 1000
```

```
Transfer 100 tokens to address 0x742d35Cc6634C0532925a3b8D7389C4e0C5F0532
```

**What the AI agent will do:**
- Execute the contract write function with your parameters
- Handle ETH value transfers if needed
- Return the transaction hash
- Estimate gas costs before execution
- Wait for transaction confirmation if requested

### Contract Deployment

**Prompt Examples:**
- "Deploy my Counter contract using Forge with my private key"
- "Help me deploy my contract to Sepolia testnet"
- "Update my wagmi configuration with the newly deployed contract address"
- "Regenerate my contract types after deployment"

**What the AI agent will do:**
- Guide you through deployment using Forge or Hardhat
- Help configure deployment scripts
- Update your wagmi configuration with new addresses  
- Regenerate contract configuration files for AI agent usage

## Multi-Chain Contract Development

### Chain-Specific Deployments

**Prompt Examples:**
- "Configure my Counter contract for deployment on Mainnet, Sepolia, Polygon, and Anvil"
- "Add my contract address for Polygon network to the wagmi configuration"
- "Set up multi-chain deployment addresses for my DeFi protocol"
- "Update my wagmi config to support the same contract on 5 different chains"

**What the AI agent will do:**
- Configure your wagmi setup with multiple chain deployments
- Map contract addresses to specific chain IDs  
- Set up the proper network configurations
- Ensure all chains are properly configured for AI agent interactions

### Cross-Chain Considerations

**Prompt Examples:**
- "What blockchain network am I currently connected to?"
- "Switch my wallet to Polygon network before calling my contract"
- "Check if my Counter contract is deployed on the current chain"
- "Read my contract data but make sure I'm on Sepolia first"
- "Switch to Mainnet and then call my contract's totalSupply function"

**What the AI agent will do:**
- Check your current blockchain connection status
- Switch networks as requested before contract interactions
- Automatically use the correct contract address for the active chain
- Verify contract deployment exists on target chain
- Handle chain-specific gas token requirements

## Contract Validation

### Pre-Deployment Validation

**Prompt Examples:**
- "Simulate my Counter contract increment function before executing it"
- "Test if my contract transaction will succeed without actually sending it"
- "Dry run my token transfer to make sure it won't fail"
- "Check if my contract call will work and then execute it if successful"
- "Validate my NFT mint transaction before spending gas"

**What the AI agent will do:**
- Run transaction simulation to predict success/failure
- Check if your wallet has sufficient funds and permissions
- Verify contract state allows the requested operation
- Only execute the real transaction if simulation passes
- Provide detailed error messages if simulation fails

### Gas Estimation

**Prompt Examples:**
- "How much gas will my contract call cost?"
- "Estimate gas for my token transfer transaction"
- "What's the gas cost to mint an NFT from my contract?"
- "Compare gas costs between different contract functions"
- "Check gas estimation before I execute my expensive contract operation"

**What the AI agent will do:**
- Calculate gas requirements for your specific contract call
- Provide estimates in both gas units and ETH cost
- Compare against current network gas prices
- Warn about unusually high gas costs
- Factor in current network congestion

## Testing Contract Integration

### Unit Testing

**Prompt Examples:**
- "Set up unit tests for my contract integration with isolated test environments"
- "Create a test that verifies my Counter contract read functionality"
- "Test my contract interactions in a controlled environment without affecting real state"
- "Write a test suite that validates my contract's write operations"
- "Set up automated testing for my multi-contract system"

**What the AI agent will do:**
- Create isolated test environments for each test case
- Set up mock environments that don't interfere with each other
- Generate test cases that verify contract read and write operations
- Configure proper test isolation to prevent state leakage
- Create comprehensive test coverage for your contract interactions

### Integration Testing

**Prompt Examples:**
- "Start a local Anvil blockchain for testing my contracts end-to-end"
- "Run my contract integration tests against a real local blockchain"
- "Test my entire contract workflow from deployment to execution on Anvil"
- "Set up end-to-end testing that includes wallet connections and transactions"
- "Validate my contract behavior on a local testnet environment"

**What the AI agent will do:**
- Launch Anvil with proper configuration for your testing needs
- Deploy your contracts to the local blockchain
- Execute comprehensive integration tests that mirror real usage
- Handle wallet connections and transaction testing
- Provide detailed test reporting and failure analysis

## Best Practices

### Contract Organization

**Conversational Guidelines:**
- "Use clear, descriptive names for my contracts like 'TokenVestingV2' instead of generic names"
- "Include version numbers in contract names when planning upgrades"
- "Store all contract addresses in configuration files rather than hardcoding them"
- "Organize contracts by functionality and protocol version"

### Type Safety

**Prompt Examples:**
- "Make sure my contract calls are type-safe using the generated Wagmi types"
- "Verify that my function parameters match the expected contract interface"
- "Check that my contract read calls return the correct TypeScript types"
- "Ensure my contract interactions leverage the generated type definitions"

**What the AI agent will do:**
- Validate function signatures against generated ABIs
- Ensure parameter types match contract expectations
- Provide type-safe return values from contract calls
- Catch type mismatches before execution

### Error Handling

**Prompt Examples:**
- "Handle errors gracefully when my contract transaction fails"
- "Wait for transaction confirmation and show me the receipt"
- "Catch and explain any errors that occur during contract calls"
- "Retry my transaction if it fails due to network issues"
- "Show detailed error messages when contract interactions fail"

**What the AI agent will do:**
- Wrap contract calls in proper error handling
- Provide detailed, user-friendly error messages
- Wait for transaction confirmations when requested
- Handle network errors and suggest retries
- Show transaction receipts and status updates

### Security Considerations

**Conversational Guidelines:**
- "Always validate input parameters before sending them to my contracts"
- "Ensure my contracts have proper access controls before deployment"
- "Check for reentrancy vulnerabilities in my contract interactions"
- "Set appropriate gas limits for all my contract transactions"
- "Verify contract addresses before sending transactions"
- "Use secure patterns for handling user funds in contracts"

## Advanced Topics

### Custom Contract Addresses

**Prompt Examples:**
- "Call my Counter contract at a specific address 0x1234... instead of the configured one"
- "Override the default contract address for this particular transaction"
- "Use a custom deployment address for my contract on this chain"
- "Call the same contract function but at a different address"

**What the AI agent will do:**
- Accept custom addresses for specific contract calls
- Override default wagmi configuration addresses when needed
- Validate the custom address format and existence
- Use the custom address for that specific interaction only

### Event Monitoring

**Prompt Examples:**
- "Show me the events emitted by my last contract transaction"
- "Get the transaction receipt and parse the logs for events"
- "Check what events were fired when I called my contract function"
- "Monitor for specific events after my contract transaction"

**What the AI agent will do:**
- Retrieve transaction receipts with event logs
- Parse and decode event logs from your transactions
- Filter for specific event types you're interested in
- Provide readable event data and parameters
- Explain the events that were emitted

### Proxy Contracts

**Prompt Examples:**
- "Configure my upgradeable contract to use the proxy address, not implementation"
- "Set up my wagmi config to interact with proxy contracts"
- "Call my upgraded contract through its proxy address"
- "Handle proxy pattern contracts in my multi-chain deployment"

**What the AI agent will do:**
- Configure wagmi with proxy addresses instead of implementation addresses
- Handle proxy pattern interactions transparently
- Ensure calls go through the proxy for upgradeable contracts
- Manage proxy vs direct contract address configurations

## Troubleshooting

### Common Issues

**When you encounter problems, try these conversational approaches:**

1. **Contract Not Found**
   - "Check if my contract is included in the wagmi configuration"
   - "List all available contracts to see what's loaded"
   - "Verify my contract ABI was generated correctly"

2. **Wrong Chain**
   - "What blockchain network am I currently connected to?"
   - "Switch to the correct chain for my contract deployment"
   - "Check if my contract is deployed on this network"

3. **ABI Mismatch**
   - "Regenerate my contract ABIs after I updated the smart contract"
   - "Update my wagmi types after contract changes"
   - "Check if my contract interface matches the deployed version"

4. **Gas Estimation Failure**
   - "Why is my contract call failing gas estimation?"
   - "Check the current state of my contract before calling it"
   - "Validate my function parameters before execution"

### Debugging Tips

**Diagnostic Prompts:**
- "Show me all the contracts available in my current configuration"
- "What's my current wallet connection status and which chain am I on?"
- "Verify my wallet is properly connected before contract calls"
- "Check if my contract exists on the current blockchain network"
- "List my contract deployments across all configured chains"
- "Debug why my contract interaction is failing"

**What the AI agent will do:**
- Display all loaded contracts and their addresses
- Show current wallet and chain connection status  
- Verify contract deployments exist on target chains
- Provide detailed error analysis for failed transactions
- Suggest fixes for common configuration issues

## Next Steps

- [Contract Testing](contract-testing.md) - Comprehensive testing strategies
- [Wagmi Integration](wagmi-integration.md) - Deep dive into Wagmi configuration
- [API Reference](../api-reference/mcp-tools/contracts.md) - Complete contract tool reference