# FAQ

Frequently asked questions about Wallet Agent for developers using AI agents.

## Overview

Common questions developers have when using Wallet Agent with AI agents like Claude Code and Cursor for blockchain development workflows.

## General Development Questions

### What is Wallet Agent?

**Q:** What exactly is Wallet Agent and how do I use it in development?

**A:** Wallet Agent is an MCP (Model Context Protocol) server that enables AI agents to perform blockchain operations through natural language prompts. Instead of writing blockchain code directly, you use prompts like "Deploy my Counter contract to Sepolia testnet" and the AI agent handles the underlying blockchain interactions.

### How does this differ from traditional blockchain development?

**Q:** How is using Wallet Agent with AI agents different from normal Web3 development?

**A:** Traditional development requires writing code with libraries like ethers.js or viem. With Wallet Agent, you use natural language: "Transfer 100 USDC to address 0x..." instead of writing transaction code. The AI agent translates your prompts into proper blockchain operations using Wallet Agent's MCP tools.

### Which AI agents work with Wallet Agent?

**Q:** What AI agents can I use with Wallet Agent?

**A:** Currently optimized for:
- **Claude Code** - Terminal-based blockchain operations
- **Cursor** - IDE-integrated blockchain development  
- Any AI agent that supports MCP (Model Context Protocol)

## Setup and Configuration

### How do I get started with development?

**Q:** What's the quickest way to start developing with Wallet Agent?

**A:** 
1. Follow the installation guide to set up Wallet Agent
2. Configure your AI agent (Claude Code or Cursor) to connect
3. Start with: "Show me all available mock accounts for testing"
4. Begin development with: "Connect to the first mock account and check balance"

### Do I need to write any blockchain code?

**Q:** Do I still need to know Solidity or Web3 libraries?

**A:** You still need to understand blockchain concepts and Solidity for smart contract development. However, you interact with deployed contracts and perform transactions through AI agent prompts rather than writing JavaScript/TypeScript Web3 code.

### What about contract development?

**Q:** How do I develop smart contracts with this setup?

**A:** Smart contract development (Solidity) remains the same. Wallet Agent helps with:
- Contract deployment: "Deploy my Counter contract to Anvil"  
- Contract interaction: "Call the increment function on my Counter contract"
- Testing: "Read the current number from my deployed contract"

## Wallet Management

### Mock vs Private Key wallets?

**Q:** When should I use mock wallets vs private key wallets?

**A:** 
- **Mock wallets**: For all development and testing. Use prompts like "Show me available mock accounts"
- **Private key wallets**: Only for real testnet/mainnet operations. Use prompts like "Import my private key from environment variable"

### How do I switch between development and production?

**Q:** How do I move from development to production safely?

**A:**
1. Develop with mock wallets: "Connect to mock wallet for testing"
2. Test on testnet: "Import private key for Sepolia testing" 
3. Deploy to mainnet: "Switch to private key wallet mode for production"

### Is private key management secure?

**Q:** How secure is private key handling in Wallet Agent?

**A:** Very secure:
- Private keys stored only in memory, never logged
- Support for environment variables and encrypted storage
- No persistence to disk or configuration files
- Secure key import: "Import private key from WALLET_PRIVATE_KEY environment variable"

## Contract Development Workflow

### How do I deploy contracts?

**Q:** What's the workflow for deploying smart contracts?

**A:**
1. Develop contract in Solidity as usual
2. Use AI prompts for deployment: "Deploy my Counter contract to Anvil"
3. Verify deployment: "Check that my Counter contract deployed successfully"
4. Test functionality: "Call the increment function and verify the count increased"

### How do I work with contract ABIs?

**Q:** How does ABI management work with Wallet Agent?

**A:** Use Wagmi for ABI generation, then:
1. "Generate Wagmi configuration for my contracts"
2. "Load contract configuration from ./src/generated.ts"  
3. "Show me all available contracts"
4. Interact with contracts: "Read the current value from my Counter contract"

### Can I test contracts locally?

**Q:** How do I test contracts in my development environment?

**A:** Use Anvil (local Ethereum node):
1. "Connect to Anvil network for local development"
2. "Deploy my contract to local network"
3. "Test contract functions with various inputs"
4. "Create fresh test environment for isolated testing"

## Multi-Chain Development

### Which networks are supported?

**Q:** What blockchain networks can I use?

**A:** All EVM-compatible networks:
- Built-in: Ethereum, Polygon, Arbitrum, Optimism, Base, and testnets
- Custom networks: "Add custom chain with RPC https://api.example.com"
- Local: Anvil for development

### How do I switch networks?

**Q:** How do I work with different blockchains?

**A:** Use network switching prompts:
- "Switch to Polygon network"
- "Check my balance on Arbitrum"  
- "Deploy my contract to Base network"
- "Show me gas prices on all networks"

### Can I work across multiple chains?

**Q:** How do I manage multi-chain deployments?

**A:** 
- Deploy same contract to multiple networks: "Deploy Counter to Ethereum and Polygon"
- Check balances across chains: "Show my USDC balance on all networks"
- Manage gas tokens: "Ensure I have ETH on Ethereum and POL on Polygon"

## Token and DeFi Operations

### How do I work with tokens?

**Q:** What token operations can I perform?

**A:** Full ERC-20 support through prompts:
- "Transfer 100 USDC to address 0x742d35..."
- "Approve Uniswap to spend 50 USDT" 
- "Check my token balances on current network"
- "Get token info for USDC contract"

### Can I interact with DeFi protocols?

**Q:** How do I integrate with DeFi protocols like Uniswap?

**A:** Yes, through contract interactions:
1. Load protocol ABIs: "Load Uniswap V3 contract configuration"
2. Interact with contracts: "Swap 1 ETH for USDC on Uniswap"
3. Monitor positions: "Check my liquidity position in ETH/USDC pool"

### What about NFTs?

**Q:** Does Wallet Agent support NFT operations?

**A:** Full ERC-721 support:
- "Transfer NFT #123 from my collection to address 0x..."
- "Check who owns NFT #456 in contract 0x..."
- "Get metadata for NFT #789"

## Testing and Development

### How do I test my applications?

**Q:** What's the testing approach with Wallet Agent?

**A:** Use isolated testing environments for clean state:
1. "Create fresh testing environment for wallet testing"
2. "Test contract deployment in isolated environment"  
3. "Verify all contract functions work correctly"
4. "Clean up test environment after completion"

### Can I use this in CI/CD?

**Q:** How do I integrate Wallet Agent into automated pipelines?

**A:** Yes, through environment configuration:
- Set environment variables for private keys
- Use testnet operations for automated testing
- Integrate with deployment scripts through AI prompts
- Monitor deployments: "Verify contract deployed successfully in CI"

### How do I debug issues?

**Q:** How do I troubleshoot problems?

**A:** Use diagnostic prompts:
- "Show current wallet and network status"
- "Check transaction 0x... status and details"
- "Estimate gas for this operation before executing"
- "Test connectivity to current network"

## Performance and Optimization

### Is this slower than direct Web3 calls?

**Q:** Does using AI agents make blockchain operations slower?

**A:** Minimal overhead:
- Direct blockchain RPC calls under the hood
- Caching for frequently accessed data  
- Batch operations where possible
- Performance comparable to direct Web3 usage

### How do I optimize gas costs?

**Q:** How can I optimize transaction gas costs?

**A:** Use gas optimization prompts:
- "Check current gas prices before transaction"
- "Estimate gas cost for this operation"  
- "Compare gas costs across different networks"
- "Batch multiple operations into single transaction"

### Can I handle high-volume operations?

**Q:** Will this work for applications with many transactions?

**A:** Yes, designed for production use:
- Efficient connection pooling and caching
- Parallel transaction processing
- Batch operations support
- Production-grade error handling and recovery

## Security and Best Practices

### What are the security best practices?

**Q:** How do I use Wallet Agent securely in development?

**A:**
- Never use private keys in development - use mock wallets
- Store production keys in environment variables only
- Use separate keys for development, staging, and production
- Monitor all mainnet operations carefully

### How do I handle errors safely?

**Q:** How should I handle transaction failures and errors?

**A:** Wallet Agent provides clear error messages:
- Check wallet connection: "Get current wallet connection status"
- Validate before executing: "Simulate this transaction before sending"
- Monitor execution: "Check status of transaction 0x..."
- Handle failures gracefully with retry logic

### Should I use this in production?

**Q:** Is Wallet Agent suitable for production applications?

**A:** Yes, with proper precautions:
- Use encrypted private key storage
- Implement proper monitoring and alerting
- Test thoroughly in staging environments
- Follow security best practices for private key management

## Integration Questions

### How does this work with existing development tools?

**Q:** Can I use this with my current development stack?

**A:** Integrates well with standard tools:
- Hardhat/Foundry for contract development
- Wagmi for ABI generation and type safety
- Standard testing frameworks with isolated test environments
- Existing CI/CD pipelines through environment variables

### Can I use this across multiple development environments?

**Q:** How do I set this up across different development environments?

**A:** Multi-environment features:
- Consistent mock wallets for development
- Environment-specific user instructions and workflows
- Separate private keys per environment
- Consistent AI prompts across different setups

### What about different development environments?

**Q:** How do I manage different environments (dev/staging/prod)?

**A:** Environment-specific configuration:
- Development: Mock wallets + Anvil network
- Staging: Testnet keys + Sepolia/Mumbai networks
- Production: Encrypted keys + Mainnet networks
- Switch between environments: "Switch to staging environment configuration"

## Related Resources

- [Troubleshooting](troubleshooting.md) - Common issues and solutions
- [User Guide](../user-guide/README.md) - Complete usage instructions
- [Developer Guide](../developer-guide/README.md) - Development workflows
- [Advanced Topics](../advanced/README.md) - Advanced features and security