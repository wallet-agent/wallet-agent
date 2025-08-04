import { connect, disconnect, getAccount, getBalance } from "@wagmi/core";
import type { Address } from "viem";
import { formatEther } from "viem";
import {
	config,
	currentWalletType,
	getAllChains,
	mockAccounts,
	privateKeyWallets,
} from "./chains.js";

// Server state
export let connectedAddress: Address | undefined;
export let currentChainId: number = 31337; // Default to Anvil

export function setConnectedAddress(address: Address | undefined) {
	connectedAddress = address;
}

export function setCurrentChainId(chainId: number) {
	currentChainId = chainId;
}

export async function connectWallet(address: Address) {
	if (currentWalletType === "privateKey") {
		// For private key wallets, just verify the address exists
		if (!privateKeyWallets.has(address)) {
			throw new Error(
				`Address ${address} is not in the list of imported wallets`,
			);
		}
		setConnectedAddress(address);
		return {
			address,
			chainId: currentChainId,
		};
	}

	// Mock wallet logic
	const isValidAccount = mockAccounts.some(
		(account) => account.toLowerCase() === address.toLowerCase(),
	);
	if (!isValidAccount) {
		throw new Error(`Address ${address} is not in the list of mock accounts`);
	}

	const connector = config.connectors[0];
	if (!connector) {
		throw new Error("No connector available");
	}
	const result = await connect(config, {
		connector,
	});
	setConnectedAddress(address);

	return {
		address,
		chainId: result.chainId,
	};
}

export async function disconnectWallet() {
	await disconnect(config);
	setConnectedAddress(undefined);
}

export function getCurrentAccount() {
	const account = getAccount(config);
	return {
		isConnected: account.isConnected,
		address: account.address,
		chainId: account.chainId,
		connector: account.connector?.name,
	};
}

export async function getWalletBalance(address?: Address) {
	const addressToCheck = address || connectedAddress;
	if (!addressToCheck) {
		throw new Error("No address provided and no wallet connected");
	}

	const balance = await getBalance(config, {
		address: addressToCheck,
		chainId: currentChainId as (typeof config.chains)[number]["id"],
	});

	// Get the current chain to find native currency symbol
	const currentChain = getAllChains().find(
		(chain) => chain.id === currentChainId,
	);
	const nativeCurrencySymbol = currentChain?.nativeCurrency.symbol || "tokens";

	return {
		address: addressToCheck,
		balance: formatEther(balance.value),
		balanceRaw: balance.value,
		symbol: nativeCurrencySymbol,
	};
}
