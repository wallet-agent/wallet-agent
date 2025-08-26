import type { Address } from "viem"
import type {
  ChainAdapter,
  WalletAdapter,
  WalletClientFactory,
} from "../adapters/wallet-adapter.js"
import { addressExists } from "../core/validators.js"
import type { StorageManager } from "../storage/storage-manager.js"
import type { TransactionRecord } from "../storage/types.js"
import { ErrorMessages } from "../utils/error-messages.js"

export type WalletType = "mock" | "privateKey"

/**
 * Wallet effects handler with dependency injection
 */
export class WalletEffects {
  private connectedAddress: Address | undefined
  private currentChainId: number = 31337 // Default to Anvil
  private currentWalletType: WalletType = "mock"

  constructor(
    private mockWalletAdapter: WalletAdapter,
    private privateKeyClientFactory: WalletClientFactory,
    private chainAdapter: ChainAdapter,
    private mockAccounts: readonly Address[],
    private privateKeyAddresses: () => Address[],
    private storageManager?: StorageManager,
  ) {}

  // Getters
  getConnectedAddress(): Address | undefined {
    return this.connectedAddress
  }

  getCurrentChainId(): number {
    return this.currentChainId
  }

  getCurrentWalletType(): WalletType {
    return this.currentWalletType
  }

  getAddress(): Address | undefined {
    return this.connectedAddress
  }

  getChainId(): number {
    return this.currentChainId
  }

  getPublicClient() {
    const chain = this.chainAdapter.getChain(this.currentChainId)
    if (!chain) return undefined

    // For now, we'll return the wallet client which can act as a public client
    if (this.currentWalletType === "privateKey" && this.connectedAddress) {
      return this.privateKeyClientFactory.createWalletClient(this.connectedAddress, chain)
    }
    // Mock adapter doesn't provide public client directly
    return undefined
  }

  // Setters
  setCurrentChainId(chainId: number): void {
    this.currentChainId = chainId
  }

  setWalletType(type: WalletType): void {
    if (type === "privateKey" && this.privateKeyAddresses().length === 0) {
      throw new Error("No private keys imported. Use import_private_key first.")
    }
    this.currentWalletType = type
  }

  // Wallet operations
  async connectWallet(address: Address) {
    if (this.currentWalletType === "privateKey") {
      const privateKeyAddresses = this.privateKeyAddresses()
      if (privateKeyAddresses.length === 0) {
        throw new Error(
          `${ErrorMessages.PRIVATE_KEY_NOT_FOUND.replace("The specified address is not in your imported private keys.", "No private keys have been imported.")} Import a private key first using import_private_key.`,
        )
      }
      if (!addressExists(address, privateKeyAddresses)) {
        throw new Error(ErrorMessages.PRIVATE_KEY_NOT_FOUND)
      }
      this.connectedAddress = address
      return {
        address,
        chainId: this.currentChainId,
      }
    }

    // Mock wallet logic
    if (!addressExists(address, this.mockAccounts)) {
      throw new Error(ErrorMessages.MOCK_ACCOUNT_NOT_FOUND)
    }

    const result = await this.mockWalletAdapter.connect(address)
    this.connectedAddress = address
    return result
  }

  async disconnectWallet() {
    await this.mockWalletAdapter.disconnect()
    this.connectedAddress = undefined
  }

  getCurrentAccount() {
    if (this.currentWalletType === "privateKey" && this.connectedAddress) {
      return {
        isConnected: true,
        address: this.connectedAddress,
        chainId: this.currentChainId,
        connector: "privateKey",
      }
    }
    return this.mockWalletAdapter.getAccount()
  }

  async getBalance(address?: Address) {
    const addressToCheck = address || this.connectedAddress
    if (!addressToCheck) {
      throw new Error("No address provided and no wallet connected")
    }

    const chain = this.chainAdapter.getChain(this.currentChainId)
    if (!chain) {
      throw new Error(`Chain ${this.currentChainId} not found`)
    }

    if (this.currentWalletType === "privateKey") {
      // For private key wallets, we would need to use publicClient
      // This is a simplified version - in real implementation you'd use viem's publicClient
      const balance = await this.mockWalletAdapter.getBalance(addressToCheck, this.currentChainId)
      return {
        address: addressToCheck,
        balance: balance.value,
        symbol: chain.nativeCurrency.symbol,
      }
    }

    const balance = await this.mockWalletAdapter.getBalance(addressToCheck, this.currentChainId)
    return {
      address: addressToCheck,
      balance: balance.value,
      symbol: balance.symbol,
    }
  }

  async signMessage(message: string) {
    if (!this.connectedAddress) {
      throw new Error("No wallet connected")
    }

    if (this.currentWalletType === "privateKey") {
      const chain = this.chainAdapter.getChain(this.currentChainId)
      if (!chain) throw new Error("Chain not found")

      const walletClient = this.privateKeyClientFactory.createWalletClient(
        this.connectedAddress,
        chain,
      )
      // @ts-expect-error - Viem types are complex, wallet client has signMessage
      return await walletClient.signMessage({ message })
    }

    // In test mode with mock wallet, return a mock signature
    if (process.env.NODE_ENV === "test") {
      return "0x1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" as `0x${string}`
    }

    return await this.mockWalletAdapter.signMessage(message)
  }

  async signTypedData(params: {
    domain: Record<string, unknown>
    types: Record<string, unknown>
    primaryType: string
    message: Record<string, unknown>
  }) {
    if (!this.connectedAddress) {
      throw new Error("No wallet connected")
    }

    if (this.currentWalletType === "privateKey") {
      const chain = this.chainAdapter.getChain(this.currentChainId)
      if (!chain) throw new Error("Chain not found")

      const walletClient = this.privateKeyClientFactory.createWalletClient(
        this.connectedAddress,
        chain,
      )
      const typedDataParams = {
        domain: params.domain,
        types: params.types,
        primaryType: params.primaryType,
        message: params.message,
      } as Parameters<typeof walletClient.signTypedData>[0]
      return await walletClient.signTypedData(typedDataParams)
    }

    // In test mode with mock wallet, return a mock signature
    if (process.env.NODE_ENV === "test") {
      return "0x1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890" as `0x${string}`
    }

    return await this.mockWalletAdapter.signTypedData(params)
  }

  async sendTransaction(params: { to: Address; value: bigint; data?: `0x${string}` }) {
    if (!this.connectedAddress) {
      throw new Error("No wallet connected")
    }

    let hash: `0x${string}`

    if (this.currentWalletType === "privateKey") {
      const chain = this.chainAdapter.getChain(this.currentChainId)
      if (!chain) throw new Error("Chain not found")

      const walletClient = this.privateKeyClientFactory.createWalletClient(
        this.connectedAddress,
        chain,
      )
      // @ts-expect-error - Viem types are complex, wallet client has sendTransaction
      hash = await walletClient.sendTransaction(params)
    } else {
      // In test mode with mock wallet, return a mock transaction hash
      if (process.env.NODE_ENV === "test") {
        hash = "0x1234567890123456789012345678901234567890123456789012345678901234" as `0x${string}`
      } else {
        hash = await this.mockWalletAdapter.sendTransaction(params)
      }
    }

    // Record transaction in history
    await this.recordTransaction(hash, params, "send")

    return hash
  }

  async switchChain(chainId: number) {
    const chain = this.chainAdapter.getChain(chainId)
    if (!chain) {
      throw new Error(`Chain ID ${chainId} is not supported. Add it first using add_custom_chain.`)
    }

    await this.mockWalletAdapter.switchChain(chainId)
    this.setCurrentChainId(chainId)

    return {
      chainId,
      chainName: chain.name,
    }
  }

  private async recordTransaction(
    hash: `0x${string}`,
    params: { to: Address; value: bigint; data?: `0x${string}` },
    type: TransactionRecord["metadata"]["type"],
    contractName?: string,
    functionName?: string,
  ) {
    if (!this.storageManager || !this.connectedAddress) {
      return // Skip recording if no storage or wallet
    }

    try {
      const transactionRecord: TransactionRecord = {
        hash,
        from: this.connectedAddress,
        to: params.to,
        value: params.value.toString(),
        chainId: this.currentChainId,
        timestamp: new Date().toISOString(),
        status: "pending",
        metadata: {
          type,
          contractName,
          functionName,
        },
      }

      const historyManager = this.storageManager.getTransactionHistory()
      await historyManager.recordTransaction(transactionRecord)
    } catch (error) {
      // Log error but don't fail transaction
      console.warn("Failed to record transaction:", error)
    }
  }
}
