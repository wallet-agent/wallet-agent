/**
 * Test-specific container implementation that eliminates singleton issues
 * Each test gets its own isolated container instance
 */

import type { Address } from "viem"
import { Container, type ContainerOptions } from "./container.js"
import { clearContractResolutionCache } from "./core/contract-resolution.js"

/**
 * Test container that provides isolated instances for each test
 * Never uses singleton pattern - each test gets a fresh instance
 */
export class TestContainer extends Container {
  private static testInstances = new WeakMap<object, TestContainer>()

  /**
   * Create an isolated container for a specific test context
   * @param testContext - Unique object to identify the test (typically the test function or describe block)
   * @param options - Container configuration options
   */
  static createForTest(testContext: object, options: ContainerOptions = {}): TestContainer {
    // Clear caches before creating new test container
    clearContractResolutionCache()

    // Always create a new instance - no singleton behavior
    const container = new TestContainer({
      // Default test-friendly options
      includeBuiltinChains: true,
      mockAccounts: [
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      ] as readonly Address[],
      // Override with provided options
      ...options,
    })

    // Store reference for cleanup but don't use it as singleton
    TestContainer.testInstances.set(testContext, container)
    return container
  }

  /**
   * Clean up test container (optional - GC will handle it)
   */
  static cleanupTest(testContext: object): void {
    const container = TestContainer.testInstances.get(testContext)
    if (container) {
      // Disconnect wallet if connected
      try {
        if (container.walletEffects.getCurrentAccount().isConnected) {
          container.walletEffects.disconnectWallet()
        }
      } catch {
        // Ignore cleanup errors
      }

      // Clear the reference
      TestContainer.testInstances.delete(testContext)
    }
  }

  /**
   * Create a test container with minimal setup for unit tests
   */
  static createMinimal(): TestContainer {
    return new TestContainer({
      includeBuiltinChains: false,
      chains: [],
      mockAccounts: ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"] as readonly Address[],
    })
  }

  constructor(options: ContainerOptions = {}) {
    super(options)

    // Ensure wallet starts in mock mode for tests
    this.walletEffects.setWalletType("mock")
  }
}

/**
 * Test-specific container provider that bypasses the singleton
 * Use this in tests instead of getContainer()
 */
export function createTestContainer(options?: ContainerOptions): TestContainer {
  return TestContainer.createForTest({}, options)
}

/**
 * Helper to create a container scoped to a specific test suite
 */
export function createSuiteContainer(suiteName: string, options?: ContainerOptions): TestContainer {
  return TestContainer.createForTest({ suiteName }, options)
}
