import type { Abi, Address } from "viem";
import type { ContractStore } from "../adapters/contract-adapter.js";
import { BUILTIN_CONTRACTS } from "../core/builtin-contracts.js";
import type { ContractConfig, WagmiContract } from "../core/contracts.js";
import { resolveContractAddress } from "../core/contracts.js";

/**
 * In-memory contract store implementation
 */
export class InMemoryContractStore implements ContractStore {
  private wagmiContracts = new Map<string, WagmiContract>();
  private registeredContracts = new Map<string, ContractConfig>();
  private builtinContracts = new Map<string, WagmiContract>();

  constructor() {
    // Initialize built-in contracts
    for (const contract of BUILTIN_CONTRACTS) {
      this.builtinContracts.set(contract.name, contract);
    }
  }

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
    if (wagmiContract) {
      const address = resolveContractAddress(wagmiContract, chainId);
      if (address) {
        return {
          name,
          address,
          abi: wagmiContract.abi,
          chainId,
        };
      }
    }

    // Finally, check built-in contracts (these don't have addresses)
    const builtinContract = this.builtinContracts.get(name);
    if (builtinContract) {
      // Built-in contracts require address to be provided externally
      return undefined;
    }

    return undefined;
  }

  getAbi(name: string): Abi | undefined {
    // Check user contracts first, then built-in
    return (
      this.wagmiContracts.get(name)?.abi || this.builtinContracts.get(name)?.abi
    );
  }

  getWagmiContract(name: string): WagmiContract | undefined {
    // User contracts take precedence over built-in
    return this.wagmiContracts.get(name) || this.builtinContracts.get(name);
  }

  getAllContracts(): WagmiContract[] {
    // Combine user and built-in contracts
    const allContracts = new Map<string, WagmiContract>();

    // Add built-in contracts first
    for (const [name, contract] of this.builtinContracts) {
      allContracts.set(name, contract);
    }

    // User contracts override built-in if same name
    for (const [name, contract] of this.wagmiContracts) {
      allContracts.set(name, contract);
    }

    return Array.from(allContracts.values());
  }

  clear(): void {
    this.wagmiContracts.clear();
    this.registeredContracts.clear();
  }
}
