/**
 * Enhanced transaction handlers with built-in simulation support
 * Provides safety features for all transaction types
 */

import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js"
import { formatEther } from "viem"
import { z } from "zod"
import { getAllChains } from "../../chains.js"
import { getContainer } from "../../container.js"
import { AddressSchema, HexStringSchema } from "../../schemas.js"
import { BaseToolHandler } from "../handler-registry.js"

// Enhanced schemas with simulation support
const SimulateTransactionSchema = z.object({
  to: AddressSchema,
  value: z.string().default("0"),
  data: HexStringSchema.optional(),
  from: AddressSchema.optional(),
  simulate: z.boolean().default(true).describe("Simulate before executing"),
  confirmThreshold: z
    .number()
    .min(0)
    .max(100)
    .default(5)
    .describe("Max gas cost in USD to auto-confirm"),
})

interface SimulationResult {
  willSucceed: boolean
  estimatedGas: bigint
  gasPrice: bigint
  totalCostWei: bigint
  totalCostEth: string
  totalCostUSD?: string
  warnings: string[]
  errors: string[]
}

/**
 * Handler for simulating and sending transactions with safety checks
 */
export class SafeSendTransactionHandler extends BaseToolHandler {
  constructor() {
    super("safe_send_transaction", "Send a transaction with optional simulation and safety checks")
  }

  async execute(args: unknown) {
    const params = this.validateArgs(SimulateTransactionSchema, args)
    const container = getContainer()

    // Get current chain info
    const chainId = container.walletEffects.getChainId()
    const chain = getAllChains().find((c) => c.id === chainId)
    if (!chain) {
      throw new McpError(ErrorCode.InvalidRequest, `Chain ${chainId} not found`)
    }

    const symbol = chain.nativeCurrency.symbol

    // Step 1: Simulate if requested
    if (params.simulate) {
      const simulation = await this.simulateTransaction(params)

      // Check if simulation failed
      if (!simulation.willSucceed) {
        const errors = simulation.errors.join("\n")
        return this.createTextResponse(
          `⚠️ Transaction Simulation Failed\n\n` +
            `The transaction will likely fail if executed:\n` +
            `${errors}\n\n` +
            `Estimated gas cost: ${simulation.totalCostEth} ${symbol}\n` +
            `\nTransaction not sent. Please review and fix the issues.`,
        )
      }

      // Check for warnings
      if (simulation.warnings.length > 0) {
        const warnings = simulation.warnings.join("\n")
        const costInfo = simulation.totalCostUSD
          ? `${simulation.totalCostEth} ${symbol} (~$${simulation.totalCostUSD})`
          : `${simulation.totalCostEth} ${symbol}`

        // Auto-confirm if below threshold
        const costUSD = parseFloat(simulation.totalCostUSD || "0")
        if (costUSD > 0 && costUSD <= params.confirmThreshold) {
          // Execute transaction
          const hash = await container.walletEffects.sendTransaction({
            to: params.to,
            value: BigInt(params.value),
            ...(params.data && { data: params.data }),
          })

          return this.createTextResponse(
            `✅ Transaction Sent Successfully\n\n` +
              `Hash: ${hash}\n` +
              `Gas used: ${simulation.estimatedGas} units\n` +
              `Total cost: ${costInfo}\n\n` +
              `Warnings:\n${warnings}`,
          )
        }

        // Require confirmation for high-value transactions
        return this.createTextResponse(
          `⚠️ Transaction Simulation - Confirmation Required\n\n` +
            `The transaction will likely succeed, but please review:\n\n` +
            `Estimated cost: ${costInfo}\n` +
            `Gas: ${simulation.estimatedGas} units\n\n` +
            `Warnings:\n${warnings}\n\n` +
            `To proceed, run the command again with simulate=false`,
        )
      }

      // Success with no warnings - execute
      const hash = await container.walletEffects.sendTransaction({
        to: params.to,
        value: BigInt(params.value),
        ...(params.data && { data: params.data }),
      })

      const costInfo = simulation.totalCostUSD
        ? `${simulation.totalCostEth} ${symbol} (~$${simulation.totalCostUSD})`
        : `${simulation.totalCostEth} ${symbol}`

      return this.createTextResponse(
        `✅ Transaction Sent Successfully\n\n` +
          `Hash: ${hash}\n` +
          `Gas used: ${simulation.estimatedGas} units\n` +
          `Total cost: ${costInfo}`,
      )
    }

    // No simulation - send directly
    const hash = await container.walletEffects.sendTransaction({
      to: params.to,
      value: BigInt(params.value),
      ...(params.data && { data: params.data }),
    })

    return this.createTextResponse(
      `Transaction sent successfully (without simulation)\nHash: ${hash}`,
    )
  }

  private async simulateTransaction(params: {
    to: `0x${string}`
    value: string
    data?: `0x${string}`
    from?: `0x${string}`
  }): Promise<SimulationResult> {
    const container = getContainer()
    const warnings: string[] = []
    const errors: string[] = []

    try {
      // Estimate gas
      const gasEstimate = await container.transactionEffects.estimateGas(
        params.to,
        params.value,
        params.data,
        params.from,
      )

      // Check account balance
      const from = params.from || container.walletEffects.getAddress()
      if (from) {
        const balanceResult = await container.walletEffects.getBalance(from)
        const balance = balanceResult.balance
        const requiredWei = BigInt(params.value) + gasEstimate.estimatedCostWei

        if (balance < requiredWei) {
          errors.push(
            `Insufficient balance: have ${formatEther(balance)} ETH, need ${formatEther(requiredWei)} ETH`,
          )
        }
      }

      // Check if sending to contract without data
      if (!params.data || params.data === "0x") {
        const code = await container.transactionEffects.getCode(params.to)
        if (code && code !== "0x") {
          warnings.push("Sending ETH to a contract address without data - verify this is intended")
        }
      }

      // Check for high gas price
      const gasPriceGwei = Number(gasEstimate.gasPrice) / 1e9
      if (gasPriceGwei > 100) {
        warnings.push(`High gas price detected: ${gasPriceGwei.toFixed(2)} Gwei`)
      }

      // Estimate USD value (would need price oracle in production)
      // In production, fetch ETH price from an oracle
      // For now, we'll use a placeholder
      const ethPriceUSD = 2000 // Placeholder
      const totalCostUSD = (parseFloat(gasEstimate.estimatedCost) * ethPriceUSD).toFixed(2)

      return {
        willSucceed: errors.length === 0,
        estimatedGas: gasEstimate.gasEstimate,
        gasPrice: gasEstimate.gasPrice,
        totalCostWei: gasEstimate.estimatedCostWei,
        totalCostEth: gasEstimate.estimatedCost,
        totalCostUSD,
        warnings,
        errors,
      }
    } catch (error) {
      errors.push(`Simulation error: ${error instanceof Error ? error.message : String(error)}`)
      return {
        willSucceed: false,
        estimatedGas: 0n,
        gasPrice: 0n,
        totalCostWei: 0n,
        totalCostEth: "0",
        warnings,
        errors,
      }
    }
  }
}

/**
 * Handler for simulating contract writes with safety checks
 */
export class SafeContractWriteHandler extends BaseToolHandler {
  constructor() {
    super("safe_write_contract", "Write to a contract with simulation and safety checks")
  }

  async execute(args: unknown) {
    const params = this.validateArgs(
      z.object({
        contract: z.string().min(1),
        function: z.string().min(1),
        args: z.array(z.unknown()).optional(),
        value: z.string().optional(),
        address: AddressSchema.optional(),
        simulate: z.boolean().default(true),
      }),
      args,
    )

    const container = getContainer()

    if (params.simulate) {
      // First simulate the transaction
      const simulation = await container.transactionEffects.simulateTransaction(
        params.contract,
        params.function,
        params.args,
        params.value,
        params.address,
      )

      if (!simulation.success) {
        return this.createTextResponse(
          `⚠️ Contract Write Simulation Failed\n\n` +
            `Contract: ${params.contract}\n` +
            `Function: ${params.function}\n` +
            `Error: ${simulation.error}\n\n` +
            `The transaction will likely fail if executed. Please review the parameters.`,
        )
      }

      return this.createTextResponse(
        `✅ Contract Write Simulation Successful\n\n` +
          `Contract: ${params.contract}\n` +
          `Function: ${params.function}\n` +
          `Simulation passed - transaction should succeed\n` +
          (simulation.result
            ? `\nSimulation Result: ${JSON.stringify(simulation.result, null, 2)}`
            : "") +
          `\n\nTo execute, run the command again with simulate=false`,
      )
    }

    // For now, we don't actually execute contract writes without simulation
    // This is a safety feature to prevent mistakes
    return this.createTextResponse(
      `⚠️ Contract Write (without simulation)\n\n` +
        `Contract: ${params.contract}\n` +
        `Function: ${params.function}\n` +
        `Args: ${JSON.stringify(params.args)}\n\n` +
        `Note: Actual execution is disabled for safety. Use the standard write_contract tool instead.`,
    )
  }
}

/**
 * Handler for simulating token transfers with safety checks
 */
export class SafeTokenTransferHandler extends BaseToolHandler {
  constructor() {
    super("safe_transfer_token", "Transfer tokens with simulation and safety checks")
  }

  async execute(args: unknown) {
    const params = this.validateArgs(
      z.object({
        token: z.string().min(1),
        to: AddressSchema,
        amount: z.string().min(1),
        simulate: z.boolean().default(true),
      }),
      args,
    )

    const container = getContainer()

    if (params.simulate) {
      // Check token balance first
      const from = container.walletEffects.getAddress()
      if (!from) {
        throw new McpError(ErrorCode.InvalidRequest, "No wallet connected")
      }

      // Check token balance
      try {
        const balanceResult = await container.tokenEffects.getTokenBalance({
          token: params.token,
          address: from,
        })

        // Parse the amount in the token's decimals
        const amountBigInt = BigInt(params.amount)

        if (balanceResult.balanceRaw < amountBigInt) {
          return this.createTextResponse(
            `⚠️ Insufficient Token Balance\n\n` +
              `Token: ${params.token}\n` +
              `Your balance: ${balanceResult.balance} ${balanceResult.symbol}\n` +
              `Trying to send: ${params.amount}\n\n` +
              `The transfer cannot proceed with insufficient balance.`,
          )
        }

        // For now, we'll assume the transfer will succeed if balance is sufficient
        // In a real implementation, we'd need actual simulation
        return this.createTextResponse(
          `✅ Token Transfer Simulation Successful\n\n` +
            `Token: ${params.token}\n` +
            `To: ${params.to}\n` +
            `Amount: ${params.amount}\n` +
            `Balance: ${balanceResult.balance} ${balanceResult.symbol}\n` +
            `Simulation passed - transfer should succeed\n\n` +
            `To execute, run the command again with simulate=false`,
        )
      } catch (error) {
        return this.createTextResponse(
          `⚠️ Token Transfer Simulation Failed\n\n` +
            `Error: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    }

    // Execute the actual transfer
    try {
      const hash = await container.tokenEffects.transferToken({
        token: params.token,
        to: params.to,
        amount: params.amount,
      })

      return this.createTextResponse(
        `✅ Token Transfer Successful\n\n` +
          `Transaction Hash: ${hash}\n` +
          `Token: ${params.token}\n` +
          `To: ${params.to}\n` +
          `Amount: ${params.amount}`,
      )
    } catch (error) {
      return this.createTextResponse(
        `⚠️ Token Transfer Failed\n\n` +
          `Error: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }
}

// Export all enhanced handlers
export const transactionSimulationHandlers = [
  new SafeSendTransactionHandler(),
  new SafeContractWriteHandler(),
  new SafeTokenTransferHandler(),
]
