# Testing with Real Anvil Blockchain

By default, all tests run with mock transports that simulate blockchain responses without requiring a real blockchain connection. However, for integration testing or debugging purposes, you can run tests against a real Anvil blockchain instance.

## Quick Start

1. **Start Anvil** (requires Foundry):
   ```bash
   anvil --host 0.0.0.0 --port 8545
   ```

2. **Run tests with real Anvil**:
   ```bash
   USE_REAL_ANVIL=true bun test
   ```

## Setup Options

### Option 1: Local Foundry Installation

Install Foundry and run Anvil directly:

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Start Anvil
anvil --host 0.0.0.0 --port 8545
```

### Option 2: Docker

Use the official Foundry Docker image:

```bash
# Start Anvil in Docker
docker run -d --name anvil -p 8545:8545 \
  ghcr.io/foundry-rs/foundry:latest \
  anvil --host 0.0.0.0

# Check if Anvil is ready
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Stop Anvil when done
docker stop anvil
```

## Environment Variables

- `USE_REAL_ANVIL=true` - Forces tests to use real Anvil instead of mocks
- `NODE_ENV=test` - Ensures test environment (automatically set by `bun test`)

## Test Transport Configuration

The test transport system automatically switches between mocks and real blockchain based on the `USE_REAL_ANVIL` environment variable:

```typescript
// In test setup
const transport = createTestTransport({
  useRealNetwork: process.env.USE_REAL_ANVIL === "true",
  mockResponses: customMockResponses,
});
```

## Benefits of Each Approach

### Mock Transport (Default)
- ✅ Fast test execution
- ✅ No external dependencies
- ✅ Deterministic results
- ✅ Works in CI/CD without setup
- ✅ Isolated test environment

### Real Anvil
- ✅ Tests actual blockchain interactions
- ✅ Validates RPC call formatting
- ✅ Tests against real EVM behavior
- ✅ Better integration testing
- ❌ Slower test execution
- ❌ Requires Anvil setup
- ❌ Potential for network-related flakiness

## Development Workflow

For most development, use the default mock transport:

```bash
# Fast test execution with mocks
bun test
```

When debugging blockchain interactions or preparing for release:

```bash
# Start Anvil
anvil --host 0.0.0.0 --port 8545

# Run tests against real blockchain
USE_REAL_ANVIL=true bun test

# Run specific test file with real Anvil
USE_REAL_ANVIL=true bun test test/integration/handlers/transactions.test.ts
```

## Troubleshooting

### Connection Refused
```
Error: connect ECONNREFUSED 127.0.0.1:8545
```
- Ensure Anvil is running on port 8545
- Check that no firewall is blocking the connection

### RPC Method Not Found
```
Error: RPC method not supported
```
- Verify you're using a recent version of Anvil
- Some advanced features might require specific Anvil configurations

### Tests Timing Out
```
Error: Test timeout exceeded
```
- Anvil might be slow to respond
- Try restarting Anvil
- Check system resources

## Mock Transport Limitations

The mock transport simulates common RPC responses but may not cover all edge cases:

- Complex contract interactions might need specific mock responses
- Gas estimation uses fixed values
- Block timestamps are static
- Event logs are simplified

When encountering test failures that might be mock-related, try running with real Anvil to verify the actual blockchain behavior.