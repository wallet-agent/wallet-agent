import type { Address } from "viem";
import { formatEther } from "viem";
import { getContainer } from "./container.js";

export async function connectWallet(address: Address) {
	return getContainer().walletEffects.connectWallet(address);
}

export async function disconnectWallet() {
	return getContainer().walletEffects.disconnectWallet();
}

export function getCurrentAccount() {
	return getContainer().walletEffects.getCurrentAccount();
}

export async function getWalletBalance(address?: Address) {
	const result = await getContainer().walletEffects.getBalance(address);
	return {
		address: result.address,
		balance: formatEther(result.balance),
		balanceRaw: result.balance,
		symbol: result.symbol,
	};
}
