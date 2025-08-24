import { getAllChains } from "../../chains.js"
import { getContainer } from "../../container.js"
import {
  formatTransactionReceipt,
  formatTransactionStatus,
} from "../../core/transaction-helpers.js"
import {
  EstimateGasArgsSchema,
  SendTransactionArgsSchema,
  SwitchChainArgsSchema,
  TransactionHashSchema,
} from "../../schemas.js"
import { sendWalletTransaction, switchToChain } from "../../transactions.js"
import { BaseToolHandler } from "../handler-registry.js"

/**
 * Handler for sending transactions
 */
export class SendTransactionHandler extends BaseToolHandler {
  constructor() {
    super("send_transaction", "Send a transaction")
  }

  async execute(args: unknown) {
    const validatedArgs = this.validateArgs(SendTransactionArgsSchema, args)
    const hash = await sendWalletTransaction(validatedArgs)
    return this.createTextResponse(`Transaction sent successfully\nHash: ${hash}`)
  }
}

/**
 * Handler for switching chains
 */
export class SwitchChainHandler extends BaseToolHandler {
  constructor() {
    super("switch_chain", "Switch to a different chain")
  }

  async execute(args: unknown) {
    const { chainId } = this.validateArgs(SwitchChainArgsSchema, args)
    await switchToChain(chainId)

    const chain = getAllChains().find((c) => c.id === chainId)
    const chainName = chain?.name || `Chain ${chainId}`
    return this.createTextResponse(`Switched to ${chainName} (Chain ID: ${chainId})`)
  }
}

/**
 * Handler for estimating gas
 */
export class EstimateGasHandler extends BaseToolHandler {
  constructor() {
    super("estimate_gas", "Estimate gas for a transaction before sending")
  }

  async execute(args: unknown) {
    const params = this.validateArgs(EstimateGasArgsSchema, args)
    const container = getContainer()
    const result = await container.transactionEffects.estimateGas(
      params.to as `0x${string}`,
      params.value,
      params.data as `0x${string}` | undefined,
      params.from as `0x${string}` | undefined,
    )

    const chainId = container.walletEffects.getChainId()
    const chain = chainId ? container.chainAdapter.getChain(chainId) : undefined
    const symbol = chain?.nativeCurrency.symbol || "ETH"

    return this.createTextResponse(
      `Gas Estimation:\n` +
        `- Estimated Gas: ${result.gasEstimate.toString()} units\n` +
        `- Gas Price: ${(Number(result.gasPrice) / 1e9).toFixed(2)} Gwei\n` +
        `- Estimated Cost: ${result.estimatedCost} ${symbol}\n` +
        `- Estimated Cost (Wei): ${result.estimatedCostWei.toString()}`,
    )
  }
}

/**
 * Handler for getting transaction status
 */
export class GetTransactionStatusHandler extends BaseToolHandler {
  constructor() {
    super("get_transaction_status", "Get the status of a transaction by its hash")
  }

  async execute(args: unknown) {
    const { hash } = this.validateArgs(TransactionHashSchema, args)
    const container = getContainer()
    const status = await container.transactionEffects.getTransactionStatus(hash)

    const formatted = formatTransactionStatus(
      status.status,
      status.hash,
      status.status !== "not_found" && status.from
        ? {
            from: status.from,
            to: status.to,
            value: status.value,
            blockNumber: status.blockNumber,
          }
        : undefined,
    )
    return this.createTextResponse(formatted)
  }
}

/**
 * Handler for getting transaction receipt
 */
export class GetTransactionReceiptHandler extends BaseToolHandler {
  constructor() {
    super("get_transaction_receipt", "Get detailed receipt of a mined transaction")
  }

  async execute(args: unknown) {
    const { hash } = this.validateArgs(TransactionHashSchema, args)
    const container = getContainer()
    const receipt = await container.transactionEffects.getTransactionReceipt(hash)

    if (!receipt) {
      return this.createTextResponse(
        `No receipt found for transaction ${hash}. The transaction may be pending or not exist.`,
      )
    }

    const chainId = container.walletEffects.getChainId()
    const chain = container.chainAdapter.getChain(chainId)
    const symbol = chain?.nativeCurrency.symbol || "ETH"

    const formatted = formatTransactionReceipt(receipt, symbol)
    return this.createTextResponse(formatted)
  }
}

// Export all handlers as an array for easy registration
export const transactionHandlers = [
  new SendTransactionHandler(),
  new SwitchChainHandler(),
  new EstimateGasHandler(),
  new GetTransactionStatusHandler(),
  new GetTransactionReceiptHandler(),
]
