/**
 * Generic wallet manager for signing operations
 * Used for Hyperliquid and other non-EVM chains
 */

import type { PrivateKeyAccount } from "viem/accounts"
import { privateKeyToAccount } from "viem/accounts"

/**
 * Generic wallet manager that handles private key management and signing
 * No chain-specific logic - pure signing functionality
 */
export class GenericWalletManager {
  private privateKey?: `0x${string}`
  private account?: PrivateKeyAccount

  /**
   * Import a private key for signing operations
   */
  async importPrivateKey(key: string): Promise<string> {
    // Validate key format
    if (!key.startsWith("0x") || key.length !== 66) {
      throw new Error("Invalid private key format. Must start with 0x and be 66 characters")
    }

    this.privateKey = key as `0x${string}`
    this.account = privateKeyToAccount(this.privateKey)

    return this.account.address
  }

  /**
   * Get the current account
   */
  getAccount(): PrivateKeyAccount | undefined {
    return this.account
  }

  /**
   * Get the current address
   */
  getAddress(): string | undefined {
    return this.account?.address
  }

  /**
   * Sign a message
   */
  async signMessage(message: string): Promise<string> {
    if (!this.account) {
      throw new Error("No wallet imported")
    }

    return await this.account.signMessage({ message })
  }

  /**
   * Sign typed data (EIP-712)
   */
  async signTypedData(params: {
    domain: unknown
    types: unknown
    primaryType: string
    message: unknown
  }): Promise<string> {
    if (!this.account) {
      throw new Error("No wallet imported")
    }

    // Viem's signTypedData expects specific structure
    return await this.account.signTypedData({
      // biome-ignore lint/suspicious/noExplicitAny: Domain structure varies by protocol
      domain: params.domain as any,
      // biome-ignore lint/suspicious/noExplicitAny: Types structure varies by protocol
      types: params.types as any,
      // biome-ignore lint/suspicious/noExplicitAny: Primary type is dynamic
      primaryType: params.primaryType as any,
      // biome-ignore lint/suspicious/noExplicitAny: Message structure varies by protocol
      message: params.message as any,
    })
  }

  /**
   * Clear the imported wallet
   */
  clearWallet(): void {
    // Overwrite the private key in memory
    if (this.privateKey) {
      this.privateKey =
        "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`
    }
    this.privateKey = undefined
    this.account = undefined
  }

  /**
   * Check if a wallet is imported
   */
  hasWallet(): boolean {
    return !!this.account
  }
}
