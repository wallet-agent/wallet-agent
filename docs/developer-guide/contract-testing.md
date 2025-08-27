# Contract Testing

This guide covers comprehensive testing strategies for smart contracts integrated with Wallet Agent using prompts for AI agents.

## Overview

Contract testing with Wallet Agent provides:
- **Isolated Test Environments**: Clean state for each test
- **Multi-Chain Testing**: Test across different blockchain networks
- **Prompts for Testing**: Direct prompts to AI agents for test execution
- **Comprehensive Validation**: Transaction receipts, gas estimation, and simulation
- **Real Blockchain Testing**: Integration with Anvil for realistic conditions

## Test Environment Setup

### Test Container Configuration

**Developer Prompt:**
> "Set up an isolated test environment for contract testing. Create a fresh testing environment that automatically cleans up between tests and provides a clean state for each test case."

**AI Agent Response:**
The AI will create isolated testing environments and ensure proper cleanup between test runs.

### Anvil Integration

**Developer Prompt:**
> "Start a local Anvil blockchain for testing and configure the environment to run integration tests against real blockchain conditions."

**Setup Commands:**
```bash
# Start Anvil in separate terminal
anvil

# Run tests with real blockchain
USE_REAL_ANVIL=true bun test test/integration/contract-e2e.test.ts
```

### Test Configuration

**Developer Prompt:**
> "Configure the test environment to use Anvil chain (chainId 31337) with automatic wallet connection for streamlined testing."

## Contract Deployment Testing

### Deployment Verification

**Developer Prompt:**
> "Load the contract configuration from './src/generated.ts' and verify that the Counter contract is properly deployed. Check that it has a valid address and is accessible."

**Test Scenario:**
> "Verify the Counter contract has the correct initial state by reading the 'number' function and confirming it returns 0."

**Expected AI Response:**
The AI will load the Wagmi config, list available contracts, find the Counter contract, validate its address format (0x followed by 40 hex characters), and verify the initial state.

### Multi-Chain Deployment

**Developer Prompt:**
> "Test that contracts are properly deployed across multiple chains. Verify that the Counter contract exists on both Anvil (chain 31337) and Sepolia (chain 11155111) with different addresses."

**Test Scenario:**
> "Load the contract configuration and confirm that the same contract name exists on multiple chains but with different deployment addresses, proving independent deployments."

## Read Function Testing

### Basic Read Operations

**Developer Prompt:**
> "Test reading simple values from the Counter contract. Read the 'number' function and verify it returns a bigint value that's greater than or equal to 0."

**Developer Prompt:**
> "Test reading functions that require parameters. Call the 'balanceOf' function on the ERC20Token contract with address '0x742d35Cc6634C0532925a3b8D7389C4e0C5F0532' and verify it returns a bigint balance."

**Developer Prompt:**
> "Test reading view functions that return complex data types. Call the 'name' function on the ERC20Token contract and verify it returns a non-empty string."

### Error Handling in Reads

**Error Testing Scenario:**
> "Test error handling by attempting to call a non-existent function called 'nonExistentFunction' on the Counter contract. Verify that this throws an appropriate error."

**Error Testing Scenario:**
> "Test parameter validation by calling the 'balanceOf' function with an invalid address format like 'invalid-address'. Confirm this results in a validation error."

**Expected Behavior:**
The AI will set up test environments, execute the read operations, validate return types and values, and properly handle error cases with appropriate exception throwing.

## Write Function Testing

### Transaction Execution

**Developer Prompt:**
> "Test state-changing contract functions. First, read the initial value from the Counter contract's 'number' function, then call the 'increment' function, wait for transaction confirmation, and verify the value increased by 1."

**Expected Flow:**
1. AI reads initial counter value
2. Executes increment transaction and returns transaction hash (64-character hex string starting with 0x)
3. Waits for transaction receipt confirmation
4. Verifies the new counter value is exactly 1 more than the initial value

**Developer Prompt:**
> "Test functions that accept parameters. Call the Counter contract's 'setNumber' function with the value 42, wait for confirmation, then read back the number to verify it was set correctly."

**Test Scenario:**
> "Execute a parameterized write function and verify the state change by reading the updated value from the contract."

### Payable Functions

**Developer Prompt:**
> "Test payable functions that accept ETH transfers. Call the PayableContract's 'deposit' function and send 0.1 ETH with the transaction. Verify the transaction succeeds and the correct ETH amount was transferred."

**Expected Verification:**
The AI will execute the payable function, confirm the transaction receipt shows success status, and verify the transaction value equals 100000000000000000 wei (0.1 ETH).

## Gas Testing

### Gas Estimation

**Developer Prompt:**
> "Estimate the gas required for calling the Counter contract's increment function. Provide the contract address and function data, then verify the gas estimate is a positive bigint value."

**Gas Estimation Scenario:**
> "Estimate gas for a transaction to address '0x5FbDB2315678afecb367f032d93F642f64180aa3' with function data '0xd09de08a' (increment function selector) and confirm the estimate is greater than 0."

**Accuracy Testing Prompt:**
> "Compare gas estimates with actual gas usage. First estimate gas for the Counter increment function, then execute the actual transaction and verify the estimate is higher than actual usage (includes safety buffer) but not more than double the actual usage."

**Expected Results:**
The AI will provide gas estimates as bigint values, execute transactions, retrieve receipts, and compare estimated vs actual gas usage to validate estimation accuracy.

### Gas Optimization Testing

**Optimization Comparison Prompt:**
> "Compare gas usage between two similar functions to measure optimization effectiveness. Execute both 'optimizedFunction' and 'standardFunction' on the OptimizedContract, then compare their gas consumption to verify the optimized version uses less gas."

**Performance Analysis Request:**
> "Run parallel transactions for both functions, wait for their receipts, extract gas usage from each, and confirm the optimized function consumes less gas than the standard implementation."

## Transaction Simulation

### Pre-Execution Validation

**Success Simulation Prompt:**
> "Simulate the Counter contract's increment function before executing it. Verify the simulation returns success: true and provides a defined result, confirming the transaction would succeed if executed."

**Failure Detection Prompt:**
> "Simulate a transaction that should fail. Try calling the 'restrictedFunction' on the RestrictedContract and verify the simulation correctly identifies it will fail with an 'Access denied' error."

**Parameter Validation Testing:**
> "Test simulation with different parameters to validate contract logic. First simulate Counter's setNumber function with a valid value (100), then simulate ValidatedContract's setNumber with an invalid negative value (-1) to confirm the contract's validation logic works properly."

**Expected Simulation Results:**
- Successful simulations return `success: true` with a defined result
- Failed simulations return `success: false` with descriptive error messages
- Parameter validation is caught before actual transaction execution

## Event Testing

### Transaction Receipt Analysis

**Event Emission Testing:**
> "Test event emission by calling the EventEmitter contract's 'emitEvent' function with message 'test message'. After the transaction completes, analyze the receipt to verify events were emitted by checking that the logs array contains at least one entry."

**Event Data Verification:**
> "Verify event details in the transaction receipt. Check that the first log entry has the correct contract address and contains topics data, confirming the event was properly emitted with the expected structure."

**Expected Event Analysis:**
The AI will execute the event-emitting function, retrieve the transaction receipt, verify logs array is populated, and validate event log structure including contract address and topics array.

## Performance Testing

### Transaction Throughput

**Concurrent Transaction Testing:**
> "Test the system's ability to handle multiple concurrent transactions. Execute 10 simultaneous calls to Counter contract's setNumber function with different values (0 through 9). Verify all transactions complete successfully and return valid transaction hashes."

**Throughput Validation Request:**
> "Process multiple transactions in parallel and confirm the system can handle the load. Each transaction should return a 64-character hex string starting with 0x, proving all transactions were successfully submitted."

**Transaction Timing Analysis:**
> "Measure transaction confirmation performance. Execute a Counter increment transaction while tracking the time from submission to receipt confirmation. Verify the transaction succeeds and completes within a reasonable timeframe (under 10 seconds on Anvil)."

**Performance Expectations:**
- Multiple concurrent transactions should all succeed
- Transaction hashes should follow the standard format
- Local blockchain (Anvil) transactions should confirm quickly
- System should handle reasonable transaction loads without failures

## Integration Testing

### Multi-Contract Workflows

**Complex Workflow Testing:**
> "Test a multi-step token approval and usage workflow. First, approve the ERC20Token contract to let address '0x742d35Cc6634C0532925a3b8D7389C4e0C5F0532' spend 1 ETH worth of tokens. Then use the TokenUser contract to consume 0.5 ETH worth of approved tokens. Finally, verify the remaining allowance is exactly 0.5 ETH worth of tokens."

**Step-by-Step Integration:**
1. "Execute token approval for 1000000000000000000n tokens (1 ETH worth)"
2. "Wait for approval confirmation, then call TokenUser's useTokens function with 500000000000000000n tokens"
3. "Verify the transaction succeeds and check the remaining allowance equals 500000000000000000n"

**Multi-Contract Verification:**
> "Test the complete integration between ERC20 token contracts and contracts that consume those tokens. Verify state changes across both contracts and confirm the workflow maintains data consistency."

### Cross-Chain Testing

**Multi-Chain Contract Execution:**
> "Test contract operations across different blockchain networks. First, switch to Anvil chain (31337) and execute Counter's increment function. Then switch to Sepolia chain (11155111) and execute the same function. Verify both transactions succeed independently with different transaction hashes."

**Chain Independence Verification:**
> "Confirm that contract operations on different chains are completely independent. Execute identical operations on Anvil and Sepolia, then verify the transaction hashes are different, proving the operations occurred on separate networks."

**Expected Cross-Chain Behavior:**
- Contract operations succeed on all configured chains
- Transaction hashes are unique per chain
- State changes are isolated to their respective chains
- Chain switching works seamlessly

## Test Utilities

### Custom Test Helpers

**Helper Function Creation Request:**
> "Create reusable test helper functions that can verify contract deployments and execute transactions with automatic waiting. Include a deployAndVerify helper that checks if a contract is deployed by calling its name function, and an executeAndWait helper that executes a write function and waits for transaction confirmation."

**Contract Verification Helper:**
> "Build a helper that lists all contracts, finds a specific contract by name, attempts to call a read function (like 'name') to verify deployment, and returns both the contract information and deployment status."

**Transaction Execution Helper:**
> "Create a helper function that executes contract write functions, automatically waits for transaction receipts, and returns the transaction hash, receipt, and success status in a structured format."

**Helper Usage Example:**
> "Use the test helpers to verify the Counter contract is deployed and then execute its increment function. The helpers should handle all the async operations and provide clean success/failure indicators."

**Expected Helper Benefits:**
- Reduces boilerplate code in tests  
- Provides consistent error handling
- Simplifies complex testing workflows
- Enables reusable testing patterns across different contracts

## Best Practices

### Test Organization

1. **Isolated Tests**: Request each test with independent setup - "Set up a fresh test environment for this specific test case"
2. **Descriptive Prompts**: Use clear, specific language - "Test the Counter contract's increment function to verify it increases the value by exactly 1"
3. **Setup/Teardown**: Ask for proper environment management - "Create a fresh testing environment and clean up after the test"
4. **Async Operations**: Always request complete operations - "Execute the transaction and wait for confirmation before proceeding"

### Performance

1. **Parallel Execution**: Request concurrent testing - "Run multiple independent contract tests simultaneously to check system performance"
2. **Resource Cleanup**: Ask for cleanup - "Ensure test environments are properly cleaned between test runs"
3. **Selective Testing**: Focus testing requests - "Test only the specific contract functions that were recently modified"

### Reliability

1. **Transaction Confirmation**: Always request full verification - "Execute the transaction, wait for the receipt, and confirm success status"
2. **Error Handling**: Test both scenarios - "Test the successful case and also verify the function properly rejects invalid inputs"
3. **State Verification**: Request comprehensive checks - "After executing the transaction, read the contract state to verify the expected changes occurred"
4. **Gas Management**: Include performance checks - "Monitor gas usage and verify transactions complete within expected gas limits"

## Next Steps

- [Testing Guide](testing.md) - General testing strategies for Wallet Agent
- [Custom Chains](custom-chains.md) - Testing on custom blockchain networks
- [API Reference](../api-reference/mcp-tools/testing.md) - Testing tool reference