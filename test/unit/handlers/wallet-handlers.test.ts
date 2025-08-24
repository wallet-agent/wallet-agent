import { beforeEach, describe, expect, test } from "bun:test"
import {
  ConnectWalletHandler,
  DisconnectWalletHandler,
  GetAccountsHandler,
  GetBalanceHandler,
  GetCurrentAccountHandler,
} from "../../../src/tools/handlers/wallet-handlers.js"
import { setupContainer } from "../../integration/handlers/setup.js"

describe("Wallet Handlers", () => {
  beforeEach(() => {
    setupContainer()
  })

  describe("ConnectWalletHandler", () => {
    test("should have correct name and description", () => {
      const handler = new ConnectWalletHandler()
      expect(handler.name).toBe("connect_wallet")
      expect(handler.description).toBe("Connect to a wallet using the specified address")
    })

    test("should connect to valid address", async () => {
      const handler = new ConnectWalletHandler()
      const result = await handler.execute({
        address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      })

      expect(result.content[0].text).toContain("Connected to wallet:")
      expect(result.content[0].text).toContain("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
    })

    test("should validate address format", async () => {
      const handler = new ConnectWalletHandler()

      try {
        await handler.execute({ address: "invalid-address" })
        throw new Error("Should have thrown")
      } catch (error) {
        expect((error as Error).message).toContain("Invalid arguments")
      }
    })
  })

  describe("DisconnectWalletHandler", () => {
    test("should have correct name and description", () => {
      const handler = new DisconnectWalletHandler()
      expect(handler.name).toBe("disconnect_wallet")
      expect(handler.description).toBe("Disconnect the currently connected wallet")
    })

    test("should disconnect wallet", async () => {
      // First connect
      const connectHandler = new ConnectWalletHandler()
      await connectHandler.execute({
        address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      })

      // Then disconnect
      const handler = new DisconnectWalletHandler()
      const result = await handler.execute({})

      expect(result.content[0].text).toBe("Wallet disconnected")
    })
  })

  describe("GetAccountsHandler", () => {
    test("should have correct name and description", () => {
      const handler = new GetAccountsHandler()
      expect(handler.name).toBe("get_accounts")
      expect(handler.description).toBe("Get the list of available mock accounts")
    })

    test("should return list of mock accounts", async () => {
      const handler = new GetAccountsHandler()
      const result = await handler.execute({})

      expect(result.content[0].text).toContain("Available mock accounts:")
      expect(result.content[0].text).toContain("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
      expect(result.content[0].text).toContain("0x70997970C51812dc3A010C7d01b50e0d17dc79C8")
    })
  })

  describe("GetCurrentAccountHandler", () => {
    test("should have correct name and description", () => {
      const handler = new GetCurrentAccountHandler()
      expect(handler.name).toBe("get_current_account")
      expect(handler.description).toBe("Get the currently connected account information")
    })

    test("should return current account when connected", async () => {
      // First connect
      const connectHandler = new ConnectWalletHandler()
      await connectHandler.execute({
        address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      })

      const handler = new GetCurrentAccountHandler()
      const result = await handler.execute({})

      expect(result.content[0].text).toContain(
        "Connected: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      )
      expect(result.content[0].text).toContain("Chain ID:")
      expect(result.content[0].text).toContain("Connector:")
    })

    test("should indicate when no wallet is connected", async () => {
      const handler = new GetCurrentAccountHandler()
      const result = await handler.execute({})

      expect(result.content[0].text).toBe("No wallet connected")
    })
  })

  describe("GetBalanceHandler", () => {
    test("should have correct name and description", () => {
      const handler = new GetBalanceHandler()
      expect(handler.name).toBe("get_balance")
      expect(handler.description).toBe("Get the balance of an address")
    })

    test("should get balance of connected wallet", async () => {
      // First connect
      const connectHandler = new ConnectWalletHandler()
      await connectHandler.execute({
        address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      })

      const handler = new GetBalanceHandler()
      const result = await handler.execute({})

      expect(result.content[0].text).toContain("Balance:")
      expect(result.content[0].text).toContain("ETH")
      expect(result.content[0].text).toContain("ETH")
    })

    test("should get balance of specific address", async () => {
      const handler = new GetBalanceHandler()
      const result = await handler.execute({
        address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      })

      expect(result.content[0].text).toContain("Balance:")
      expect(result.content[0].text).toContain("ETH")
      expect(result.content[0].text).toContain("ETH")
    })

    test("should validate address format", async () => {
      const handler = new GetBalanceHandler()

      try {
        await handler.execute({ address: "not-valid" })
        throw new Error("Should have thrown")
      } catch (error) {
        expect((error as Error).message).toContain("Invalid arguments")
      }
    })
  })
})
