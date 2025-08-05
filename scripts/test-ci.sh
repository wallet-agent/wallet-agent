#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Anvil in Docker...${NC}"

# Start Anvil container
docker run -d --name test-anvil -p 8545:8545 ghcr.io/foundry-rs/foundry:latest anvil --host 0.0.0.0

# Wait for Anvil to be ready
echo -e "${YELLOW}Waiting for Anvil to be ready...${NC}"
sleep 2  # Give Anvil a moment to start

# Check if Anvil is running
if ! docker ps | grep -q test-anvil; then
  echo -e "${RED}Anvil container failed to start${NC}"
  docker logs test-anvil
  docker rm -f test-anvil
  exit 1
fi

# Check if port is accessible by testing JSON-RPC endpoint
for i in {1..20}; do
  if curl -s -X POST http://localhost:8545 \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
    2>/dev/null | grep -q "result"; then
    echo -e "${GREEN}Anvil is ready!${NC}"
    break
  fi
  if [ $i -eq 20 ]; then
    echo -e "${RED}Anvil is running but port 8545 is not responding to RPC calls${NC}"
    echo "Container status:"
    docker ps -a | grep test-anvil
    echo "Container logs:"
    docker logs test-anvil
    docker rm -f test-anvil
    exit 1
  fi
  echo -n "."
  sleep 1
done
echo ""

# Run tests
echo -e "${YELLOW}Running tests...${NC}"
USE_REAL_ANVIL=true NODE_ENV=test bun test

# Capture test exit code
TEST_EXIT_CODE=$?

# Clean up
echo -e "${YELLOW}Cleaning up...${NC}"
docker stop test-anvil
docker rm test-anvil

# Exit with test exit code
if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}All tests passed!${NC}"
else
  echo -e "${RED}Tests failed with exit code $TEST_EXIT_CODE${NC}"
fi

exit $TEST_EXIT_CODE