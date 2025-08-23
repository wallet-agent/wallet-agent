import { z } from "zod"
import { getContainer } from "../../container.js"
import { AddressSchema, TokenAmountSchema, TokenIdSchema } from "../../schemas.js"
import { BaseToolHandler } from "../handler-registry.js"

/**
 * Handler for transferring tokens
 */
export class TransferTokenHandler extends BaseToolHandler {
  constructor() {
    super("transfer_token", "Transfer ERC-20 tokens to another address")
  }

  async execute(args: unknown) {
    const { token, to, amount } = this.validateArgs(
      z.object({
        token: z.string(),
        to: AddressSchema,
        amount: TokenAmountSchema,
      }),
      args,
    )

    const container = getContainer()
    const hash = await container.tokenEffects.transferToken({ token, to, amount })

    return this.createTextResponse(
      `Token transfer successful\n` +
        `Transaction hash: ${hash}\n` +
        `Token: ${token}\n` +
        `To: ${to}\n` +
        `Amount: ${amount}`,
    )
  }
}

/**
 * Handler for approving token spending
 */
export class ApproveTokenHandler extends BaseToolHandler {
  constructor() {
    super("approve_token", "Approve ERC-20 token spending")
  }

  async execute(args: unknown) {
    const { token, spender, amount } = this.validateArgs(
      z.object({
        token: z.string(),
        spender: AddressSchema,
        amount: TokenAmountSchema,
      }),
      args,
    )

    const container = getContainer()
    const hash = await container.tokenEffects.approveToken({ token, spender, amount })

    return this.createTextResponse(
      `Token approval successful\n` +
        `Transaction hash: ${hash}\n` +
        `Token: ${token}\n` +
        `Spender: ${spender}\n` +
        `Amount: ${amount}`,
    )
  }
}

/**
 * Handler for getting token balance
 */
export class GetTokenBalanceHandler extends BaseToolHandler {
  constructor() {
    super("get_token_balance", "Get ERC-20 token balance")
  }

  async execute(args: unknown) {
    const { token, address } = this.validateArgs(
      z.object({
        token: z.string(),
        address: AddressSchema.optional(),
      }),
      args,
    )

    const container = getContainer()
    const balance = await container.tokenEffects.getTokenBalance({ token, address })

    return this.createTextResponse(
      `Token Balance:\n` +
        `Amount: ${balance.balance} ${balance.symbol}\n` +
        `Raw: ${balance.balanceRaw}\n` +
        `Decimals: ${balance.decimals}`,
    )
  }
}

/**
 * Handler for getting token info
 */
export class GetTokenInfoHandler extends BaseToolHandler {
  constructor() {
    super("get_token_info", "Get ERC-20 token information (name, symbol, decimals)")
  }

  async execute(args: unknown) {
    const { token } = this.validateArgs(z.object({ token: z.string() }), args)

    const container = getContainer()
    const info = await container.tokenEffects.getTokenInfo(token)

    return this.createTextResponse(
      `Token Information:\n` +
        `Name: ${info.name}\n` +
        `Symbol: ${info.symbol}\n` +
        `Decimals: ${info.decimals}`,
    )
  }
}

/**
 * Handler for transferring NFTs
 */
export class TransferNFTHandler extends BaseToolHandler {
  constructor() {
    super("transfer_nft", "Transfer an ERC-721 NFT to another address")
  }

  async execute(args: unknown) {
    const { nft, to, tokenId } = this.validateArgs(
      z.object({
        nft: z.string(),
        to: AddressSchema,
        tokenId: TokenIdSchema,
      }),
      args,
    )

    const container = getContainer()
    const hash = await container.tokenEffects.transferNFT({ nft, to, tokenId })

    return this.createTextResponse(
      `NFT transfer successful\n` +
        `Transaction hash: ${hash}\n` +
        `NFT: ${nft}\n` +
        `Token ID: ${tokenId}\n` +
        `To: ${to}`,
    )
  }
}

/**
 * Handler for getting NFT owner
 */
export class GetNFTOwnerHandler extends BaseToolHandler {
  constructor() {
    super("get_nft_owner", "Get the owner of an ERC-721 NFT")
  }

  async execute(args: unknown) {
    const { nft, tokenId } = this.validateArgs(
      z.object({
        nft: z.string(),
        tokenId: TokenIdSchema,
      }),
      args,
    )

    const container = getContainer()
    const owner = await container.tokenEffects.getNFTOwner({ nft, tokenId })

    return this.createTextResponse(
      `NFT Owner:\nContract: ${nft}\nToken ID: ${tokenId}\nOwner: ${owner}`,
    )
  }
}

/**
 * Handler for getting NFT info
 */
export class GetNFTInfoHandler extends BaseToolHandler {
  constructor() {
    super("get_nft_info", "Get ERC-721 NFT information (name, symbol, tokenURI)")
  }

  async execute(args: unknown) {
    const { nft, tokenId } = this.validateArgs(
      z.object({
        nft: z.string(),
        tokenId: TokenIdSchema.optional(),
      }),
      args,
    )

    const container = getContainer()
    const info = await container.tokenEffects.getNFTInfo({ nft, tokenId })

    return this.createTextResponse(
      `NFT Information:\n` +
        `Name: ${info.name}\n` +
        `Symbol: ${info.symbol}` +
        (info.tokenURI ? `\nToken URI: ${info.tokenURI}` : ""),
    )
  }
}

// Export all handlers as an array for easy registration
export const tokenHandlers = [
  new TransferTokenHandler(),
  new ApproveTokenHandler(),
  new GetTokenBalanceHandler(),
  new GetTokenInfoHandler(),
  new TransferNFTHandler(),
  new GetNFTOwnerHandler(),
  new GetNFTInfoHandler(),
]
