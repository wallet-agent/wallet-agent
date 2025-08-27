# User Instructions

Creating custom user instructions and workflows for AI agents using Wallet Agent.

## Overview

User instructions enable individual developers to create standardized workflows, custom prompts, and specialized procedures for AI agents. This guide covers creating effective user instructions that leverage Wallet Agent's capabilities while maintaining consistency across different AI agent platforms.

**🎯 Customization Goal:** Create reusable, personalized instructions that make AI agents more effective at blockchain operations while reducing repetitive explanations.

## Understanding User Instructions

### What Are User Instructions?

User instructions are structured guidelines that:
- Define standard workflows for blockchain operations
- Establish project-specific terminology and procedures
- Create reusable prompts for common tasks
- Ensure consistency across different AI agents
- Reduce setup time for new development environments

### When to Create User Instructions

**Development Scenarios:**
- "Create standard instructions for my DeFi protocol interactions"
- "Set up consistent token deployment procedures for my projects"
- "Establish security protocols for mainnet operations"
- "Define testing workflows for smart contract development"

## Types of User Instructions

### Workflow Instructions

Standard procedures for common blockchain operations:

**Token Operations Workflow:**
```
When deploying ERC-20 tokens:
1. Always start with mock wallet testing
2. Deploy to Sepolia testnet first
3. Verify contract on block explorer
4. Test all token functions thoroughly
5. Only deploy to mainnet after thorough testing
6. Use secure wallet for initial token distribution
```

**DeFi Protocol Interaction:**
```
For interacting with our liquidity protocol:
1. Check current gas prices before operations
2. Simulate all transactions before execution
3. Use 10% slippage tolerance for DEX operations
4. Always approve exact amounts, never unlimited
5. Monitor positions after each interaction
```

### Security Instructions

Project-specific security protocols and procedures:

**Private Key Management:**
```
Personal security protocol:
- Development: Use Anvil default keys only
- Staging: Use testnet-specific keys with limited funds
- Production: Use encrypted keys with careful consideration
- Never share private keys in any communication
- All mainnet operations require careful review
```

**Transaction Approval Process:**
```
For high-value transactions:
1. Simulate transaction and review gas costs
2. Document transaction details for personal records
3. Double-check all parameters
4. Execute when you can monitor the transaction
5. Monitor transaction until confirmed
6. Document completion for future reference
```

### Custom Terminology

Project-specific terms and conventions:

**Contract Naming:**
```
Project contract naming conventions:
- Counter contracts: Use "ProjectCounter" naming
- Token contracts: Use "ProjectToken" format
- Always include version numbers in contract names
- Use consistent ABI generation paths: ./src/generated.ts
```

**Network References:**
```
Development network terminology:
- "dev" = Anvil local network (chainId: 31337)
- "staging" = Sepolia testnet (chainId: 11155111)
- "prod" = Ethereum mainnet (chainId: 1)
- "side" = Polygon mainnet (chainId: 137)
```

## Creating Effective Instructions

### Structure and Format

**Clear Action Steps:**
**Developer:** "Create user instructions for our NFT minting process"

**AI Agent Response:** The AI will help structure:
```
NFT Minting Workflow:

Prerequisites:
- Wallet connected to appropriate network
- Sufficient ETH for gas fees
- NFT metadata uploaded to IPFS

Steps:
1. "Load my NFT contract configuration from ./contracts/generated.ts"
2. "Estimate gas for minting 10 NFTs to address 0x..."
3. "Simulate the mint transaction before executing"
4. "Execute the mint with confirmed gas settings"
5. "Verify NFTs appear in recipient wallet"

Post-Mint:
- Update personal records with mint details
- Document transaction hash for reference
- Monitor for any failed transactions
```

### Project-Specific Prompts

**Standardized Prompt Templates:**
**Developer:** "Create prompt templates for our most common operations"

**AI Agent Response:** The AI will generate:

**Daily Operations:**
```
Standard Daily Check:
"Show me balances for all my wallets on Ethereum and Polygon, check gas prices on both networks, and display any pending transactions from the last 24 hours"

Deployment Check:
"Verify all my smart contracts are deployed correctly on [network], check contract verification status, and confirm all contract functions are working"
```

**Emergency Procedures:**
```
Security Incident Response:
"Immediately check balances on all networks, show recent transaction history, identify any unauthorized transactions, and prepare asset migration to backup wallets"
```

### Integration Patterns

**AI Agent Integration:**
**Developer:** "Set up instructions that work across Claude Code and Cursor"

**AI Agent Response:** The AI will create platform-agnostic instructions:
```
Cross-Platform Instructions:

For Terminal-based AI (Claude Code):
- Use full command contexts
- Include directory navigation
- Specify complete file paths
- Request confirmation for destructive operations

For IDE-based AI (Cursor):
- Reference current workspace context
- Use relative file paths where appropriate
- Leverage IDE file navigation
- Integrate with existing project structure
```

## Advanced Instruction Patterns

### Conditional Workflows

**Environment-Specific Instructions:**
**Developer:** "Create instructions that adapt based on the current network"

**AI Agent Response:** The AI will structure:
```
Network-Adaptive Workflow:

IF network is Anvil (development):
- Use mock wallets and unlimited gas
- Skip transaction confirmations
- Enable verbose logging
- Allow experimental operations

IF network is Sepolia (staging):
- Use testnet keys only
- Verify sufficient test ETH
- Confirm all operations
- Log all transactions

IF network is Mainnet (production):
- Use encrypted production keys
- Require careful review for operations
- Maximum transaction value limits
- Comprehensive monitoring
```

### Role-Based Instructions

**Development Phase Specifications:**
**Developer:** "Create different instruction sets for different development phases"

**AI Agent Response:** The AI will define:
```
Development Phase Instructions:
- Focus on contract development and testing
- Use development and staging environments
- Emphasis on code verification and testing
- Limited mainnet access

Deployment Phase Instructions:
- Production deployment and infrastructure operations
- Access to production environments
- Monitoring and maintenance tasks
- Emergency response procedures

Maintenance Phase Instructions:
- Token and asset management
- Regular operations and monitoring
- Financial tracking and reporting
- Compliance and audit procedures
```

## Implementation Strategies

### Development Environment Setup

**New Environment Setup:**
**Developer:** "Create setup instructions for new development environments"

**AI Agent Response:** The AI will generate:
```
New Development Environment Setup:

Week 1 - Setup:
1. "Set up Wallet Agent with mock wallets for testing"
2. "Load our project's contract configuration"
3. "Connect to Anvil development network"
4. "Practice basic operations with test transactions"

Week 2 - Development:
1. "Switch to Sepolia testnet with provided test keys"
2. "Deploy a simple contract following our standards"
3. "Interact with existing project contracts"
4. "Complete the new developer checklist"

Week 3 - Integration:
1. "Set up personal secure wallet for mainnet operations"
2. "Practice mainnet operations with small amounts"
3. "Review and implement security protocols"
4. "Document production access procedures"
```

### Quality Assurance

**Instruction Testing:**
**Developer:** "Test and validate our user instructions work correctly"

**AI Agent Response:** The AI will help with:
1. Create test scenarios for each instruction set
2. Validate instructions work with different AI agents
3. Check for ambiguous or unclear steps
4. Verify security procedures are followed
5. Update instructions based on testing results

### Version Control

**Instruction Management:**
**Developer:** "Manage and version control our user instructions"

**AI Agent Response:** The AI will set up:
- Version tracking for instruction updates
- Change approval processes
- Distribution across development environments
- Regular review and update schedules
- Integration with existing documentation systems

## Common Instruction Templates

### Contract Development

**Standard Development Flow:**
```
Smart Contract Development Instructions:

Initial Setup:
1. "Create a new testing environment for isolated development"
2. "Connect to Anvil network with default test accounts"
3. "Load Foundry configuration for contract compilation"

Development Process:
1. "Compile contracts and check for any compilation errors"
2. "Deploy to local network and verify deployment success"
3. "Test all contract functions with various input scenarios"
4. "Run complete test suite and ensure all tests pass"

Deployment Preparation:
1. "Generate Wagmi configuration for frontend integration"
2. "Deploy to Sepolia testnet for integration testing"
3. "Verify contract on Etherscan testnet"
4. "Complete security checklist before mainnet deployment"
```

### DeFi Operations

**Liquidity Management:**
```
DeFi Liquidity Operations:

Pre-Operation Checks:
1. "Check current liquidity pool composition and fees"
2. "Estimate impermanent loss for proposed position size"
3. "Verify slippage tolerance is appropriate for market conditions"

Execution Steps:
1. "Approve exact token amounts for liquidity provision"
2. "Add liquidity to pool with confirmed parameters"
3. "Verify LP tokens received match expected amounts"
4. "Set up position monitoring and alerts"

Post-Operation:
- Monitor pool performance daily
- Track impermanent loss and fee earnings
- Rebalance position based on market conditions
```

### Security Procedures

**Incident Response:**
```
Security Incident Response Instructions:

Immediate Actions (within 5 minutes):
1. "Show all wallet balances across all networks immediately"
2. "Display recent transaction history for suspicious activity"
3. "Check for any pending or unusual transactions"
4. "Disable automated operations if any are running"

Assessment Phase (5-15 minutes):
1. "Identify scope of potential compromise"
2. "Calculate total value at risk across all positions"
3. "Determine which private keys may be compromised"
4. "Document incident for analysis and improvement"

Recovery Actions (as needed):
1. "Generate new secure wallet addresses"
2. "Execute emergency asset migration to secure wallets"
3. "Update all system configurations with new addresses"
4. "Document incident and lessons learned"
```

## Best Practices for User Instructions

### Clarity and Precision

**Writing Effective Instructions:**
- Use specific, actionable language
- Include exact prompts and expected responses
- Specify all required parameters and contexts
- Provide clear success/failure criteria
- Include troubleshooting steps

### Maintenance and Updates

**Keeping Instructions Current:**
- Review instructions monthly for accuracy
- Update when Wallet Agent features change
- Incorporate lessons learned from operations
- Test instructions with new development setups
- Version control all instruction changes

### Security Considerations

**Secure Instruction Practices:**
- Never include private keys in instructions
- Use placeholders for sensitive information
- Implement approval processes for high-value operations
- Regular security reviews of instruction content
- Separate development and production procedures

## Integration Examples

### CI/CD Pipeline Integration

**Automated Operations:**
**Developer:** "Create instructions for automated blockchain operations in CI/CD"

**AI Agent Response:** The AI will structure:
```
CI/CD Blockchain Integration:

Pre-Deployment:
1. "Load contract configuration from build artifacts"
2. "Verify all contracts compile without errors"
3. "Run complete test suite with fresh testing environment"
4. "Estimate deployment gas costs for budget approval"

Deployment Process:
1. "Deploy contracts to staging environment first"
2. "Verify deployment success and contract functionality"
3. "Run integration tests against deployed contracts"
4. "Get approval for production deployment"

Post-Deployment:
1. "Verify production deployment matches staging"
2. "Update contract addresses in configuration"
3. "Run smoke tests on production deployment"
4. "Update project documentation with new addresses"
```

### Monitoring and Alerting

**Operational Monitoring:**
**Developer:** "Set up instructions for ongoing blockchain operations monitoring"

**AI Agent Response:** The AI will create:
```
Daily Monitoring Checklist:

Morning Check (9 AM daily):
1. "Show balances for all project wallets on all networks"
2. "Check gas prices and network congestion levels"
3. "Review any failed transactions from last 24 hours"
4. "Verify all automated operations completed successfully"

Weekly Review (Monday mornings):
1. "Generate weekly transaction report for all wallets"
2. "Review gas usage and optimization opportunities"
3. "Check contract verification status on all networks"
4. "Document any pending operations or issues"

Monthly Audit (First Monday of month):
1. "Complete security audit of all wallet activities"
2. "Review and update access controls and permissions"
3. "Generate compliance reports for personal records"
4. "Plan any needed infrastructure updates or changes"
```

## Related Documentation

- [Private Keys](private-keys.md) - Security considerations for instructions
- [Encrypted Keys](encrypted-keys.md) - Enhanced security workflows
- [Extending](extending.md) - Custom functionality integration
- [Security Guide](../user-guide/security.md) - General security practices