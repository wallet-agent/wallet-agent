# Testing Tools

MCP tools for development, testing, and validation with AI agents.

## Overview

Testing tools enable AI agents to help developers validate transactions, simulate operations, and debug blockchain interactions through prompts. These tools are essential for safe development and testing workflows.

## Tools

### simulate_contract_call

Simulate a contract function call without gas costs or state changes.

**Tool Name:** `simulate_contract_call`

**What you provide:**
- Contract name from your loaded Wagmi configuration
- Function name to simulate
- Function arguments (optional, depending on the function)
- ETH value to send with call (optional, for payable functions)
- Caller address (optional, defaults to connected wallet)
- Custom contract address (optional, if different from configuration)

**What the AI returns:**
- Simulation success/failure status
- Return value from the function call
- Estimated gas usage
- Detailed error message if simulation fails
- Debugging tips and next steps

**Example Prompts:**
- "Simulate calling transfer with 100 tokens to address 0x123..."
- "Test the mint function before executing it"
- "Preview calling deposit with 0.5 ETH"
- "Simulate increment function on my Counter contract"
- "Check if this risky transaction would succeed"

**AI Agent Response:**
The AI agent will simulate the contract call and report whether it would succeed or fail, including return values, gas estimates, and detailed error messages with debugging tips if the simulation fails.

**Errors:**
- `InvalidParams`: Invalid contract, function, or arguments
- `InvalidRequest`: Contract not loaded or wallet not connected
- `InternalError`: Simulation failed due to network or contract issues

---

### dry_run_transaction

Preview the complete effects of a transaction without executing it.

**Tool Name:** `dry_run_transaction`

**What you provide:**
- Contract name from your loaded configuration
- Function name to execute
- Function arguments (optional)
- ETH value to send (optional)
- Transaction sender address (optional)

**What the AI returns:**
- Complete transaction preview with expected results
- Success/failure prediction with detailed reasoning
- Gas requirements and cost estimation
- Return values and state changes
- Go/no-go recommendation with troubleshooting tips

**Example Prompts:**
- "Dry run a token transfer before sending it"
- "Preview the effects of calling this payable function"
- "Test this risky transaction before executing"
- "Check if this transaction would succeed"
- "What would happen if I called this function?"

**AI Agent Response:**
The AI agent will provide a comprehensive transaction preview, including success prediction, expected results, gas costs, and actionable recommendations on whether to proceed with the transaction.

**Errors:**
- `InvalidParams`: Invalid transaction parameters
- `InternalError`: Dry run failed due to network issues

---

### test_contract_function

Generate and run comprehensive test scenarios for a specific contract function.

**Tool Name:** `test_contract_function`

**What you provide:**
- Contract name from your loaded configuration
- Function name to test
- Include edge cases: true/false (defaults to true)

**What the AI returns:**
- Complete test suite results with pass/fail summary
- Individual test scenario results with descriptions
- Edge case testing results
- Success rate percentage
- Detailed failure reasons and debugging recommendations

**Example Prompts:**
- "Test all scenarios for the transfer function"
- "Run comprehensive tests on my contract's mint function"
- "Generate and run test cases for the deposit function"
- "Test edge cases for my contract function"
- "Validate my function handles all input types correctly"

**AI Agent Response:**
The AI agent will generate and execute multiple test scenarios, providing a comprehensive test report with pass/fail results, success rates, and detailed analysis of any failures.

**Errors:**
- `InvalidParams`: Invalid contract or function name
- `InternalError`: Test generation or execution failed

---

### test_contract

Run comprehensive tests on all functions in a contract.

**Tool Name:** `test_contract`

**What you provide:**
- Contract name from your loaded configuration
- Function type filter: "all", "view", "pure", "nonpayable", "payable" (defaults to "all")

**What the AI returns:**
- Contract testing overview with function counts
- Available functions organized by type
- Testing recommendations for each function type
- Guidance on using individual function testing tools

**Example Prompts:**
- "Test all functions in my Token contract"
- "Run tests on view functions only"
- "Test all payable functions in my contract"
- "Give me a testing overview of my NFT contract"
- "Analyze what functions I can test in this contract"

**AI Agent Response:**
The AI agent will provide a comprehensive overview of the contract's functions organized by type, with specific guidance on testing strategies and recommendations for using individual testing tools.

**Errors:**
- `InvalidParams`: Invalid contract name or function type
- `InternalError`: Failed to analyze contract for testing

---

### simulate_transaction

Simulate a contract transaction before execution to predict success or failure.

**Tool Name:** `simulate_transaction`

**Parameters:**
- `contract` - Contract name from loaded configuration
- `function` - Function name to call
- `args` - Function arguments (optional)
- `value` - ETH value to send (optional)
- `address` - Custom contract address (optional)

**Response:**
The AI agent provides simulation results including success status, function return values, error messages, gas estimates, and revert reasons if the transaction would fail.

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

**Tool Name:** `estimate_gas`

**Parameters:**
- `to` - Recipient address
- `value` - Amount in native token units (optional)
- `data` - Transaction data (optional)
- `from` - Sender address (optional, defaults to connected wallet)

**Response:**
The AI agent provides gas estimation including gas units, current gas price, total estimated cost in native currency, and currency symbol.

**Example Prompts:**
- "How much gas would it cost to send 1 ETH to Alice?"
- "Estimate gas for calling this contract function"
- "What's the gas cost for this transaction on the current network?"
- "Check gas fees before I execute this operation"
- "Calculate the transaction cost in USD"

**AI Agent Response:**
The AI agent will estimate the gas cost and display it in both gas units and the native currency (ETH, POL, etc.), along with current gas price information.

**Errors:**
- `InvalidParams`: Invalid address format
- `InternalError`: Gas estimation failed (contract revert, insufficient funds)

---

### get_transaction_receipt

Get detailed information about a completed transaction.

**Tool Name:** `get_transaction_receipt`

**Parameters:**
- `hash` - Transaction hash (0x...)

**Response:**
The AI agent provides comprehensive transaction details including transaction hash, block information, gas usage, status, events/logs, and confirmation count.

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

### Advanced Contract Function Testing
**Developer:** "Test all scenarios for my Counter contract's setNumber function"

**AI Agent Response:** The AI will:
1. Generate test scenarios: "Created 8 test cases including edge cases"
2. Execute tests: "Running positive values, zero, negative values, boundary conditions"
3. Report results: "6/8 tests passed. Function rejects negative values as expected."
4. Provide insights: "Function handles edge cases correctly with proper error messages"

### Contract Simulation Workflows
**Developer:** "Simulate calling the withdraw function with different amounts to find the maximum I can withdraw"

**AI Agent Response:** The AI will:
1. Test small amount: "withdraw(0.1 ETH): Success"
2. Test larger amount: "withdraw(1.0 ETH): Success"
3. Test maximum: "withdraw(2.5 ETH): Would fail - insufficient contract balance"
4. Recommend: "Maximum safe withdrawal: 2.3 ETH"

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

### Comprehensive Function Testing
**Developer:** "Run a complete test suite on my ERC20 token contract"

**AI Agent Response:** The AI will:
1. Analyze contract: "Found 15 functions: 8 view, 5 non-payable, 2 payable"
2. Test view functions: "All read functions work correctly"
3. Test state-changing functions: "Transfer, approve, mint functions tested with various scenarios"
4. Report results: "92% test success rate. 2 functions have access control restrictions as expected"

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

### Dry Run Transaction Preview
**Developer:** "Preview what would happen if I call the complex trading function with these parameters"

**AI Agent Response:** The AI will:
1. Analyze transaction: "Function would execute 3 internal operations"
2. Check preconditions: "Sufficient balance, valid parameters, proper approvals"
3. Estimate outcomes: "Would swap 1000 USDC for ~995 DAI, fee: 5 USDC"
4. Gas analysis: "Estimated 180K gas (~$12 at current prices)"
5. Recommendation: "Transaction ready to execute - all checks passed"

### Edge Case Testing
**Developer:** "Test my contract function with extreme values and edge cases"

**AI Agent Response:** The AI will:
1. Test boundary values: "Zero, maximum uint256, negative values"
2. Test invalid inputs: "Empty strings, null addresses, overflow scenarios"
3. Test state conditions: "Contract paused, insufficient funds, access restrictions"
4. Summarize: "Function properly handles 12/15 edge cases. 3 scenarios need additional validation"

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
2. Test all public functions using comprehensive test scenarios
3. Check initial state values with read operations
4. Simulate key functions to ensure they work as expected
5. Confirm gas costs are reasonable across different operations

### Contract Regression Testing
**Developer:** "I updated my contract. Test that all existing functionality still works"

**AI Agent Response:** The AI will:
1. Load new contract configuration
2. Run comprehensive test suite on all functions
3. Compare results with expected behavior
4. Identify any breaking changes or regressions
5. Provide detailed compatibility report

### Continuous Testing
**Developer:** "Set up automated testing for my contract on this testnet"

**AI Agent Response:** "I can help you create test scenarios that you can run regularly: comprehensive function testing with edge cases, contract simulation for critical operations, gas estimation tracking, state verification, and integration testing with other contracts."

### Advanced Testing Automation
**Developer:** "Create a testing workflow that validates my entire DeFi protocol"

**AI Agent Response:** The AI will:
1. Analyze protocol contracts: "Found Token, Staking, and Governance contracts"
2. Create integration tests: "Testing token approval → staking → reward claiming workflow"
3. Simulate complex scenarios: "Multi-user interactions, edge cases, failure modes"
4. Set up monitoring: "Gas optimization tracking, function success rates, error analysis"
5. Provide automation scripts: "Repeatable test suite for continuous validation"

## Related Tools

- [Contract Tools](contracts.md) - Contract interaction for testing scenarios
- [Transaction Tools](transactions.md) - Transaction execution and monitoring
- [Wallet Tools](wallet.md) - Account setup for testing environments
- [Chain Tools](chains.md) - Multi-chain testing support