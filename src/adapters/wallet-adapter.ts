import type { Address, Chain, WalletClient } from "viem";

/**
 * Interface for wallet operations
 */
export interface WalletAdapter {
  connect(address: Address): Promise<{ address: Address; chainId: number }>;
  disconnect(): Promise<void>;
  getAccount(): {
    isConnected: boolean;
    address?: Address;
    chainId?: number;
    connector?: string;
  };
  getBalance(
    address: Address,
    chainId: number,
  ): Promise<{ value: bigint; decimals: number; symbol: string }>;
  signMessage(message: string): Promise<string>;
  signTypedData(params: {
    domain: Record<string, unknown>;
    types: Record<string, unknown>;
    primaryType: string;
    message: Record<string, unknown>;
  }): Promise<string>;
  sendTransaction(params: {
    to: Address;
    value: bigint;
    data?: `0x${string}`;
  }): Promise<`0x${string}`>;
  switchChain(chainId: number): Promise<void>;
}

/**
 * Interface for creating wallet clients
 */
export interface WalletClientFactory {
  createWalletClient(address: Address, chain: Chain): WalletClient;
}

/**
 * Interface for chain management
 */
export interface ChainAdapter {
  getAllChains(): Chain[];
  getChain(chainId: number): Chain | undefined;
  addCustomChain(chain: Chain): void;
  updateCustomChain(
    chainId: number,
    updates: Partial<{
      name: string;
      rpcUrl: string;
      nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
      };
      blockExplorerUrl?: string;
    }>,
  ): void;
}
