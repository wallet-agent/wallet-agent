import { getAccount } from "@wagmi/core";
import type { Address, Hex } from "viem";
import { getContainer } from "./container.js";
import { readContract, writeContract } from "./contract-operations.js";
import { resolveContract } from "./contract-resolution.js";
import {
	formatTokenAmount,
	getTokenInfoByAddress,
	parseTokenAmount,
} from "./core/token-registry.js";
import { getCurrentAccount } from "./wallet.js";

export interface TokenTransferParams {
	token: string;
	to: Address;
	amount: string;
}

export interface TokenApproveParams {
	token: string;
	spender: Address;
	amount: string;
}

export interface TokenBalanceParams {
	token: string;
	address?: Address;
}

export interface TokenInfoResult {
	name: string;
	symbol: string;
	decimals: number;
	address: Address;
	isWellKnown: boolean;
}

/**
 * Transfer ERC-20 tokens
 */
export async function transferToken(params: TokenTransferParams): Promise<Hex> {
	const container = getContainer();
	const chainId = container.walletEffects.getCurrentChainId();

	// Resolve the token contract
	const resolved = await resolveContract(
		params.token,
		undefined,
		chainId,
		container.contractAdapter,
		"builtin:ERC20",
	);

	// Get token decimals
	const decimals = (await readContract({
		contract: resolved.isBuiltin ? "builtin:ERC20" : resolved.name,
		address: resolved.address,
		function: "decimals",
	})) as number;

	// Parse amount to smallest unit
	const amountWei = parseTokenAmount(params.amount, decimals);

	// Execute transfer
	return await writeContract({
		contract: resolved.isBuiltin ? "builtin:ERC20" : resolved.name,
		address: resolved.address,
		function: "transfer",
		args: [params.to, amountWei],
	});
}

/**
 * Approve ERC-20 token spending
 */
export async function approveToken(params: TokenApproveParams): Promise<Hex> {
	const container = getContainer();
	const chainId = container.walletEffects.getCurrentChainId();

	// Resolve the token contract
	const resolved = await resolveContract(
		params.token,
		undefined,
		chainId,
		container.contractAdapter,
		"builtin:ERC20",
	);

	let amountWei: bigint;

	if (params.amount.toLowerCase() === "max") {
		// Max uint256
		amountWei = 2n ** 256n - 1n;
	} else {
		// Get token decimals
		const decimals = (await readContract({
			contract: resolved.isBuiltin ? "builtin:ERC20" : resolved.name,
			address: resolved.address,
			function: "decimals",
		})) as number;

		// Parse amount to smallest unit
		amountWei = parseTokenAmount(params.amount, decimals);
	}

	// Execute approve
	return await writeContract({
		contract: resolved.isBuiltin ? "builtin:ERC20" : resolved.name,
		address: resolved.address,
		function: "approve",
		args: [params.spender, amountWei],
	});
}

/**
 * Get ERC-20 token balance
 */
export async function getTokenBalance(params: TokenBalanceParams): Promise<{
	balance: string;
	balanceRaw: bigint;
	symbol: string;
	decimals: number;
}> {
	const container = getContainer();
	const chainId = container.walletEffects.getCurrentChainId();

	// Use current account if no address provided
	const address = params.address || getCurrentAccount()?.address;
	if (!address) {
		throw new Error("No address provided and no wallet connected");
	}

	// Resolve the token contract
	const resolved = await resolveContract(
		params.token,
		undefined,
		chainId,
		container.contractAdapter,
		"builtin:ERC20",
	);

	// Get token info
	const [balanceRaw, symbol, decimals] = await Promise.all([
		readContract({
			contract: resolved.isBuiltin ? "builtin:ERC20" : resolved.name,
			address: resolved.address,
			function: "balanceOf",
			args: [address],
		}) as Promise<bigint>,
		readContract({
			contract: resolved.isBuiltin ? "builtin:ERC20" : resolved.name,
			address: resolved.address,
			function: "symbol",
		}) as Promise<string>,
		readContract({
			contract: resolved.isBuiltin ? "builtin:ERC20" : resolved.name,
			address: resolved.address,
			function: "decimals",
		}) as Promise<number>,
	]);

	const balance = formatTokenAmount(balanceRaw, decimals);

	return {
		balance,
		balanceRaw,
		symbol,
		decimals,
	};
}

/**
 * Get ERC-20 token information
 */
export async function getTokenInfo(token: string): Promise<TokenInfoResult> {
	const container = getContainer();
	const chainId = container.walletEffects.getCurrentChainId();

	// Resolve the token contract
	const resolved = await resolveContract(
		token,
		undefined,
		chainId,
		container.contractAdapter,
		"builtin:ERC20",
	);

	// Get token info from contract
	const [name, symbol, decimals] = await Promise.all([
		readContract({
			contract: resolved.isBuiltin ? "builtin:ERC20" : resolved.name,
			address: resolved.address,
			function: "name",
		}) as Promise<string>,
		readContract({
			contract: resolved.isBuiltin ? "builtin:ERC20" : resolved.name,
			address: resolved.address,
			function: "symbol",
		}) as Promise<string>,
		readContract({
			contract: resolved.isBuiltin ? "builtin:ERC20" : resolved.name,
			address: resolved.address,
			function: "decimals",
		}) as Promise<number>,
	]);

	// Check if it's a well-known token
	const wellKnownInfo = getTokenInfoByAddress(resolved.address, chainId);

	return {
		name,
		symbol,
		decimals,
		address: resolved.address,
		isWellKnown: !!wellKnownInfo,
	};
}

/**
 * Transfer ERC-721 NFT
 */
export async function transferNFT(params: {
	nft: string;
	to: Address;
	tokenId: string;
}): Promise<Hex> {
	const container = getContainer();
	const chainId = container.walletEffects.getCurrentChainId();
	const account = getAccount(container.wagmiConfig);

	if (!account.address) {
		throw new Error("No wallet connected");
	}

	// Resolve the NFT contract
	const resolved = await resolveContract(
		params.nft,
		undefined,
		chainId,
		container.contractAdapter,
		"builtin:ERC721",
	);

	// Execute safeTransferFrom
	return await writeContract({
		contract: resolved.isBuiltin ? "builtin:ERC721" : resolved.name,
		address: resolved.address,
		function: "safeTransferFrom",
		args: [account.address, params.to, BigInt(params.tokenId)],
	});
}

/**
 * Get NFT owner
 */
export async function getNFTOwner(params: {
	nft: string;
	tokenId: string;
}): Promise<Address> {
	const container = getContainer();
	const chainId = container.walletEffects.getCurrentChainId();

	// Resolve the NFT contract
	const resolved = await resolveContract(
		params.nft,
		undefined,
		chainId,
		container.contractAdapter,
		"builtin:ERC721",
	);

	// Get owner
	return (await readContract({
		contract: resolved.isBuiltin ? "builtin:ERC721" : resolved.name,
		address: resolved.address,
		function: "ownerOf",
		args: [BigInt(params.tokenId)],
	})) as Address;
}

/**
 * Get NFT information
 */
export async function getNFTInfo(params: {
	nft: string;
	tokenId?: string;
}): Promise<{
	name: string;
	symbol: string;
	tokenURI?: string;
}> {
	const container = getContainer();
	const chainId = container.walletEffects.getCurrentChainId();

	// Resolve the NFT contract
	const resolved = await resolveContract(
		params.nft,
		undefined,
		chainId,
		container.contractAdapter,
		"builtin:ERC721",
	);

	// Get basic info
	const [name, symbol] = await Promise.all([
		readContract({
			contract: resolved.isBuiltin ? "builtin:ERC721" : resolved.name,
			address: resolved.address,
			function: "name",
		}) as Promise<string>,
		readContract({
			contract: resolved.isBuiltin ? "builtin:ERC721" : resolved.name,
			address: resolved.address,
			function: "symbol",
		}) as Promise<string>,
	]);

	// Get token URI if token ID provided
	let tokenURI: string | undefined;
	if (params.tokenId) {
		tokenURI = (await readContract({
			contract: resolved.isBuiltin ? "builtin:ERC721" : resolved.name,
			address: resolved.address,
			function: "tokenURI",
			args: [BigInt(params.tokenId)],
		})) as string;
	}

	return {
		name,
		symbol,
		...(tokenURI !== undefined && { tokenURI }),
	};
}
