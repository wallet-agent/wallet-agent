import { describe, expect, mock, test } from "bun:test"
import { transactionSimulationHandlers } from "../../../src/tools/handlers/transaction-simulation.js"

// Mock the container
mock.module("../../../src/container.js", () => ({
  getContainer: mock(() => ({
    chainAdapter: {
      getAllChains: mock(() => [
        {
          id: 1,
          name: "Ethereum",
          nativeCurrency: { symbol: "ETH", decimals: 18, name: "Ether" },
        },
      ]),
    },
    walletEffects: {
      getChainId: mock(() => 1),
      getAddress: mock(() => "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7"),
      getBalance: mock(async () => ({
        balance: BigInt("1000000000000000000"),
        address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7",
        symbol: "ETH",
      })), // 1 ETH
      sendTransaction: mock(async () => "0xmockedtxhash123"),
    },
    transactionEffects: {
      estimateGas: mock(async () => ({
        gasEstimate: BigInt(21000),
        gasPrice: BigInt(20000000000), // 20 Gwei
        estimatedCost: "0.00042",
        estimatedCostWei: BigInt(420000000000000), // 0.00042 ETH
      })),
      getCode: mock(async (address: string) => {
        // Return code for WETH contract address
        if (address.toLowerCase() === "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2") {
          return "0x606060405260"
        }
        return undefined
      }),
      simulateTransaction: mock(async (_contract, func, _args) => {
        if (func === "failingFunction") {
          return {
            success: false,
            error: "execution reverted: Insufficient balance",
            willRevert: true,
          }
        }
        return {
          success: true,
          result: "0xsuccess",
          willRevert: false,
        }
      }),
    },
    contractEffects: {
      writeContract: mock(async () => ({
        hash: "0xcontracttxhash",
        status: "success",
      })),
    },
    tokenEffects: {
      getTokenBalance: mock(async () => ({
        balance: "1000000",
        balanceRaw: BigInt("1000000"),
        symbol: "USDC",
        decimals: 6,
      })),
      transferToken: mock(async () => "0xtokentxhash"),
    },
  })),
}))

describe("Transaction Simulation Handlers", () => {
  describe("SafeSendTransactionHandler", () => {
    const handler = transactionSimulationHandlers[0]

    test("should simulate transaction before sending", async () => {
      const result = await handler.execute({
        to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7",
        value: "1000000000000000", // 0.001 ETH
        simulate: true,
      })

      expect(result.content[0].type).toBe("text")
      expect(result.content[0].text).toContain("Transaction Sent Successfully")
      expect(result.content[0].text).toContain("0xmockedtxhash123")
    })

    test("should warn when sending to contract without data", async () => {
      const result = await handler.execute({
        to: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH contract
        value: "1000000000000000",
        simulate: true,
      })

      expect(result.content[0].text).toContain("Warnings:")
      expect(result.content[0].text).toContain("contract address without data")
    })

    test("should detect insufficient balance", async () => {
      const result = await handler.execute({
        to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7",
        value: "2000000000000000000", // 2 ETH (more than balance)
        simulate: true,
      })

      expect(result.content[0].text).toContain("Simulation Failed")
      expect(result.content[0].text).toContain("Insufficient balance")
    })

    test("should skip simulation when simulate=false", async () => {
      const result = await handler.execute({
        to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7",
        value: "1000000000000000",
        simulate: false,
      })

      expect(result.content[0].text).toContain("without simulation")
      expect(result.content[0].text).toContain("0xmockedtxhash123")
    })

    test("should auto-confirm low-value transactions", async () => {
      const result = await handler.execute({
        to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7",
        value: "1000000000000", // Very small amount
        simulate: true,
        confirmThreshold: 10, // $10 threshold
      })

      expect(result.content[0].text).toContain("Transaction Sent Successfully")
      expect(result.content[0].text).not.toContain("Confirmation Required")
    })
  })

  describe("SafeContractWriteHandler", () => {
    const handler = transactionSimulationHandlers[1]

    test("should simulate contract write successfully", async () => {
      const result = await handler.execute({
        contract: "TestContract",
        function: "transfer",
        args: ["0xrecipient", "1000000"],
        simulate: true,
      })

      expect(result.content[0].text).toContain("Contract Write Simulation Successful")
      expect(result.content[0].text).toContain("Simulation passed")
    })

    test("should handle simulation failure", async () => {
      const result = await handler.execute({
        contract: "TestContract",
        function: "failingFunction",
        args: [],
        simulate: true,
      })

      expect(result.content[0].text).toContain("Simulation Failed")
      expect(result.content[0].text).toContain("Insufficient balance")
    })

    test("should execute without simulation when requested", async () => {
      const result = await handler.execute({
        contract: "TestContract",
        function: "transfer",
        args: ["0xrecipient", "1000000"],
        simulate: false,
      })

      expect(result.content[0].text).toContain("without simulation")
      expect(result.content[0].text).toContain("TestContract")
    })
  })

  describe("SafeTokenTransferHandler", () => {
    const handler = transactionSimulationHandlers[2]

    test("should simulate token transfer successfully", async () => {
      const result = await handler.execute({
        token: "USDC",
        to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7",
        amount: "100000", // 100k tokens
        simulate: true,
      })

      expect(result.content[0].text).toContain("Token Transfer Simulation Successful")
      expect(result.content[0].text).toContain("Simulation passed")
    })

    test("should detect insufficient token balance", async () => {
      const result = await handler.execute({
        token: "USDC",
        to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7",
        amount: "2000000", // 2M tokens (more than balance)
        simulate: true,
      })

      expect(result.content[0].text).toContain("Insufficient Token Balance")
      expect(result.content[0].text).toContain("Your balance: 1000000 USDC")
    })

    test("should handle transfer simulation failure", async () => {
      // Create a new mock for this test that throws an error
      mock.module("../../../src/container.js", () => ({
        getContainer: mock(() => ({
          chainAdapter: {
            getAllChains: mock(() => [
              {
                id: 1,
                name: "Ethereum",
                nativeCurrency: { symbol: "ETH", decimals: 18, name: "Ether" },
              },
            ]),
          },
          walletEffects: {
            getChainId: mock(() => 1),
            getAddress: mock(() => "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7"),
          },
          tokenEffects: {
            getTokenBalance: mock(async () => {
              throw new Error("Token is paused")
            }),
          },
        })),
      }))

      const result = await handler.execute({
        token: "PAUSED",
        to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7",
        amount: "100",
        simulate: true,
      })

      expect(result.content[0].text).toContain("Token Transfer Simulation Failed")
      expect(result.content[0].text).toContain("Token is paused")
    })

    test("should execute without simulation when requested", async () => {
      // Reset mock to include transferToken
      mock.restore()
      mock.module("../../../src/container.js", () => ({
        getContainer: mock(() => ({
          chainAdapter: {
            getAllChains: mock(() => [
              {
                id: 1,
                name: "Ethereum",
                nativeCurrency: { symbol: "ETH", decimals: 18, name: "Ether" },
              },
            ]),
          },
          walletEffects: {
            getChainId: mock(() => 1),
            getAddress: mock(() => "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7"),
          },
          tokenEffects: {
            transferToken: mock(async () => "0xtokentxhash"),
          },
        })),
      }))

      const result = await handler.execute({
        token: "USDC",
        to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7",
        amount: "100000",
        simulate: false,
      })

      expect(result.content[0].text).toContain("Token Transfer Successful")
      expect(result.content[0].text).toContain("0xtokentxhash")
    })
  })

  describe("Handler Registration", () => {
    test("should export exactly 3 simulation handlers", () => {
      expect(transactionSimulationHandlers).toHaveLength(3)
    })

    test("should have correct handler names", () => {
      const names = transactionSimulationHandlers.map((h) => h.name)
      expect(names).toContain("safe_send_transaction")
      expect(names).toContain("safe_write_contract")
      expect(names).toContain("safe_transfer_token")
    })

    test("should have descriptive descriptions", () => {
      for (const handler of transactionSimulationHandlers) {
        expect(handler.description).toContain("simulation")
        expect(handler.description.toLowerCase()).toContain("safe")
      }
    })
  })
})
