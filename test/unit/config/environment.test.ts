import { describe, expect, test } from "bun:test"
import { config, getHyperliquidEndpoint } from "../../../src/config/environment.js"

describe("Environment Configuration", () => {
  describe("Config Structure", () => {
    test("config has expected properties", () => {
      // Check all expected properties exist (they may be undefined)
      expect("apiKey" in config).toBe(true)
      expect("apiUrl" in config).toBe(true)
      expect("hasProFeatures" in config).toBe(true)
      expect("hyperliquidEndpoint" in config).toBe(true)
      expect("hyperliquidNetwork" in config).toBe(true)
    })

    test("config types are correct", () => {
      // apiKey can be string or undefined
      expect(config.apiKey === undefined || typeof config.apiKey === "string").toBe(true)

      // apiUrl should be a string
      expect(typeof config.apiUrl).toBe("string")

      // hasProFeatures should be a boolean
      expect(typeof config.hasProFeatures).toBe("boolean")

      // hyperliquidEndpoint can be string or undefined
      expect(
        config.hyperliquidEndpoint === undefined || typeof config.hyperliquidEndpoint === "string",
      ).toBe(true)

      // hyperliquidNetwork should be string
      expect(typeof config.hyperliquidNetwork).toBe("string")
    })

    test("hasProFeatures correlates with apiKey", () => {
      // hasProFeatures should be true only if apiKey is truthy
      expect(config.hasProFeatures).toBe(!!config.apiKey)
    })

    test("apiUrl has a value", () => {
      // Should always have a URL value (either from env or default)
      expect(config.apiUrl).toBeTruthy()
      expect(config.apiUrl.startsWith("http")).toBe(true)
    })

    test("hyperliquidNetwork has a value", () => {
      // Should always have a network value
      expect(config.hyperliquidNetwork).toBeTruthy()
      expect(
        ["mainnet", "testnet"].includes(config.hyperliquidNetwork) ||
          typeof config.hyperliquidNetwork === "string",
      ).toBe(true)
    })
  })

  describe("getHyperliquidEndpoint Function", () => {
    test("returns a valid URL", () => {
      const endpoint = getHyperliquidEndpoint()

      expect(typeof endpoint).toBe("string")
      expect(endpoint.length).toBeGreaterThan(0)
      expect(endpoint.startsWith("https://")).toBe(true)
      expect(endpoint.includes("hyperliquid")).toBe(true)
    })

    test("returns custom endpoint when configured", () => {
      if (config.hyperliquidEndpoint) {
        expect(getHyperliquidEndpoint()).toBe(config.hyperliquidEndpoint)
      }
    })

    test("returns network-appropriate endpoint when no custom endpoint", () => {
      if (!config.hyperliquidEndpoint) {
        const endpoint = getHyperliquidEndpoint()

        if (config.hyperliquidNetwork === "testnet") {
          expect(endpoint).toBe("https://api.hyperliquid-testnet.xyz")
        } else {
          expect(endpoint).toBe("https://api.hyperliquid.xyz")
        }
      }
    })

    test("handles all network values correctly", () => {
      const endpoint = getHyperliquidEndpoint()

      // Should always return a valid endpoint
      expect(endpoint).toBeTruthy()
      expect(endpoint.startsWith("https://")).toBe(true)

      // If custom endpoint is set, that takes precedence
      if (config.hyperliquidEndpoint) {
        expect(endpoint).toBe(config.hyperliquidEndpoint)
      } else {
        // Otherwise, should be based on network
        if (config.hyperliquidNetwork === "testnet") {
          expect(endpoint).toContain("testnet")
        } else if (config.hyperliquidNetwork === "mainnet") {
          expect(endpoint).not.toContain("testnet")
        }
      }
    })
  })

  describe("Environment Variable Handling", () => {
    test("respects current environment settings", () => {
      // Test that config reflects current environment

      // If API key is set in env, it should be in config
      if (process.env.WALLET_AGENT_API_KEY) {
        expect(config.apiKey).toBe(process.env.WALLET_AGENT_API_KEY)
        expect(config.hasProFeatures).toBe(true)
      }

      // If API URL is set in env, it should be in config
      if (process.env.WALLET_AGENT_API_URL) {
        expect(config.apiUrl).toBe(process.env.WALLET_AGENT_API_URL)
      } else {
        // Otherwise should use default
        expect(config.apiUrl).toBe("https://api.wallet-agent.ai")
      }

      // If Hyperliquid endpoint is set, it should be in config
      if (process.env.HYPERLIQUID_ENDPOINT) {
        expect(config.hyperliquidEndpoint).toBe(process.env.HYPERLIQUID_ENDPOINT)
      }

      // If Hyperliquid network is set, it should be in config
      if (process.env.HYPERLIQUID_NETWORK) {
        expect(config.hyperliquidNetwork).toBe(process.env.HYPERLIQUID_NETWORK)
      } else {
        // Otherwise should default to mainnet
        expect(config.hyperliquidNetwork).toBe("mainnet")
      }
    })
  })
})
