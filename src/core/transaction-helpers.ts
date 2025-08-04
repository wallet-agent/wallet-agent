import { formatEther } from "viem";

/**
 * Pure helper functions for transaction operations
 */

/**
 * Calculate transaction cost from gas and price
 */
export function calculateTransactionCost(
  gasEstimate: bigint,
  gasPrice: bigint,
): {
  totalWei: bigint;
  totalEth: string;
  gasPriceGwei: string;
} {
  const totalWei = gasEstimate * gasPrice;
  const totalEth = formatEther(totalWei);
  const gasPriceGwei = (Number(gasPrice) / 1e9).toFixed(2);

  return {
    totalWei,
    totalEth,
    gasPriceGwei,
  };
}

/**
 * Format transaction status for display
 */
export function formatTransactionStatus(
  status: "pending" | "confirmed" | "not_found",
  hash: string,
  details?: {
    from?: string;
    to?: string | null;
    value?: string;
    blockNumber?: bigint;
  },
): string {
  if (status === "not_found") {
    return `Transaction ${hash} not found. It may not exist or hasn't been broadcasted yet.`;
  }

  let result = `Transaction Status:\n- Hash: ${hash}\n- Status: ${status}`;

  if (details) {
    result += `\n- From: ${details.from}`;
    result += `\n- To: ${details.to || "Contract Creation"}`;
    result += `\n- Value: ${details.value} ETH`;
    if (details.blockNumber) {
      result += `\n- Block Number: ${details.blockNumber}`;
    }
  }

  return result;
}

/**
 * Format transaction receipt for display
 */
export function formatTransactionReceipt(
  receipt: {
    hash: string;
    status: "success" | "failed";
    blockNumber: bigint;
    from: string;
    to?: string | null;
    contractAddress?: string | null;
    gasUsed: bigint;
    effectiveGasPrice: bigint;
    logs: number;
  },
  nativeSymbol: string,
): string {
  const { totalEth, gasPriceGwei } = calculateTransactionCost(
    receipt.gasUsed,
    receipt.effectiveGasPrice,
  );

  let result = `Transaction Receipt:\n- Hash: ${receipt.hash}\n- Status: ${receipt.status}`;
  result += `\n- Block Number: ${receipt.blockNumber}`;
  result += `\n- From: ${receipt.from}`;
  result += `\n- To: ${receipt.to || "Contract Creation"}`;

  if (receipt.contractAddress) {
    result += `\n- Contract Created: ${receipt.contractAddress}`;
  }

  result += `\n- Gas Used: ${receipt.gasUsed.toString()} units`;
  result += `\n- Effective Gas Price: ${gasPriceGwei} Gwei`;
  result += `\n- Total Cost: ${totalEth} ${nativeSymbol}`;
  result += `\n- Logs: ${receipt.logs} events`;

  return result;
}

/**
 * Check if an error message indicates a revert
 */
export function isRevertError(errorMessage: string): boolean {
  return (
    errorMessage.includes("revert") ||
    errorMessage.includes("execution reverted")
  );
}
