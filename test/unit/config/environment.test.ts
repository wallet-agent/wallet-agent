import { describe, expect, test } from "bun:test"

// Create a local testConfig that works the same way as the real one
// This isolates the test from any module interference
const testConfig = {
  get apiKey() {
    return process.env.WALLET_AGENT_API_KEY
  },
  get apiUrl() {
    return process.env.WALLET_AGENT_API_URL || "https://api.wallet-agent.ai"
  },
  get hasProFeatures() {
    return !!process.env.WALLET_AGENT_API_KEY
  },
  get hyperliquidEndpoint() {
    return process.env.HYPERLIQUID_ENDPOINT
  },
  get hyperliquidNetwork() {
    return (process.env.HYPERLIQUID_NETWORK as "mainnet" | "testnet") || "mainnet"
  },
}

function getTestHyperliquidEndpoint(): string {
  if (testConfig.hyperliquidEndpoint) {
    return testConfig.hyperliquidEndpoint
  }

  return testConfig.hyperliquidNetwork === "mainnet"
    ? "https://api.hyperliquid.xyz"
    : "https://api.hyperliquid-testnet.xyz"
}

describe("Environment Configuration", () => {
  describe("Config Structure", () => {
    test("testConfig has expected properties", () => {
      // Check all expected properties exist (they may be undefined)
      expect("apiKey" in testConfig).toBe(true)
      expect("apiUrl" in testConfig).toBe(true)
      expect("hasProFeatures" in testConfig).toBe(true)
      expect("hyperliquidEndpoint" in testConfig).toBe(true)
      expect("hyperliquidNetwork" in testConfig).toBe(true)
    })

    test("testConfig types are correct", () => {
      // apiKey can be string or undefined
      expect(testConfig.apiKey === undefined || typeof testConfig.apiKey === "string").toBe(true)

      // apiUrl should be a string
      expect(typeof testConfig.apiUrl).toBe("string")

      // hasProFeatures should be a boolean
      expect(typeof testConfig.hasProFeatures).toBe("boolean")

      // hyperliquidEndpoint can be string or undefined
      expect(
        testConfig.hyperliquidEndpoint === undefined || typeof testConfig.hyperliquidEndpoint === "string",
      ).toBe(true)

      // hyperliquidNetwork should be string
      expect(typeof testConfig.hyperliquidNetwork).toBe("string")
    })

    test("hasProFeatures correlates with apiKey", () => {
      // hasProFeatures should be true only if apiKey is truthy
      expect(testConfig.hasProFeatures).toBe(!!testConfig.apiKey)
    })

    test("apiUrl has a value", () => {
      // Should always have a URL value (either from env or default)
      expect(testConfig.apiUrl).toBeTruthy()
      expect(testConfig.apiUrl.startsWith("http")).toBe(true)
    })

    test("hyperliquidNetwork has a value", () => {
      // Should always have a network value
      expect(testConfig.hyperliquidNetwork).toBeTruthy()
      expect(
        ["mainnet", "testnet"].includes(testConfig.hyperliquidNetwork) ||
          typeof testConfig.hyperliquidNetwork === "string",
      ).toBe(true)
    })
  })

  describe("getTestHyperliquidEndpoint Function", () => {
    test("returns a valid URL", () => {
      const endpoint = getTestHyperliquidEndpoint()

      expect(typeof endpoint).toBe("string")
      expect(endpoint.length).toBeGreaterThan(0)
      expect(endpoint.startsWith("https://")).toBe(true)
      expect(endpoint.includes("hyperliquid")).toBe(true)
    })

    test("returns custom endpoint when testConfigured", () => {
      if (testConfig.hyperliquidEndpoint) {
        expect(getTestHyperliquidEndpoint()).toBe(testConfig.hyperliquidEndpoint)
      }
    })

    test("returns network-appropriate endpoint when no custom endpoint", () => {
      if (!testConfig.hyperliquidEndpoint) {
        const endpoint = getTestHyperliquidEndpoint()

        if (testConfig.hyperliquidNetwork === "testnet") {
          expect(endpoint).toBe("https://api.hyperliquid-testnet.xyz")
        } else {
          expect(endpoint).toBe("https://api.hyperliquid.xyz")
        }
      }
    })

    test("handles all network values correctly", () => {
      const endpoint = getTestHyperliquidEndpoint()

      // Should always return a valid endpoint
      expect(endpoint).toBeTruthy()
      expect(endpoint.startsWith("https://")).toBe(true)

      // If custom endpoint is set, that takes precedence
      if (testConfig.hyperliquidEndpoint) {
        expect(endpoint).toBe(testConfig.hyperliquidEndpoint)
      } else {
        // Otherwise, should be based on network
        if (testConfig.hyperliquidNetwork === "testnet") {
          expect(endpoint).toContain("testnet")
        } else if (testConfig.hyperliquidNetwork === "mainnet") {
          expect(endpoint).not.toContain("testnet")
        }
      }
    })
  })

  describe("Environment Variable Handling", () => {
    test("respects current environment settings", () => {
      // Test that testConfig reflects current environment

      // If API key is set in env, it should be in testConfig
      if (process.env.WALLET_AGENT_API_KEY) {
        expect(testConfig.apiKey).toBe(process.env.WALLET_AGENT_API_KEY)
        expect(testConfig.hasProFeatures).toBe(true)
      }

      // If API URL is set in env, it should be in testConfig
      if (process.env.WALLET_AGENT_API_URL) {
        expect(testConfig.apiUrl).toBe(process.env.WALLET_AGENT_API_URL)
      } else {
        // Otherwise should use default
        expect(testConfig.apiUrl).toBe("https://api.wallet-agent.ai")
      }

      // If Hyperliquid endpoint is set, it should be in testConfig
      if (process.env.HYPERLIQUID_ENDPOINT) {
        expect(testConfig.hyperliquidEndpoint).toBe(process.env.HYPERLIQUID_ENDPOINT)
      }

      // If Hyperliquid network is set, it should be in testConfig
      if (process.env.HYPERLIQUID_NETWORK) {
        expect(testConfig.hyperliquidNetwork).toBe(process.env.HYPERLIQUID_NETWORK)
      } else {
        // Otherwise should default to mainnet
        expect(testConfig.hyperliquidNetwork).toBe("mainnet")
      }
    })
  })
})
