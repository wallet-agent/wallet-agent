import { mock } from "@wagmi/connectors";
import { createConfig, getAccount } from "@wagmi/core";
import type { Address, Chain } from "viem";
import { http } from "viem";
import { anvil, mainnet, polygon, sepolia } from "viem/chains";
import type { ContractAdapter } from "./adapters/contract-adapter.js";
import type { TokenAdapter } from "./adapters/token-adapter.js";
import {
  ChainAdapterImpl,
  PrivateKeyWalletClientFactory,
  WagmiWalletAdapter,
} from "./adapters/wagmi-adapter.js";
import type { ChainAdapter } from "./adapters/wallet-adapter.js";
import { readContract, writeContract } from "./contract-operations.js";
import { ContractEffects } from "./effects/contract-effects.js";
import { InMemoryContractStore } from "./effects/contract-store.js";
import { NodeFileReader } from "./effects/file-reader.js";
import { TokenEffects } from "./effects/token-effects.js";
import { TransactionEffects } from "./effects/transaction-effects.js";
import { WalletEffects } from "./effects/wallet-effects.js";

// Mock accounts
export const mockAccounts = [
  "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
] as const satisfies readonly Address[];

// Built-in chains (Anvil first as default)
export const builtInChains = [anvil, mainnet, sepolia, polygon];

// Global state stores
export const customChains = new Map<number, Chain>();
export const privateKeyWallets = new Map<Address, `0x${string}`>();

/**
 * Dependency injection container
 */
export class Container {
  private static instance: Container;

  public chainAdapter: ChainAdapter;
  public walletEffects: WalletEffects;
  public contractAdapter: ContractAdapter;
  public tokenEffects: TokenAdapter;
  public transactionEffects: TransactionEffects;
  public wagmiConfig: ReturnType<typeof createConfig>;

  private constructor() {
    // Initialize chain adapter
    this.chainAdapter = new ChainAdapterImpl(builtInChains, customChains);

    // Initialize Wagmi config
    this.wagmiConfig = this.createWagmiConfig();

    // Initialize wallet adapter
    const wagmiAdapter = new WagmiWalletAdapter(this.wagmiConfig);

    // Initialize private key client factory
    const privateKeyClientFactory = new PrivateKeyWalletClientFactory(
      privateKeyWallets,
    );

    // Initialize wallet effects
    this.walletEffects = new WalletEffects(
      wagmiAdapter,
      privateKeyClientFactory,
      this.chainAdapter,
      mockAccounts,
      () => Array.from(privateKeyWallets.keys()),
    );

    // Initialize contract adapter
    const fileReader = new NodeFileReader();
    const contractStore = new InMemoryContractStore();
    this.contractAdapter = new ContractEffects(fileReader, contractStore);

    // Initialize token effects
    this.tokenEffects = new TokenEffects(
      this.contractAdapter,
      this.walletEffects,
      readContract,
      writeContract,
      () => {
        const account = getAccount(this.wagmiConfig);
        return account.isConnected && account.address
          ? { address: account.address }
          : undefined;
      },
    );

    // Initialize transaction effects
    this.transactionEffects = new TransactionEffects(
      this.walletEffects,
      this.chainAdapter,
      this.contractAdapter,
    );
  }

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  /**
   * Reset the container instance (for testing only)
   */
  static resetInstance(): void {
    if (process.env.NODE_ENV === "test") {
      Container.instance = null as any;
      customChains.clear();
      privateKeyWallets.clear();
    }
  }

  /**
   * Update Wagmi config when chains change
   */
  updateWagmiConfig(): void {
    this.wagmiConfig = this.createWagmiConfig();
    // Update the adapter with new config
    const wagmiAdapter = new WagmiWalletAdapter(this.wagmiConfig);
    const privateKeyClientFactory = new PrivateKeyWalletClientFactory(
      privateKeyWallets,
    );

    this.walletEffects = new WalletEffects(
      wagmiAdapter,
      privateKeyClientFactory,
      this.chainAdapter,
      mockAccounts,
      () => Array.from(privateKeyWallets.keys()),
    );

    // Update transaction effects with new wallet effects
    this.transactionEffects = new TransactionEffects(
      this.walletEffects,
      this.chainAdapter,
      this.contractAdapter,
    );
  }

  private createWagmiConfig() {
    const allChains = this.chainAdapter.getAllChains();
    // Ensure we always have at least one chain
    if (allChains.length === 0) {
      throw new Error("No chains available");
    }

    const transports: Record<number, ReturnType<typeof http>> = {};
    for (const chain of allChains) {
      transports[chain.id] = this.createTransport(chain);
    }

    return createConfig({
      chains: allChains as [Chain, ...Chain[]],
      connectors: [
        mock({
          accounts: mockAccounts,
          features: {
            reconnect: true,
          },
        }),
      ],
      transports,
    });
  }

  private createTransport(chain: Chain): ReturnType<typeof http> {
    // Create a transport that checks NODE_ENV at request time, not creation time
    return (() => ({
      config: {
        key: "dynamic",
        name: "Dynamic Transport",
        request: {} as any,
        retryCount: 3,
        timeout: 10000,
        type: "http",
      },
      request: async (args: any) => {
        // Check NODE_ENV at request time
        if (process.env.NODE_ENV === "test") {
          // Use mock transport logic
          return this.handleMockRequest(chain, args);
        }
        // Use real HTTP transport
        const realTransport = http(chain.rpcUrls.default.http[0]);
        const client = realTransport({ chain });
        return client.request(args);
      },
    })) as ReturnType<typeof http>;
  }

  private async handleMockRequest(chain: Chain, { method, params }: any) {
    // Check if this is a custom chain with a fake URL
    const rpcUrl = chain.rpcUrls.default.http[0];
    if (rpcUrl && rpcUrl.includes("example.com")) {
      throw new Error("HTTP request failed");
    }

    // Mock responses
    if (method === "eth_chainId") return `0x${chain.id.toString(16)}`;
    if (method === "eth_blockNumber") return "0x0";
    if (method === "eth_getCode") return "0x";
    if (method === "eth_call")
      throw new Error("execution reverted: returned no data");
    if (method === "eth_estimateGas") return "0x5208";
    if (method === "eth_gasPrice") return "0x4a817c800";
    if (method === "eth_getBalance") return "0x0";
    if (method === "eth_accounts") return [];
    if (method === "net_version") return chain.id.toString();
    if (method === "eth_sendTransaction") {
      return "0x1234567890123456789012345678901234567890123456789012345678901234";
    }
    if (method === "eth_getTransactionByHash") {
      if (
        params[0] ===
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
      ) {
        return null;
      }
      return {
        hash: params[0],
        blockNumber: "0x1",
        from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        value: "0x0",
      };
    }
    if (method === "eth_getTransactionReceipt") {
      if (
        params[0] ===
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
      ) {
        return null;
      }
      return {
        transactionHash: params[0],
        blockNumber: "0x1",
        status: "0x1",
        gasUsed: "0x5208",
        effectiveGasPrice: "0x4a817c800",
        from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        contractAddress: null,
        logs: [],
        type: "0x0",
        cumulativeGasUsed: "0x5208",
      };
    }
    if (method === "eth_signTypedData_v4") {
      return "0x1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890";
    }
    if (method === "personal_sign") {
      return "0x1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890";
    }
    if (method === "eth_getTransactionCount") return "0x0";
    if (method === "eth_getBlockByNumber") {
      return {
        number: "0x0",
        timestamp: "0x0",
        baseFeePerGas: "0x3b9aca00",
      };
    }

    throw new Error(`Mock transport: Unsupported method ${method}`);
  }
}

// Export singleton instance getter
export function getContainer(): Container {
  return Container.getInstance();
}
