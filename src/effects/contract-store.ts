import type { Abi, Address } from "viem";
import type { ContractStore } from "../adapters/contract-adapter.js";
import type { ContractConfig, WagmiContract } from "../core/contracts.js";
import { resolveContractAddress } from "../core/contracts.js";

/**
 * In-memory contract store implementation
 */
export class InMemoryContractStore implements ContractStore {
	private wagmiContracts = new Map<string, WagmiContract>();
	private registeredContracts = new Map<string, ContractConfig>();

	addContracts(contracts: WagmiContract[]): void {
		for (const contract of contracts) {
			this.wagmiContracts.set(contract.name, contract);
		}
	}

	registerContract(name: string, address: Address, chainId: number): void {
		const wagmiContract = this.wagmiContracts.get(name);
		if (!wagmiContract) {
			throw new Error(`Contract ${name} not found in loaded contracts`);
		}

		const key = `${name}-${chainId}`;
		this.registeredContracts.set(key, {
			name,
			address,
			abi: wagmiContract.abi,
			chainId,
		});
	}

	getContract(name: string, chainId: number): ContractConfig | undefined {
		// First try registered contract with specific address
		const key = `${name}-${chainId}`;
		const registered = this.registeredContracts.get(key);
		if (registered) return registered;

		// Then try Wagmi contract with chain-specific address
		const wagmiContract = this.wagmiContracts.get(name);
		if (!wagmiContract) return undefined;

		const address = resolveContractAddress(wagmiContract, chainId);
		if (!address) return undefined;

		return {
			name,
			address,
			abi: wagmiContract.abi,
			chainId,
		};
	}

	getAbi(name: string): Abi | undefined {
		return this.wagmiContracts.get(name)?.abi;
	}

	getWagmiContract(name: string): WagmiContract | undefined {
		return this.wagmiContracts.get(name);
	}

	getAllContracts(): WagmiContract[] {
		return Array.from(this.wagmiContracts.values());
	}

	clear(): void {
		this.wagmiContracts.clear();
		this.registeredContracts.clear();
	}
}
