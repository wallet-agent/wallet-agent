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
    const params = this.validateArgs(
      z.object({
        contract: z.string(),
        function: z.string(),
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
        ? `Transaction simulation successful\n` +
            `Contract: ${params.contract}\n` +
            `Function: ${params.function}\n` +
            `Result: ${JSON.stringify(result.result, null, 2)}`
        : `Transaction simulation failed\nError: ${result.error}`,
    )
  }
}

// Export all handlers as an array for easy registration
export const miscHandlers = [new ResolveENSNameHandler(), new SimulateTransactionHandler()]
