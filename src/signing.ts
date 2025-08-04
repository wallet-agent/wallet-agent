import { signMessage, signTypedData } from "@wagmi/core";
import { config } from "./chains.js";
import { connectedAddress } from "./wallet.js";

export async function signWalletMessage(message: string) {
	if (!connectedAddress) {
		throw new Error("No wallet connected");
	}

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
