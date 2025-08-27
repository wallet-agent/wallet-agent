# Wagmi Integration

This guide covers using Wagmi-generated contract configurations with AI agents through prompts.

## Overview

Wallet Agent leverages Wagmi's contract configuration system for AI-powered blockchain interactions:
- **Contract Configuration Loading**: AI agents can load and use Wagmi-generated contract data
- **Multi-Chain Support**: Chain-specific contract deployments accessible through prompts
- **Prompt Interface**: Contract interactions through conversational prompts
- **AI-Native Workflow**: Contract operations without writing code

## Wagmi Configuration

### Basic Configuration

**Prompt to AI Agent:**
"Create a wagmi.config.ts file in my project root with a Foundry plugin that includes my Counter contract deployed at 0x5FbDB... on Anvil (chain 31337) and 0x742d35... on Sepolia (chain 11155111). Also include an ERC20Token deployed on mainnet and Polygon. Output the generated types to src/generated.ts."

**What the AI will create:**
- A Wagmi configuration file with proper imports
- Foundry plugin configuration pointing to your contracts directory
- Multi-chain deployment addresses for your contracts
- Output path for generated TypeScript types

### Plugin Options

#### Foundry Plugin Setup

**Prompt to AI Agent:**
"Set up a Wagmi Foundry plugin configuration that includes only Counter.sol and Token.sol contracts, but excludes test and script directories. Point it to my ./contracts project directory."

#### Hardhat Plugin Setup

**Prompt to AI Agent:**
"Configure Wagmi for a Hardhat project with contracts in ./contracts and artifacts in ./artifacts. Include multi-chain deployment addresses for my contracts."

#### ABI Plugin Setup

**Prompt to AI Agent:**
"Set up Wagmi configuration using direct ABI files. I want to include the standard ERC20 ABI and name it 'ERC20' in my generated types."

## Code Generation

### Generating Types

**Prompt to AI Agent:**
"Install the Wagmi CLI as a dev dependency and generate TypeScript types from my contract configuration."

**Alternative prompts:**
- "Generate Wagmi types from my configuration and watch for changes during development"
- "Set up automatic type generation that rebuilds when my contracts change"

### Generated Output

**What you'll get:**
The generated file will include:
- Contract addresses organized by chain ID
- Complete contract ABIs with all functions, events, and errors
- Function definitions for AI agent contract interactions
- Configuration data for all contracts defined in your setup

**Expected structure:**
- Address mappings for multi-chain deployments
- ABI definitions with full function signatures
- Contract metadata for AI prompt processing
- Configuration data for AI agent usage

## Loading Contracts

### Loading Generated Contracts

**Prompt to AI Agent:**
"Load my Wagmi-generated contract configuration from ./src/generated.ts into the wallet agent and show me which contracts and chains were loaded."

**What happens:**
- Wallet Agent parses your generated configuration file
- Extracts contract ABIs and deployment addresses
- Loads all contract definitions for use with AI prompts
- Returns summary of loaded contracts and supported chains

### Verifying Loaded Contracts

**Prompt to AI Agent:**
"Show me all the contracts that are currently loaded in the wallet agent, including their names, addresses, and which chains they're deployed on."

**Expected output:**
- Complete list of available contracts
- Deployment addresses for each chain
- Chain IDs where each contract is available
- Contract names as defined in your Wagmi configuration

## Contract Interactions

### Type-Safe Reads

**Prompt to AI Agent:**
"Read the current number value from my Counter contract."

**Prompt with parameters:**
"Check the ERC20Token balance for address 0x742d35Cc6634C0532925a3b8D7389C4e0C5F0532."

**Additional examples:**
- "Get the total supply of my ERC20Token"
- "Check if address 0x123... has approval to spend tokens from 0x456..."
- "Read the name and symbol of my deployed token contract"

### Type-Safe Writes

**Prompt to AI Agent:**
"Increment the counter in my Counter contract."

**Prompt with parameters:**
"Transfer 1 token from my wallet to address 0x742d35Cc6634C0532925a3b8D7389C4e0C5F0532 using the ERC20Token contract."

**Additional examples:**
- "Approve address 0x123... to spend 1000 tokens on my behalf"
- "Call the mint function on my token contract to create 100 new tokens"
- "Execute a custom function on my contract with specific parameters"

## Multi-Chain Development

### Chain-Specific Deployments

**Prompt to AI Agent:**
"Configure my Wagmi setup with MyContract deployed on multiple chains: mainnet (0x123...), Sepolia testnet (0x456...), Polygon (0x789...), Arbitrum (0xabc...), Optimism (0xdef...), Base (0x321...), and my local Anvil (0x654...)."

**What this enables:**
- Same contract interface across all supported chains
- Automatic address resolution based on current chain
- Type-safe interactions regardless of which chain you're on
- Seamless switching between development and production environments

### Cross-Chain Contract Calls

**Prompt to AI Agent:**
"Switch to Polygon network and read the getValue function from MyContract, then switch to mainnet and call the same function to compare results."

**Alternative multi-chain prompts:**
- "Check my token balance on both Polygon and mainnet"
- "Deploy the same contract transaction on Sepolia first, then on mainnet"
- "Compare contract states across Arbitrum and Optimism"
- "Test my contract interaction on Anvil before running it on mainnet"

## Advanced Configuration

### Custom Contract Names

**Prompt to AI Agent:**
"Set up a Wagmi configuration that uses the ERC20 ABI but names it 'MyToken' instead. Deploy it to mainnet at 0x123... and Polygon at 0x456..."

**Benefits:**
- Custom naming for better code readability
- Multiple contracts using the same ABI with different names
- Clear distinction between similar contracts

### Environment-Based Configuration

**Prompt to AI Agent:**
"Create a Wagmi configuration that uses mainnet addresses in production but local Anvil addresses in development. Make it automatically detect the environment."

**Use cases:**
- Development vs production contract addresses
- Different configurations for staging environments
- Conditional contract inclusion based on environment
- Separate test and live contract deployments

### Build Integration

**Prompt to AI Agent:**
"Configure Wagmi to automatically clean and build my Foundry contracts before generating types."

**Additional build prompts:**
- "Set up Wagmi to run my contract compilation before type generation"
- "Configure automatic contract building in my Wagmi workflow"
- "Ensure my contracts are always compiled before generating TypeScript types"

## Development Workflow

### Continuous Generation

**Prompt to AI Agent:**
"Set up my package.json scripts to run Wagmi type generation alongside my development server, and also generate types as part of my build process."

**Workflow prompts:**
- "Configure automatic type regeneration that watches for contract changes"
- "Add a script that generates Wagmi types on demand"
- "Set up concurrent Wagmi generation with my development environment"

### Git Integration

**Prompt to AI Agent:**
"Configure my .gitignore to track generated Wagmi types but ignore build artifacts and cache directories."

**Version control considerations:**
- Generated types should be committed for consistency
- Build artifacts should be ignored
- Cache directories don't need version control
- Contract compilation outputs should be excluded

### CI/CD Integration

**Prompt to AI Agent:**
"Add GitHub Actions steps to generate Wagmi types during CI and verify they're up to date with the committed versions."

**CI/CD workflow prompts:**
- "Set up automatic type generation in my deployment pipeline"
- "Add verification that generated types match the current contracts"
- "Configure CI to fail if Wagmi types are out of date"

## Testing with Generated Types

### Unit Tests

**Prompt to AI Agent:**
"Create a test that reads the initial counter value, increments it, then verifies the new value is one higher. Use the generated Counter contract types and a clean test environment."

**Test scenario prompts:**
- "Test that my ERC20 token transfer function works correctly"
- "Verify contract functions return the expected data types"
- "Create a test that validates contract state changes after transactions"
- "Test error handling for invalid contract function calls"

### Integration Tests

**Prompt to AI Agent:**
"Create a multi-chain integration test that checks the same contract function works on both Anvil and Sepolia, then compares the results to ensure they're both valid."

**Integration test prompts:**
- "Test contract interactions across different networks"
- "Verify contract deployments are consistent across chains"
- "Create tests that validate cross-chain contract behavior"
- "Test switching between chains and calling the same contract functions"

## Best Practices

### Configuration Management

**Key principles:**
1. **Environment Separation**: Use different configurations for dev/staging/prod
2. **Version Control**: Commit generated types for consistency  
3. **Automation**: Generate types in CI/CD pipelines

**Prompt to AI Agent:**
"Set up separate Wagmi configurations for development, staging, and production environments with appropriate contract addresses for each."

### Type Safety

**Benefits of generated types:**
- TypeScript validation for function names and parameters
- Compile-time error detection for invalid contract calls
- Auto-completion for contract methods and events
- Type-safe parameter validation

**AI agents automatically leverage these types when:**
- Reading contract functions
- Writing to contracts
- Validating function parameters
- Suggesting available contract methods

### Performance

**Optimization strategies:**
1. **Selective Generation**: Only generate contracts you need
2. **Caching**: Use build caches to speed up regeneration
3. **Incremental Updates**: Only regenerate when contracts change

**Prompt to AI Agent:**
"Optimize my Wagmi configuration to only generate types for the contracts I'm actively using and set up caching for faster builds."

## Troubleshooting

### Common Issues

#### Contract Not Found

**Prompt to AI Agent:**
"My contract isn't being recognized. Show me all the contracts currently loaded and help me figure out why my contract isn't available."

**Troubleshooting steps:**
- Verify contract is in Wagmi configuration
- Check that types were generated successfully
- Ensure contract was loaded into wallet agent
- Confirm contract name matches configuration

#### ABI Mismatch

**Prompt to AI Agent:**
"My contract ABI seems out of date. Regenerate the Wagmi types and reload them into the wallet agent."

**When to regenerate:**
- After changing contract source code
- When function signatures don't match
- After deploying updated contracts
- When getting "function not found" errors

#### Chain Configuration

**Prompt to AI Agent:**
"Check if my Counter contract is deployed on the current chain I'm connected to, and show me which chains it's available on."

**Common chain issues:**
- Contract not deployed on current chain
- Wrong chain ID in configuration
- Missing deployment addresses
- Network connection problems

### Debugging Tips

**Troubleshooting prompts:**
- "Verify my generated types contain the expected contracts and functions"
- "Check that my contract addresses are correct for each chain"
- "Compare my generated ABI with the actual deployed contract"
- "Test my contract interactions on Anvil before trying other networks"

**Debugging workflow:**
1. **Verify Generation**: Check generated file exists and contains expected contracts
2. **Check Deployments**: Ensure contract addresses are correct for target chains
3. **Validate ABIs**: Compare generated ABIs with actual contract interfaces
4. **Test Locally**: Use Anvil for consistent local testing

## Next Steps

- [Contract Testing](contract-testing.md) - Testing strategies for Wagmi-integrated contracts
- [Custom Chains](custom-chains.md) - Adding custom EVM chains
- [API Reference](../api-reference/mcp-tools/contracts.md) - Complete contract tools reference