import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js"
import type { Address } from "viem"
import { z } from "zod"
import {
  listContracts,
  loadWagmiConfig,
  readContract,
  writeContract,
} from "../../contract-operations.js"
import { BaseToolHandler, type ToolResponse } from "../handler-registry.js"

/**
 * Handler for loading Wagmi config
 */
export class LoadWagmiConfigHandler extends BaseToolHandler {
  constructor() {
    super("load_wagmi_config", "Load contract ABIs from a Wagmi-generated file")
  }

  async execute(args: unknown) {
    const { filePath } = this.validateArgs(z.object({ filePath: z.string() }), args)

    await loadWagmiConfig(filePath)
    const contracts = listContracts()

    return this.createTextResponse(
      `Loaded ${contracts.length} contracts from Wagmi config:\n` +
        `${contracts.map((c) => c.name).join(", ")}`,
    )
  }
}

/**
 * Handler for listing contracts
 */
export class ListContractsHandler extends BaseToolHandler {
  constructor() {
    super("list_contracts", "List all available contracts from Wagmi config")
  }

  async execute(_args: unknown) {
    const contracts = listContracts()

    if (contracts.length === 0) {
      return this.createTextResponse("No contracts loaded. Use load_wagmi_config first.")
    }

    const contractList = contracts.map((c) => `- ${c.name}`).join("\n")

    return this.createTextResponse(`Available contracts:\n${contractList}`)
  }
}

/**
 * Handler for writing to contracts
 */
export class WriteContractHandler extends BaseToolHandler {
  constructor() {
    super("write_contract", "Write to a smart contract using Wagmi-generated ABIs")
  }

  async execute(args: unknown): Promise<ToolResponse> {
    // Use loose validation since contract args can be complex
    const params = args as {
      contract: string
      function: string
      address?: string
      args?: unknown[]
      value?: string
    }

    if (!params.contract || !params.function) {
      throw new McpError(ErrorCode.InvalidParams, "contract and function are required")
    }

    const result = await writeContract({
      ...params,
      address: params.address as Address | undefined,
    })
    return this.createTextResponse(
      `Transaction sent successfully\n` +
        `Hash: ${result}\n` +
        `Contract: ${params.contract}\n` +
        `Function: ${params.function}`,
    )
  }
}

/**
 * Handler for reading from contracts
 */
export class ReadContractHandler extends BaseToolHandler {
  constructor() {
    super("read_contract", "Read from a smart contract using Wagmi-generated ABIs")
  }

  async execute(args: unknown): Promise<ToolResponse> {
    // Use loose validation since contract args can be complex
    const params = args as {
      contract: string
      function: string
      address?: string
      args?: unknown[]
    }

    if (!params.contract || !params.function) {
      throw new McpError(ErrorCode.InvalidParams, "contract and function are required")
    }

    const result = await readContract({
      ...params,
      address: params.address as Address | undefined,
    })

    // Format the result based on its type
    let formattedResult: string
    if (typeof result === "bigint") {
      formattedResult = result.toString()
    } else if (typeof result === "object" && result !== null) {
      formattedResult = JSON.stringify(result, null, 2)
    } else {
      formattedResult = String(result)
    }

    return this.createTextResponse(
      `Contract read successful:\n` +
        `Result: ${formattedResult}\n` +
        `Contract: ${params.contract}\n` +
        `Function: ${params.function}`,
    )
  }
}

// Export all handlers as an array for easy registration
export const contractHandlers = [
  new LoadWagmiConfigHandler(),
  new ListContractsHandler(),
  new WriteContractHandler(),
  new ReadContractHandler(),
]
