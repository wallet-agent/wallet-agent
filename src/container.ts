import { mock } from "@wagmi/connectors"
import { createConfig, getAccount } from "@wagmi/core"
import type { Address, Chain, Transport } from "viem"
import { http } from "viem"
import { anvil, mainnet, polygon, sepolia } from "viem/chains"
import type { ContractAdapter } from "./adapters/contract-adapter.js"
import type { TokenAdapter } from "./adapters/token-adapter.js"
import {
  ChainAdapterImpl,
  PrivateKeyWalletClientFactory,
  WagmiWalletAdapter,
} from "./adapters/wagmi-adapter.js"
import type { ChainAdapter } from "./adapters/wallet-adapter.js"
import { readContract, writeContract } from "./contract-operations.js"
import { ContractEffects } from "./effects/contract-effects.js"
import type { ContractStore } from "./effects/contract-store.js"
import { InMemoryContractStore } from "./effects/contract-store.js"
import type { FileReader } from "./effects/file-reader.js"
import { NodeFileReader } from "./effects/file-reader.js"
import { TokenEffects } from "./effects/token-effects.js"
import { TransactionEffects } from "./effects/transaction-effects.js"
import { WalletEffects } from "./effects/wallet-effects.js"
import { createLogger } from "./logger.js"
import { EncryptedKeyStoreManager } from "./storage/encrypted-key-store.js"
import { findProjectStorage, ProjectStorageManager } from "./storage/project-storage.js"
import { StorageManager } from "./storage/storage-manager.js"
import type { TestGlobalThis } from "./types/test-globals.js"

// Default mock accounts
export const DEFAULT_MOCK_ACCOUNTS = [
  "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
] as const satisfies readonly Address[]

// Default built-in chains (Anvil first as default)
export const DEFAULT_BUILTIN_CHAINS = [anvil, mainnet, sepolia, polygon]

// Legacy global state stores (for backward compatibility)
export const customChains = new Map<number, Chain>()
export const privateKeyWallets = new Map<Address, `0x${string}`>()

// Re-export for backward compatibility
export const mockAccounts = DEFAULT_MOCK_ACCOUNTS
export const builtInChains = DEFAULT_BUILTIN_CHAINS

/**
 * Configuration options for creating a Container instance
 */
export interface ContainerOptions {
  /** Custom chains to include (in addition to built-in chains) */
  chains?: Chain[]
  /** Mock accounts for testing */
  mockAccounts?: readonly Address[]
  /** File reader implementation */
  fileReader?: FileReader
  /** Contract store implementation */
  contractStore?: ContractStore
  /** Transport provider for chains */
  transportProvider?: (chain: Chain) => Transport
  /** Whether to include default built-in chains */
  includeBuiltinChains?: boolean
  /** Initial private key wallets */
  privateKeyWallets?: Map<Address, `0x${string}`>
  /** Whether to enable persistent storage (default: true) */
  enableStorage?: boolean
}

const logger = createLogger("container")

/**
 * Dependency injection container
 */
export class Container {
  private static instance?: Container

  public chainAdapter: ChainAdapter
  public walletEffects: WalletEffects
  public contractAdapter: ContractAdapter
  public tokenEffects: TokenAdapter
  public transactionEffects: TransactionEffects
  public wagmiConfig: ReturnType<typeof createConfig>
  public storageManager?: StorageManager
  private encryptedKeyStore?: EncryptedKeyStoreManager

  // Instance-specific state stores
  public readonly customChains: Map<number, Chain>
  public readonly privateKeyWallets: Map<Address, `0x${string}`>
  private readonly options: ContainerOptions

  constructor(options: ContainerOptions = {}) {
    this.options = options

    // Initialize instance-specific state
    this.customChains = new Map()
    this.privateKeyWallets = options.privateKeyWallets || new Map()

    // Initialize chains
    const baseChains = options.includeBuiltinChains !== false ? DEFAULT_BUILTIN_CHAINS : []
    const allInitialChains = [...baseChains, ...(options.chains || [])]

    // Add custom chains to the map
    if (options.chains) {
      for (const chain of options.chains) {
        this.customChains.set(chain.id, chain)
      }
    }

    // Initialize chain adapter
    this.chainAdapter = new ChainAdapterImpl(allInitialChains, this.customChains)

    // Initialize Wagmi config
    this.wagmiConfig = this.createWagmiConfig()

    // Initialize wallet adapter
    const wagmiAdapter = new WagmiWalletAdapter(this.wagmiConfig)

    // Initialize private key client factory
    const privateKeyClientFactory = new PrivateKeyWalletClientFactory(this.privateKeyWallets)

    // Initialize storage manager first (unless disabled for testing)
    if (options.enableStorage !== false && process.env.NODE_ENV !== "test") {
      // Check if we're in a project context first
      const projectStoragePath = findProjectStorage()

      if (projectStoragePath) {
        // Use project storage if available
        this.storageManager = new ProjectStorageManager(projectStoragePath)
        logger.info({ msg: `Using project storage at ${projectStoragePath}` })
      } else {
        // Fall back to global storage
        this.storageManager = new StorageManager()
        logger.info({ msg: "Using global storage (no project detected)" })
      }

      // Initialize storage asynchronously (don't block container creation)
      this.initializeStorageAsync().catch((error) => {
        logger.warn({ msg: "Failed to initialize storage, falling back to in-memory", error })
      })
    }

    // Initialize wallet effects
    const accounts = options.mockAccounts || DEFAULT_MOCK_ACCOUNTS
    this.walletEffects = new WalletEffects(
      wagmiAdapter,
      privateKeyClientFactory,
      this.chainAdapter,
      accounts,
      () => Array.from(this.privateKeyWallets.keys()),
      this.storageManager,
    )

    // Initialize contract adapter
    const fileReader = options.fileReader || new NodeFileReader()
    const contractStore = options.contractStore || new InMemoryContractStore()
    this.contractAdapter = new ContractEffects(fileReader, contractStore)

    // Initialize token effects
    this.tokenEffects = new TokenEffects(
      this.contractAdapter,
      this.walletEffects,
      readContract,
      writeContract,
      () => {
        const account = getAccount(this.wagmiConfig)
        return account.isConnected && account.address ? { address: account.address } : undefined
      },
    )

    // Initialize transaction effects
    this.transactionEffects = new TransactionEffects(
      this.walletEffects,
      this.chainAdapter,
      this.contractAdapter,
    )
  }

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container()
    }

    // In test environments, verify the container is properly initialized
    if (process.env.NODE_ENV === "test") {
      if (
        !Container.instance.chainAdapter ||
        !Container.instance.walletEffects ||
        !Container.instance.walletEffects.connectWallet ||
        typeof Container.instance.walletEffects.connectWallet !== "function"
      ) {
        // Reinitialize if properties are missing (likely due to test race conditions)
        Container.instance = new Container()
      }
    }

    return Container.instance
  }

  /**
   * Create a new Container instance with custom options
   */
  static create(options?: ContainerOptions): Container {
    return new Container(options)
  }

  /**
   * Reset the container instance (for testing only)
   */
  static async resetInstance(): Promise<void> {
    if (process.env.NODE_ENV === "test") {
      // Ensure any existing wallet is disconnected before resetting
      if (Container.instance) {
        try {
          await Container.instance.walletEffects?.disconnectWallet()
        } catch {
          // Ignore errors during cleanup
        }
      }

      // Force a complete reset
      Container.instance = undefined

      // Clear global state (for backward compatibility)
      customChains.clear()
      privateKeyWallets.clear()

      // Force garbage collection if available
      if (typeof global !== "undefined" && global.gc) {
        global.gc()
      }
    }
  }

  /**
   * Update Wagmi config when chains change
   */
  updateWagmiConfig(): void {
    // Clear caches when configuration changes
    this.transactionEffects.clearClientCache()

    this.wagmiConfig = this.createWagmiConfig()
    // Update the adapter with new config
    const wagmiAdapter = new WagmiWalletAdapter(this.wagmiConfig)
    const privateKeyClientFactory = new PrivateKeyWalletClientFactory(this.privateKeyWallets)

    const accounts = this.options.mockAccounts || DEFAULT_MOCK_ACCOUNTS
    this.walletEffects = new WalletEffects(
      wagmiAdapter,
      privateKeyClientFactory,
      this.chainAdapter,
      accounts,
      () => Array.from(this.privateKeyWallets.keys()),
    )

    // Update transaction effects with new wallet effects
    this.transactionEffects = new TransactionEffects(
      this.walletEffects,
      this.chainAdapter,
      this.contractAdapter,
    )
  }

  /**
   * Get encrypted key store manager
   */
  getEncryptedKeyStore(): EncryptedKeyStoreManager | undefined {
    if (!this.storageManager) {
      return undefined
    }

    if (!this.encryptedKeyStore) {
      this.encryptedKeyStore = new EncryptedKeyStoreManager(this.storageManager)
    }

    return this.encryptedKeyStore
  }

  /**
   * Initialize storage asynchronously
   */
  private async initializeStorageAsync(): Promise<void> {
    if (!this.storageManager) {
      return
    }

    try {
      await this.storageManager.initialize()
      logger.info("Global storage initialized successfully")
    } catch (error) {
      logger.error({ msg: "Failed to initialize storage", error })
      // Storage failure is not fatal - container continues with in-memory storage
      this.storageManager = undefined
    }
  }

  /**
   * Get storage manager if available
   */
  getStorageManager(): StorageManager | undefined {
    return this.storageManager
  }

  private createWagmiConfig() {
    const allChains = this.chainAdapter.getAllChains()
    // Ensure we always have at least one chain
    if (allChains.length === 0) {
      throw new Error("No chains available")
    }

    const transports: Record<number, ReturnType<typeof http>> = {}
    for (const chain of allChains) {
      transports[chain.id] = this.createTransport(chain)
    }

    const mockAccountsArray = this.options.mockAccounts || DEFAULT_MOCK_ACCOUNTS

    return createConfig({
      chains: allChains as [Chain, ...Chain[]],
      connectors: [
        mock({
          accounts: mockAccountsArray as readonly [Address, ...Address[]],
          features: {
            reconnect: true,
          },
        }),
      ],
      transports,
    })
  }

  private createTransport(chain: Chain): ReturnType<typeof http> {
    // Use custom transport provider if provided
    if (this.options.transportProvider) {
      return this.options.transportProvider(chain) as ReturnType<typeof http>
    }

    // Check if test transport is available via global
    if (
      process.env.NODE_ENV === "test" &&
      (global as { __testTransport?: unknown }).__testTransport
    ) {
      // Log transport usage in CI for debugging
      if (process.env.CI) {
        logger.debug(`Using test transport for chain ${chain.id} (${chain.name})`)
      }

      // For custom chains with example.com, create a failing transport
      const rpcUrl = chain.rpcUrls.default.http[0]
      if (rpcUrl?.includes("example.com")) {
        if (process.env.CI) {
          logger.debug(`Chain ${chain.id} has example.com URL, using default http transport`)
        }
        return http() // Return a default http transport that will fail
      }
      return (global as { __testTransport?: ReturnType<typeof http> })
        .__testTransport as ReturnType<typeof http>
    }

    // Log when NOT using test transport in test environment
    if (process.env.NODE_ENV === "test" && process.env.CI) {
      logger.warn(`Test transport not available for chain ${chain.id}, using HTTP transport`)
    }

    // Use regular HTTP transport
    return http(chain.rpcUrls.default.http[0])
  }
}

// Export singleton instance getter (for backward compatibility)
export function getContainer(): Container {
  // Check for test container override first (for test isolation)
  const testGlobal = globalThis as TestGlobalThis
  if (process.env.NODE_ENV === "test" && testGlobal.__walletAgentTestContainer) {
    return testGlobal.__walletAgentTestContainer
  }

  return Container.getInstance()
}

// Export factory function for creating new containers
export function createContainer(options?: ContainerOptions): Container {
  return Container.create(options)
}
