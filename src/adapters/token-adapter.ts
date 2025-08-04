import type { Address, Hex } from "viem";

/**
 * Token transfer parameters
 */
export interface TokenTransferParams {
  token: string;
  to: Address;
  amount: string;
}

/**
 * Token approval parameters
 */
export interface TokenApproveParams {
  token: string;
  spender: Address;
  amount: string;
}

/**
 * Token balance query parameters
 */
export interface TokenBalanceParams {
  token: string;
  address?: Address;
}

/**
 * Token balance result
 */
export interface TokenBalanceResult {
  balance: string;
  balanceRaw: bigint;
  symbol: string;
  decimals: number;
}

/**
 * Token information result
 */
export interface TokenInfoResult {
  name: string;
  symbol: string;
  decimals: number;
  address: Address;
  isWellKnown: boolean;
}

/**
 * NFT transfer parameters
 */
export interface NFTTransferParams {
  nft: string;
  to: Address;
  tokenId: string;
}

/**
 * NFT query parameters
 */
export interface NFTQueryParams {
  nft: string;
  tokenId: string;
}

/**
 * NFT info parameters
 */
export interface NFTInfoParams {
  nft: string;
  tokenId?: string;
}

/**
 * NFT information result
 */
export interface NFTInfoResult {
  name: string;
  symbol: string;
  tokenURI?: string;
}

/**
 * Token adapter interface for ERC-20 and ERC-721 operations
 */
export interface TokenAdapter {
  // ERC-20 Operations
  transferToken(params: TokenTransferParams): Promise<Hex>;
  approveToken(params: TokenApproveParams): Promise<Hex>;
  getTokenBalance(params: TokenBalanceParams): Promise<TokenBalanceResult>;
  getTokenInfo(token: string): Promise<TokenInfoResult>;

  // ERC-721 Operations
  transferNFT(params: NFTTransferParams): Promise<Hex>;
  getNFTOwner(params: NFTQueryParams): Promise<Address>;
  getNFTInfo(params: NFTInfoParams): Promise<NFTInfoResult>;
}
