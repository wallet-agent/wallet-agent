import { type Address, type Chain, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
	mockAccounts,
	privateKeyWallets,
	setCurrentWalletType,
	currentWalletType as walletType,
} from "./chains.js";
import { PrivateKeySchema } from "./schemas.js";

export interface WalletInfo {
	address: Address;
	type: "mock" | "privateKey";
}

// Import a private key
export function importPrivateKey(privateKey: `0x${string}`): Address {
	// Validate private key format using Zod
	const validatedKey = PrivateKeySchema.parse(privateKey);

	try {
		const account = privateKeyToAccount(validatedKey);
		privateKeyWallets.set(account.address, validatedKey);
		return account.address;
	} catch (error) {
		throw new Error(`Failed to import private key: ${error}`);
	}
}

// Remove a private key
export function removePrivateKey(address: Address): boolean {
	// Clear the private key from memory before deletion
	if (privateKeyWallets.has(address)) {
		// Overwrite the key in memory (though JS doesn't guarantee this)
		privateKeyWallets.set(
			address,
			"0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
		);
		return privateKeyWallets.delete(address);
	}
	return false;
}

// Clear all private keys (for security)
export function clearAllPrivateKeys(): void {
	// Overwrite all keys before clearing
	for (const [address] of privateKeyWallets) {
		privateKeyWallets.set(
			address,
			"0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
		);
	}
	privateKeyWallets.clear();
}

// List all imported wallets
export function listImportedWallets(): WalletInfo[] {
	return Array.from(privateKeyWallets.keys()).map((address) => ({
		address,
		type: "privateKey" as const,
	}));
}

// Create a wallet client for a private key
export function createPrivateKeyWalletClient(address: Address, chain: Chain) {
	const privateKey = privateKeyWallets.get(address);
	if (!privateKey) {
		throw new Error(`No private key found for address ${address}`);
	}

	const account = privateKeyToAccount(privateKey);
	return createWalletClient({
		account,
		chain,
		transport: http(chain.rpcUrls.default.http[0]),
	});
}

// Get current wallet info
export function getCurrentWalletInfo(): {
	type: typeof walletType;
	availableAddresses: Address[];
} {
	if (walletType === "privateKey") {
		return {
			type: walletType,
			availableAddresses: Array.from(privateKeyWallets.keys()),
		};
	}

	// Mock wallet
	return {
		type: "mock",
		availableAddresses: [...mockAccounts],
	};
}

// Set wallet type
export function setWalletType(type: "mock" | "privateKey") {
	if (type === "privateKey" && privateKeyWallets.size === 0) {
		throw new Error("No private keys imported. Use import_private_key first.");
	}
	setCurrentWalletType(type);
}
