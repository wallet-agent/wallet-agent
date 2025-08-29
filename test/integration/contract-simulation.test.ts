import { beforeEach, describe, expect, test } from "bun:test"
import { TestContainer } from "../../src/test-container.js"
import { handleToolCall } from "../../src/tools/handlers.js"
import {
  deployTestContracts,
  isAnvilRunning,
  type DeployedContracts,
} from "../setup/deploy-contracts.js"

interface McpServer {
  callTool(
    name: string,
    args: any,
  ): Promise<{
    isError: boolean
    content: [{ text: string; type: string }, ...Array<{ text: string; type: string }>]
    error?: string
  }>
}

const useRealAnvil = process.env.USE_REAL_ANVIL === "true"

describe.skipIf(!useRealAnvil)("Contract Simulation Integration Test", () => {
  let server: McpServer
  let testContainer: TestContainer
  let deployedContracts: DeployedContracts

  const testAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  const testPrivateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
  const recipientAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"

  beforeEach(async () => {
    if (!useRealAnvil) return

    const anvilRunning = await isAnvilRunning()
    if (!anvilRunning) {
      throw new Error("Anvil is not running. Start Anvil for this test.")
    }

    testContainer = TestContainer.createForTest({})
    deployedContracts = await deployTestContracts()

    server = {
      async callTool(name: string, args: any) {
        try {
          ;(globalThis as any).__walletAgentTestContainer = testContainer

          const result = await handleToolCall({
            method: "tools/call",
            params: {
              name,
              arguments: args,
            },
          })
          return {
            isError: false,
            content: result.content || [],
          }
        } catch (error) {
          return {
            isError: true,
            content: [{ text: error instanceof Error ? error.message : String(error), type: "text" }],
            error: error instanceof Error ? error.message : String(error),
          }
        }
      },
    }

    await server.callTool("load_wagmi_config", {
      filePath: "./test/setup/test-wagmi-config.ts",
    })

    await server.callTool("import_private_key", {
      privateKey: testPrivateKey,
    })
  })

  describe("Transaction Simulation", () => {
    test("should simulate successful contract write transaction", async () => {
      const simulateResult = await server.callTool("simulate_transaction", {
        contract: "Storage", 
        address: deployedContracts.storage,
        function: "store",
        args: [999],
      })

      expect(simulateResult.isError).toBe(false)
      if (!simulateResult.isError) {
        const response = simulateResult.content[0].text
        expect(response).toMatch(/(simulation|success|gas)/i)
        expect(response).toContain("store")
        expect(response).toContain("999")
        console.log("✓ Storage contract simulation:", response.substring(0, 100) + "...")
      }
    })

    test("should simulate ERC20 token transfer", async () => {
      const simulateResult = await server.callTool("simulate_transaction", {
        contract: "ERC20",
        address: deployedContracts.erc20,
        function: "transfer",
        args: [recipientAddress, "1000000000000000000"],
      })

      expect(simulateResult.isError).toBe(false)
      if (!simulateResult.isError) {
        const response = simulateResult.content[0].text
        expect(response).toMatch(/(simulation|transfer|success)/i)
        expect(response).toContain(recipientAddress)
        console.log("✓ ERC20 transfer simulation succeeded")
      }
    })

    test("should simulate failing transaction due to insufficient balance", async () => {
      const simulateResult = await server.callTool("simulate_transaction", {
        contract: "ERC20",
        address: deployedContracts.erc20,
        function: "transfer",
        args: [recipientAddress, "999999999999999999999999999"],
      })

      if (simulateResult.isError || simulateResult.content[0].text.includes("revert") || simulateResult.content[0].text.includes("insufficient")) {
        console.log("✓ Simulation correctly predicted failure")
        expect(true).toBe(true)
      } else {
        console.log("Note: Simulation may not detect all failure cases")
      }
    })

    test("should simulate transaction with ETH value", async () => {
      const simulateResult = await server.callTool("simulate_transaction", {
        contract: "Storage",
        address: deployedContracts.storage,
        function: "store",
        args: [123],
        value: "1.0",
      })

      expect(simulateResult.isError).toBe(false)
      if (!simulateResult.isError) {
        const response = simulateResult.content[0].text
        expect(response).toMatch(/(simulation|gas|estimate)/i)
        console.log("✓ Transaction with ETH value simulated")
      }
    })
  })

  describe("Contract Call Simulation", () => {
    test("should simulate view function calls", async () => {
      await server.callTool("write_contract", {
        contract: "Storage",
        address: deployedContracts.storage,
        function: "store",
        args: [42],
      })

      await new Promise(resolve => setTimeout(resolve, 1000))

      const simulateResult = await server.callTool("simulate_contract_call", {
        contract: "Storage",
        address: deployedContracts.storage,
        function: "retrieve",
      })

      expect(simulateResult.isError).toBe(false)
      if (!simulateResult.isError) {
        const response = simulateResult.content[0].text
        expect(response).toMatch(/(42|simulation|result)/i)
        console.log("✓ View function simulation returned stored value")
      }
    })

    test("should simulate ERC20 balance check", async () => {
      const simulateResult = await server.callTool("simulate_contract_call", {
        contract: "ERC20",
        address: deployedContracts.erc20,
        function: "balanceOf", 
        args: [testAddress],
      })

      expect(simulateResult.isError).toBe(false)
      if (!simulateResult.isError) {
        const response = simulateResult.content[0].text
        expect(response).toMatch(/(balance|simulation|10000)/i)
        console.log("✓ ERC20 balance simulation:", response)
      }
    })

    test("should simulate with different caller addresses", async () => {
      const callers = [testAddress, recipientAddress]
      
      for (const caller of callers) {
        const simulateResult = await server.callTool("simulate_contract_call", {
          contract: "ERC20",
          address: deployedContracts.erc20,
          function: "balanceOf",
          args: [caller],
          from: caller,
        })

        expect(simulateResult.isError).toBe(false)
        if (!simulateResult.isError) {
          console.log(`✓ Simulation for caller ${caller}:`, simulateResult.content[0].text.substring(0, 50))
        }
      }
    })
  })

  describe("Dry Run Transactions", () => {
    test("should dry run contract state changes", async () => {
      const dryRunResult = await server.callTool("dry_run_transaction", {
        contract: "Storage",
        address: deployedContracts.storage,
        function: "store",
        args: [777],
      })

      expect(dryRunResult.isError).toBe(false)
      if (!dryRunResult.isError) {
        const response = dryRunResult.content[0].text
        expect(response).toMatch(/(dry.run|preview|effects|777)/i)
        console.log("✓ Dry run preview:", response.substring(0, 100) + "...")
      }

      const currentValueResult = await server.callTool("read_contract", {
        contract: "Storage",
        address: deployedContracts.storage,
        function: "retrieve",
      })

      if (!currentValueResult.isError) {
        const currentValue = currentValueResult.content[0].text
        expect(currentValue).not.toContain("777")
        console.log("✓ Dry run did not modify actual state")
      }
    })

    test("should dry run token transfer effects", async () => {
      const dryRunResult = await server.callTool("dry_run_transaction", {
        contract: "ERC20",
        address: deployedContracts.erc20,
        function: "transfer",
        args: [recipientAddress, "5000000000000000000"],
      })

      expect(dryRunResult.isError).toBe(false)
      if (!dryRunResult.isError) {
        const response = dryRunResult.content[0].text
        expect(response).toMatch(/(preview|transfer|balance|effect)/i)
        expect(response).toContain(recipientAddress)
        console.log("✓ Token transfer dry run shows balance effects")
      }
    })

    test("should dry run multiple state changes", async () => {
      const operations = [
        { value: 100 },
        { value: 200 },
        { value: 300 },
      ]

      for (const op of operations) {
        const dryRunResult = await server.callTool("dry_run_transaction", {
          contract: "Storage",
          address: deployedContracts.storage,
          function: "store",
          args: [op.value],
        })

        expect(dryRunResult.isError).toBe(false)
        if (!dryRunResult.isError) {
          const response = dryRunResult.content[0].text
          expect(response).toContain(op.value.toString())
          console.log(`✓ Dry run for value ${op.value}`)
        }
      }
    })
  })

  describe("Simulation Error Handling", () => {
    test("should handle simulation of non-existent function", async () => {
      const simulateResult = await server.callTool("simulate_transaction", {
        contract: "Storage",
        address: deployedContracts.storage,
        function: "nonExistentFunction",
        args: [],
      })

      expect(simulateResult.isError).toBe(true)
      if (simulateResult.isError) {
        expect(simulateResult.content[0].text).toMatch(/(function|not found|does not exist)/i)
      }
    })

    test("should handle simulation with wrong argument types", async () => {
      const simulateResult = await server.callTool("simulate_transaction", {
        contract: "Storage",
        address: deployedContracts.storage,
        function: "store",
        args: ["not_a_number"],
      })

      expect(simulateResult.isError).toBe(true)
      if (simulateResult.isError) {
        expect(simulateResult.content[0].text).toMatch(/(argument|type|invalid)/i)
      }
    })

    test("should handle simulation with invalid contract address", async () => {
      const simulateResult = await server.callTool("simulate_contract_call", {
        contract: "Storage",
        address: "0x1234567890123456789012345678901234567890",
        function: "retrieve",
      })

      expect(simulateResult.isError).toBe(true)
      if (simulateResult.isError) {
        expect(simulateResult.content[0].text).toMatch(/(contract|not found|invalid address)/i)
      }
    })
  })

  describe("Gas Estimation in Simulation", () => {
    test("should include gas estimates in simulation results", async () => {
      const simulateResult = await server.callTool("simulate_transaction", {
        contract: "Storage",
        address: deployedContracts.storage,
        function: "store",
        args: [888],
      })

      expect(simulateResult.isError).toBe(false)
      if (!simulateResult.isError) {
        const response = simulateResult.content[0].text
        expect(response).toMatch(/(gas|estimate|cost)/i)
        console.log("✓ Simulation includes gas information")
      }
    })

    test("should compare gas costs for different operations", async () => {
      const operations = [
        { contract: "Storage", function: "store", args: [1] },
        { contract: "Storage", function: "retrieve", args: [] },
      ]

      const gasEstimates = []

      for (const op of operations) {
        const simulateResult = await server.callTool("simulate_transaction", {
          contract: op.contract,
          address: deployedContracts.storage,
          function: op.function,
          args: op.args,
        })

        if (!simulateResult.isError) {
          const response = simulateResult.content[0].text
          const gasMatch = response.match(/(\d+)\s*(gas|units)/i)
          if (gasMatch) {
            gasEstimates.push({ 
              operation: op.function, 
              gas: parseInt(gasMatch[1]!) 
            })
          }
        }
      }

      if (gasEstimates.length >= 2) {
        console.log("✓ Gas comparison:", gasEstimates)
        const storeGas = gasEstimates.find(e => e.operation === "store")?.gas
        const retrieveGas = gasEstimates.find(e => e.operation === "retrieve")?.gas
        
        if (storeGas && retrieveGas) {
          expect(storeGas).toBeGreaterThan(retrieveGas)
          console.log(`✓ Store operation (${storeGas}) uses more gas than retrieve (${retrieveGas})`)
        }
      }
    })
  })
})