# Custom Chains

This guide covers adding and managing custom EVM-compatible blockchain networks with Wallet Agent through prompts for AI agents.

## Overview

Wallet Agent supports any EVM-compatible blockchain network through:
- **Dynamic Chain Addition**: Add custom chains at runtime
- **RPC Configuration**: Custom RPC endpoints and settings
- **Native Currency Support**: Define custom native tokens
- **Block Explorer Integration**: Optional block explorer URLs
- **Multi-Chain Contracts**: Deploy contracts across custom chains

## Adding Custom Chains

### Basic Chain Addition

**Example prompt to AI agent:**
> "Add a custom EVM chain with chain ID 1234, name 'My Custom Chain', RPC URL 'https://rpc.mycustomchain.com', native currency called 'Custom Token' with symbol 'CUSTOM' and 18 decimals, and block explorer at 'https://explorer.mycustomchain.com'."

### Popular Chain Examples

#### Arbitrum Nova
**Example prompt:**
> "Please add Arbitrum Nova to my wallet. It has chain ID 42170, uses the RPC endpoint 'https://nova.arbitrum.io/rpc', has ETH as its native currency, and the block explorer is at 'https://nova.arbiscan.io'."

#### Avalanche C-Chain
**Example prompt:**
> "Add Avalanche C-Chain with chain ID 43114, RPC URL 'https://api.avax.network/ext/bc/C/rpc', native token AVAX (18 decimals), and block explorer 'https://snowtrace.io'."

#### Fantom
**Example prompt:**
> "Set up Fantom Opera network for me. Chain ID is 250, RPC is 'https://rpc.ftm.tools', native currency is FTM with 18 decimals, and explorer is 'https://ftmscan.com'."

#### BNB Smart Chain
**Example prompt:**
> "Add BNB Smart Chain with chain ID 56, RPC 'https://bsc-dataseed1.binance.org', BNB as native currency, and 'https://bscscan.com' as the block explorer."

## Chain Management

### Listing All Chains

**Example prompts:**
> "Show me my current wallet info including which chain I'm connected to and what chains are available."

> "What chain am I currently on and what other chains can I use?"

### Switching Chains

**Example prompts:**
> "Switch to chain ID 1234."

> "Change my wallet to use the Arbitrum Nova network."

> "Can you switch to my custom chain and confirm the switch was successful?"

### Updating Chain Configuration

**Example prompts for RPC updates:**
> "Update chain ID 1234 to use the faster RPC endpoint 'https://faster-rpc.mycustomchain.com'."

**For block explorer updates:**
> "Change the block explorer for chain 1234 to 'https://new-explorer.mycustomchain.com'."

**For native currency updates:**
> "Update chain 1234's native currency to 'New Custom Token' with symbol 'NCT' and 18 decimals."

### Removing Custom Chains

**Example prompt:**
> "Remove the custom chain with ID 1234 from my wallet. I understand that built-in chains like Mainnet and Sepolia cannot be removed."

## Contract Deployment on Custom Chains

### Multi-Chain Contract Configuration

**Example conversation for configuring contracts across chains:**
> "I need to configure my contract deployments for multiple chains. My contract 'MyContract' is deployed at different addresses: Mainnet (0x123...), Polygon (0x456...), my custom chain 1234 (0x789...), Arbitrum Nova (0xabc...), and Avalanche (0xdef...). Please update my Wagmi configuration."

### Deploy and Test Workflow

**Example conversation for deployment workflow:**
> "I want to deploy and test my contract on a custom chain. Here's what I need to do:
> 1. First, add my custom chain with the settings I provided earlier
> 2. Deploy my contract 'MyContract' to the custom chain using the RPC 'https://rpc.mycustomchain.com'
> 3. Update my Wagmi configuration with the new contract address
> 4. Regenerate the contract types
> 5. Load the updated configuration into the wallet agent"

### Multi-Chain Contract Testing

**Example testing scenario prompts:**
> "Set up a test environment for my custom chain integration. I want to:
> 1. Add a test chain with ID 1234 called 'Test Chain' using localhost RPC
> 2. Load my contract configuration from the generated file
> 3. Test that I can switch to the custom chain and call the 'getValue' function on 'MyContract'
> 4. Verify the contract interaction works properly"

## RPC Configuration

### Multiple RPC Endpoints

**Example scenario for RPC reliability:**
> "Set up my custom chain with chain ID 1234 called 'My Chain' using the primary RPC 'https://primary-rpc.mychain.com' with TKN as the native currency. If the primary RPC fails later, I want to be able to switch to the backup RPC 'https://backup-rpc.mychain.com'."

**Follow-up prompt for switching to backup:**
> "The primary RPC for chain 1234 seems to be having issues. Please update it to use the backup RPC endpoint 'https://backup-rpc.mychain.com'."

### RPC Performance Optimization

**Example conversation for environment-based RPC selection:**
> "I want to set up my custom chain with different RPC endpoints for development and production. For development, use the faster but less reliable endpoint 'https://dev-rpc.mychain.com'. For production, use the more reliable endpoint 'https://prod-rpc.mychain.com'. The chain ID is 1234, name is 'My Chain', and native currency is TKN with 18 decimals."

## Network-Specific Features

### Gas Configuration

**Example prompts for checking gas on custom chains:**
> "I'm on my custom chain now. Can you show me my balance and estimate the gas cost for sending 1.0 CUSTOM tokens to address 0x742d35Cc6634C0532925a3b8D7389C4e0C5F0532?"

> "What's my current balance on this custom chain and how much gas would it cost to send a transaction?"

### Native Currency Operations

**Example conversation for native currency transactions:**
> "Send 0.5 CUSTOM tokens to address 0x742d35Cc6634C0532925a3b8D7389C4e0C5F0532 on my custom chain."

**Follow-up to check transaction:**
> "Check the status of that transaction and show me how much gas was used."

**Alternative comprehensive request:**
> "I want to send 0.5 of the native currency to 0x742d35Cc6634C0532925a3b8D7389C4e0C5F0532, then monitor the transaction and report the final status and gas usage."

## Testing Custom Chains

### Local Development Chain

**Example prompt for local development setup:**
> "Set up a local development chain for testing. Use chain ID 1337, name it 'Local Dev Chain', connect to localhost:8545, and use ETH as the native currency with 18 decimals."

> "I'm running a local blockchain node on port 8545. Can you add it as a custom chain so I can test my contracts locally?"

### Testnet Integration

**Example prompt for testnet setup:**
> "Add the testnet for my custom blockchain. It has chain ID 12345, name 'My Chain Testnet', RPC at 'https://testnet-rpc.mychain.com', uses test tokens called 'tTKN' with 18 decimals, and has a block explorer at 'https://testnet-explorer.mychain.com'."

## Chain Compatibility

### EVM Compatibility Check

**Example prompt for testing chain compatibility:**
> "Test if my custom chain with ID 1234 is EVM compatible. Switch to it, check my balance, and if I have any contracts deployed, try calling a basic function like 'name' to verify contract calls work properly."

**Alternative diagnostic request:**
> "Help me verify my custom chain is working correctly. I want to test basic operations like balance checking and if possible, contract interactions."

### Feature Support Testing

**Example comprehensive testing prompt:**
> "I want to thoroughly test my custom chain's EVM compatibility. Please:
> 1. Add a test chain with ID 1234, name 'Test Chain', RPC 'https://rpc.testchain.com', and TEST as native currency
> 2. Switch to this chain
> 3. Check that balance queries work properly
> 4. Test gas estimation for a 0.1 TEST transaction to address 0x742d35Cc6634C0532925a3b8D7389C4e0C5F0532
> 5. Try sending a small 0.01 TEST transaction to verify transaction functionality
> 6. Confirm all operations return the expected data types and formats"

## Security Considerations

### RPC Endpoint Security

**Example security-conscious setup request:**
> "I want to add my custom chain with proper security. For production, make sure to only use HTTPS RPC endpoints. The chain ID is 1234, name is 'My Chain', and I want to use 'https://rpc.mychain.com' as the RPC URL. The native currency is TKN with 18 decimals. Please verify the RPC URL is secure before adding."

**Development vs production security conversation:**
> "Help me set up my custom chain securely. In development I can use HTTP, but in production I need HTTPS endpoints only. Validate the security of my RPC URL before proceeding."

### Chain ID Validation

**Example validation request:**
> "Before I add my custom chain with ID 1234, please check that this ID doesn't conflict with existing chains like Mainnet (1), Polygon (137), Arbitrum (42161), or Optimism (10). Also verify the chain ID is within the valid range of 1 to 2^32 - 1."

**Comprehensive validation prompt:**
> "I want to add a new custom chain but need to ensure everything is valid first. Please:
> 1. Validate that chain ID 1234 doesn't conflict with known chains
> 2. Confirm the chain ID is in the valid range
> 3. Check that my RPC URL uses HTTPS for security
> 4. Then proceed with adding the chain if all validations pass"

## Advanced Configuration

### Environment-Based Chain Management

**Example conversation for multi-environment setup:**
> "I need to set up different blockchain configurations for different environments:
> 
> **Development environment:**
> - Local Dev chain (ID 1337) on localhost:8545 with ETH
> 
> **Staging environment:** 
> - Staging Chain (ID 1234) using 'https://staging-rpc.mychain.com' with tTKN tokens
> 
> **Production environment:**
> - My Chain (ID 1234) using 'https://rpc.mychain.com' with TKN tokens and block explorer 'https://explorer.mychain.com'
> 
> Please help me set up the appropriate configuration for my current environment."

### Chain Health Monitoring

**Example health check request:**
> "Check the health of chain ID 1234. Switch to it and test basic operations like getting my balance and estimating gas for a small transaction to 0x742d35Cc6634C0532925a3b8D7389C4e0C5F0532. Let me know if the chain is functioning properly or experiencing issues."

**Automated monitoring conversation:**
> "I want to monitor the health of my custom chains. Can you periodically check chain 1234 by testing balance queries and gas estimation? If any issues are detected, please alert me so I can switch to a backup RPC if needed."

## Troubleshooting

### Common Issues

#### RPC Connection Failures
**Example diagnostic conversation:**
> "I'm having trouble with my custom chain. Can you test the connectivity by switching to chain ID 1234 and checking my balance? If you get any fetch errors or the RPC seems unreachable, please update the chain to use the backup RPC 'https://backup-rpc.mychain.com'."

**Alternative troubleshooting request:**
> "My custom chain isn't responding properly. Help me diagnose if it's an RPC connectivity issue and switch to a backup endpoint if needed."

#### Invalid Chain Configuration
**Example validation conversation:**
> "I'm trying to add a custom chain but getting errors. Can you help validate my configuration? Check that I have all required fields (chainId, name, rpcUrl, nativeCurrency), verify the RPC URL starts with http or https, and warn me if the native currency doesn't use the standard 18 decimals."

**Configuration debugging request:**
> "My chain configuration seems invalid. Please validate all the required fields and check for any common configuration mistakes before I try adding the chain again."

### Debugging Tips

**Example troubleshooting conversation:**
> "I'm having issues with my custom chain. Can you help me debug by checking:
> 1. Whether the chain ID is unique and valid
> 2. If the RPC endpoint is reachable
> 3. That all required configuration fields are present
> 4. The overall connectivity and health of the chain
> 5. Any error messages in the logs that might indicate the problem"

## Best Practices

When working with AI agents to manage custom chains, follow these conversational guidelines:

1. **Use HTTPS**: Always request secure RPC endpoints in production by saying "make sure to use HTTPS RPC endpoints for security"
2. **Backup RPCs**: Ask for fallback configurations like "set up a backup RPC in case the primary fails"
3. **Environment Separation**: Specify your environment context: "this is for development/staging/production"
4. **Health Monitoring**: Request regular checks: "monitor the health of my custom chains"
5. **Documentation**: Ask the AI to explain configurations: "document what you're setting up so I understand"
6. **Validation**: Always request validation: "validate this configuration before proceeding"
7. **Security**: Be explicit about security needs: "ensure this is secure for production use"

## Next Steps

- [Testing Guide](testing.md) - Testing strategies for multi-chain applications
- [Contract Development](contract-development.md) - Deploy contracts on custom chains
- [API Reference](../api-reference/mcp-tools/chains.md) - Chain management tool reference