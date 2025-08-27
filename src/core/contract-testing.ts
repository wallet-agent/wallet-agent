/**
 * Contract testing and simulation utilities
 * Provides safe contract function simulation without gas costs or state changes
 */

import { getPublicClient } from "@wagmi/core"
import { type Address, encodeFunctionData, type Hex, type PublicClient } from "viem"
import { getAllChains } from "../chains.js"
import { getContainer } from "../container.js"
import { createLogger } from "../logger.js"
import { resolveContract } from "./contract-resolution.js"

const logger = createLogger("contract-testing")

export interface ContractSimulationParams {
  contract: string
  address?: Address
  function: string
  args?: unknown[]
  value?: string
  from?: Address
  blockNumber?: bigint
}

export interface SimulationResult {
  success: boolean
  returnValue?: unknown
  revertReason?: string
  gasUsed?: bigint
  stateChanges?: StateChange[]
  logs?: SimulationLog[]
}

export interface StateChange {
  address: Address
  slot: Hex
  oldValue: Hex
  newValue: Hex
  humanReadable?: string
}

export interface SimulationLog {
  address: Address
  topics: Hex[]
  data: Hex
  decoded?: {
    eventName: string
    args: Record<string, unknown>
  }
}

export interface TestScenario {
  name: string
  description: string
  params: ContractSimulationParams
  expectedOutcome: "success" | "revert"
  expectedRevertReason?: string
}

/**
 * Simulate a contract function call without executing it
 * Uses eth_call to test function behavior safely
 */
export async function simulateContractCall(
  params: ContractSimulationParams,
): Promise<SimulationResult> {
  const container = getContainer()
  const chainId = container.walletEffects.getCurrentChainId()
  const chain = getAllChains().find((c) => c.id === chainId)

  if (!chain) {
    throw new Error(`Chain ${chainId} not found`)
  }

  // Resolve contract
  const resolved = resolveContract(
    params.contract,
    params.address,
    chainId,
    container.contractAdapter,
  )

  const { address: contractAddress, abi } = resolved

  // Get public client
  const publicClient = getPublicClient(container.wagmiConfig, { chainId }) as PublicClient
  if (!publicClient) {
    throw new Error("Failed to get public client")
  }

  try {
    // Encode function data
    const data = encodeFunctionData({
      abi,
      functionName: params.function,
      args: (params.args || []) as readonly unknown[],
    })

    // Get caller address
    const from = params.from || (container.walletEffects.getCurrentAccount().address as Address)
    if (!from) {
      throw new Error("No caller address available")
    }

    // Simulate the call using eth_call
    const result = await publicClient.call({
      to: contractAddress,
      data,
      value: params.value ? BigInt(params.value) : undefined,
      account: from,
      blockNumber: params.blockNumber,
    })

    // For successful calls, try to decode the return value
    let returnValue: unknown
    try {
      if (result.data && result.data !== "0x") {
        // Find the function in ABI to get return types
        const functionAbi = abi.find(
          (item) => item.type === "function" && item.name === params.function,
        )

        if (functionAbi && "outputs" in functionAbi && functionAbi.outputs) {
          // Decode return value based on ABI
          returnValue = await publicClient.readContract({
            address: contractAddress,
            abi,
            functionName: params.function,
            args: params.args || [],
            account: from,
            blockNumber: params.blockNumber,
          })
        }
      }
    } catch (decodeError) {
      // If decoding fails, still consider the simulation successful
      logger.debug({ msg: "Failed to decode return value", error: decodeError })
    }

    return {
      success: true,
      returnValue,
      gasUsed: undefined, // CallReturnType doesn't include gasUsed
      stateChanges: [], // TODO: Implement state tracking
      logs: [], // TODO: Implement event log parsing
    }
  } catch (error) {
    // Handle revert/error cases
    const errorMessage = error instanceof Error ? error.message : String(error)

    // Extract revert reason from error message
    let revertReason = "Unknown error"
    if (errorMessage.includes("execution reverted")) {
      // Try to extract custom error or revert reason
      const match = errorMessage.match(/execution reverted:?\s*(.+)/)
      if (match?.[1]) {
        revertReason = match[1].trim()
      }
    } else if (errorMessage.includes("returned no data")) {
      revertReason = "Function call returned no data (possibly reverted)"
    }

    return {
      success: false,
      revertReason,
      gasUsed: undefined,
      stateChanges: [],
      logs: [],
    }
  }
}

/**
 * Generate test scenarios for a contract function based on its ABI
 */
export function generateTestScenarios(contractName: string, functionName: string): TestScenario[] {
  const container = getContainer()
  const chainId = container.walletEffects.getCurrentChainId()

  const resolved = resolveContract(contractName, undefined, chainId, container.contractAdapter)

  const functionAbi = resolved.abi.find(
    (item) => item.type === "function" && item.name === functionName,
  )

  if (!functionAbi || functionAbi.type !== "function") {
    throw new Error(`Function ${functionName} not found in ${contractName}`)
  }

  const scenarios: TestScenario[] = []
  const inputs = functionAbi.inputs || []

  // Basic success scenario
  scenarios.push({
    name: "Basic Success",
    description: `Test ${functionName} with typical valid inputs`,
    params: {
      contract: contractName,
      function: functionName,
      args: generateBasicArgs(inputs),
    },
    expectedOutcome: "success",
  })

  // Edge case scenarios based on input types
  if (inputs.some((input) => input.type.includes("uint"))) {
    scenarios.push({
      name: "Zero Values",
      description: `Test ${functionName} with zero values for numeric inputs`,
      params: {
        contract: contractName,
        function: functionName,
        args: generateZeroArgs(inputs),
      },
      expectedOutcome: "success",
    })

    scenarios.push({
      name: "Maximum Values",
      description: `Test ${functionName} with maximum values for numeric inputs`,
      params: {
        contract: contractName,
        function: functionName,
        args: generateMaxArgs(inputs),
      },
      expectedOutcome: "success",
    })
  }

  // Address validation scenarios
  if (inputs.some((input) => input.type === "address")) {
    scenarios.push({
      name: "Zero Address",
      description: `Test ${functionName} with zero address (0x0)`,
      params: {
        contract: contractName,
        function: functionName,
        args: generateZeroAddressArgs(inputs),
      },
      expectedOutcome: "revert",
      expectedRevertReason: "Zero address not allowed",
    })
  }

  return scenarios
}

/**
 * Run multiple test scenarios and return aggregated results
 */
export async function runTestScenarios(scenarios: TestScenario[]): Promise<{
  totalTests: number
  passed: number
  failed: number
  results: Array<{
    scenario: TestScenario
    result: SimulationResult
    passed: boolean
  }>
}> {
  const results = []
  let passed = 0
  let failed = 0

  for (const scenario of scenarios) {
    try {
      const result = await simulateContractCall(scenario.params)

      // Check if result matches expectations
      const testPassed =
        (scenario.expectedOutcome === "success" && result.success) ||
        (scenario.expectedOutcome === "revert" && !result.success)

      if (testPassed) {
        passed++
      } else {
        failed++
      }

      results.push({
        scenario,
        result,
        passed: testPassed,
      })
    } catch (error) {
      failed++
      results.push({
        scenario,
        result: {
          success: false,
          revertReason: error instanceof Error ? error.message : String(error),
        },
        passed: false,
      })
    }
  }

  return {
    totalTests: scenarios.length,
    passed,
    failed,
    results,
  }
}

// Helper functions for generating test arguments

function generateBasicArgs(inputs: readonly { type: string; name?: string }[]): unknown[] {
  return inputs.map((input) => {
    switch (input.type) {
      case "address":
        return "0x1234567890123456789012345678901234567890"
      case "uint256":
      case "uint":
        return "1000"
      case "uint8":
        return "10"
      case "bool":
        return true
      case "string":
        return "test"
      case "bytes":
      case "bytes32":
        return "0x1234567890abcdef"
      default:
        if (input.type.startsWith("uint")) {
          return "100"
        }
        return "0x0"
    }
  })
}

function generateZeroArgs(inputs: readonly { type: string; name?: string }[]): unknown[] {
  return inputs.map((input) => {
    switch (input.type) {
      case "address":
        return "0x0000000000000000000000000000000000000000"
      case "bool":
        return false
      case "string":
        return ""
      default:
        if (input.type.includes("uint") || input.type.includes("int")) {
          return "0"
        }
        return "0x0"
    }
  })
}

function generateMaxArgs(inputs: readonly { type: string; name?: string }[]): unknown[] {
  return inputs.map((input) => {
    switch (input.type) {
      case "uint256":
        return "115792089237316195423570985008687907853269984665640564039457584007913129639935" // 2^256 - 1
      case "uint8":
        return "255"
      case "uint16":
        return "65535"
      case "uint32":
        return "4294967295"
      default:
        return generateBasicArgs([input])[0]
    }
  })
}

function generateZeroAddressArgs(inputs: readonly { type: string; name?: string }[]): unknown[] {
  return inputs.map((input) => {
    if (input.type === "address") {
      return "0x0000000000000000000000000000000000000000"
    }
    return generateBasicArgs([input])[0]
  })
}
