import type { Address, Hex } from "viem"
import type { ContractAdapter } from "../adapters/contract-adapter.js"
import type {
  NFTInfoParams,
  NFTInfoResult,
  NFTQueryParams,
  NFTTransferParams,
  TokenAdapter,
  TokenApproveParams,
  TokenBalanceParams,
  TokenBalanceResult,
  TokenInfoResult,
  TokenTransferParams,
} from "../adapters/token-adapter.js"
import type { ContractReadParams, ContractWriteParams } from "../contract-operations.js"
import { resolveContract } from "../core/contract-resolution.js"
import {
  formatTokenAmount,
  getTokenInfoByAddress,
  parseTokenAmount,
} from "../core/token-registry.js"
import type { WalletEffects } from "./wallet-effects.js"

/**
 * Token effects handler with dependency injection
 */
export class TokenEffects implements TokenAdapter {
  constructor(
    private contractAdapter: ContractAdapter,
    private walletEffects: WalletEffects,
    private readContract: (params: ContractReadParams) => Promise<unknown>,
    private writeContract: (params: ContractWriteParams) => Promise<Hex>,
    private getCurrentAccount: () => { address: Address } | undefined,
  ) {}

  /**
   * Transfer ERC-20 tokens
   */
  async transferToken(params: TokenTransferParams): Promise<Hex> {
    const chainId = this.walletEffects.getCurrentChainId()

    // Resolve the token contract
    const resolved = resolveContract(
      params.token,
      undefined,
      chainId,
      this.contractAdapter,
      "builtin:ERC20",
    )

    // Get token decimals
    const decimals = (await this.readContract({
      contract: resolved.isBuiltin ? "builtin:ERC20" : resolved.name,
      address: resolved.address,
      function: "decimals",
    })) as number

    // Parse amount to smallest unit
    const amountWei = parseTokenAmount(params.amount, decimals)

    // Execute transfer
    return await this.writeContract({
      contract: resolved.isBuiltin ? "builtin:ERC20" : resolved.name,
      address: resolved.address,
      function: "transfer",
      args: [params.to, amountWei],
    })
  }

  /**
   * Approve ERC-20 token spending
   */
  async approveToken(params: TokenApproveParams): Promise<Hex> {
    const chainId = this.walletEffects.getCurrentChainId()

    // Resolve the token contract
    const resolved = resolveContract(
      params.token,
      undefined,
      chainId,
      this.contractAdapter,
      "builtin:ERC20",
    )

    let amountWei: bigint

    if (params.amount.toLowerCase() === "max") {
      // Max uint256
      amountWei = 2n ** 256n - 1n
    } else {
      // Get token decimals
      const decimals = (await this.readContract({
        contract: resolved.isBuiltin ? "builtin:ERC20" : resolved.name,
        address: resolved.address,
        function: "decimals",
      })) as number

      // Parse amount to smallest unit
      amountWei = parseTokenAmount(params.amount, decimals)
    }

    // Execute approve
    return await this.writeContract({
      contract: resolved.isBuiltin ? "builtin:ERC20" : resolved.name,
      address: resolved.address,
      function: "approve",
      args: [params.spender, amountWei],
    })
  }

  /**
   * Get ERC-20 token balance
   */
  async getTokenBalance(params: TokenBalanceParams): Promise<TokenBalanceResult> {
    const chainId = this.walletEffects.getCurrentChainId()

    // Use current account if no address provided
    const address = params.address || this.getCurrentAccount()?.address
    if (!address) {
      throw new Error("No address provided and no wallet connected")
    }

    // Resolve the token contract
    const resolved = resolveContract(
      params.token,
      undefined,
      chainId,
      this.contractAdapter,
      "builtin:ERC20",
    )

    // Get token info
    const [balanceRaw, symbol, decimals] = await Promise.all([
      this.readContract({
        contract: resolved.isBuiltin ? "builtin:ERC20" : resolved.name,
        address: resolved.address,
        function: "balanceOf",
        args: [address],
      }) as Promise<bigint>,
      this.readContract({
        contract: resolved.isBuiltin ? "builtin:ERC20" : resolved.name,
        address: resolved.address,
        function: "symbol",
      }) as Promise<string>,
      this.readContract({
        contract: resolved.isBuiltin ? "builtin:ERC20" : resolved.name,
        address: resolved.address,
        function: "decimals",
      }) as Promise<number>,
    ])

    const balance = formatTokenAmount(balanceRaw, decimals)

    return {
      balance,
      balanceRaw,
      symbol,
      decimals,
    }
  }

  /**
   * Get ERC-20 token information
   */
  async getTokenInfo(token: string): Promise<TokenInfoResult> {
    const chainId = this.walletEffects.getCurrentChainId()

    // Resolve the token contract
    const resolved = resolveContract(
      token,
      undefined,
      chainId,
      this.contractAdapter,
      "builtin:ERC20",
    )

    // Get token info from contract
    const [name, symbol, decimals] = await Promise.all([
      this.readContract({
        contract: resolved.isBuiltin ? "builtin:ERC20" : resolved.name,
        address: resolved.address,
        function: "name",
      }) as Promise<string>,
      this.readContract({
        contract: resolved.isBuiltin ? "builtin:ERC20" : resolved.name,
        address: resolved.address,
        function: "symbol",
      }) as Promise<string>,
      this.readContract({
        contract: resolved.isBuiltin ? "builtin:ERC20" : resolved.name,
        address: resolved.address,
        function: "decimals",
      }) as Promise<number>,
    ])

    // Check if it's a well-known token
    const wellKnownInfo = getTokenInfoByAddress(resolved.address, chainId)

    return {
      name,
      symbol,
      decimals,
      address: resolved.address,
      isWellKnown: !!wellKnownInfo,
    }
  }

  /**
   * Transfer ERC-721 NFT
   */
  async transferNFT(params: NFTTransferParams): Promise<Hex> {
    const chainId = this.walletEffects.getCurrentChainId()
    const account = this.getCurrentAccount()

    if (!account?.address) {
      throw new Error("No wallet connected")
    }

    // Resolve the NFT contract
    const resolved = resolveContract(
      params.nft,
      undefined,
      chainId,
      this.contractAdapter,
      "builtin:ERC721",
    )

    // Execute safeTransferFrom
    return await this.writeContract({
      contract: resolved.isBuiltin ? "builtin:ERC721" : resolved.name,
      address: resolved.address,
      function: "safeTransferFrom",
      args: [account.address, params.to, BigInt(params.tokenId)],
    })
  }

  /**
   * Get NFT owner
   */
  async getNFTOwner(params: NFTQueryParams): Promise<Address> {
    const chainId = this.walletEffects.getCurrentChainId()

    // Resolve the NFT contract
    const resolved = resolveContract(
      params.nft,
      undefined,
      chainId,
      this.contractAdapter,
      "builtin:ERC721",
    )

    // Get owner
    return (await this.readContract({
      contract: resolved.isBuiltin ? "builtin:ERC721" : resolved.name,
      address: resolved.address,
      function: "ownerOf",
      args: [BigInt(params.tokenId)],
    })) as Address
  }

  /**
   * Get NFT information
   */
  async getNFTInfo(params: NFTInfoParams): Promise<NFTInfoResult> {
    const chainId = this.walletEffects.getCurrentChainId()

    // Resolve the NFT contract
    const resolved = resolveContract(
      params.nft,
      undefined,
      chainId,
      this.contractAdapter,
      "builtin:ERC721",
    )

    // Get basic info
    const [name, symbol] = await Promise.all([
      this.readContract({
        contract: resolved.isBuiltin ? "builtin:ERC721" : resolved.name,
        address: resolved.address,
        function: "name",
      }) as Promise<string>,
      this.readContract({
        contract: resolved.isBuiltin ? "builtin:ERC721" : resolved.name,
        address: resolved.address,
        function: "symbol",
      }) as Promise<string>,
    ])

    // Get token URI if token ID provided
    let tokenURI: string | undefined
    if (params.tokenId) {
      tokenURI = (await this.readContract({
        contract: resolved.isBuiltin ? "builtin:ERC721" : resolved.name,
        address: resolved.address,
        function: "tokenURI",
        args: [BigInt(params.tokenId)],
      })) as string
    }

    return {
      name,
      symbol,
      ...(tokenURI !== undefined && { tokenURI }),
    }
  }
}
