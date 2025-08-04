import type { Address } from "viem";

/**
 * Check if a string is a valid Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Check if a string is a valid hex string
 */
export function isValidHex(hex: string): boolean {
  return /^0x[a-fA-F0-9]*$/.test(hex);
}

/**
 * Check if a string is a valid private key
 */
export function isValidPrivateKey(privateKey: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(privateKey);
}

/**
 * Check if a chain ID is valid (positive integer)
 */
export function isValidChainId(chainId: number): boolean {
  return Number.isInteger(chainId) && chainId > 0;
}

/**
 * Check if an address exists in a list (case-insensitive)
 */
export function addressExists(
  address: Address,
  addresses: readonly Address[],
): boolean {
  const normalizedAddress = address.toLowerCase();
  return addresses.some((addr) => addr.toLowerCase() === normalizedAddress);
}

/**
 * Validate transaction value is a valid numeric string
 */
export function isValidTransactionValue(value: string): boolean {
  return /^\d+$/.test(value) && BigInt(value) >= 0n;
}
