import { sendTransaction, switchChain } from "@wagmi/core";
import type { Address } from "viem";
import { parseEther } from "viem";
import { config, getAllChains } from "./chains.js";
import { connectedAddress, setCurrentChainId } from "./wallet.js";

export async function sendWalletTransaction(params: {
	to: Address;
	value: string;
	data?: `0x${string}`;
}) {
	if (!connectedAddress) {
		throw new Error("No wallet connected");
	}

	const value = parseEther(params.value);
	const transactionParams = {
		to: params.to,
		value,
		...(params.data ? { data: params.data } : {}),
	};
	const hash = await sendTransaction(config, transactionParams);

	return hash;
}

export async function switchToChain(chainId: number) {
	// Check if chain is supported
	const allChains = getAllChains();
	const chain = allChains.find((c) => c.id === chainId);
	if (!chain) {
		throw new Error(
			`Chain ID ${chainId} is not supported. Add it first using add_custom_chain.`,
		);
	}

	await switchChain(config, {
		chainId: chainId as (typeof config.chains)[number]["id"],
	});
	setCurrentChainId(chainId);

	return {
		chainId,
		chainName: chain.name,
	};
}
