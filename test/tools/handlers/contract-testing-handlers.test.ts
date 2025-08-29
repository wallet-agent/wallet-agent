import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test"
import type { Address } from "viem"
import * as contractOps from "../../../src/contract-operations.js"
import * as contractResolution from "../../../src/core/contract-resolution.js"
import * as contractTesting from "../../../src/core/contract-testing.js"
import {
  DryRunTransactionHandler,
  SimulateContractCallHandler,
  TestContractFunctionHandler,
} from "../../../src/tools/handlers/contract-testing-handlers.js"

// Mock ERC20 ABI for testing
const mockERC20Abi = [
  {
    type: "function",
    name: "transfer",
    inputs: [
      { type: "address", name: "to" },
      { type: "uint256", name: "amount" },
    ],
    outputs: [{ type: "bool", name: "" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ type: "address", name: "account" }],
    outputs: [{ type: "uint256", name: "" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { type: "address", name: "from", indexed: true },
      { type: "address", name: "to", indexed: true },
      { type: "uint256", name: "value", indexed: false },
    ],
  },
] as const

describe("Contract Testing Handlers", () => {
  let listContractsSpy: ReturnType<typeof spyOn>
  let resolveContractSpy: ReturnType<typeof spyOn>
  let simulateContractCallSpy: ReturnType<typeof spyOn>
  let generateTestScenariosSpy: ReturnType<typeof spyOn>
  let runTestScenariosSpy: ReturnType<typeof spyOn>

  beforeEach(() => {

    // Mock the listContracts function
    listContractsSpy = spyOn(contractOps, "listContracts").mockReturnValue([
      { name: "TestToken", chains: [31337] },
    ])

    // Mock the resolveContract function
    resolveContractSpy = spyOn(contractResolution, "resolveContract").mockImplementation(
      (contractName: string) => {
        if (contractName === "TestToken") {
          return {
            name: "TestToken",
            address: "0x1234567890123456789012345678901234567890" as Address,
            abi: mockERC20Abi,
            isBuiltin: false,
          }
        }
        throw new Error(`Contract ${contractName} not found`)
      },
    )

    // Mock contract testing functions
    simulateContractCallSpy = spyOn(contractTesting, "simulateContractCall")
    generateTestScenariosSpy = spyOn(contractTesting, "generateTestScenarios")
    runTestScenariosSpy = spyOn(contractTesting, "runTestScenarios")
  })

  afterEach(() => {
    // Restore all spies
    listContractsSpy?.mockRestore()
    resolveContractSpy?.mockRestore()
    simulateContractCallSpy?.mockRestore()
    generateTestScenariosSpy?.mockRestore()
    runTestScenariosSpy?.mockRestore()
  })

  describe("SimulateContractCallHandler", () => {
    let handler: SimulateContractCallHandler

    beforeEach(() => {
      handler = new SimulateContractCallHandler()
    })

    test("should simulate successful contract call", async () => {
      // Mock successful simulation
      simulateContractCallSpy.mockResolvedValue({
        success: true,
        returnValue: true,
        gasUsed: BigInt(21000),
        stateChanges: [],
        logs: [],
      })

      const response = await handler.execute({
        contract: "TestToken",
        function: "transfer",
        args: ["0x742d35Cc6634C0532925a3b8D84d2f96D564e1C1", "1000"],
      })

      expect(response.content).toHaveLength(1)
      expect(response.content[0]?.type).toBe("text")

      const content = response.content[0]?.text || ""
      expect(content).toContain("Contract Simulation: TestToken.transfer()")
      expect(content).toContain("✅ **Status:** Success")
      expect(content).toContain("**Return Value:** true")
      expect(content).toContain("**Estimated Gas:** 21,000")
      expect(content).toContain("Function call would succeed if executed")
    })

    test("should simulate failed contract call", async () => {
      // Mock failed simulation
      simulateContractCallSpy.mockResolvedValue({
        success: false,
        revertReason: "ERC20: transfer amount exceeds balance",
        stateChanges: [],
        logs: [],
      })

      const response = await handler.execute({
        contract: "TestToken",
        function: "transfer",
        args: ["0x742d35Cc6634C0532925a3b8D84d2f96D564e1C1", "999999999"],
      })

      const content = response.content[0]?.text || ""
      expect(content).toContain("❌ **Status:** Would Revert")
      expect(content).toContain("**Revert Reason:** ERC20: transfer amount exceeds balance")
      expect(content).toContain("Check function parameters for invalid values")
    })

    test("should include value parameter in simulation", async () => {
      simulateContractCallSpy.mockResolvedValue({
        success: true,
        returnValue: undefined,
        gasUsed: BigInt(25000),
        stateChanges: [],
        logs: [],
      })

      const response = await handler.execute({
        contract: "TestToken",
        function: "transfer",
        args: ["0x742d35Cc6634C0532925a3b8D84d2f96D564e1C1", "1000"],
        value: "0.1",
      })

      const content = response.content[0]?.text || ""
      expect(content).toContain("Transaction will send 0.1 ETH to the contract")

      // Verify the simulation was called with correct parameters
      expect(simulateContractCallSpy).toHaveBeenCalledWith({
        contract: "TestToken",
        address: undefined,
        function: "transfer",
        args: ["0x742d35Cc6634C0532925a3b8D84d2f96D564e1C1", "1000"],
        value: "0.1",
        from: undefined,
      })
    })

    test("should handle simulation errors gracefully", async () => {
      simulateContractCallSpy.mockRejectedValue(new Error("Network error"))

      await expect(
        handler.execute({
          contract: "TestToken",
          function: "transfer",
          args: ["0x742d35Cc6634C0532925a3b8D84d2f96D564e1C1", "1000"],
        }),
      ).rejects.toThrow("Simulation failed: Network error")
    })
  })

  describe("TestContractFunctionHandler", () => {
    let handler: TestContractFunctionHandler

    beforeEach(() => {
      handler = new TestContractFunctionHandler()
    })

    test("should run test scenarios for contract function", async () => {
      // Mock test scenario generation
      const mockScenarios = [
        {
          name: "Basic Success",
          description: "Test transfer with typical valid inputs",
          params: {
            contract: "TestToken",
            function: "transfer",
            args: ["0x1234567890123456789012345678901234567890", "1000"],
          },
          expectedOutcome: "success" as const,
        },
        {
          name: "Zero Address",
          description: "Test transfer with zero address",
          params: {
            contract: "TestToken",
            function: "transfer",
            args: ["0x0000000000000000000000000000000000000000", "1000"],
          },
          expectedOutcome: "revert" as const,
          expectedRevertReason: "Zero address not allowed",
        },
      ]

      generateTestScenariosSpy.mockReturnValue(mockScenarios)

      // Mock test results
      const mockResults = {
        totalTests: 2,
        passed: 1,
        failed: 1,
        results: [
          {
            scenario: mockScenarios[0],
            result: { success: true, returnValue: true },
            passed: true,
          },
          {
            scenario: mockScenarios[1],
            result: { success: false, revertReason: "ERC20: transfer to the zero address" },
            passed: true, // Expected to revert
          },
        ],
      }

      runTestScenariosSpy.mockResolvedValue(mockResults)

      const response = await handler.execute({
        contract: "TestToken",
        function: "transfer",
      })

      const content = response.content[0]?.text || ""
      expect(content).toContain("Function Test Results: TestToken.transfer()")
      expect(content).toContain("Total Tests: 2")
      expect(content).toContain("Passed: 1 ✅")
      expect(content).toContain("Failed: 1 ❌")
      expect(content).toContain("Success Rate: 50%")
      expect(content).toContain("**Basic Success** - ✅ PASS")
      expect(content).toContain("**Zero Address** - ✅ PASS")
    })

    test("should handle empty test scenarios", async () => {
      generateTestScenariosSpy.mockReturnValue([])

      const response = await handler.execute({
        contract: "TestToken",
        function: "transfer",
      })

      const content = response.content[0]?.text || ""
      expect(content).toContain("No test scenarios generated")
      expect(content).toContain("Function has complex parameter types")
    })

    test("should handle all tests passing", async () => {
      const mockScenarios = [
        {
          name: "Success Case",
          description: "Test successful transfer",
          params: {
            contract: "TestToken",
            function: "transfer",
            args: ["0x1234567890123456789012345678901234567890", "1000"],
          },
          expectedOutcome: "success" as const,
        },
      ]

      generateTestScenariosSpy.mockReturnValue(mockScenarios)

      const mockResults = {
        totalTests: 1,
        passed: 1,
        failed: 0,
        results: [
          {
            scenario: mockScenarios[0],
            result: { success: true, returnValue: true },
            passed: true,
          },
        ],
      }

      runTestScenariosSpy.mockResolvedValue(mockResults)

      const response = await handler.execute({
        contract: "TestToken",
        function: "transfer",
      })

      const content = response.content[0]?.text || ""
      expect(content).toContain("🎉 **All tests passed!**")
      expect(content).toContain("The function handles various scenarios correctly")
    })
  })

  describe("DryRunTransactionHandler", () => {
    let handler: DryRunTransactionHandler

    beforeEach(() => {
      handler = new DryRunTransactionHandler()
    })

    test("should preview successful transaction", async () => {
      simulateContractCallSpy.mockResolvedValue({
        success: true,
        returnValue: true,
        gasUsed: BigInt(23000),
        stateChanges: [],
        logs: [],
      })

      const response = await handler.execute({
        contract: "TestToken",
        function: "transfer",
        args: ["0x742d35Cc6634C0532925a3b8D84d2f96D564e1C1", "1000"],
        value: "0.05",
      })

      const content = response.content[0]?.text || ""
      expect(content).toContain("Transaction Dry Run: TestToken.transfer()")
      expect(content).toContain("✅ **Transaction would succeed**")
      expect(content).toContain("Return Value: true")
      expect(content).toContain("Gas Required: 23,000")
      expect(content).toContain("ETH Transfer: 0.05 ETH")
      expect(content).toContain("🚀 **Ready to Execute:**")
      expect(content).toContain("All preconditions are met")
    })

    test("should warn about failing transaction", async () => {
      simulateContractCallSpy.mockResolvedValue({
        success: false,
        revertReason: "ERC20: insufficient allowance",
        stateChanges: [],
        logs: [],
      })

      const response = await handler.execute({
        contract: "TestToken",
        function: "transfer",
        args: ["0x742d35Cc6634C0532925a3b8D84d2f96D564e1C1", "999999"],
      })

      const content = response.content[0]?.text || ""
      expect(content).toContain("❌ **Transaction would fail**")
      expect(content).toContain("**Error:** ERC20: insufficient allowance")
      expect(content).toContain("🔧 **Troubleshooting:**")
      expect(content).toContain("⚠️ **Do not execute this transaction**")
      expect(content).toContain("it will fail and consume gas")
    })

    test("should handle missing return value", async () => {
      simulateContractCallSpy.mockResolvedValue({
        success: true,
        returnValue: undefined,
        gasUsed: BigInt(21000),
        stateChanges: [],
        logs: [],
      })

      const response = await handler.execute({
        contract: "TestToken",
        function: "transfer",
        args: ["0x742d35Cc6634C0532925a3b8D84d2f96D564e1C1", "1000"],
      })

      const content = response.content[0]?.text || ""
      expect(content).toContain("✅ **Transaction would succeed**")
      expect(content).toContain("Gas Required: 21,000")
      expect(content).not.toContain("Return Value:")
    })
  })

  describe("Error handling", () => {
    test("all handlers should fail gracefully for simulation errors", async () => {
      const handlers = [
        new SimulateContractCallHandler(),
        new TestContractFunctionHandler(),
        new DryRunTransactionHandler(),
      ]

      // Mock simulation to throw error
      simulateContractCallSpy.mockRejectedValue(new Error("RPC error"))
      generateTestScenariosSpy.mockImplementation(() => {
        throw new Error("ABI parsing error")
      })

      for (const handler of handlers) {
        await expect(
          handler.execute({
            contract: "TestToken",
            function: "transfer",
            args: ["0x742d35Cc6634C0532925a3b8D84d2f96D564e1C1", "1000"],
          }),
        ).rejects.toThrow()
      }
    })
  })
})
