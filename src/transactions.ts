import { sendTransaction, switchChain } from "@wagmi/core";
import type { Address } from "viem";
import { parseEther } from "viem";
import { config, currentWalletType, getAllChains } from "./chains.js";
import {
	connectedAddress,
	currentChainId,
	setCurrentChainId,
} from "./wallet.js";
import { createPrivateKeyWalletClient } from "./wallet-manager.js";

export async function sendWalletTransaction(params: {
	to: Address;
	value: string;
	data?: `0x${string}`;
}) {
	if (!connectedAddress) {
		throw new Error("No wallet connected");
	}

	const value = parseEther(params.value);

	if (currentWalletType === "privateKey") {
		// Use private key wallet client
		const chain = getAllChains().find((c) => c.id === currentChainId);
		if (!chain) throw new Error("Chain not found");

		const walletClient = createPrivateKeyWalletClient(connectedAddress, chain);
		const hash = await walletClient.sendTransaction({
			to: params.to,
			value,
			...(params.data ? { data: params.data } : {}),
		});
		return hash;
	}

	// Use mock wallet
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
