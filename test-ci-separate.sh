#!/bin/bash
# Script to run tests in separate processes to avoid test isolation issues

echo "Building Docker image..."
docker build -f Dockerfile.test -t wallet-agent-test .

echo "Running unit tests in Docker (CI mode)..."
docker run --rm \
  -e CI=true \
  -e NODE_ENV=test \
  wallet-agent-test bun test test/core test/effects test/schemas.test.ts

echo "Running integration tests in Docker (CI mode)..."
docker run --rm \
  -e CI=true \
  -e NODE_ENV=test \
  wallet-agent-test bun test test/integration