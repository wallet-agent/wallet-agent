import { getAccount, getPublicClient, getWalletClient } from "@wagmi/core";
import {
	type Address,
	encodeFunctionData,
	type Hex,
	type PublicClient,
	parseEther,
	type WalletClient,
} from "viem";
import { getAllChains } from "./chains.js";
import { getContainer } from "./container.js";
import { resolveContract } from "./core/contract-resolution.js";
import {
	createPrivateKeyWalletClient,
	getCurrentWalletInfo,
} from "./wallet-manager.js";

export interface ContractWriteParams {
	contract: string;
	address?: Address;
	function: string;
	args?: unknown[];
	value?: string;
}

export interface ContractReadParams {
	contract: string;
	address?: Address;
	function: string;
	args?: unknown[];
}

/**
 * Load contracts from Wagmi-generated file
 */
export async function loadWagmiConfig(filePath: string): Promise<void> {
	const container = getContainer();
	await container.contractAdapter.loadFromFile(filePath);
}

/**
 * List all available contracts
 */
export function listContracts() {
	const container = getContainer();
	return container.contractAdapter.listContracts();
}

/**
 * Write to a contract
 */
export async function writeContract(params: ContractWriteParams): Promise<Hex> {
	const container = getContainer();
	const account = getAccount(container.wagmiConfig);
	if (!account.address) {
		throw new Error("No wallet connected");
	}

	const chainId = container.walletEffects.getCurrentChainId();
	const chain = getAllChains().find((c) => c.id === chainId);
	if (!chain) {
		throw new Error("Current chain not found");
	}

	// Resolve contract
	const resolved = resolveContract(
		params.contract,
		params.address,
		chainId,
		container.contractAdapter,
	);

	const { address: contractAddress, abi } = resolved;

	// Get wallet client
	let walletClient: WalletClient;
	if (getCurrentWalletInfo().type === "privateKey") {
		walletClient = createPrivateKeyWalletClient(account.address, chain);
	} else {
		walletClient = await getWalletClient(container.wagmiConfig, {
			chainId,
			account: account.address,
		});
	}

	if (!walletClient) {
		throw new Error("Failed to get wallet client");
	}

	// Encode function data
	const data = encodeFunctionData({
		abi,
		functionName: params.function,
		args: params.args || [],
	});

	// Send transaction
	const hash = await walletClient.sendTransaction({
		account: account.address,
		to: contractAddress,
		data,
		value: params.value ? parseEther(params.value) : undefined,
		chain,
	});

	return hash;
}

/**
 * Read from a contract
 */
export async function readContract(
	params: ContractReadParams,
): Promise<unknown> {
	const container = getContainer();
	const chainId = container.walletEffects.getCurrentChainId();
	const chain = getAllChains().find((c) => c.id === chainId);
	if (!chain) {
		throw new Error("Current chain not found");
	}

	// Resolve contract
	const resolved = resolveContract(
		params.contract,
		params.address,
		chainId,
		container.contractAdapter,
	);

	const { address: contractAddress, abi } = resolved;

	// Get public client
	const publicClient = getPublicClient(container.wagmiConfig, {
		chainId,
	}) as PublicClient;

	if (!publicClient) {
		throw new Error("Failed to get public client");
	}

	// Read contract
	const result = await publicClient.readContract({
		address: contractAddress,
		abi,
		functionName: params.function,
		args: params.args || [],
	});

	return result;
}
