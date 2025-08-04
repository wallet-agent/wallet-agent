import type { Abi, Address } from "viem";
import type {
  ContractAdapter,
  ContractStore,
  FileReader,
} from "../adapters/contract-adapter.js";
import type { ContractConfig, ContractInfo } from "../core/contracts.js";
import { getContractInfo, parseWagmiContent } from "../core/contracts.js";

/**
 * Contract effects handler with dependency injection
 */
export class ContractEffects implements ContractAdapter {
  constructor(
    private fileReader: FileReader,
    private contractStore: ContractStore,
  ) {}

  async loadFromFile(filePath: string): Promise<void> {
    try {
      const content = await this.fileReader.read(filePath);

      // First try safe parsing
      let contracts = parseWagmiContent(content);

      // If no contracts were parsed safely, we might need to use eval
      // This should be done in a controlled environment
      if (contracts.length === 0) {
        console.warn("No contracts parsed safely, attempting eval parsing");
        contracts = this.unsafeParseWagmiContent(content);
      }

      this.contractStore.addContracts(contracts);
    } catch (error) {
      throw new Error(`Failed to load Wagmi contracts: ${error}`);
    }
  }

  /**
   * Unsafe parsing using eval - should only be used for trusted generated code
   */
  private unsafeParseWagmiContent(
    content: string,
  ): import("../core/contracts.js").WagmiContract[] {
    const contracts: import("../core/contracts.js").WagmiContract[] = [];

    // Parse ABIs with eval
    const abiMatches = content.matchAll(
      /export const (\w+)ABI = (\[[\s\S]*?\]) as const/g,
    );

    const abiMap = new Map<string, Abi>();

    for (const match of abiMatches) {
      const [, contractName, abiString] = match;
      if (!contractName || !abiString) continue;

      try {
        // biome-ignore lint/security/noGlobalEval: Required for parsing Wagmi generated code
        const abi = eval(abiString) as Abi;
        abiMap.set(contractName, abi);
      } catch (error) {
        console.error(`Failed to parse ABI for ${contractName}:`, error);
      }
    }

    // Parse addresses with eval
    const addressMatches = content.matchAll(
      /export const (\w+)Address = ({[\s\S]*?}) as const/g,
    );

    const addressMap = new Map<string, Record<number, Address>>();

    for (const match of addressMatches) {
      const [, contractName, addressString] = match;
      if (!contractName || !addressString) continue;

      try {
        // biome-ignore lint/security/noGlobalEval: Required for parsing Wagmi generated code
        const addresses = eval(addressString) as Record<number, Address>;
        addressMap.set(contractName, addresses);
      } catch (error) {
        console.error(`Failed to parse addresses for ${contractName}:`, error);
      }
    }

    // Combine ABIs and addresses
    for (const [name, abi] of abiMap) {
      const addresses = addressMap.get(name);
      contracts.push({
        name,
        abi,
        ...(addresses && { addresses }),
      });
    }

    return contracts;
  }

  registerContract(name: string, address: Address, chainId: number): void {
    this.contractStore.registerContract(name, address, chainId);
  }

  getContract(name: string, chainId: number): ContractConfig | undefined {
    return this.contractStore.getContract(name, chainId);
  }

  getAbi(name: string): Abi | undefined {
    return this.contractStore.getAbi(name);
  }

  listContracts(): ContractInfo[] {
    const contracts = this.contractStore.getAllContracts();
    return getContractInfo(contracts);
  }

  clear(): void {
    this.contractStore.clear();
  }
}
