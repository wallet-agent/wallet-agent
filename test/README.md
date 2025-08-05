# Testing Guide

## Quick Start

```bash
# Run all tests
bun test

# Run with coverage
bun test --coverage

# Run specific test
bun test test/integration/handlers/token.test.ts

# Run tests matching pattern
bun test --grep "transfer"
```

## Test Structure

```
test/
├── core/               # Core utility tests
├── effects/            # Effect layer tests  
├── integration/        # Integration tests
│   └── handlers/       # MCP handler tests
├── unit/              # Unit tests
└── utils/             # Test utilities
```

## Test Modes

### Mock Mode (Default)
Fast execution with Wagmi's mock connector. No real blockchain needed.

```bash
bun test
```

### Anvil Mode
Tests against real Anvil blockchain for accurate gas estimation and contract interactions.

```bash
USE_REAL_ANVIL=true bun test
```

## Testing with Anvil

### Local Installation
```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Start Anvil
anvil --host 0.0.0.0 --port 8545

# Run tests
USE_REAL_ANVIL=true bun test
```

### Docker (No Installation)
```bash
# Start Anvil
docker run -d --name anvil -p 8545:8545 \
  -e ANVIL_IP_ADDR=0.0.0.0 \
  ghcr.io/foundry-rs/foundry:latest anvil

# Run tests
USE_REAL_ANVIL=true bun test

# Clean up
docker stop anvil && docker rm anvil
```

## Writing Tests

### Integration Test
```typescript
import { describe, it, expect } from "bun:test";
import { setupContainer, expectToolSuccess } from "./setup.js";

describe("My Feature", () => {
  setupContainer(); // Reset state

  it("should work", async () => {
    await expectToolSuccess("connect_wallet", {
      address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    });

    const result = await expectToolSuccess("my_tool", {
      param: "value"
    });

    expect(result.text).toContain("Success");
  });
});
```

### Test Utilities
- `expectToolSuccess(tool, args)` - Expect successful execution
- `expectToolExecutionError(...)` - Expect execution error  
- `expectToolValidationError(...)` - Expect validation error
- `setupContainer()` - Reset container state

## CI/CD

```bash
# Run CI tests locally
bun run test:ci

# Type checking
bun run typecheck

# Linting
bun run lint
bun run lint:fix
```

Coverage requirements:
- Minimum: 80%
- Target: 90%

## Troubleshooting

### Anvil Connection Failed
```bash
# Check if running
curl http://localhost:8545

# Check Docker logs
docker logs anvil
```

### Test Timeout
```bash
USE_REAL_ANVIL=true bun test --timeout 30000
```

### State Contamination
Always use `setupContainer()` to reset state between test suites.

### Debug Mode
```bash
DEBUG=true bun test -t "specific test name"
```

## Best Practices

1. Reset state with `setupContainer()` in integration tests
2. Test both mock and Anvil modes
3. Use descriptive test names
4. Test error cases
5. Keep tests focused on one concept

---

For issues, please [open an issue](https://github.com/wallet-agent/wallet-agent/issues).