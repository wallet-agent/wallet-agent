/**
 * MCP tool handlers for Wagmi ABI extraction and analysis
 */

import { writeFile } from "node:fs/promises"
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js"
import type { Abi, AbiEvent, AbiFunction } from "viem"
import { z } from "zod"
import { getContainer } from "../../container.js"
import { listContracts } from "../../contract-operations.js"
import { resolveContract } from "../../core/contract-resolution.js"
import { BaseToolHandler, type ToolResponse } from "../handler-registry.js"

/**
 * Get contract ABI by name with validation
 */
async function getContractAbi(
  contractName: string,
): Promise<{ abi: Abi; addresses?: Record<number, string> }> {
  const contracts = listContracts()

  const contract = contracts.find((c) => c.name === contractName)
  if (!contract) {
    const availableContracts = contracts.map((c) => c.name).join(", ")
    throw new McpError(
      ErrorCode.InvalidParams,
      `Contract "${contractName}" not found. Available contracts: ${availableContracts || "none"}. Use load_wagmi_config first.`,
    )
  }

  const container = getContainer()
  const currentChainId = container.walletEffects.getCurrentChainId()

  const resolved = resolveContract(
    contractName,
    undefined, // let it resolve the address
    currentChainId,
    container.contractAdapter,
  )

  return {
    abi: resolved.abi,
    addresses: undefined, // For now, we don't return addresses - could be enhanced later
  }
}

/**
 * Format ABI in different output formats
 */
function formatAbi(
  abi: Abi,
  format: string = "json",
  includeAddresses?: Record<number, string>,
): string {
  switch (format) {
    case "json": {
      const output = includeAddresses ? { abi, addresses: includeAddresses } : abi
      return JSON.stringify(output, null, 2)
    }

    case "typescript": {
      const abiString = JSON.stringify(abi, null, 2)
      const addressesString = includeAddresses
        ? `\n\nexport const addresses = ${JSON.stringify(includeAddresses, null, 2)} as const`
        : ""
      return `export const abi = ${abiString} as const${addressesString}`
    }

    case "human-readable":
      return formatAbiHumanReadable(abi)

    default:
      return JSON.stringify(abi, null, 2)
  }
}

/**
 * Format ABI in human-readable format
 */
function formatAbiHumanReadable(abi: Abi): string {
  const functions: string[] = []
  const events: string[] = []
  const errors: string[] = []

  for (const item of abi) {
    switch (item.type) {
      case "function": {
        const func = item as AbiFunction
        const inputs = func.inputs?.map((input) => `${input.type} ${input.name}`).join(", ") || ""
        const outputs = func.outputs?.map((output) => output.type).join(", ") || "void"
        const mutability = func.stateMutability === "nonpayable" ? "" : ` ${func.stateMutability}`
        functions.push(`  ${func.name}(${inputs})${mutability} -> ${outputs}`)
        break
      }
      case "event": {
        const event = item as AbiEvent
        const inputs =
          event.inputs
            ?.map((input) => {
              const indexed = input.indexed ? " indexed" : ""
              return `${input.type}${indexed} ${input.name}`
            })
            .join(", ") || ""
        events.push(`  ${event.name}(${inputs})`)
        break
      }
      case "error": {
        const errorInputs =
          item.inputs?.map((input) => `${input.type} ${input.name}`).join(", ") || ""
        errors.push(`  ${item.name}(${errorInputs})`)
        break
      }
    }
  }

  let output = ""
  if (functions.length > 0) {
    output += `📋 **Functions:**\n${functions.join("\n")}\n\n`
  }
  if (events.length > 0) {
    output += `📡 **Events:**\n${events.join("\n")}\n\n`
  }
  if (errors.length > 0) {
    output += `❌ **Errors:**\n${errors.join("\n")}\n\n`
  }

  return output.trim() || "No functions, events, or errors found in ABI"
}

/**
 * Detect standard interfaces (ERC20, ERC721, etc)
 */
function detectStandards(abi: Abi): string[] {
  const functionNames = abi
    .filter((item) => item.type === "function")
    .map((item) => (item as AbiFunction).name)

  const eventNames = abi
    .filter((item) => item.type === "event")
    .map((item) => (item as AbiEvent).name)

  const standards: string[] = []

  // ERC20 detection
  const erc20Functions = [
    "name",
    "symbol",
    "decimals",
    "totalSupply",
    "balanceOf",
    "transfer",
    "transferFrom",
    "approve",
    "allowance",
  ]
  const erc20Events = ["Transfer", "Approval"]
  if (
    erc20Functions.every((fn) => functionNames.includes(fn)) &&
    erc20Events.every((ev) => eventNames.includes(ev))
  ) {
    standards.push("ERC-20")
  }

  // ERC721 detection
  const erc721Functions = [
    "balanceOf",
    "ownerOf",
    "approve",
    "getApproved",
    "setApprovalForAll",
    "isApprovedForAll",
    "transferFrom",
    "safeTransferFrom",
  ]
  const erc721Events = ["Transfer", "Approval", "ApprovalForAll"]
  if (
    erc721Functions.every((fn) => functionNames.includes(fn)) &&
    erc721Events.every((ev) => eventNames.includes(ev))
  ) {
    standards.push("ERC-721")
  }

  // ERC1155 detection
  const erc1155Functions = [
    "balanceOf",
    "balanceOfBatch",
    "setApprovalForAll",
    "isApprovedForAll",
    "safeTransferFrom",
    "safeBatchTransferFrom",
  ]
  const erc1155Events = ["TransferSingle", "TransferBatch", "ApprovalForAll"]
  if (
    erc1155Functions.every((fn) => functionNames.includes(fn)) &&
    erc1155Events.every((ev) => eventNames.includes(ev))
  ) {
    standards.push("ERC-1155")
  }

  // Ownable detection
  if (
    functionNames.includes("owner") &&
    functionNames.includes("transferOwnership") &&
    eventNames.includes("OwnershipTransferred")
  ) {
    standards.push("Ownable")
  }

  // AccessControl detection
  if (
    functionNames.includes("hasRole") &&
    functionNames.includes("grantRole") &&
    functionNames.includes("revokeRole") &&
    eventNames.includes("RoleGranted")
  ) {
    standards.push("AccessControl")
  }

  // Upgradeable detection
  if (
    functionNames.includes("upgradeTo") ||
    functionNames.includes("upgradeToAndCall") ||
    eventNames.includes("Upgraded")
  ) {
    standards.push("Upgradeable")
  }

  return standards
}

/**
 * Extract ABI for a specific contract
 */
export class ExtractWagmiAbiHandler extends BaseToolHandler {
  constructor() {
    super("extract_wagmi_abi", "Extract ABI for a specific contract from loaded Wagmi config")
  }

  async execute(args: unknown): Promise<ToolResponse> {
    const { contract, format } = this.validateArgs(
      z.object({
        contract: z.string(),
        format: z.enum(["json", "typescript", "human-readable"]).optional().default("json"),
      }),
      args,
    )

    try {
      const { abi, addresses } = await getContractAbi(contract)
      const formattedAbi = formatAbi(abi, format, addresses)

      return this.createTextResponse(
        `🔍 **ABI for ${contract}** (${format} format):\n\n` +
          `\`\`\`${format === "typescript" ? "typescript" : "json"}\n${formattedAbi}\n\`\`\``,
      )
    } catch (error) {
      if (error instanceof McpError) throw error
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to extract ABI: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }
}

/**
 * List all callable functions for a contract
 */
export class ListWagmiFunctionsHandler extends BaseToolHandler {
  constructor() {
    super("list_wagmi_functions", "List all callable functions for a contract from Wagmi config")
  }

  async execute(args: unknown): Promise<ToolResponse> {
    const { contract, type } = this.validateArgs(
      z.object({
        contract: z.string(),
        type: z.enum(["view", "pure", "nonpayable", "payable", "all"]).optional().default("all"),
      }),
      args,
    )

    try {
      const { abi } = await getContractAbi(contract)

      const functions = abi
        .filter((item) => item.type === "function")
        .map((item) => item as AbiFunction)
        .filter((func) => type === "all" || func.stateMutability === type)

      if (functions.length === 0) {
        return this.createTextResponse(
          `📋 **Functions for ${contract}** (${type}):\n\n` +
            `No ${type === "all" ? "" : `${type} `}functions found in this contract.`,
        )
      }

      const functionList = functions
        .map((func) => {
          const inputs = func.inputs?.map((input) => `${input.type} ${input.name}`).join(", ") || ""
          const outputs =
            func.outputs
              ?.map((output) => `${output.type}${output.name ? ` ${output.name}` : ""}`)
              .join(", ") || "void"
          const mutability = func.stateMutability === "nonpayable" ? "" : ` ${func.stateMutability}`

          return `  **${func.name}**(${inputs})${mutability}\n    → Returns: ${outputs}`
        })
        .join("\n\n")

      const summary = `Found ${functions.length} ${type === "all" ? "" : `${type} `}function${functions.length === 1 ? "" : "s"}`

      return this.createTextResponse(
        `📋 **Functions for ${contract}** (${type}):\n\n` + `${summary}\n\n${functionList}`,
      )
    } catch (error) {
      if (error instanceof McpError) throw error
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to list functions: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }
}

/**
 * List all events that a contract can emit
 */
export class ListWagmiEventsHandler extends BaseToolHandler {
  constructor() {
    super("list_wagmi_events", "List all events that a contract can emit from Wagmi config")
  }

  async execute(args: unknown): Promise<ToolResponse> {
    const { contract } = this.validateArgs(
      z.object({
        contract: z.string(),
      }),
      args,
    )

    try {
      const { abi } = await getContractAbi(contract)

      const events = abi.filter((item) => item.type === "event").map((item) => item as AbiEvent)

      if (events.length === 0) {
        return this.createTextResponse(
          `📡 **Events for ${contract}**:\n\nNo events found in this contract.`,
        )
      }

      const eventList = events
        .map((event) => {
          const inputs =
            event.inputs
              ?.map((input) => {
                const indexed = input.indexed ? " indexed" : ""
                return `${input.type}${indexed} ${input.name}`
              })
              .join(", ") || ""

          return `  **${event.name}**(${inputs})`
        })
        .join("\n")

      const summary = `Found ${events.length} event${events.length === 1 ? "" : "s"}`

      return this.createTextResponse(
        `📡 **Events for ${contract}**:\n\n` + `${summary}\n\n${eventList}`,
      )
    } catch (error) {
      if (error instanceof McpError) throw error
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to list events: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }
}

/**
 * Export contract ABI to a file
 */
export class ExportWagmiAbiHandler extends BaseToolHandler {
  constructor() {
    super("export_wagmi_abi", "Export contract ABI to a file in specified format")
  }

  async execute(args: unknown): Promise<ToolResponse> {
    const { contract, filePath, format, includeAddresses } = this.validateArgs(
      z.object({
        contract: z.string(),
        filePath: z.string(),
        format: z.enum(["json", "typescript"]).optional().default("json"),
        includeAddresses: z.boolean().optional().default(false),
      }),
      args,
    )

    try {
      const { abi, addresses } = await getContractAbi(contract)
      const addressesToInclude = includeAddresses ? addresses : undefined
      const formattedAbi = formatAbi(abi, format, addressesToInclude)

      await writeFile(filePath, formattedAbi, "utf-8")

      const sizeInfo = `${Math.round((formattedAbi.length / 1024) * 10) / 10}KB`
      const addressInfo =
        includeAddresses && addresses
          ? ` with ${Object.keys(addresses).length} chain addresses`
          : ""

      return this.createTextResponse(
        `💾 **ABI exported successfully!**\n\n` +
          `**Contract:** ${contract}\n` +
          `**File:** ${filePath}\n` +
          `**Format:** ${format}\n` +
          `**Size:** ${sizeInfo}${addressInfo}\n\n` +
          `The ABI has been written to the specified file and is ready for use.`,
      )
    } catch (error) {
      if (error instanceof McpError) throw error
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to export ABI: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }
}

/**
 * Analyze contract capabilities and detect standards
 */
export class AnalyzeWagmiContractHandler extends BaseToolHandler {
  constructor() {
    super(
      "analyze_wagmi_contract",
      "Analyze contract capabilities and detect standards (ERC20, ERC721, etc)",
    )
  }

  async execute(args: unknown): Promise<ToolResponse> {
    const { contract } = this.validateArgs(
      z.object({
        contract: z.string(),
      }),
      args,
    )

    try {
      const { abi, addresses } = await getContractAbi(contract)

      // Count different types of items
      const functions = abi.filter((item) => item.type === "function").length
      const events = abi.filter((item) => item.type === "event").length
      const errors = abi.filter((item) => item.type === "error").length

      // Function type breakdown
      const viewFunctions = abi.filter(
        (item) => item.type === "function" && (item as AbiFunction).stateMutability === "view",
      ).length
      const pureFunctions = abi.filter(
        (item) => item.type === "function" && (item as AbiFunction).stateMutability === "pure",
      ).length
      const payableFunctions = abi.filter(
        (item) => item.type === "function" && (item as AbiFunction).stateMutability === "payable",
      ).length
      const nonpayableFunctions = functions - viewFunctions - pureFunctions - payableFunctions

      // Detect standards
      const standards = detectStandards(abi)

      // Deployment info
      const deploymentInfo = addresses
        ? `\n**Deployments:** ${Object.keys(addresses).length} chain${Object.keys(addresses).length === 1 ? "" : "s"}`
        : ""

      return this.createTextResponse(
        `🔬 **Contract Analysis: ${contract}**\n\n` +
          `**📊 Overview:**\n` +
          `- Functions: ${functions} total\n` +
          `- Events: ${events}\n` +
          `- Custom Errors: ${errors}${deploymentInfo}\n\n` +
          `**🔧 Function Breakdown:**\n` +
          `- View (read-only): ${viewFunctions}\n` +
          `- Pure (no state access): ${pureFunctions}\n` +
          `- Payable (accepts ETH): ${payableFunctions}\n` +
          `- Non-payable (state-changing): ${nonpayableFunctions}\n\n` +
          `**🏷️ Detected Standards:**\n` +
          (standards.length > 0
            ? standards.map((s) => `- ${s}`).join("\n")
            : "- No standard interfaces detected") +
          "\n\n" +
          `**💡 Recommendations:**\n` +
          (standards.includes("ERC-20")
            ? "- This is a token contract - use token transfer tools\n"
            : "") +
          (standards.includes("ERC-721")
            ? "- This is an NFT contract - use NFT transfer tools\n"
            : "") +
          (standards.includes("Ownable")
            ? "- This contract has an owner - check ownership functions\n"
            : "") +
          (payableFunctions > 0
            ? "- Contract accepts ETH payments - ensure proper value handling\n"
            : "") +
          (functions > 10 ? "- Large contract - consider using function filtering\n" : "") +
          (standards.length === 0
            ? "- Custom contract - review functions carefully before interaction"
            : ""),
      )
    } catch (error) {
      if (error instanceof McpError) throw error
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to analyze contract: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }
}

/**
 * Export all wagmi ABI extraction handlers
 */
export const wagmiAbiHandlers = [
  new ExtractWagmiAbiHandler(),
  new ListWagmiFunctionsHandler(),
  new ListWagmiEventsHandler(),
  new ExportWagmiAbiHandler(),
  new AnalyzeWagmiContractHandler(),
]
