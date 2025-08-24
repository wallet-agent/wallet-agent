import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js"
import { z } from "zod"
import { getContainer } from "../../container.js"
import { EnsNameSchema } from "../../schemas.js"
import { BaseToolHandler } from "../handler-registry.js"

/**
 * Handler for resolving ENS names
 */
export class ResolveENSNameHandler extends BaseToolHandler {
  constructor() {
    super("resolve_ens_name", "Resolve an ENS name to an Ethereum address (mainnet only)")
  }

  async execute(args: unknown) {
    const { name } = this.validateArgs(EnsNameSchema, args)

    const container = getContainer()
    const address = await container.transactionEffects.resolveEnsName(name)

    if (!address) {
      return this.createTextResponse(`ENS name "${name}" could not be resolved`)
    }

    return this.createTextResponse(`ENS Resolution:\n${name} → ${address}`)
  }
}

/**
 * Handler for simulating transactions
 */
export class SimulateTransactionHandler extends BaseToolHandler {
  constructor() {
    super(
      "simulate_transaction",
      "Simulate a contract transaction before executing to check if it will succeed",
    )
  }

  async execute(args: unknown) {
    // Check for missing required fields first
    const rawArgs = args as Record<string, unknown>
    if (!rawArgs?.contract || !rawArgs?.function) {
      throw new McpError(ErrorCode.InvalidParams, "Contract and function are required")
    }

    const params = this.validateArgs(
      z.object({
        contract: z.string().min(1, "Contract is required"),
        function: z.string().min(1, "Function is required"),
        address: z.string().optional(),
        args: z.array(z.unknown()).optional(),
        value: z.string().optional(),
      }),
      args,
    )

    const container = getContainer()
    const result = await container.transactionEffects.simulateTransaction(
      params.contract,
      params.function,
      params.args,
      params.value,
      params.address as `0x${string}` | undefined,
    )

    return this.createTextResponse(
      result.success
        ? `Transaction Simulation Successful:\n` +
            `- Contract: ${params.contract}\n` +
            `- Function: ${params.function}\n` +
            `- Result: ${JSON.stringify(result.result, null, 2)}\n` +
            `- Will Revert: No\n` +
            `The transaction should execute successfully.`
        : `Transaction Simulation Failed:\n` +
            `- Contract: ${params.contract}\n` +
            `- Function: ${params.function}\n` +
            `- Error: ${result.error}\n` +
            `- Will Revert: ${result.willRevert ? "Yes" : "Unknown"}\n` +
            `The transaction will likely fail if executed.`,
    )
  }
}

// Export all handlers as an array for easy registration
export const miscHandlers = [new ResolveENSNameHandler(), new SimulateTransactionHandler()]
