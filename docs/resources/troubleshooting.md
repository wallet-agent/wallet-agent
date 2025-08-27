# Troubleshooting

Common issues and solutions when using WalletAgent with AI agents.

## Overview

This guide helps resolve common problems you might encounter when using WalletAgent with AI agents like Claude Code and Cursor. Issues are organized by category with step-by-step solutions and preventive measures.

## Connection and Setup Issues

### Wallet Connection Problems

**Issue:** "No wallet connected" errors when trying to perform operations.

**AI Agent Troubleshooting:**
**You:** "I'm getting 'no wallet connected' errors"

**AI Agent Response:** The AI will help by:
1. Check if any wallet is currently connected
2. Show available accounts for connection
3. Guide through wallet connection process
4. Verify connection status after setup

**Common Solutions:**
- "Show me all available mock accounts and connect to the first one"
- "Import my private key and switch to private key wallet mode"
- "Check my current wallet connection status"
- "Reconnect to my wallet if the connection was lost"

**Prevention:**
- Always connect a wallet before attempting transactions
- Verify wallet connection status periodically
- Use persistent connections in long-running sessions

---

### RPC and Network Issues

**Issue:** Network connectivity problems or RPC endpoint failures.

**Symptoms:**
- Slow or timing out operations
- "Network error" messages
- Failed transaction broadcasts
- Inconsistent balance information

**AI Agent Troubleshooting:**
**You:** "My blockchain operations are failing with network errors"

**AI Agent Response:** The AI will:
1. Test current RPC connectivity
2. Check network status and congestion
3. Suggest alternative RPC endpoints
4. Help switch to more reliable networks

**Solutions:**
- "Test my connection to the current blockchain network"
- "Switch to a different RPC endpoint for better reliability"
- "Check if the network is experiencing congestion"
- "Use a backup RPC provider for this operation"

**Prevention:**
- Use multiple RPC endpoints for redundancy
- Monitor network status before critical operations
- Choose reliable, high-performance RPC providers

## Transaction Issues

### Transaction Failures

**Issue:** Transactions failing to execute or getting stuck.

**Common Error Messages:**
- "Insufficient funds for gas"
- "Transaction underpriced"
- "Nonce too high/low"
- "Contract execution reverted"

**AI Agent Troubleshooting:**
**You:** "My transaction failed with error [specific error message]"

**AI Agent Response:** The AI will diagnose:
1. Check account balance and gas requirements
2. Analyze current gas prices and network conditions
3. Verify transaction parameters and contract state
4. Suggest corrections and retry strategies

**Specific Solutions:**

**Insufficient Gas:**
- "Check my ETH balance and ensure I have enough for gas"
- "Estimate gas cost for this transaction before sending"
- "Increase gas limit if the transaction is complex"

**Gas Price Issues:**
- "Check current network gas prices and adjust accordingly"
- "Use recommended gas price for current network conditions"
- "Wait for lower gas prices during off-peak hours"

**Contract Reverts:**
- "Simulate this transaction before executing to check for errors"
- "Verify contract state and my account permissions"
- "Check if contract function parameters are correct"

---

### Stuck or Pending Transactions

**Issue:** Transactions remain pending for extended periods.

**AI Agent Troubleshooting:**
**You:** "My transaction has been pending for 30 minutes"

**AI Agent Response:** The AI will:
1. Check transaction status and network confirmation
2. Analyze current network congestion
3. Suggest acceleration or replacement strategies
4. Monitor transaction progress

**Solutions:**
- "Check the current status of transaction 0xabc123..."
- "Speed up my pending transaction with higher gas price"
- "Cancel and replace my stuck transaction"
- "Wait for network congestion to clear"

## Contract and ABI Issues

### Contract Loading Problems

**Issue:** Contracts not loading or ABI-related errors.

**Common Symptoms:**
- "Contract not loaded" errors
- Functions not recognized
- Incorrect parameter types
- Missing contract addresses

**AI Agent Troubleshooting:**
**You:** "My contract isn't loading properly"

**AI Agent Response:** The AI will:
1. Verify contract configuration file exists and is accessible
2. Check Wagmi configuration format and syntax
3. Validate contract addresses and ABI data
4. Help reload and refresh contract information

**Solutions:**
- "Load my contract configuration from ./src/generated.ts"
- "Verify my Wagmi configuration file is correct"
- "Check if contract addresses are valid for the current network"
- "List all available contracts to see what loaded successfully"

**Prevention:**
- Keep contract configurations up to date
- Regenerate contract types after changes
- Use absolute paths for configuration files
- Validate contract addresses before deployment

---

### Contract Interaction Errors

**Issue:** Contract function calls failing or returning unexpected results.

**AI Agent Troubleshooting:**
**You:** "My contract function call is failing"

**AI Agent Response:** The AI will:
1. Simulate the contract call to identify issues
2. Check function parameters and types
3. Verify contract state and permissions
4. Analyze gas requirements and network conditions

**Solutions:**
- "Simulate calling this function before executing"
- "Verify the function parameters are correct"
- "Check if I have permission to call this function"
- "Ensure the contract is deployed on the current network"

## Chain and Network Issues

### Chain Switching Problems

**Issue:** Unable to switch between different blockchain networks.

**AI Agent Troubleshooting:**
**You:** "I can't switch to [specific chain]"

**AI Agent Response:** The AI will:
1. Check if the target chain is configured
2. Verify chain configuration and RPC endpoints
3. Test connectivity to the target network
4. Help add or update chain configuration

**Solutions:**
- "Show me all available blockchain networks"
- "Add [specific network] to my available chains"
- "Update the RPC endpoint for [network name]"
- "Test connectivity to [network name] before switching"

---

### Network Connectivity Issues

**Issue:** Problems connecting to supported blockchain networks.

**AI Agent Troubleshooting:**
**You:** "I can't connect to Polygon network"

**AI Agent Response:** The AI will:
1. Test connectivity to the network
2. Check network status and responsiveness  
3. Verify chain configuration
4. Suggest alternative networks if needed

**Solutions:**
- "Test connectivity to Polygon network"
- "Switch to Anvil for local development"
- "Try Sepolia testnet instead"
- "Check network status for current issues"

## Balance and Token Issues

### Balance Display Problems

**Issue:** Incorrect or missing balance information.

**AI Agent Troubleshooting:**
**You:** "My balance looks wrong or isn't updating"

**AI Agent Response:** The AI will:
1. Refresh balance information from blockchain
2. Check if connected to correct network
3. Verify account address and connection
4. Compare with block explorer data

**Solutions:**
- "Refresh my balance from the blockchain"
- "Verify I'm connected to the correct network"
- "Check my balance on [specific network]"
- "Compare my balance with block explorer data"

---

### Token Operation Issues

**Issue:** Token transfers or approvals failing.

**AI Agent Troubleshooting:**
**You:** "My token transfer failed"

**AI Agent Response:** The AI will:
1. Check token balance and allowances
2. Verify token contract address and network
3. Analyze transfer parameters and permissions
4. Suggest corrections and retry strategies

**Solutions:**
- "Check my balance of [specific token]"
- "Verify the token contract address is correct"
- "Approve token spending before transfer"
- "Check if recipient address is valid"

## Performance Issues

### Slow Operations

**Issue:** Operations taking longer than expected to complete.

**AI Agent Troubleshooting:**
**You:** "Everything is running very slowly"

**AI Agent Response:** The AI will:
1. Test current network performance and latency
2. Check RPC endpoint response times
3. Analyze operation complexity and requirements
4. Suggest optimization strategies

**Solutions:**
- "Switch to a faster RPC endpoint"
- "Use batch operations for multiple queries"
- "Check network congestion and wait for better conditions"
- "Optimize gas settings for faster confirmation"

---

### Memory and Resource Issues

**Issue:** High memory usage or resource consumption.

**AI Agent Troubleshooting:**
**You:** "The system seems to be using too much memory"

**AI Agent Response:** The AI will:
1. Check cache usage and cleanup requirements
2. Analyze resource consumption patterns
3. Suggest memory optimization strategies
4. Help clear unnecessary cached data

**Solutions:**
- "Clear cached data to free up memory"
- "Optimize batch operations to reduce memory usage"
- "Check for memory leaks in long-running operations"
- "Restart the system if memory usage is excessive"

## AI Agent Interaction Issues

### Prompt Interpretation Problems

**Issue:** AI agent not understanding requests or providing unexpected responses.

**Troubleshooting Tips:**
- Be specific about what you want to accomplish
- Provide context about your current setup
- Break complex operations into smaller steps
- Use clear, unambiguous language

**Better Prompt Examples:**
- Instead of: "Do something with my tokens"
- Use: "Transfer 100 USDC to address 0x742d35..."

- Instead of: "Check my stuff"
- Use: "Show my USDC balance on Polygon network"

---

### Operation Confirmation Issues

**Issue:** AI agent not completing operations or losing context.

**Solutions:**
- Provide operation confirmation when requested
- Be patient during complex multi-step operations
- Ask for status updates on long-running operations
- Restart the conversation if context is lost

## Diagnostic Commands

### System Health Checks

**General Diagnostics:**
- "Show me my current wallet and network status"
- "Test connectivity to all configured networks"
- "Check system health and performance"
- "Verify all configurations are working properly"

**Connection Testing:**
- "Test my connection to Ethereum mainnet"
- "Verify RPC endpoints are responding"
- "Check network latency and performance"
- "Test wallet connection and authentication"

**Configuration Validation:**
- "Verify my contract configuration is correct"
- "Check all network configurations"
- "Validate token contract addresses"
- "Confirm chain settings and parameters"

## Getting Additional Help

### When to Escalate

Contact support or community resources when:
- Issues persist after following troubleshooting steps
- Errors involve potential security concerns
- Problems affect production operations
- Complex integration issues arise

### Information to Provide

When seeking help, include:
- Specific error messages and context
- Steps taken to reproduce the issue
- Current configuration and environment
- Expected vs actual behavior

**AI Agent Help Request:**
"I need help with [specific issue]. Here's what I've tried: [list steps]. The error message is: [exact message]. My setup includes: [relevant configuration details]."

## Related Resources

- [FAQ](faq.md) - Common questions and answers
- [User Guide](../user-guide/README.md) - Complete usage instructions
- [API Reference](../api-reference/README.md) - Technical documentation
- [Contributing](../contributing/README.md) - Report bugs and contribute fixes