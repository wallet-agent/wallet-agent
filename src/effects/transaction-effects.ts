import type { Address, Chain, PublicClient } from "viem";
import { createPublicClient, http, parseEther } from "viem";
import type { ContractAdapter } from "../adapters/contract-adapter.js";
import type { ChainAdapter } from "../adapters/wallet-adapter.js";
import { resolveContract } from "../core/contract-resolution.js";
import { calculateTransactionCost } from "../core/transaction-helpers.js";
import type { WalletEffects } from "./wallet-effects.js";

export interface TransactionStatusResult {
  status: "pending" | "confirmed" | "not_found";
  hash: `0x${string}`;
  from?: Address;
  to?: Address | null;
  value?: string;
  blockNumber?: bigint;
}

export interface TransactionReceiptResult {
  hash: `0x${string}`;
  status: "success" | "failed";
  blockNumber: bigint;
  gasUsed: bigint;
  effectiveGasPrice: bigint;
  totalCost: string;
  from: Address;
  to: Address | null;
  contractAddress: Address | null;
  logs: number;
  symbol: string;
}

export interface GasEstimateResult {
  gasEstimate: bigint;
  gasPrice: bigint;
  estimatedCost: string;
  estimatedCostWei: bigint;
}

export interface TransactionSimulationResult {
  success: boolean;
  result?: any;
  error?: string;
  willRevert: boolean;
}

/**
 * Transaction effects handler with dependency injection
 */
export class TransactionEffects {
  constructor(
    private walletEffects: WalletEffects,
    private chainAdapter: ChainAdapter,
    private contractAdapter: ContractAdapter,
  ) {}

  /**
   * Create a public client for the current or specified chain
   */
  private createPublicClient(chain: Chain): PublicClient {
    return createPublicClient({
      chain,
      transport: http(chain.rpcUrls.default.http[0]),
    });
  }

  /**
   * Get the current chain
   */
  private getCurrentChain(): Chain {
    const chainId = this.walletEffects.getChainId();
    const chain = this.chainAdapter.getChain(chainId);

    if (!chain) {
      throw new Error(`Chain with ID ${chainId} not found`);
    }

    return chain;
  }

  /**
   * Estimate gas for a transaction
   */
  async estimateGas(
    to: Address,
    value?: string,
    data?: `0x${string}`,
    from?: Address,
  ): Promise<GasEstimateResult> {
    const address = from || this.walletEffects.getAddress();

    if (!address) {
      throw new Error("No wallet connected and no from address provided");
    }

    const chain = this.getCurrentChain();
    const client = this.createPublicClient(chain);

    // Prepare transaction
    const transaction = {
      account: address,
      to,
      value: value ? parseEther(value) : undefined,
      data,
      chain,
    };

    // Estimate gas
    const gasEstimate = await client.estimateGas(transaction);
    const gasPrice = await client.getGasPrice();

    // Calculate costs
    const { totalWei, totalEth } = calculateTransactionCost(
      gasEstimate,
      gasPrice,
    );

    return {
      gasEstimate,
      gasPrice,
      estimatedCost: totalEth,
      estimatedCostWei: totalWei,
    };
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(
    hash: `0x${string}`,
  ): Promise<TransactionStatusResult> {
    const chain = this.getCurrentChain();
    const client = this.createPublicClient(chain);

    try {
      const transaction = await client.getTransaction({ hash });

      if (!transaction) {
        return {
          status: "not_found",
          hash,
        };
      }

      // Check if transaction is mined
      const status = transaction.blockNumber ? "confirmed" : "pending";

      return {
        status,
        hash,
        ...(transaction.blockNumber && {
          blockNumber: transaction.blockNumber,
        }),
        from: transaction.from,
        to: transaction.to,
        value: transaction.value
          ? (Number(transaction.value) / 1e18).toString()
          : "0",
      };
    } catch (error: any) {
      // Handle viem's TransactionNotFoundError
      if (error.name === "TransactionNotFoundError") {
        return {
          status: "not_found",
          hash,
        };
      }
      throw new Error(`Failed to get transaction status: ${error}`);
    }
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(
    hash: `0x${string}`,
  ): Promise<TransactionReceiptResult | null> {
    const chain = this.getCurrentChain();
    const client = this.createPublicClient(chain);

    try {
      const receipt = await client.getTransactionReceipt({ hash });

      if (!receipt) {
        return null;
      }

      const { totalEth } = calculateTransactionCost(
        receipt.gasUsed,
        receipt.effectiveGasPrice,
      );

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
        logs: receipt.logs.length,
        symbol: chain.nativeCurrency.symbol,
      };
    } catch (error: any) {
      // Handle viem's TransactionReceiptNotFoundError
      if (error.name === "TransactionReceiptNotFoundError") {
        return null;
      }
      throw new Error(`Failed to get transaction receipt: ${error}`);
    }
  }

  /**
   * Resolve ENS name to address
   */
  async resolveEnsName(name: string): Promise<Address | null> {
    // Only works on mainnet (chain ID 1)
    const currentChainId = this.walletEffects.getChainId();
    if (currentChainId !== 1) {
      throw new Error(
        "ENS resolution only works on Ethereum mainnet. Please switch to mainnet.",
      );
    }

    const mainnet = this.chainAdapter.getChain(1);
    if (!mainnet) {
      throw new Error("Ethereum mainnet not found in chain list");
    }

    const client = this.createPublicClient(mainnet);

    try {
      const address = await client.getEnsAddress({ name });
      return address;
    } catch (error) {
      throw new Error(`Failed to resolve ENS name: ${error}`);
    }
  }

  /**
   * Simulate a transaction
   */
  async simulateTransaction(
    contract: string,
    functionName: string,
    args?: any[],
    value?: string,
    address?: Address,
  ): Promise<TransactionSimulationResult> {
    const currentAddress = address || this.walletEffects.getAddress();

    if (!currentAddress) {
      throw new Error("No wallet connected");
    }

    const chain = this.getCurrentChain();
    const client = this.createPublicClient(chain);

    try {
      // Resolve contract details
      const contractInfo = resolveContract(
        contract,
        undefined,
        chain.id,
        this.contractAdapter,
        "builtin:ERC20",
      );

      if (!contractInfo.address) {
        throw new Error(`Contract ${contract} requires an address`);
      }

      // Find the function in the ABI
      const func = contractInfo.abi.find(
        (item: any) => item.type === "function" && item.name === functionName,
      );

      if (!func) {
        throw new Error(`Function ${functionName} not found in contract ABI`);
      }

      // Simulate the contract call
      const result = await client.simulateContract({
        address: contractInfo.address,
        abi: contractInfo.abi,
        functionName,
        args: args || [],
        account: currentAddress,
        value: value ? parseEther(value) : undefined,
      });

      return {
        success: true,
        result: result.result,
        willRevert: false,
      };
    } catch (error: any) {
      // Check if it's a revert error
      const isRevert =
        error.message?.includes("revert") ||
        error.message?.includes("execution reverted");

      return {
        success: false,
        error: error.message || "Simulation failed",
        willRevert: isRevert,
      };
    }
  }
}
