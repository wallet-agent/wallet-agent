# Testing Tools

MCP tools for development, testing, and validation with AI agents.

## Overview

Testing tools enable AI assistants to help developers validate transactions, simulate operations, and debug blockchain interactions through natural language prompts. These tools are essential for safe development and testing workflows.

## Tools

### simulate_transaction

Simulate a contract transaction before execution to predict success or failure.

**Tool Name:** `mcp__wallet-agent__simulate_transaction`

**Parameters:**
```typescript
{
  contract: string;     // Contract name from loaded config
  function: string;     // Function name to call
  args?: any[];        // Function arguments (optional)
  value?: string;      // ETH value to send (optional)
  address?: string;    // Custom contract address (optional)
}
```

**Response:**
```typescript
{
  success: boolean;
  result?: any;        // Function return value (if successful)
  error?: string;      // Error message (if failed)
  gasEstimate?: string; // Estimated gas usage
  revertReason?: string; // Revert reason (if contract reverted)
}
```

**Example Prompts:**
- "Simulate calling the increment function before executing it"
- "Test if the withdraw function would work with 100 ETH"
- "Check if calling setNumber with 42 would succeed"
- "Simulate the risky function to see if it would revert"
- "Test this transaction before I send it for real"

**AI Agent Response:**
The AI agent will simulate the transaction and report whether it would succeed or fail, including any error messages, gas estimates, and return values. For failed simulations, it will explain why the transaction would fail.

**Errors:**
- `InvalidParams`: Invalid contract name or function
- `InvalidRequest`: Contract not loaded or wallet not connected
- `InternalError`: Simulation failed due to network error

---

### estimate_gas

Estimate gas cost for a transaction before execution.

**Tool Name:** `mcp__wallet-agent__estimate_gas`

**Parameters:**
```typescript
{
  to: string;           // Recipient address
  value?: string;       // Amount in native token units (optional)
  data?: string;        // Transaction data (optional)
  from?: string;        // Sender address (optional, defaults to connected wallet)
}
```

**Response:**
```typescript
{
  gasEstimate: string;  // Estimated gas units
  gasPrice: string;     // Current gas price
  estimatedCost: string; // Total estimated cost in native token
  currency: string;     // Native currency symbol
}
```

**Example Prompts:**
- "How much gas would it cost to send 1 ETH to Alice?"
- "Estimate gas for calling this contract function"
- "What's the gas cost for this transaction on the current network?"
- "Check gas fees before I execute this operation"
- "Calculate the transaction cost in USD"

**AI Agent Response:**
The AI agent will estimate the gas cost and display it in both gas units and the native currency (ETH, MATIC, etc.), along with current gas price information.

**Errors:**
- `InvalidParams`: Invalid address format
- `InternalError`: Gas estimation failed (contract revert, insufficient funds)

---

### get_transaction_receipt

Get detailed information about a completed transaction.

**Tool Name:** `mcp__wallet-agent__get_transaction_receipt`

**Parameters:**
```typescript
{
  hash: string;         // Transaction hash (0x...)
}
```

**Response:**
```typescript
{
  transactionHash: string;
  blockNumber: number;
  blockHash: string;
  transactionIndex: number;
  from: string;
  to: string;
  gasUsed: string;
  gasPrice: string;
  status: "success" | "failed";
  logs: Array<{
    address: string;
    topics: string[];
    data: string;
    logIndex: number;
  }>;
  value: string;
  confirmations: number;
}
```

**Example Prompts:**
- "Get the detailed receipt for transaction 0xabc123..."
- "Show me the gas usage for my last transaction"
- "Check if transaction 0xdef456... was successful"
- "Analyze the events emitted in transaction 0xghi789..."
- "Get comprehensive details about that failed transaction"

**AI Agent Response:**
The AI agent will retrieve and display comprehensive transaction details including gas usage, status, events, and block information in a human-readable format.

**Errors:**
- `InvalidParams`: Invalid transaction hash format
- `InvalidRequest`: Transaction not found or not yet mined
- `InternalError`: RPC call failed

## Development Testing Workflows

### Pre-Transaction Validation
**Developer:** "Before I increment the counter, simulate it and estimate the gas cost"

**AI Agent Response:** The AI will:
1. Simulate: "Simulation successful - counter would increase from 5 to 6"
2. Estimate gas: "Gas estimate: 43,852 units, cost: ~0.00088 ETH"
3. Conclude: "Transaction looks safe to execute"

### Transaction Analysis
**Developer:** "My transaction 0xabc123... just completed. Analyze what happened"

**AI Agent Response:** The AI will:
1. Get receipt: "Transaction successful in block 12,345,678"
2. Analyze gas: "Used 21,000 gas (standard transfer)"
3. Check events: "No events emitted (simple ETH transfer)"
4. Summary: "Successfully transferred 0.1 ETH to Alice"

### Batch Testing
**Developer:** "Test all these contract functions before I execute them: increment, setNumber(42), and withdraw(1.0)"

**AI Agent Response:** The AI will simulate each function and report:
- increment: ✅ Success (gas: ~43K)
- setNumber(42): ✅ Success (gas: ~45K) 
- withdraw(1.0): ❌ Failed - insufficient balance

### Error Diagnosis
**Developer:** "Why did my transaction fail? Hash: 0xdef456..."

**AI Agent Response:** The AI will analyze the receipt and explain:
"Transaction failed due to: 'ERC20: insufficient allowance'. You need to approve the contract to spend your tokens first."

## Testing Strategies

### Safe Development Practice
**Developer:** "I'm about to call a new contract function. Help me test it safely"

**AI Agent Response:** "I'll help you test safely. First, let me simulate the transaction to check for any issues, then estimate gas costs, and finally we can execute if everything looks good."

### Gas Optimization Testing
**Developer:** "Compare gas costs between calling setNumber(42) and increment() ten times"

**AI Agent Response:** The AI will:
1. Simulate both approaches
2. Calculate total gas for each
3. Report: "Single setNumber(42): ~45K gas vs 10x increment(): ~438K gas. Single call is 90% more efficient."

### Multi-Chain Testing
**Developer:** "Test this same contract call on both Ethereum and Polygon to compare gas costs"

**AI Agent Response:** The AI will switch chains, test on both, and compare:
- Ethereum: 45,000 gas (~$12.50)
- Polygon: 45,000 gas (~$0.02)

### Contract State Validation
**Developer:** "After I call increment(), verify the counter actually increased"

**AI Agent Response:** The AI will:
1. Read current value: "Counter is currently: 5"
2. Execute increment
3. Verify: "Counter is now: 6. Increment successful!"

## Advanced Testing Scenarios

### Complex Transaction Testing
**Developer:** "I want to approve tokens, then swap them on Uniswap. Test this whole workflow"

**AI Agent Response:** The AI will:
1. Simulate approval: "Approval would succeed"
2. Simulate swap: "Swap would succeed, receiving ~95.2 DAI"
3. Estimate total gas: "Total gas: ~180K units (~$25)"
4. Ask: "Proceed with both transactions?"

### Revert Reason Analysis
**Developer:** "Simulate calling the restricted function and tell me why it fails"

**AI Agent Response:** "Simulation failed with revert reason: 'Ownable: caller is not the owner'. You need to be the contract owner to call this function."

### Value Transaction Testing
**Developer:** "Test sending 0.5 ETH to the deposit function"

**AI Agent Response:** 
1. Check balance: "You have 2.1 ETH available"
2. Simulate: "Deposit function accepts 0.5 ETH successfully"
3. Estimate: "Gas cost: ~65K units (~0.0013 ETH)"
4. Summary: "Total cost: 0.5013 ETH (0.5 deposit + 0.0013 gas)"

### Event Verification Testing
**Developer:** "After I call the mint function, verify the Transfer event was emitted correctly"

**AI Agent Response:** The AI will:
1. Execute mint transaction
2. Analyze receipt: "Transfer event found: from=0x000..., to=your_address, value=1000"
3. Confirm: "Mint successful - 1000 tokens transferred to your address"

## Testing Best Practices

### Always Simulate First
**Developer:** "Execute the dangerous function"
**AI Response:** "Let me simulate this first to check for issues... Simulation shows this would revert. The function requires admin privileges."

### Gas Budget Planning
**Developer:** "I have 0.01 ETH for gas. What operations can I afford?"

**AI Agent Response:** The AI will estimate costs for common operations:
- Simple transfer: ~0.0004 ETH (25 operations possible)
- Token transfer: ~0.0012 ETH (8 operations possible)  
- Contract call: ~0.002 ETH (5 operations possible)

### Cross-Network Testing
**Developer:** "Test this contract deployment on a testnet first"

**AI Agent Response:** "I'll help you deploy on Sepolia testnet first. Let me estimate gas, simulate the deployment, and verify the contract works before moving to mainnet."

## Error Recovery and Debugging

### Transaction Failure Analysis
**Developer:** "All my transactions are failing. Help me debug"

**AI Agent Response:** The AI will systematically check:
1. Wallet balance and gas fees
2. Network connection and RPC status  
3. Contract addresses and function signatures
4. Recent successful transactions for comparison

### Gas Issues Debugging
**Developer:** "Why do my gas estimates keep failing?"

**AI Agent Response:** "Let me check several things: your account balance, current network congestion, the contract state that might cause reverts, and whether you're using the correct function parameters."

### Performance Testing
**Developer:** "My contract calls are very slow. Help me optimize"

**AI Agent Response:** The AI will:
1. Test transaction on different RPC endpoints
2. Compare gas estimates across similar operations
3. Suggest batching strategies
4. Recommend optimal timing for lower gas costs

## Integration with Development Workflow

### Pre-Commit Testing
**Developer:** "Before I commit this contract change, test all the functions"

**AI Agent Response:** "I'll run a comprehensive test of all contract functions: read operations, write operations with various parameters, edge cases, and gas optimization checks."

### Deployment Verification
**Developer:** "I just deployed my contract. Verify it's working correctly"

**AI Agent Response:** The AI will:
1. Verify contract deployment
2. Test all public functions
3. Check initial state values
4. Confirm gas costs are reasonable

### Continuous Testing
**Developer:** "Set up automated testing for my contract on this testnet"

**AI Agent Response:** "I can help you create test scenarios that you can run regularly: function simulation, gas estimation, state verification, and integration testing with other contracts."

## Related Tools

- [Contract Tools](contracts.md) - Contract interaction for testing scenarios
- [Transaction Tools](transactions.md) - Transaction execution and monitoring
- [Wallet Tools](wallet.md) - Account setup for testing environments
- [Chain Tools](chains.md) - Multi-chain testing support