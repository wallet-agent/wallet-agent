import { signMessage, signTypedData } from "@wagmi/core";
import { config, currentWalletType, getAllChains } from "./chains.js";
import { connectedAddress, currentChainId } from "./wallet.js";
import { createPrivateKeyWalletClient } from "./wallet-manager.js";

export async function signWalletMessage(message: string) {
	if (!connectedAddress) {
		throw new Error("No wallet connected");
	}

	if (currentWalletType === "privateKey") {
		// Use private key wallet client
		const chain = getAllChains().find((c) => c.id === currentChainId);
		if (!chain) throw new Error("Chain not found");

		const walletClient = createPrivateKeyWalletClient(connectedAddress, chain);
		const signature = await walletClient.signMessage({ message });
		return signature;
	}

	// Use mock wallet
	const signature = await signMessage(config, { message });
	return signature;
}

export async function signWalletTypedData(params: {
	domain: Record<string, unknown>;
	types: Record<string, unknown>;
	primaryType: string;
	message: Record<string, unknown>;
}) {
	if (!connectedAddress) {
		throw new Error("No wallet connected");
	}

	const signature = await signTypedData(config, {
		domain: params.domain,
		types: params.types,
		primaryType: params.primaryType,
		message: params.message,
	});

	return signature;
}
