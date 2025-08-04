import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { Abi, Address } from "viem";

export interface ContractConfig {
	address: Address;
	abi: Abi;
	name: string;
	chainId?: number;
}

export interface WagmiContract {
	name: string;
	abi: Abi;
	address?: Record<number, Address>;
}

class ContractRegistry {
	private contracts: Map<string, ContractConfig> = new Map();
	private wagmiContracts: Map<string, WagmiContract> = new Map();

	/**
	 * Load contracts from a Wagmi generated file
	 */
	async loadWagmiGenerated(filePath: string): Promise<void> {
		try {
			const absolutePath = resolve(process.cwd(), filePath);
			const fileContent = await readFile(absolutePath, "utf-8");

			// Parse the generated file to extract contract definitions
			// This is a simplified parser - might need adjustment based on actual Wagmi output
			const contractMatches = fileContent.matchAll(
				/export const (\w+)ABI = (\[[\s\S]*?\]) as const/g,
			);

			for (const match of contractMatches) {
				const [, contractName, abiString] = match;
				if (!contractName || !abiString) continue;

				try {
					// biome-ignore lint/security/noGlobalEval: Need to parse ABI from generated code
					const abi = eval(abiString) as Abi;
					this.wagmiContracts.set(contractName, {
						name: contractName,
						abi,
					});
				} catch (error) {
					console.error(`Failed to parse ABI for ${contractName}:`, error);
				}
			}

			// Also look for address mappings
			const addressMatches = fileContent.matchAll(
				/export const (\w+)Address = ({[\s\S]*?}) as const/g,
			);

			for (const match of addressMatches) {
				const [, contractName, addressString] = match;
				if (!contractName || !addressString) continue;

				const wagmiContract = this.wagmiContracts.get(contractName);
				if (wagmiContract) {
					try {
						// biome-ignore lint/security/noGlobalEval: Need to parse addresses from generated code
						const addresses = eval(addressString) as Record<number, Address>;
						wagmiContract.address = addresses;
					} catch (error) {
						console.error(
							`Failed to parse addresses for ${contractName}:`,
							error,
						);
					}
				}
			}
		} catch (error) {
			throw new Error(`Failed to load Wagmi contracts: ${error}`);
		}
	}

	/**
	 * Register a contract with a specific address and chain
	 */
	registerContract(name: string, address: Address, chainId: number): void {
		const wagmiContract = this.wagmiContracts.get(name);
		if (!wagmiContract) {
			throw new Error(`Contract ${name} not found in Wagmi contracts`);
		}

		const key = `${name}-${chainId}`;
		this.contracts.set(key, {
			name,
			address,
			abi: wagmiContract.abi,
			chainId,
		});
	}

	/**
	 * Get a contract by name and chain ID
	 */
	getContract(name: string, chainId: number): ContractConfig | undefined {
		// First try chain-specific contract
		const chainKey = `${name}-${chainId}`;
		const chainContract = this.contracts.get(chainKey);
		if (chainContract) return chainContract;

		// Then try Wagmi contract with chain-specific address
		const wagmiContract = this.wagmiContracts.get(name);
		if (wagmiContract?.address?.[chainId]) {
			return {
				name,
				address: wagmiContract.address[chainId],
				abi: wagmiContract.abi,
				chainId,
			};
		}

		return undefined;
	}

	/**
	 * List all available contracts
	 */
	listContracts(): Array<{ name: string; chains: number[] }> {
		const contractMap = new Map<string, Set<number>>();

		// Add registered contracts
		for (const [, contract] of this.contracts) {
			const chains = contractMap.get(contract.name) || new Set();
			if (contract.chainId) chains.add(contract.chainId);
			contractMap.set(contract.name, chains);
		}

		// Add Wagmi contracts
		for (const [name, contract] of this.wagmiContracts) {
			const chains = contractMap.get(name) || new Set();
			if (contract.address) {
				for (const chainId of Object.keys(contract.address)) {
					chains.add(Number(chainId));
				}
			}
			contractMap.set(name, chains);
		}

		return Array.from(contractMap.entries()).map(([name, chains]) => ({
			name,
			chains: Array.from(chains),
		}));
	}

	/**
	 * Get ABI for a contract by name
	 */
	getAbi(name: string): Abi | undefined {
		return this.wagmiContracts.get(name)?.abi;
	}

	/**
	 * Clear all contracts
	 */
	clear(): void {
		this.contracts.clear();
		this.wagmiContracts.clear();
	}
}

// Global contract registry instance
export const contractRegistry = new ContractRegistry();
