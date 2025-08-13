import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { type Address, type Chain, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { getContainer, mockAccounts } from "./container.js";
import { PrivateKeySchema } from "./schemas.js";

export type WalletType = "mock" | "privateKey";

export interface WalletInfo {
  address: Address;
  type: WalletType;
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
        `Failed to read private key from file: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // Environment variable (anything else is treated as env var name)
  const envValue = process.env[input];
  if (!envValue) {
    throw new Error(`Environment variable ${input} is not set`);
  }

  return PrivateKeySchema.parse(envValue);
}

export function importPrivateKey(input: string): Address {
  try {
    const validatedKey = resolvePrivateKey(input);
    const account = privateKeyToAccount(validatedKey);

    // Store in container's instance-specific map
    const container = getContainer();
    container.privateKeyWallets.set(account.address, validatedKey);
    return account.address;
  } catch (error) {
    throw new Error(`Failed to import private key: ${error}`);
  }
}

export function removePrivateKey(address: Address): boolean {
  const container = getContainer();
  const privateKeyWallets = container.privateKeyWallets;

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
  const container = getContainer();
  const privateKeyWallets = container.privateKeyWallets;

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
  const container = getContainer();
  const privateKeyWallets = container.privateKeyWallets;

  return Array.from(privateKeyWallets.keys()).map((address) => ({
    address,
    type: "privateKey" as const,
  }));
}

export function createPrivateKeyWalletClient(address: Address, chain: Chain) {
  const container = getContainer();
  const privateKeyWallets = container.privateKeyWallets;
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

export function getCurrentWalletInfo() {
  const container = getContainer();
  const effects = container.walletEffects;
  const address = effects.getAddress();
  const walletType = effects.getCurrentWalletType();

  return {
    type: walletType,
    walletType, // keep for backward compatibility
    currentAddress: address,
    availableAddresses:
      walletType === "privateKey"
        ? Array.from(container.privateKeyWallets.keys())
        : [...mockAccounts],
  };
}

export function setWalletType(type: WalletType) {
  getContainer().walletEffects.setWalletType(type);
}
