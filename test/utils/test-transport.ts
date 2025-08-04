import { http, type Transport } from "viem";
import { createMockTransport, type MockResponses } from "./mock-transport.js";

export interface TestTransportConfig {
  useRealNetwork?: boolean;
  mockResponses?: MockResponses;
  rpcUrl?: string;
}

// Global test transport configuration
let globalTestConfig: TestTransportConfig = {};

/**
 * Set global test transport configuration
 * This allows tests to configure transport behavior
 */
export function setTestTransportConfig(config: TestTransportConfig): void {
  globalTestConfig = { ...globalTestConfig, ...config };
}

/**
 * Reset test transport configuration to defaults
 */
export function resetTestTransportConfig(): void {
  globalTestConfig = {};
}

/**
 * Create a transport for testing that can switch between mock and real network
 * @param config - Configuration for the transport
 */
export function createTestTransport(config: TestTransportConfig = {}): Transport {
  // Merge with global config, local config takes precedence
  const mergedConfig = { ...globalTestConfig, ...config };

  // Check if we should use real network
  const useReal = mergedConfig.useRealNetwork || process.env.USE_REAL_ANVIL === "true";

  if (useReal) {
    // Use real HTTP transport
    const rpcUrl = mergedConfig.rpcUrl || "http://localhost:8545";
    return http(rpcUrl);
  }

  // Use mock transport
  return createMockTransport(mergedConfig.mockResponses);
}

/**
 * Helper to create a test transport with specific mock responses
 */
export function createMockTestTransport(mockResponses?: MockResponses): Transport {
  return createTestTransport({ useRealNetwork: false, mockResponses });
}