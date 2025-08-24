import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js"
import { addCustomChain, removeCustomChain, updateCustomChain } from "../../chains.js"
import {
  AddCustomChainArgsSchema,
  RemoveCustomChainArgsSchema,
  UpdateCustomChainArgsSchema,
} from "../../schemas.js"
import { BaseToolHandler } from "../handler-registry.js"

/**
 * Handler for adding custom chains
 */
export class AddCustomChainHandler extends BaseToolHandler {
  constructor() {
    super("add_custom_chain", "Add a custom EVM-compatible blockchain network")
  }

  async execute(args: unknown) {
    const validatedArgs = this.validateArgs(AddCustomChainArgsSchema, args)
    const chain = addCustomChain(
      validatedArgs.chainId,
      validatedArgs.name,
      validatedArgs.rpcUrl,
      validatedArgs.nativeCurrency,
      validatedArgs.blockExplorerUrl,
    )

    return this.createTextResponse(
      `Custom chain added successfully:\n` +
        `Name: ${chain.name}\n` +
        `Chain ID: ${chain.id}\n` +
        `RPC URL: ${chain.rpcUrls.default.http[0]}\n` +
        `Native Currency: ${chain.nativeCurrency.symbol}`,
    )
  }
}

/**
 * Handler for updating custom chains
 */
export class UpdateCustomChainHandler extends BaseToolHandler {
  constructor() {
    super("update_custom_chain", "Update an existing custom chain's configuration")
  }

  async execute(args: unknown) {
    const validatedArgs = this.validateArgs(UpdateCustomChainArgsSchema, args)
    const updates: Parameters<typeof updateCustomChain>[1] = {}
    if (validatedArgs.name) updates.name = validatedArgs.name
    if (validatedArgs.rpcUrl) updates.rpcUrl = validatedArgs.rpcUrl
    if (validatedArgs.nativeCurrency) updates.nativeCurrency = validatedArgs.nativeCurrency
    if (validatedArgs.blockExplorerUrl) updates.blockExplorerUrl = validatedArgs.blockExplorerUrl

    try {
      updateCustomChain(validatedArgs.chainId, updates)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      // Chain not found errors should be treated as invalid params
      if (errorMessage.includes("not found")) {
        throw new McpError(ErrorCode.InvalidParams, errorMessage)
      }
      throw error
    }

    const updatesList = []
    if (updates.name) updatesList.push(`Name: ${updates.name}`)
    if (updates.rpcUrl) updatesList.push(`RPC URL: ${updates.rpcUrl}`)
    if (updates.nativeCurrency)
      updatesList.push(`Native Currency: ${updates.nativeCurrency.symbol}`)
    if (updates.blockExplorerUrl) updatesList.push(`Block Explorer: ${updates.blockExplorerUrl}`)

    return this.createTextResponse(
      `Custom chain ${validatedArgs.chainId} updated successfully:\n${updatesList.map((item) => `- ${item}`).join("\n")}`,
    )
  }
}

/**
 * Handler for removing custom chains
 */
export class RemoveCustomChainHandler extends BaseToolHandler {
  constructor() {
    super("remove_custom_chain", "Remove a previously added custom chain")
  }

  async execute(args: unknown) {
    const { chainId } = this.validateArgs(RemoveCustomChainArgsSchema, args)
    removeCustomChain(chainId)
    return this.createTextResponse(`Custom chain ${chainId} removed successfully.`)
  }
}

// Export all handlers as an array for easy registration
export const chainHandlers = [
  new AddCustomChainHandler(),
  new UpdateCustomChainHandler(),
  new RemoveCustomChainHandler(),
]
