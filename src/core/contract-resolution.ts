import type { Address } from "viem";
import type { ContractAdapter } from "../adapters/contract-adapter.js";
import { isBuiltinContract } from "./builtin-contracts.js";
import type { ContractConfig } from "./contracts.js";
import { resolveTokenAddress } from "./token-registry.js";

export interface ResolvedContract {
  name: string;
  address: Address;
  abi: NonNullable<ContractConfig["abi"]>;
  isBuiltin: boolean;
}

/**
 * Resolve a contract identifier to a contract configuration
 *
 * Resolution order:
 * 1. User's Wagmi contracts (by name)
 * 2. Well-known token symbols (e.g., "USDC")
 * 3. Built-in contracts (e.g., "builtin:ERC20")
 * 4. Assume it's an address and use builtin:ERC20/ERC721
 *
 * @param contractOrToken - Contract name, token symbol, or address
 * @param address - Optional address override
 * @param chainId - Chain ID for resolution
 * @param contractAdapter - Contract adapter instance
 * @param defaultBuiltin - Default built-in contract to use for addresses
 */
export function resolveContract(
  contractOrToken: string,
  address: Address | undefined,
  chainId: number,
  contractAdapter: ContractAdapter,
  defaultBuiltin: "builtin:ERC20" | "builtin:ERC721" = "builtin:ERC20",
): ResolvedContract {
  // If explicit address provided, use it
  if (address) {
    // Try to get ABI from contract name
    const abi = contractAdapter.getAbi(contractOrToken);
    if (abi) {
      return {
        name: contractOrToken,
        address,
        abi,
        isBuiltin: isBuiltinContract(contractOrToken),
      };
    }

    // Fall back to default built-in
    const builtinAbi = contractAdapter.getAbi(defaultBuiltin);
    if (!builtinAbi) {
      throw new Error(`Built-in contract ${defaultBuiltin} not found`);
    }

    return {
      name: defaultBuiltin,
      address,
      abi: builtinAbi,
      isBuiltin: true,
    };
  }

  // 1. Try user's Wagmi contracts first
  const userContract = contractAdapter.getContract(contractOrToken, chainId);
  if (userContract?.address) {
    return {
      name: contractOrToken,
      address: userContract.address,
      abi: userContract.abi,
      isBuiltin: false,
    };
  }

  // 2. Try well-known token symbols
  const tokenAddress = resolveTokenAddress(contractOrToken, chainId);
  if (tokenAddress) {
    const builtinAbi = contractAdapter.getAbi("builtin:ERC20");
    if (!builtinAbi) {
      throw new Error("Built-in ERC20 contract not found");
    }

    return {
      name: contractOrToken,
      address: tokenAddress,
      abi: builtinAbi,
      isBuiltin: true,
    };
  }

  // 3. Try built-in contracts (requires address)
  if (isBuiltinContract(contractOrToken)) {
    throw new Error(
      `Built-in contract ${contractOrToken} requires an address parameter`,
    );
  }

  // 4. If it looks like an address, use it with default built-in
  if (contractOrToken.startsWith("0x") && contractOrToken.length === 42) {
    const builtinAbi = contractAdapter.getAbi(defaultBuiltin);
    if (!builtinAbi) {
      throw new Error(`Built-in contract ${defaultBuiltin} not found`);
    }

    return {
      name: defaultBuiltin,
      address: contractOrToken as Address,
      abi: builtinAbi,
      isBuiltin: true,
    };
  }

  throw new Error(
    `Contract ${contractOrToken} not found. Provide an address or load the contract first.`,
  );
}

/**
 * Helper to detect if a contract implements ERC-165 interface
 */
export function supportsInterface(abi: ContractConfig["abi"]): boolean {
  if (!abi) return false;

  // Check if ABI includes supportsInterface function
  const hasSupportsInterface = abi.some(
    (item) =>
      item.type === "function" &&
      item.name === "supportsInterface" &&
      item.inputs?.length === 1 &&
      item.inputs?.[0]?.type === "bytes4",
  );

  return hasSupportsInterface;
}

/**
 * Common ERC interface IDs
 */
export const INTERFACE_IDS = {
  ERC165: "0x01ffc9a7",
  ERC20: "0x36372b07",
  ERC721: "0x80ac58cd",
  ERC721Metadata: "0x5b5e139f",
  ERC1155: "0xd9b67a26",
} as const;
