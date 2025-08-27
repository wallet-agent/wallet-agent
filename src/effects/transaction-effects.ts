import type { Address, Chain, PublicClient } from "viem"
import { createPublicClient, http, parseEther } from "viem"
import type { ContractAdapter } from "../adapters/contract-adapter.js"
import type { ChainAdapter } from "../adapters/wallet-adapter.js"
import { resolveContract } from "../core/contract-resolution.js"
import { calculateTransactionCost } from "../core/transaction-helpers.js"
import { ErrorMessages } from "../utils/error-messages.js"
import type { WalletEffects } from "./wallet-effects.js"

export interface TransactionStatusResult {
  status: "pending" | "confirmed" | "not_found"
  hash: `0x${string}`
  from?: Address
  to?: Address | null
  value?: string
  blockNumber?: bigint
}

export interface TransactionReceiptResult {
  hash: `0x${string}`
  status: "success" | "failed"
  blockNumber: bigint
  gasUsed: bigint
  effectiveGasPrice: bigint
  totalCost: string
  from: Address
  to: Address | null
  contractAddress: Address | null
  logs: number
  symbol: string
}

export interface GasEstimateResult {
  gasEstimate: bigint
  gasPrice: bigint
  estimatedCost: string
  estimatedCostWei: bigint
}

export interface TransactionSimulationResult {
  success: boolean
  result?: unknown
  error?: string
  willRevert: boolean
}

/**
 * Transaction effects handler with dependency injection
 */
export class TransactionEffects {
  private clientCache = new Map<number, PublicClient>()

  constructor(
    private walletEffects: WalletEffects,
    private chainAdapter: ChainAdapter,
    private contractAdapter: ContractAdapter,
  ) {}

  /**
   * Clear cached clients (call when chains are updated)
   */
  clearClientCache(): void {
    this.clientCache.clear()
  }

  /**
   * Create a public client for the current or specified chain with caching
   */
  private createPublicClient(chain: Chain): PublicClient {
    // Check cache first
    const cached = this.clientCache.get(chain.id)
    if (cached) {
      return cached
    }

    let client: PublicClient

    // In test mode, use the container's configured transport
    if (process.env.NODE_ENV === "test") {
      // Import container here to avoid circular dependency
      const { getContainer } = require("../container.js")
      const container = getContainer()
      const transportFactory = container.wagmiConfig._internal.transports[chain.id]
      if (transportFactory) {
        client = createPublicClient({
          chain,
          transport: transportFactory,
        })
      } else {
        client = createPublicClient({
          chain,
          transport: http(chain.rpcUrls.default.http[0]),
        })
      }
    } else {
      client = createPublicClient({
        chain,
        transport: http(chain.rpcUrls.default.http[0]),
      })
    }

    // Cache the client
    this.clientCache.set(chain.id, client)
    return client
  }

  /**
   * Get the current chain
   */
  private getCurrentChain(): Chain {
    const chainId = this.walletEffects.getChainId()
    const chain = this.chainAdapter.getChain(chainId)

    if (!chain) {
      throw new Error(ErrorMessages.CHAIN_NOT_FOUND(chainId))
    }

    return chain
  }

  /**
   * Estimate gas for a transaction with optimized parallel calls
   */
  async estimateGas(
    to: Address,
    value?: string,
    data?: `0x${string}`,
    from?: Address,
  ): Promise<GasEstimateResult> {
    const address = from || this.walletEffects.getAddress()

    if (!address) {
      throw new Error(ErrorMessages.WALLET_NOT_CONNECTED)
    }

    const chain = this.getCurrentChain()
    const client = this.createPublicClient(chain)

    // Prepare transaction
    const transaction = {
      account: address,
      to,
      value: value ? parseEther(value) : undefined,
      data,
      chain,
    }

    // Run gas estimation and gas price fetch in parallel
    const [gasEstimate, gasPrice] = await Promise.all([
      client.estimateGas(transaction),
      client.getGasPrice(),
    ])

    // Calculate costs
    const { totalWei, totalEth } = calculateTransactionCost(gasEstimate, gasPrice)

    return {
      gasEstimate,
      gasPrice,
      estimatedCost: totalEth,
      estimatedCostWei: totalWei,
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(hash: `0x${string}`): Promise<TransactionStatusResult> {
    const chain = this.getCurrentChain()
    const client = this.createPublicClient(chain)

    try {
      const transaction = await client.getTransaction({ hash })

      if (!transaction) {
        return {
          status: "not_found",
          hash,
        }
      }

      // Check if transaction is mined
      const status = transaction.blockNumber ? "confirmed" : "pending"

      return {
        status,
        hash,
        ...(transaction.blockNumber && {
          blockNumber: transaction.blockNumber,
        }),
        from: transaction.from,
        to: transaction.to,
        value: transaction.value ? (Number(transaction.value) / 1e18).toString() : "0",
      }
    } catch (error) {
      // Handle viem's TransactionNotFoundError
      if (error instanceof Error && error.name === "TransactionNotFoundError") {
        return {
          status: "not_found",
          hash,
        }
      }
      throw new Error(
        `Failed to get transaction status: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(hash: `0x${string}`): Promise<TransactionReceiptResult | null> {
    const chain = this.getCurrentChain()
    const client = this.createPublicClient(chain)

    try {
      const receipt = await client.getTransactionReceipt({ hash })

      if (!receipt) {
        return null
      }

      // Viem might return a receipt with null values instead of null itself
      if (!receipt.blockNumber && !receipt.gasUsed) {
        return null
      }

      const { totalEth } = calculateTransactionCost(receipt.gasUsed, receipt.effectiveGasPrice)

      return {
        hash: receipt.transactionHash,
        status: receipt.status === "success" ? "success" : "failed",
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
        effectiveGasPrice: receipt.effectiveGasPrice,
        totalCost: totalEth,
        from: receipt.from,
        to: receipt.to || null,
        contractAddress: receipt.contractAddress || null,
        logs: receipt.logs?.length || 0,
        symbol: chain.nativeCurrency.symbol,
      }
    } catch (error) {
      // Handle viem's TransactionReceiptNotFoundError
      if (
        (error instanceof Error && error.name === "TransactionReceiptNotFoundError") ||
        (error instanceof Error && error.message?.includes("Transaction receipt not found"))
      ) {
        return null
      }
      throw new Error(
        `Failed to get transaction receipt: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Get bytecode at an address
   */
  async getCode(address: Address): Promise<`0x${string}` | undefined> {
    const chain = this.getCurrentChain()
    const client = this.createPublicClient(chain)

    try {
      const code = await client.getBytecode({ address })
      return code
    } catch (error) {
      throw new Error(`Failed to get code at address: ${error}`)
    }
  }

  /**
   * Resolve ENS name to address
   */
  async resolveEnsName(name: string): Promise<Address | null> {
    // Only works on mainnet (chain ID 1)
    const currentChainId = this.walletEffects.getChainId()
    if (currentChainId !== 1) {
      throw new Error("ENS resolution only works on Ethereum mainnet. Please switch to mainnet.")
    }

    const mainnet = this.chainAdapter.getChain(1)
    if (!mainnet) {
      throw new Error("Ethereum mainnet not found in chain list")
    }

    const client = this.createPublicClient(mainnet)

    try {
      const address = await client.getEnsAddress({ name })
      return address
    } catch (error) {
      throw new Error(`Failed to resolve ENS name: ${error}`)
    }
  }

  /**
   * Simulate a transaction
   */
  async simulateTransaction(
    contract: string,
    functionName: string,
    args?: unknown[],
    value?: string,
    address?: Address,
  ): Promise<TransactionSimulationResult> {
    const currentAddress = address || this.walletEffects.getAddress()

    if (!currentAddress) {
      throw new Error(ErrorMessages.WALLET_NOT_CONNECTED)
    }

    const chain = this.getCurrentChain()
    const client = this.createPublicClient(chain)

    try {
      // Resolve contract details
      const contractInfo = resolveContract(
        contract,
        undefined,
        chain.id,
        this.contractAdapter,
        "builtin:ERC20",
      )

      if (!contractInfo.address) {
        throw new Error(`Contract ${contract} requires an address`)
      }

      // Find the function in the ABI
      const func = contractInfo.abi.find(
        (item) => item.type === "function" && item.name === functionName,
      )

      if (!func) {
        return {
          success: false,
          error: `Function ${functionName} not found in contract ABI`,
          willRevert: false,
        }
      }

      // Simulate the contract call
      const result = await client.simulateContract({
        address: contractInfo.address,
        abi: contractInfo.abi,
        functionName,
        args: args || [],
        account: currentAddress,
        value: value ? parseEther(value) : undefined,
      })

      return {
        success: true,
        result: result.result,
        willRevert: false,
      }
    } catch (error) {
      // Check if it's a revert error
      const errorMessage = error instanceof Error ? error.message : String(error)
      const isRevert =
        errorMessage.includes("revert") || errorMessage.includes("execution reverted")

      return {
        success: false,
        error: errorMessage || "Simulation failed",
        willRevert: isRevert,
      }
    }
  }
}
