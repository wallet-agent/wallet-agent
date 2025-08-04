import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { type Address, type Chain, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { getContainer, mockAccounts, privateKeyWallets } from "./container.js";
import { PrivateKeySchema } from "./schemas.js";

export interface WalletInfo {
  address: Address;
  type: "mock" | "privateKey";
}

/**
 * Securely resolve a private key from various sources
 */
function resolvePrivateKey(input: string): `0x${string}` {
  // Direct private key (starts with 0x and is 66 characters)
  if (input.startsWith("0x")) {
    return PrivateKeySchema.parse(input);
  }

  // File path (contains / or starts with ~)
  if (input.includes("/") || input.startsWith("~")) {
    try {
      // Expand ~ to home directory
      const filePath = input.startsWith("~")
        ? input.replace("~", homedir())
        : input;

      const fileContent = readFileSync(filePath, "utf8").trim();
      return PrivateKeySchema.parse(fileContent);
    } catch (error) {
      throw new Error(
        `Failed to read private key from file ${input}: ${error}`,
      );
    }
  }

  // Environment variable (doesn't start with 0x and doesn't contain /)
  if (!input.includes("/")) {
    const envValue = process.env[input];
    if (!envValue) {
      throw new Error(`Environment variable ${input} is not set`);
    }
    return PrivateKeySchema.parse(envValue);
  }

  // If we get here, it's an invalid format
  throw new Error(
    "Invalid private key input format. Expected: 0x-prefixed private key, environment variable name, or file path",
  );
}

export function importPrivateKey(privateKeyInput: string): Address {
  try {
    const validatedKey = resolvePrivateKey(privateKeyInput);
    const account = privateKeyToAccount(validatedKey);
    privateKeyWallets.set(account.address, validatedKey);
    return account.address;
  } catch (error) {
    throw new Error(`Failed to import private key: ${error}`);
  }
}

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

export function listImportedWallets(): WalletInfo[] {
  return Array.from(privateKeyWallets.keys()).map((address) => ({
    address,
    type: "privateKey" as const,
  }));
}

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

export function getCurrentWalletInfo(): {
  type: "mock" | "privateKey";
  availableAddresses: Address[];
} {
  const walletType = getContainer().walletEffects.getCurrentWalletType();

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

export function setWalletType(type: "mock" | "privateKey") {
  getContainer().walletEffects.setWalletType(type);
}
