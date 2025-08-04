import type { Address } from "viem";
import type {
	ChainAdapter,
	WalletAdapter,
	WalletClientFactory,
} from "../adapters/wallet-adapter";
import { addressExists } from "../core/validators";

export type WalletType = "mock" | "privateKey";

/**
 * Wallet effects handler with dependency injection
 */
export class WalletEffects {
	private connectedAddress: Address | undefined;
	private currentChainId: number = 31337; // Default to Anvil
	private currentWalletType: WalletType = "mock";

	constructor(
		private mockWalletAdapter: WalletAdapter,
		private privateKeyClientFactory: WalletClientFactory,
		private chainAdapter: ChainAdapter,
		private mockAccounts: readonly Address[],
		private privateKeyAddresses: () => Address[],
	) {}

	// Getters
	getConnectedAddress(): Address | undefined {
		return this.connectedAddress;
	}

	getCurrentChainId(): number {
		return this.currentChainId;
	}

	getCurrentWalletType(): WalletType {
		return this.currentWalletType;
	}

	// Setters
	setCurrentChainId(chainId: number): void {
		this.currentChainId = chainId;
	}

	setWalletType(type: WalletType): void {
		if (type === "privateKey" && this.privateKeyAddresses().length === 0) {
			throw new Error(
				"No private keys imported. Use import_private_key first.",
			);
		}
		this.currentWalletType = type;
	}

	// Wallet operations
	async connectWallet(address: Address) {
		if (this.currentWalletType === "privateKey") {
			const privateKeyAddresses = this.privateKeyAddresses();
			if (!addressExists(address, privateKeyAddresses)) {
				throw new Error(
					`Address ${address} is not in the list of imported wallets`,
				);
			}
			this.connectedAddress = address;
			return {
				address,
				chainId: this.currentChainId,
			};
		}

		// Mock wallet logic
		if (!addressExists(address, this.mockAccounts)) {
			throw new Error(`Address ${address} is not in the list of mock accounts`);
		}

		const result = await this.mockWalletAdapter.connect(address);
		this.connectedAddress = address;
		return result;
	}

	async disconnectWallet() {
		await this.mockWalletAdapter.disconnect();
		this.connectedAddress = undefined;
	}

	getCurrentAccount() {
		if (this.currentWalletType === "privateKey" && this.connectedAddress) {
			return {
				isConnected: true,
				address: this.connectedAddress,
				chainId: this.currentChainId,
				connector: "privateKey",
			};
		}
		return this.mockWalletAdapter.getAccount();
	}

	async getBalance(address?: Address) {
		const addressToCheck = address || this.connectedAddress;
		if (!addressToCheck) {
			throw new Error("No address provided and no wallet connected");
		}

		const chain = this.chainAdapter.getChain(this.currentChainId);
		if (!chain) {
			throw new Error(`Chain ${this.currentChainId} not found`);
		}

		if (this.currentWalletType === "privateKey") {
			// For private key wallets, we would need to use publicClient
			// This is a simplified version - in real implementation you'd use viem's publicClient
			const balance = await this.mockWalletAdapter.getBalance(
				addressToCheck,
				this.currentChainId,
			);
			return {
				address: addressToCheck,
				balance: balance.value,
				symbol: chain.nativeCurrency.symbol,
			};
		}

		const balance = await this.mockWalletAdapter.getBalance(
			addressToCheck,
			this.currentChainId,
		);
		return {
			address: addressToCheck,
			balance: balance.value,
			symbol: balance.symbol,
		};
	}

	async signMessage(message: string) {
		if (!this.connectedAddress) {
			throw new Error("No wallet connected");
		}

		if (this.currentWalletType === "privateKey") {
			const chain = this.chainAdapter.getChain(this.currentChainId);
			if (!chain) throw new Error("Chain not found");

			const walletClient = this.privateKeyClientFactory.createWalletClient(
				this.connectedAddress,
				chain,
			);
			// @ts-expect-error - Viem types are complex, wallet client has signMessage
			return await walletClient.signMessage({ message });
		}

		return await this.mockWalletAdapter.signMessage(message);
	}

	async signTypedData(params: {
		domain: Record<string, unknown>;
		types: Record<string, unknown>;
		primaryType: string;
		message: Record<string, unknown>;
	}) {
		if (!this.connectedAddress) {
			throw new Error("No wallet connected");
		}

		if (this.currentWalletType === "privateKey") {
			const chain = this.chainAdapter.getChain(this.currentChainId);
			if (!chain) throw new Error("Chain not found");

			const walletClient = this.privateKeyClientFactory.createWalletClient(
				this.connectedAddress,
				chain,
			);
			const typedDataParams = {
				domain: params.domain,
				types: params.types,
				primaryType: params.primaryType,
				message: params.message,
			} as Parameters<typeof walletClient.signTypedData>[0];
			return await walletClient.signTypedData(typedDataParams);
		}

		return await this.mockWalletAdapter.signTypedData(params);
	}

	async sendTransaction(params: {
		to: Address;
		value: bigint;
		data?: `0x${string}`;
	}) {
		if (!this.connectedAddress) {
			throw new Error("No wallet connected");
		}

		if (this.currentWalletType === "privateKey") {
			const chain = this.chainAdapter.getChain(this.currentChainId);
			if (!chain) throw new Error("Chain not found");

			const walletClient = this.privateKeyClientFactory.createWalletClient(
				this.connectedAddress,
				chain,
			);
			// @ts-expect-error - Viem types are complex, wallet client has sendTransaction
			return await walletClient.sendTransaction(params);
		}

		return await this.mockWalletAdapter.sendTransaction(params);
	}

	async switchChain(chainId: number) {
		const chain = this.chainAdapter.getChain(chainId);
		if (!chain) {
			throw new Error(
				`Chain ID ${chainId} is not supported. Add it first using add_custom_chain.`,
			);
		}

		await this.mockWalletAdapter.switchChain(chainId);
		this.setCurrentChainId(chainId);

		return {
			chainId,
			chainName: chain.name,
		};
	}
}
