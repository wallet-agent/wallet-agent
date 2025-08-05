# Test Scripts

This folder contains utility scripts for running integration tests with Anvil.

## Scripts

### test-ci.sh
All-in-one CI testing script that:
- Starts Anvil in a Docker container
- Waits for Anvil to be ready
- Runs all tests with `USE_REAL_ANVIL=true`
- Cleans up the Docker container
- Returns proper exit code for CI/CD pipelines

**Usage:**
```bash
./scripts/test-ci.sh
# or via npm/bun
bun run test:ci
```

### test-ci-separate.sh
Lightweight testing script for when Anvil is already running:
- Checks if Anvil is accessible on localhost:8545
- Runs all tests with `USE_REAL_ANVIL=true`
- Returns proper exit code

**Usage:**
```bash
# First, start Anvil separately
anvil --host 0.0.0.0 --port 8545

# Then run tests
./scripts/test-ci-separate.sh
# or via npm/bun
bun run test:ci:separate
```

## Requirements

- **test-ci.sh**: Requires Docker to be installed and running
- **test-ci-separate.sh**: Requires Anvil to be running on http://localhost:8545

## Exit Codes

Both scripts return:
- `0` - All tests passed
- Non-zero - Tests failed (exit code from test runner)