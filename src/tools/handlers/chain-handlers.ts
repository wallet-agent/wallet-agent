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
    updateCustomChain(validatedArgs.chainId, validatedArgs)
    return this.createTextResponse(`Custom chain ${validatedArgs.chainId} updated successfully`)
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
    return this.createTextResponse(`Custom chain ${chainId} removed successfully`)
  }
}

// Export all handlers as an array for easy registration
export const chainHandlers = [
  new AddCustomChainHandler(),
  new UpdateCustomChainHandler(),
  new RemoveCustomChainHandler(),
]
