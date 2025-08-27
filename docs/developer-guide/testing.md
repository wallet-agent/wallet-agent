# Testing

This guide covers comprehensive testing strategies for Wallet Agent applications and integrations using natural language prompts with AI agents.

## Overview

Wallet Agent testing provides:
- **Safe Testing Environment**: Mock wallets and simulation for risk-free development
- **Multi-Chain Testing**: Test across different blockchain networks  
- **Real Blockchain Integration**: Anvil and testnet support
- **Natural Language Testing**: AI-powered testing workflows through conversational prompts
- **Comprehensive Validation**: Transaction testing, gas estimation, and contract simulation

## Testing Approaches

### Safe Development Testing

Wallet Agent prioritizes safety in testing workflows. When working with an AI agent, you can request safe testing setups with prompts like:

**Setting up safe testing environments:**
- "Use mock wallets for testing these contract functions"
- "Set up a clean testing environment for each test scenario"
- "Test with simulated transactions to avoid gas costs"
- "Create a fresh testing state for contract interaction testing"

### Testing Levels

1. **Unit Tests**: Individual function and module testing
2. **Integration Tests**: Multi-component interaction testing
3. **End-to-End Tests**: Complete workflow testing with real blockchain
4. **Performance Tests**: Load and stress testing

## Unit Testing

### Core Module Testing

When testing individual wallet components, you can use these conversational prompts with your AI agent:

**Wallet Connection Testing:**
- "Test that I can connect to a mock wallet account successfully"
- "Verify that wallet connection returns the correct address and connection status"
- "Test error handling when trying to connect with an invalid address format"
- "Ensure that connection attempts with malformed addresses throw appropriate error messages"

**Balance Query Testing:**
- "Test getting ETH balance for a connected wallet and verify it returns a valid string"
- "Check that balance queries return positive values for funded test accounts"
- "Test balance retrieval for specific addresses without requiring wallet connection"
- "Verify that balance queries handle different address formats correctly"

**Account Management Testing:**
- "Test retrieving the list of available mock accounts"
- "Verify that account information includes required fields like address and balance"
- "Test switching between different mock accounts in the test environment"
- "Ensure that account operations maintain state consistency across test runs"

### Utility Function Testing

When testing core validation and utility functions, use these conversational testing prompts:

**Address Validation Testing:**
- "Test that valid Ethereum addresses pass validation when used in AI prompts"
- "Verify that the zero address is accepted as valid by the AI agent"
- "Test that invalid addresses are rejected with appropriate error messages"
- "Ensure addresses that are too short or contain invalid characters fail validation"
- "Test edge cases like empty strings and malformed addresses in AI prompts"

**Amount Validation Testing:**
- "Test that valid decimal amounts pass validation when used in AI prompts"
- "Verify that whole numbers and very small decimal amounts are handled correctly"
- "Test that invalid amounts like negative numbers are rejected with helpful error messages"
- "Ensure non-numeric strings in amounts trigger validation errors in AI responses"
- "Test boundary conditions like very large amounts in AI prompts"

**Input Sanitization Testing:**
- "Test that user input is properly sanitized before processing in all validation functions"
- "Verify that special characters and potential injection attempts are handled safely"
- "Test Unicode handling and international number formats in validation routines"

## Integration Testing

### Multi-Component Workflows

When testing complete wallet workflows that involve multiple components working together, use these comprehensive prompts:

**Complete Wallet Workflow Testing:**
- "Test the full wallet workflow: get accounts, connect wallet, check balance, send transaction, and verify receipt"
- "Walk through the entire user journey from wallet connection to transaction completion"
- "Verify that each step in the workflow returns expected data types and valid transaction hashes"
- "Test that transaction status progresses correctly from pending to success"
- "Ensure that transaction receipts contain all required fields like status and gas usage"

**Chain Switching Workflow Testing:**
- "Test switching from Anvil to Sepolia testnet and verify all operations still work"
- "Connect to a wallet, switch chains, and confirm that balance queries work on the new chain"
- "Test that wallet info reflects the correct chain ID after switching"
- "Verify that chain-specific operations like gas estimation work after chain changes"
- "Test error handling when switching to unsupported or custom chain IDs"

**State Management Integration:**
- "Test that wallet state persists correctly across multiple operations"
- "Verify that connection status remains consistent during complex workflows"
- "Test that cache invalidation works properly when switching chains or accounts"

### Token Operations Integration

When testing complete ERC-20 token workflows, use these integration testing prompts:

**ERC-20 Token Workflow Testing:**
- "Set up a test environment with Wagmi contract configuration loaded for token testing"
- "Test the complete ERC-20 workflow: get token balance, retrieve token info, approve spending, and transfer tokens"
- "Connect a wallet and verify that all token operations work with the connected account"
- "Test token balance queries and ensure they return properly formatted string values"
- "Verify that token info includes required fields like name, symbol, and decimals"

**Token Transaction Testing:**
- "Test token approval transactions and verify they return valid transaction hashes"
- "Test token transfers between accounts and confirm successful transaction completion"
- "Test approving maximum allowance and verify the approval transaction processes correctly"
- "Test token operations with different amount formats and decimal precision"

**Contract Integration Testing:**
- "Load Wagmi configuration from generated.ts and test that all token contracts are accessible"
- "Test token operations across different contracts defined in the Wagmi config"
- "Verify that contract address resolution works for both contract names and direct addresses"
- "Test error handling when interacting with non-existent or invalid token contracts"

## End-to-End Testing

### Real Blockchain Testing

For end-to-end testing with real blockchain networks, use these comprehensive testing prompts:

**Anvil Integration Testing:**
- "Set up E2E testing with a real Anvil instance running locally"
- "Skip tests if USE_REAL_ANVIL environment variable is not set to true"
- "Configure test environment to connect to Anvil on chain ID 31337"
- "Import a test private key for real transaction testing on Anvil"

**Real Blockchain Operations:**
- "Test switching to private key wallet mode and verify real balance queries work"
- "Load Wagmi configuration and test reading from deployed smart contracts"
- "Test contract write operations and verify they return valid transaction hashes"
- "Execute a contract function like 'increment' on a Counter contract and wait for transaction confirmation"
- "Verify that transaction receipts include gas usage and success status for real transactions"

**Contract Deployment Testing:**
- "Test deploying contracts to Anvil and verify they're accessible through the wallet agent"
- "Test contract interaction workflows from deployment through function calls"
- "Verify that contract state changes persist across multiple function calls"
- "Test contract events and logs are properly captured in transaction receipts"

### Cross-Chain E2E Testing

For testing across multiple blockchain networks, use these cross-chain testing prompts:

**Multi-Chain Testing Setup:**
- "Set up cross-chain testing that skips unless USE_REAL_CHAINS environment variable is enabled"
- "Configure test environment to work with both Anvil (31337) and Sepolia (11155111) chains"
- "Test switching between multiple chains and verify operations work on each"

**Cross-Chain Operations:**
- "Test wallet operations across Anvil and Sepolia testnet sequentially"
- "Switch to each chain and verify balance queries return valid results"
- "Test that chain-specific gas estimation works correctly on different networks"
- "Verify that contract operations work consistently across different EVM chains"
- "Log balance information for each tested chain to verify different network states"

**Network Configuration Testing:**
- "Test adding custom chain configurations and switching to them"
- "Verify that chain metadata like native currency symbols are correct for each network"
- "Test error handling when attempting to switch to unsupported chain IDs"
- "Test that RPC endpoints respond correctly for all configured chains"

## Performance Testing

### Load Testing

When testing system performance under load, use these performance-focused prompts:

**Concurrent Operations Testing:**
- "Test 50 concurrent balance queries and measure total execution time"
- "Set up a connected wallet and execute multiple balance queries simultaneously"
- "Verify that all concurrent operations return valid string balance values"
- "Ensure that 50 concurrent balance queries complete within 5 seconds"
- "Log the total duration and verify system handles concurrent load appropriately"

**Transaction Estimation Performance:**
- "Test rapid gas estimation with 20 concurrent requests using different transaction amounts"
- "Set up sequential gas estimations with incrementing ETH values from 0.01 to 0.20"
- "Measure and log the total time for batch gas estimation operations"
- "Verify that all gas estimates return valid bigint values greater than zero"
- "Test that gas estimation performance scales appropriately with request volume"

**Throughput Testing:**
- "Test system throughput with high-frequency wallet operations"
- "Measure response times for batch operations under sustained load"
- "Test that caching mechanisms improve performance for repeated operations"
- "Verify that system maintains responsiveness during peak operation periods"

### Memory Testing

When testing for memory leaks and resource management, use these memory-focused prompts:

**Memory Leak Detection:**
- "Test for memory leaks by performing 100 repeated balance query operations"
- "Set up a connected wallet and measure initial memory usage before testing"
- "Execute balance queries in a loop with periodic garbage collection every 10 iterations"
- "Measure final memory usage and calculate the total memory increase"
- "Verify that memory increase stays under 10MB after 100 operations"

**Resource Management Testing:**
- "Test that repeated operations don't accumulate excessive memory usage"
- "Monitor heap usage during sustained wallet operations"
- "Verify that garbage collection effectively cleans up temporary objects"
- "Test memory usage patterns during different types of wallet operations"
- "Log memory statistics to identify potential memory leak patterns"

**Long-Running Process Testing:**
- "Test memory stability during extended wallet operation sessions"
- "Monitor memory usage over extended periods of repeated operations"
- "Test that caches don't grow unbounded during long-running sessions"
- "Verify that connection pools and client instances are properly managed"

## Test Configuration

### Jest Configuration

When setting up test configuration with an AI agent, use these setup prompts:

**Basic Jest Setup:**
- "Configure Jest with TypeScript support using ts-jest preset"
- "Set up Jest to run in Node.js environment for wallet testing"
- "Configure test file discovery to find all .test.ts files in the test directory"
- "Set up TypeScript transformation for ES modules with proper import handling"

**Coverage Configuration:**
- "Configure test coverage collection for all source files except type definitions"
- "Exclude test utilities from coverage reporting"
- "Set up coverage reporting with text, lcov, and HTML formats"
- "Configure coverage directory to output reports in ./coverage folder"

**Test Environment Setup:**
- "Set up test timeout to 30 seconds for blockchain operations"
- "Configure Jest to handle ES modules with proper extension mapping"
- "Set up after-environment configuration file at test/setup.ts"
- "Configure Jest globals for TypeScript ES module support"

### Test Setup

When configuring test setup and custom matchers, use these setup prompts:

**Global Test Configuration:**
- "Set up global test configuration with NODE_ENV set to 'test'"
- "Configure beforeAll and afterAll hooks for test suite initialization and cleanup"
- "Set up testing utilities for use across all test files"
- "Set up environment variables needed for testing blockchain operations"

**Custom Test Matchers:**
- "Create a custom Jest matcher to validate transaction hashes match the pattern 0x[64 hex chars]"
- "Set up a custom matcher to validate Ethereum addresses match the pattern 0x[40 hex chars]"
- "Configure custom matchers with descriptive error messages for test failures"
- "Add TypeScript type declarations for custom matchers to ensure type safety"

**Test Utilities Setup:**
- "Configure test utilities for commonly used testing patterns"
- "Set up helper functions for wallet connection and transaction waiting"
- "Create reusable test patterns for common wallet operations"
- "Configure test teardown to ensure clean state between test runs"

## Test Utilities

### Helper Functions

When creating reusable test utilities, use these utility-focused prompts:

**Wallet Setup Helpers:**
- "Create a helper function that sets up a connected wallet for testing and returns accounts"
- "Build a reusable utility to get accounts and connect the first account automatically"
- "Set up a helper that returns both the testing environment and available accounts for testing"

**Transaction Testing Utilities:**
- "Create a helper function to wait for transaction confirmation with configurable timeout"
- "Build a utility that polls transaction receipts until status changes from pending"
- "Set up transaction waiting with 1-second intervals and 30-second default timeout"
- "Handle transaction not found errors during the waiting period gracefully"

**Test Data Generation:**
- "Create a helper to generate random Ethereum addresses for testing"
- "Build utilities to create test data like random addresses using crypto.getRandomValues"
- "Set up helper functions to generate valid hex addresses with proper formatting"

**Performance Measurement Utilities:**
- "Create a helper function to measure execution time of async operations"
- "Build a utility that times operations and returns both result and duration"
- "Set up performance measurement helpers for timing wallet operations"

**Usage Examples:**
- "Show how to use test helpers in actual test cases for wallet operations"
- "Demonstrate measuring balance query execution time using the performance helper"
- "Use the connected wallet setup helper in test scenarios"

## CI/CD Integration

### GitHub Actions

When setting up continuous integration for wallet testing, use these CI/CD prompts:

**Basic CI Pipeline Setup:**
- "Set up GitHub Actions workflow that runs on push and pull request events"
- "Configure the CI pipeline to run on ubuntu-latest with Bun package manager"
- "Set up Bun installation using oven-sh/setup-bun action with latest version"
- "Configure package installation step using 'bun install' command"

**Test Execution Stages:**
- "Set up unit test execution using 'bun test test/unit' command"
- "Configure integration test stage with 'bun test test/integration'"
- "Add Anvil startup step with background execution and 5-second wait"
- "Set up E2E test execution with USE_REAL_ANVIL environment variable"
- "Configure test private key from GitHub secrets for blockchain testing"

**Coverage and Reporting:**
- "Add test coverage generation step using 'bun test --coverage'"
- "Set up coverage upload to Codecov using codecov-action@v3"
- "Configure coverage reporting to track test quality over time"
- "Ensure all test stages complete successfully before deployment"

### Test Scripts

When setting up package.json test scripts for development workflows, use these script setup prompts:

**Basic Test Scripts:**
- "Set up a basic 'test' script that runs the default Jest configuration"
- "Create separate scripts for unit, integration, and E2E test execution"
- "Configure 'test:unit' script to run only unit tests in test/unit directory"
- "Set up 'test:integration' script to run integration tests in test/integration"

**Development Scripts:**
- "Create 'test:watch' script for development with Jest watch mode"
- "Set up 'test:coverage' script to generate coverage reports during development"
- "Configure 'test:e2e' script with USE_REAL_ANVIL environment variable"

**Anvil Integration Scripts:**
- "Create 'test:anvil' script that starts Anvil and runs E2E tests concurrently"
- "Set up concurrent execution of Anvil startup and test execution with proper timing"
- "Configure the script to wait 5 seconds for Anvil startup before running tests"
- "Ensure the Anvil integration script handles both startup and test execution properly"

## Best Practices

### Test Organization

When organizing your test suite, discuss these practices with your AI agent:

**Descriptive Test Naming:**
- "Help me create clear, descriptive test names that explain what functionality is being tested"
- "Review my test names to ensure they describe the expected behavior clearly and concisely"
- "Suggest better test naming patterns for wallet functionality testing"

**Logical Test Grouping:**
- "Organize related tests into logical describe blocks based on functionality"
- "Group wallet connection tests separately from transaction tests"
- "Create test suites that group by feature area like token operations, chain management, etc."

**Test Isolation Practices:**
- "Ensure each test runs independently without relying on state from previous tests"
- "Set up proper test environment management with clean state for each test"
- "Help me identify and fix tests that have hidden dependencies on other tests"

### Performance

When optimizing test performance, use these optimization prompts:

**Parallel Test Execution:**
- "Configure tests to run concurrently where possible to reduce total test time"
- "Identify which tests can safely run in parallel and which need sequential execution"
- "Help optimize test execution time while maintaining test reliability"

**Resource Management:**
- "Set up proper cleanup between tests to prevent resource leaks"
- "Ensure testing environments and blockchain connections are properly disposed"
- "Help identify and fix resource management issues in test setup"

**Development Testing Strategies:**
- "Set up focused testing during development to run only relevant test suites"
- "Configure appropriate timeouts for different types of blockchain operations"
- "Create efficient test feedback loops for rapid development cycles"

### Reliability

For building reliable tests, engage with these testing principles:

**Comprehensive Error Testing:**
- "Help me test both success and failure scenarios for each wallet operation"
- "Ensure error handling paths are properly tested with appropriate error messages"
- "Test edge cases and boundary conditions for input validation"

**Async Operation Management:**
- "Review my tests to ensure all async operations are properly awaited"
- "Help identify and fix race conditions in test execution"
- "Ensure transaction waiting and blockchain operations are handled correctly"

**State Verification:**
- "Help me verify that operations produce expected state changes"
- "Ensure test assertions check both direct results and observable effects"
- "Create deterministic test scenarios that produce predictable outcomes"

## Debugging Tests

### Logging and Debugging

When debugging test issues, use these diagnostic prompts with your AI agent:

**Debug Logging Setup:**
- "Enable debug logging for wallet-agent tests by setting DEBUG environment variable"
- "Set up custom debug logging for test operations with descriptive messages"
- "Create debug statements at key points in test execution for troubleshooting"
- "Configure debug logging to track test environment setup and operations"

**Test Operation Tracking:**
- "Add debug statements to track test progression through complex operations"
- "Log key milestones in test execution like 'Starting test operation' and 'Test completed'"
- "Set up debug output that helps identify where tests fail or hang"
- "Use debug logging to trace the flow of multi-step wallet operations"

### Test Inspection

When you need detailed inspection of test results, use these analysis prompts:

**Transaction Detail Inspection:**
- "Help me inspect transaction details including receipts, gas usage, and status"
- "Set up detailed logging of transaction receipts with formatted JSON output"
- "Create inspection utilities that log transaction hashes, gas used, and other metadata"
- "Add comprehensive transaction analysis to help debug failed operations"

**State Inspection Utilities:**
- "Create utilities to inspect wallet state during test execution"
- "Log detailed information about account balances, connection status, and chain state"
- "Set up inspection helpers that dump relevant state information for debugging"
- "Add logging that helps understand why tests fail by showing current system state"

**Debugging Workflows:**
- "Help me debug test failures by adding appropriate logging and inspection points"
- "Create debugging workflows that systematically check each step of complex operations"
- "Set up test debugging that captures both successful and failed operation details"

## Next Steps

- [Contract Testing](contract-testing.md) - Specialized contract testing strategies
- [API Reference](../api-reference/mcp-tools/testing.md) - Testing tool reference
- [Contributing](../contributing/testing.md) - Contributing testing guidelines