import {
  type Config,
  connect,
  disconnect,
  getAccount,
  getBalance,
  sendTransaction,
  signMessage,
  signTypedData,
  switchChain,
} from "@wagmi/core"
import type { Address, Chain, WalletClient } from "viem"
import { createWalletClient, http } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import type { ChainAdapter, WalletAdapter } from "./wallet-adapter"

/**
 * Wagmi implementation of WalletAdapter
 */
export class WagmiWalletAdapter implements WalletAdapter {
  constructor(
    private config: Config,
    private connectorIndex: number = 0,
  ) {}

  async connect(address: Address): Promise<{ address: Address; chainId: number }> {
    const connector = this.config.connectors[this.connectorIndex]
    if (!connector) {
      throw new Error("No connector available")
    }

    // Check if already connected and disconnect first to avoid ConnectorAlreadyConnectedError
    const account = getAccount(this.config)
    if (account.isConnected) {
      await disconnect(this.config)
    }

    const result = await connect(this.config, { connector })
    return {
      address,
      chainId: result.chainId,
    }
  }

  async disconnect(): Promise<void> {
    await disconnect(this.config)
  }

  getAccount() {
    const account = getAccount(this.config)
    return {
      isConnected: account.isConnected,
      ...(account.address && { address: account.address }),
      ...(account.chainId && { chainId: account.chainId }),
      ...(account.connector && { connector: account.connector.name }),
    }
  }

  async getBalance(address: Address, chainId: number) {
    const balance = await getBalance(this.config, {
      address,
      chainId: chainId as (typeof this.config.chains)[number]["id"],
    })

    return {
      value: balance.value,
      decimals: balance.decimals,
      symbol: balance.symbol,
    }
  }

  async signMessage(message: string): Promise<string> {
    return await signMessage(this.config, { message })
  }

  async signTypedData(params: {
    domain: Record<string, unknown>
    types: Record<string, unknown>
    primaryType: string
    message: Record<string, unknown>
  }): Promise<string> {
    return await signTypedData(this.config, params)
  }

  async sendTransaction(params: {
    to: Address
    value: bigint
    data?: `0x${string}`
  }): Promise<`0x${string}`> {
    return await sendTransaction(this.config, params)
  }

  async switchChain(chainId: number): Promise<void> {
    await switchChain(this.config, {
      chainId: chainId as (typeof this.config.chains)[number]["id"],
    })
  }
}

/**
 * Private key wallet client factory
 */
export class PrivateKeyWalletClientFactory {
  constructor(private privateKeyStore: Map<Address, `0x${string}`>) {}

  createWalletClient(address: Address, chain: Chain): WalletClient {
    const privateKey = this.privateKeyStore.get(address)
    if (!privateKey) {
      throw new Error(`No private key found for address ${address}`)
    }

    const account = privateKeyToAccount(privateKey)
    return createWalletClient({
      account,
      chain,
      transport: http(chain.rpcUrls.default.http[0]),
    })
  }
}

/**
 * Chain adapter implementation
 */
export class ChainAdapterImpl implements ChainAdapter {
  constructor(
    private builtInChains: Chain[],
    private customChains: Map<number, Chain>,
  ) {}

  getAllChains(): Chain[] {
    return [...this.builtInChains, ...this.customChains.values()]
  }

  getChain(chainId: number): Chain | undefined {
    return this.getAllChains().find((chain) => chain.id === chainId)
  }

  addCustomChain(chain: Chain): void {
    if (this.getChain(chain.id)) {
      throw new Error(`Chain with ID ${chain.id} already exists`)
    }
    this.customChains.set(chain.id, chain)
  }

  updateCustomChain(
    chainId: number,
    updates: Partial<{
      name: string
      rpcUrl: string
      nativeCurrency: {
        name: string
        symbol: string
        decimals: number
      }
      blockExplorerUrl?: string
    }>,
  ): void {
    const chain = this.customChains.get(chainId)
    if (!chain) {
      throw new Error(`Custom chain with ID ${chainId} not found`)
    }

    // Create updated chain with new properties
    const updatedChain: Chain = {
      ...chain,
      ...(updates.name && { name: updates.name }),
      ...(updates.nativeCurrency && { nativeCurrency: updates.nativeCurrency }),
      ...(updates.rpcUrl && {
        rpcUrls: {
          default: {
            http: [updates.rpcUrl],
          },
        },
      }),
      ...(updates.blockExplorerUrl && {
        blockExplorers: {
          default: {
            name: `${updates.name || chain.name} Explorer`,
            url: updates.blockExplorerUrl,
          },
        },
      }),
    }

    this.customChains.set(chainId, updatedChain)
  }

  removeCustomChain(chainId: number): void {
    // Check if it's a custom chain
    if (!this.customChains.has(chainId)) {
      // Check if it's a built-in chain
      const isBuiltIn = this.builtInChains.some((chain) => chain.id === chainId)
      if (isBuiltIn) {
        throw new Error(`Cannot remove built-in chain with ID ${chainId}`)
      }
      throw new Error(`Custom chain with ID ${chainId} not found`)
    }

    // Remove the custom chain
    this.customChains.delete(chainId)
  }
}
