import { beforeEach } from "bun:test"
import { MockPresets } from "../../utils/mock-transport.js"
import { resetTestTransportConfig, setTestTransportConfig } from "../../utils/test-transport.js"

/**
 * Configure test transport for token operations tests
 */
export function setupTokenTestTransport() {
  beforeEach(() => {
    // Reset to defaults first
    resetTestTransportConfig()

    // Configure mock responses for token tests
    const mockResponses = new Map([
      ...MockPresets.noContractWithProperError(),
      // Add specific overrides for token tests
      ["eth_getBalance", "0x0"],
      ["eth_gasPrice", "0x4a817c800"], // 20 gwei
      ["eth_estimateGas", "0x5208"], // 21000 gas
    ])

    setTestTransportConfig({ mockResponses })
  })
}

/**
 * Configure test transport to simulate no wallet connected
 */
export function setupNoWalletTransport() {
  beforeEach(() => {
    resetTestTransportConfig()

    const mockResponses = new Map([...MockPresets.noContract(), ["eth_accounts", []]])

    setTestTransportConfig({ mockResponses })
  })
}

/**
 * Configure test transport for real Anvil testing
 */
export function setupRealAnvilTransport() {
  beforeEach(() => {
    resetTestTransportConfig()
    setTestTransportConfig({ useRealNetwork: true })
  })
}
