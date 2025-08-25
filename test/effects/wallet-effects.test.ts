import { beforeEach, describe, expect, it } from "bun:test"
import type { Address } from "viem"
import { WalletEffects } from "../../src/effects/wallet-effects"
import {
  createMockChainAdapter,
  createMockWalletAdapter,
  createMockWalletClientFactory,
  testAddresses,
  testChains,
} from "../utils/mocks"

describe("WalletEffects", () => {
  let walletEffects: WalletEffects
  let mockWalletAdapter: ReturnType<typeof createMockWalletAdapter>
  let mockClientFactory: ReturnType<typeof createMockWalletClientFactory>
  let mockChainAdapter: ReturnType<typeof createMockChainAdapter>
  let privateKeyAddresses: Address[]

  beforeEach(() => {
    mockWalletAdapter = createMockWalletAdapter()
    mockClientFactory = createMockWalletClientFactory()
    mockChainAdapter = createMockChainAdapter([testChains.anvil, testChains.mainnet])
    privateKeyAddresses = []

    walletEffects = new WalletEffects(
      mockWalletAdapter,
      mockClientFactory,
      mockChainAdapter,
      [testAddresses.mock1, testAddresses.mock2],
      () => privateKeyAddresses,
    )
  })

  describe("connectWallet", () => {
    it("connects to mock wallet", async () => {
      const result = await walletEffects.connectWallet(testAddresses.mock1)
      expect(result.address).toBe(testAddresses.mock1)
      expect(result.chainId).toBe(1)
      expect(walletEffects.getConnectedAddress()).toBe(testAddresses.mock1)
    })

    it("throws error for invalid mock address", async () => {
      expect(walletEffects.connectWallet(testAddresses.privateKey1)).rejects.toThrow(
        "is not in the list of available mock accounts",
      )
    })

    it("connects to private key wallet", async () => {
      privateKeyAddresses.push(testAddresses.privateKey1)
      walletEffects.setWalletType("privateKey")

      const result = await walletEffects.connectWallet(testAddresses.privateKey1)
      expect(result.address).toBe(testAddresses.privateKey1)
      expect(result.chainId).toBe(31337) // Default Anvil
    })
  })

  describe("disconnectWallet", () => {
    it("disconnects wallet", async () => {
      await walletEffects.connectWallet(testAddresses.mock1)
      expect(walletEffects.getConnectedAddress()).toBe(testAddresses.mock1)

      await walletEffects.disconnectWallet()
      expect(walletEffects.getConnectedAddress()).toBeUndefined()
    })
  })

  describe("setWalletType", () => {
    it("sets wallet type to mock", () => {
      walletEffects.setWalletType("mock")
      expect(walletEffects.getCurrentWalletType()).toBe("mock")
    })

    it("sets wallet type to privateKey", () => {
      privateKeyAddresses.push(testAddresses.privateKey1)
      walletEffects.setWalletType("privateKey")
      expect(walletEffects.getCurrentWalletType()).toBe("privateKey")
    })

    it("throws error when setting privateKey without imported keys", () => {
      expect(() => walletEffects.setWalletType("privateKey")).toThrow("No private keys imported")
    })
  })

  describe("getBalance", () => {
    it("gets balance for connected wallet", async () => {
      await walletEffects.connectWallet(testAddresses.mock1)
      const result = await walletEffects.getBalance()

      expect(result.address).toBe(testAddresses.mock1)
      expect(result.balance).toBe(1000000000000000000n)
      expect(result.symbol).toBe("ETH")
    })

    it("gets balance for specific address", async () => {
      const result = await walletEffects.getBalance(testAddresses.mock2)
      expect(result.address).toBe(testAddresses.mock2)
    })

    it("throws error when no address provided and not connected", async () => {
      expect(walletEffects.getBalance()).rejects.toThrow(
        "No address provided and no wallet connected",
      )
    })
  })

  describe("signMessage", () => {
    it("signs message with mock wallet", async () => {
      await walletEffects.connectWallet(testAddresses.mock1)
      const signature = await walletEffects.signMessage("Hello World")
      expect(signature).toBe(
        "0x1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890",
      )
    })

    it("signs message with private key wallet", async () => {
      privateKeyAddresses.push(testAddresses.privateKey1)
      walletEffects.setWalletType("privateKey")
      await walletEffects.connectWallet(testAddresses.privateKey1)

      const signature = await walletEffects.signMessage("Hello World")
      expect(signature).toBe("0xprivatekey-signature")
    })

    it("throws error when not connected", async () => {
      expect(walletEffects.signMessage("Hello")).rejects.toThrow("No wallet connected")
    })
  })

  describe("switchChain", () => {
    it("switches to valid chain", async () => {
      const result = await walletEffects.switchChain(1)
      expect(result.chainId).toBe(1)
      expect(result.chainName).toBe("Ethereum")
      expect(walletEffects.getCurrentChainId()).toBe(1)
    })

    it("throws error for unsupported chain", async () => {
      expect(walletEffects.switchChain(999)).rejects.toThrow("Chain ID 999 is not supported")
    })
  })
})
