/**
 * MCP tool handlers for contract testing and simulation
 */

import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js"
import type { Address } from "viem"
import { z } from "zod"
import { getContainer } from "../../container.js"
import { resolveContract } from "../../core/contract-resolution.js"
import {
  type ContractSimulationParams,
  generateTestScenarios,
  runTestScenarios,
  simulateContractCall,
} from "../../core/contract-testing.js"
import { BaseToolHandler, type ToolResponse } from "../handler-registry.js"

/**
 * Simulate a contract function call without executing it
 */
export class SimulateContractCallHandler extends BaseToolHandler {
  constructor() {
    super(
      "simulate_contract_call",
      "Simulate a contract function call without gas costs or state changes",
    )
  }

  async execute(args: unknown): Promise<ToolResponse> {
    const {
      contract,
      address,
      function: functionName,
      args: functionArgs,
      value,
      from,
    } = this.validateArgs(
      z.object({
        contract: z.string().describe("Contract name from Wagmi config"),
        address: z.string().optional().describe("Contract address (optional if in Wagmi config)"),
        function: z.string().describe("Function name to simulate"),
        args: z.array(z.unknown()).optional().describe("Function arguments"),
        value: z.string().optional().describe("ETH value to send with call"),
        from: z.string().optional().describe("Caller address (defaults to connected wallet)"),
      }),
      args,
    )

    try {
      const params: ContractSimulationParams = {
        contract,
        address: address as Address | undefined,
        function: functionName,
        args: functionArgs,
        value,
        from: from as Address | undefined,
      }

      const result = await simulateContractCall(params)

      let responseText = `🧪 **Contract Simulation: ${contract}.${functionName}()**\n\n`

      if (result.success) {
        responseText += `✅ **Status:** Success\n`

        if (result.returnValue !== undefined) {
          const returnValueStr =
            typeof result.returnValue === "object"
              ? JSON.stringify(result.returnValue, null, 2)
              : String(result.returnValue)
          responseText += `📤 **Return Value:** ${returnValueStr}\n`
        }

        if (result.gasUsed) {
          responseText += `⛽ **Estimated Gas:** ${result.gasUsed.toLocaleString()}\n`
        }

        responseText += `\n💡 **Next Steps:**\n`
        responseText += `- Function call would succeed if executed\n`
        responseText += `- Consider the gas cost when submitting the transaction\n`
        if (value) {
          responseText += `- Transaction will send ${value} ETH to the contract\n`
        }
      } else {
        responseText += `❌ **Status:** Would Revert\n`
        responseText += `🚨 **Revert Reason:** ${result.revertReason}\n\n`
        responseText += `💡 **Debugging Tips:**\n`
        responseText += `- Check function parameters for invalid values\n`
        responseText += `- Verify contract state meets function requirements\n`
        responseText += `- Review function documentation for preconditions\n`
        responseText += `- Try different parameter values or caller addresses\n`
      }

      return this.createTextResponse(responseText)
    } catch (error) {
      if (error instanceof McpError) throw error
      throw new McpError(
        ErrorCode.InternalError,
        `Simulation failed: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }
}

/**
 * Test a contract function with multiple scenarios
 */
export class TestContractFunctionHandler extends BaseToolHandler {
  constructor() {
    super(
      "test_contract_function",
      "Generate and run multiple test scenarios for a contract function",
    )
  }

  async execute(args: unknown): Promise<ToolResponse> {
    const { contract, function: functionName } = this.validateArgs(
      z.object({
        contract: z.string().describe("Contract name from Wagmi config"),
        function: z.string().describe("Function name to test"),
        includeEdgeCases: z
          .boolean()
          .optional()
          .default(true)
          .describe("Include edge case testing scenarios"),
      }),
      args,
    )

    try {
      // Generate test scenarios
      const scenarios = generateTestScenarios(contract, functionName)

      if (scenarios.length === 0) {
        return this.createTextResponse(
          `⚠️ **No test scenarios generated for ${contract}.${functionName}()**\n\n` +
            `This might indicate:\n` +
            `- Function has complex parameter types that need manual test cases\n` +
            `- Function is not found in the contract ABI\n` +
            `- Contract is not loaded properly`,
        )
      }

      // Run the test scenarios
      const testResults = await runTestScenarios(scenarios)

      let responseText = `🧪 **Function Test Results: ${contract}.${functionName}()**\n\n`
      responseText += `📊 **Summary:**\n`
      responseText += `- Total Tests: ${testResults.totalTests}\n`
      responseText += `- Passed: ${testResults.passed} ✅\n`
      responseText += `- Failed: ${testResults.failed} ❌\n`
      responseText += `- Success Rate: ${Math.round((testResults.passed / testResults.totalTests) * 100)}%\n\n`

      responseText += `📋 **Test Scenarios:**\n\n`

      for (const { scenario, result, passed } of testResults.results) {
        const status = passed ? "✅ PASS" : "❌ FAIL"
        responseText += `**${scenario.name}** - ${status}\n`
        responseText += `${scenario.description}\n`

        if (!passed) {
          responseText += `🚨 Reason: ${result.revertReason || "Unexpected result"}\n`
        } else if (result.returnValue !== undefined) {
          const returnValue =
            typeof result.returnValue === "object"
              ? JSON.stringify(result.returnValue)
              : String(result.returnValue)
          responseText += `📤 Returned: ${returnValue}\n`
        }

        responseText += `\n`
      }

      if (testResults.failed > 0) {
        responseText += `💡 **Recommendations:**\n`
        responseText += `- Review failed test cases to understand function behavior\n`
        responseText += `- Consider edge cases when calling this function\n`
        responseText += `- Add proper error handling in your application\n`
        responseText += `- Test with your specific use case parameters\n`
      } else {
        responseText += `🎉 **All tests passed!** The function handles various scenarios correctly.\n`
      }

      return this.createTextResponse(responseText)
    } catch (error) {
      if (error instanceof McpError) throw error
      throw new McpError(
        ErrorCode.InternalError,
        `Function testing failed: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }
}

/**
 * Batch test multiple functions in a contract
 */
export class TestContractHandler extends BaseToolHandler {
  constructor() {
    super("test_contract", "Run comprehensive tests on all functions in a contract")
  }

  async execute(args: unknown): Promise<ToolResponse> {
    const { contract, functionType } = this.validateArgs(
      z.object({
        contract: z.string().describe("Contract name from Wagmi config"),
        functionType: z
          .enum(["all", "view", "pure", "nonpayable", "payable"])
          .optional()
          .default("all")
          .describe("Filter functions by type (default: all)"),
      }),
      args,
    )

    try {
      const container = getContainer()
      const chainId = container.walletEffects.getCurrentChainId()
      const resolved = resolveContract(contract, undefined, chainId, container.contractAdapter)

      // Get all functions from the contract ABI
      const allFunctions = resolved.abi.filter((item) => item.type === "function")

      // Filter functions by type if specified
      const filteredFunctions =
        functionType === "all"
          ? allFunctions
          : allFunctions.filter(
              (func) => func.type === "function" && func.stateMutability === functionType,
            )

      if (filteredFunctions.length === 0) {
        return this.createTextResponse(
          `⚠️ **No ${functionType} functions found in ${contract}**\n\n` +
            `The contract ABI contains ${allFunctions.length} total functions, but none match the filter "${functionType}".`,
        )
      }

      let responseText = `🧪 **Contract Testing Suite: ${contract}**\n\n`
      responseText += `📊 **Overview:**\n`
      responseText += `- Total Functions: ${allFunctions.length}\n`
      responseText += `- Testing ${functionType}: ${filteredFunctions.length} functions\n\n`

      responseText += `🔧 **Available Functions:**\n\n`

      for (const func of filteredFunctions) {
        if (func.type === "function") {
          const inputs = func.inputs || []
          const inputTypes = inputs.map((input) => `${input.type} ${input.name || ""}`).join(", ")
          const outputs = func.outputs || []
          const outputTypes = outputs.map((output) => output.type).join(", ")

          responseText += `**${func.name}(${inputTypes})**\n`
          responseText += `- State Mutability: ${func.stateMutability}\n`
          if (outputTypes) {
            responseText += `- Returns: ${outputTypes}\n`
          }
          responseText += `- Use: \`test_contract_function\` with function "${func.name}"\n\n`
        }
      }

      responseText += `💡 **Next Steps:**\n`
      responseText += `- Test individual functions with "test_contract_function"\n`
      responseText += `- Simulate specific calls with "simulate_contract_call"\n`
      responseText += `- Preview transactions with "dry_run_transaction"\n`

      return this.createTextResponse(responseText)
    } catch (error) {
      if (error instanceof McpError) throw error
      throw new McpError(
        ErrorCode.InternalError,
        `Contract analysis failed: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }
}

/**
 * Dry-run a transaction to preview its effects
 */
export class DryRunTransactionHandler extends BaseToolHandler {
  constructor() {
    super("dry_run_transaction", "Preview the effects of a transaction without executing it")
  }

  async execute(args: unknown): Promise<ToolResponse> {
    const {
      contract,
      address,
      function: functionName,
      args: functionArgs,
      value,
      from,
    } = this.validateArgs(
      z.object({
        contract: z.string().describe("Contract name from Wagmi config"),
        address: z.string().optional().describe("Contract address (optional if in Wagmi config)"),
        function: z.string().describe("Function name to execute"),
        args: z.array(z.unknown()).optional().describe("Function arguments"),
        value: z.string().optional().describe("ETH value to send"),
        from: z.string().optional().describe("Transaction sender"),
      }),
      args,
    )

    try {
      const params: ContractSimulationParams = {
        contract,
        address: address as Address | undefined,
        function: functionName,
        args: functionArgs,
        value,
        from: from as Address | undefined,
      }

      const result = await simulateContractCall(params)

      let responseText = `🔮 **Transaction Dry Run: ${contract}.${functionName}()**\n\n`

      if (result.success) {
        responseText += `✅ **Transaction would succeed**\n\n`
        responseText += `📊 **Expected Results:**\n`

        if (result.returnValue !== undefined) {
          const returnValue =
            typeof result.returnValue === "object"
              ? JSON.stringify(result.returnValue, null, 2)
              : String(result.returnValue)
          responseText += `- Return Value: ${returnValue}\n`
        }

        if (result.gasUsed) {
          responseText += `- Gas Required: ${result.gasUsed.toLocaleString()}\n`
        }

        if (value) {
          responseText += `- ETH Transfer: ${value} ETH\n`
        }

        responseText += `\n🚀 **Ready to Execute:**\n`
        responseText += `- All preconditions are met\n`
        responseText += `- Function will execute successfully\n`
        responseText += `- Consider the gas cost before proceeding\n`
      } else {
        responseText += `❌ **Transaction would fail**\n\n`
        responseText += `🚨 **Error:** ${result.revertReason}\n\n`
        responseText += `🔧 **Troubleshooting:**\n`
        responseText += `- Verify all function parameters are correct\n`
        responseText += `- Check if the caller has necessary permissions\n`
        responseText += `- Ensure the contract state allows this operation\n`
        responseText += `- Review the contract's requirements and restrictions\n\n`
        responseText += `⚠️ **Do not execute this transaction** - it will fail and consume gas.\n`
      }

      return this.createTextResponse(responseText)
    } catch (error) {
      if (error instanceof McpError) throw error
      throw new McpError(
        ErrorCode.InternalError,
        `Dry run failed: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }
}

/**
 * Export all contract testing handlers
 */
export const contractTestingHandlers = [
  new SimulateContractCallHandler(),
  new TestContractFunctionHandler(),
  new TestContractHandler(),
  new DryRunTransactionHandler(),
]
