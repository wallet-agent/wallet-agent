# 🧪 Wallet Agent Testing Guide

This guide covers all testing scenarios for the Wallet Agent MCP server.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Testing with Real Blockchain](#testing-with-real-blockchain)
- [Writing Tests](#writing-tests)
- [CI/CD Testing](#cicd-testing)
- [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

```bash
# Run all tests (mock mode)
bun test

# Run tests with coverage
bun test --coverage

# Run specific test file
bun test test/integration/handlers/token.test.ts

# Run tests matching pattern
bun test --grep "transfer"
```

## 📁 Test Structure

```
test/
├── core/               # Core utility tests
├── effects/            # Effect layer tests
├── integration/        # Integration tests
│   ├── handlers/       # MCP handler tests
│   └── e2e/           # End-to-end scenarios
├── unit/              # Unit tests
├── utils/             # Test utilities
└── setup-transport.js  # Test transport configuration
```

## 🎯 Running Tests

### Basic Test Commands

```bash
# Run all tests
bun test

# Run with coverage report
bun test --coverage

# Run in watch mode
bun test --watch

# Run specific test suite
bun test test/integration/handlers/wallet.test.ts

# Run tests matching a pattern
bun test --grep "wallet"
```

### Test Modes

The integration tests support two modes:

#### 1. **Mock Mode** (Default)
- Uses Wagmi's mock connector
- Fast execution
- No real blockchain needed
- Ideal for rapid development

```bash
bun test
```

#### 2. **Anvil Mode** 
- Tests against real Anvil blockchain
- Validates actual blockchain behavior
- Tests gas estimation
- Verifies contract interactions

```bash
USE_REAL_ANVIL=true bun test
```

## 🔗 Testing with Real Blockchain

### Option 1: Local Anvil (Requires Foundry)

```bash
# Install Foundry (if not already installed)
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Start Anvil
anvil --host 0.0.0.0 --port 8545

# Run tests in another terminal
USE_REAL_ANVIL=true bun test
```

### Option 2: Docker Anvil (No Installation Required)

```bash
# Start Anvil container
docker run -d --name anvil -p 8545:8545 \
  -e ANVIL_IP_ADDR=0.0.0.0 \
  ghcr.io/foundry-rs/foundry:latest anvil

# Run tests
USE_REAL_ANVIL=true bun test

# Clean up when done
docker stop anvil && docker rm anvil
```

### Anvil Test Scripts

```bash
# Run all tests with Anvil
bun run test:anvil

# Test specific handlers
bun run test:anvil:tokens       # Token operations
bun run test:anvil:transactions  # Transaction operations
bun run test:anvil:contracts    # Contract interactions

# CI testing scripts
bun run test:ci                 # Start Anvil in Docker and run all tests
bun run test:ci:separate        # Run tests with existing Anvil instance
```

### Benefits of Anvil Testing

- ✅ Real blockchain transaction validation
- ✅ Accurate gas estimation testing
- ✅ Contract deployment and interaction
- ✅ Network error handling
- ✅ Fork mainnet state testing

## ✍️ Writing Tests

### Integration Test Example

```typescript
import { describe, it, expect } from "bun:test";
import { 
  setupContainer, 
  expectToolSuccess, 
  expectToolExecutionError 
} from "./setup.js";

describe("My Feature", () => {
  setupContainer(); // Reset container state

  it("should do something", async () => {
    // Connect wallet
    await expectToolSuccess("connect_wallet", {
      address: TEST_ADDRESS_1
    });

    // Test your feature
    const result = await expectToolSuccess("my_tool", {
      param: "value"
    });

    expect(result.text).toContain("Success");
  });

  it("should handle errors", async () => {
    await expectToolExecutionError(
      "my_tool",
      { invalid: "params" },
      "Expected error message"
    );
  });
});
```

### Unit Test Example

```typescript
import { describe, it, expect } from "bun:test";
import { myFunction } from "../../src/myModule.js";

describe("myFunction", () => {
  it("should return expected value", () => {
    const result = myFunction("input");
    expect(result).toBe("expected output");
  });
});
```

### Test Utilities

```typescript
// Test addresses
export const TEST_ADDRESS_1 = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
export const TEST_ADDRESS_2 = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

// Test helpers
expectToolSuccess(toolName, args)      // Expect successful execution
expectToolExecutionError(...)          // Expect execution error
expectToolValidationError(...)         // Expect validation error
setupContainer()                       // Reset container state
```

## 🔄 CI/CD Testing

### GitHub Actions

Our CI pipeline runs:
1. Type checking (`bun run typecheck`)
2. Linting (`bun run lint`)
3. Unit tests with coverage
4. Integration tests with Anvil

### Local CI Testing

```bash
# Run the same tests as CI
bun run test:ci

# Just type checking
bun run typecheck

# Just linting
bun run lint

# Format code
bun run lint:fix
```

### Coverage Requirements

- Minimum coverage: 80%
- Target coverage: 90%
- View coverage report: `bun test --coverage`

## 🐛 Troubleshooting

### Common Issues

#### 1. **Anvil Connection Failed**
```bash
# Check if Anvil is running
curl http://localhost:8545

# Check Docker logs
docker logs anvil
```

#### 2. **Test Timeout**
```bash
# Increase timeout for slow tests
USE_REAL_ANVIL=true bun test --timeout 30000
```

#### 3. **State Contamination**
```typescript
// Always use setupContainer() to reset state
describe("My Test", () => {
  setupContainer(); // Important!
  // ... tests
});
```

#### 4. **Gas Estimation Errors**
```bash
# Use real Anvil for accurate gas tests
USE_REAL_ANVIL=true bun test test/integration/handlers/transactions.test.ts
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=true bun test

# Debug specific test
DEBUG=true bun test -t "specific test name"
```

## 📊 Test Categories

### Unit Tests
- Pure functions
- Utility modules
- Schema validation
- No external dependencies

### Integration Tests
- MCP handler tests
- Multi-component interactions
- Mock blockchain tests
- Contract interactions

### E2E Tests
- Complete user workflows
- Real blockchain tests
- Performance testing
- Error scenarios

## 🎯 Best Practices

1. **Always reset state**: Use `setupContainer()` in integration tests
2. **Test both modes**: Ensure tests work in mock and Anvil modes
3. **Use descriptive names**: Clear test descriptions help debugging
4. **Test error cases**: Always test validation and error handling
5. **Keep tests focused**: One concept per test
6. **Use test utilities**: Leverage helper functions for consistency

## 🔗 Related Documentation

- [Contributing Guide](../CONTRIBUTING.md)
- [Development Setup](../README.md#development)
- [CI/CD Configuration](../.github/workflows/ci.yml)

---

For more information or to report testing issues, please [open an issue](https://github.com/shanev/wallet-agent/issues).