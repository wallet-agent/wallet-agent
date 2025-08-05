#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Running tests with existing Anvil...${NC}"
echo -e "${YELLOW}Make sure Anvil is running on http://localhost:8545${NC}"

# Check if Anvil is accessible
if ! curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  2>/dev/null | grep -q "result"; then
  echo -e "${RED}Anvil is not running or not accessible on http://localhost:8545${NC}"
  echo -e "${RED}Please start Anvil with: anvil --host 0.0.0.0 --port 8545${NC}"
  exit 1
fi

echo -e "${GREEN}Anvil is accessible!${NC}"

# Run tests
echo -e "${YELLOW}Running tests...${NC}"
USE_REAL_ANVIL=true NODE_ENV=test bun test

# Capture test exit code
TEST_EXIT_CODE=$?

# Exit with test exit code
if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}All tests passed!${NC}"
else
  echo -e "${RED}Tests failed with exit code $TEST_EXIT_CODE${NC}"
fi

exit $TEST_EXIT_CODE