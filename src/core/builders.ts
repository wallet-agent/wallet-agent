import type { Chain } from "viem";
import { defineChain } from "viem";

/**
 * Build a custom chain configuration
 */
export function buildCustomChain(params: {
  id: number;
  name: string;
  rpcUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorerUrl?: string;
}): Chain {
  return defineChain({
    id: params.id,
    name: params.name,
    nativeCurrency: params.nativeCurrency,
    rpcUrls: {
      default: {
        http: [params.rpcUrl],
      },
    },
    blockExplorers: params.blockExplorerUrl
      ? {
          default: {
            name: `${params.name} Explorer`,
            url: params.blockExplorerUrl,
          },
        }
      : undefined,
  });
}

/**
 * Build transaction parameters
 */
export function buildTransactionParams(params: {
  to: string;
  value: bigint;
  data?: string;
}) {
  const txParams: {
    to: `0x${string}`;
    value: bigint;
    data?: `0x${string}`;
  } = {
    to: params.to as `0x${string}`,
    value: params.value,
  };

  if (params.data) {
    txParams.data = params.data as `0x${string}`;
  }

  return txParams;
}

/**
 * Build error response for MCP
 */
export function buildErrorResponse(code: number, message: string) {
  return {
    code,
    message,
    data: null,
  };
}

/**
 * Build success response for MCP tools
 */
export function buildToolResponse(text: string) {
  return {
    content: [
      {
        type: "text" as const,
        text,
      },
    ],
  };
}
