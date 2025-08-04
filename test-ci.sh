#!/bin/bash
# Script to run tests in CI-like Docker environment

echo "Building Docker image..."
docker build -f Dockerfile.test -t wallet-agent-test .

echo "Running tests in Docker (CI mode)..."
docker run --rm \
  -e CI=true \
  -e NODE_ENV=test \
  wallet-agent-test "$@"