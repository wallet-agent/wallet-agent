import type { Chain } from "viem";
import { z } from "zod";
import type { Container } from "./container.js";
import { getContainer } from "./container.js";
import { buildCustomChain } from "./core/builders.js";
import { ChainConfigSchema } from "./schemas.js";

/**
 * Get all available chains from a specific container
 */
export function getAllChainsForContainer(container: Container): Chain[] {
  return container.chainAdapter.getAllChains();
}

/**
 * Get all available chains (uses default container for backward compatibility)
 */
export function getAllChains(): Chain[] {
  return getAllChainsForContainer(getContainer());
}

/**
 * Add a custom chain to a specific container
 */
export function addCustomChainToContainer(
  container: Container,
  chainId: number,
  name: string,
  rpcUrl: string,
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  },
  blockExplorerUrl?: string,
): Chain {
  // Create the chain config object for validation
  const chainConfig = {
    id: chainId,
    name,
    nativeCurrency,
    rpcUrls: {
      default: {
        http: [rpcUrl],
      },
    },
    ...(blockExplorerUrl && {
      blockExplorers: {
        default: {
          name: `${name} Explorer`,
          url: blockExplorerUrl,
        },
      },
    }),
  };

  // Validate chain config with Zod
  try {
    ChainConfigSchema.parse(chainConfig);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Invalid chain configuration: ${error.issues.map((e) => e.message).join(", ")}`,
      );
    }
    throw error;
  }

  // Build and add the chain
  const customChain = buildCustomChain({
    id: chainId,
    name,
    rpcUrl,
    nativeCurrency,
    ...(blockExplorerUrl && { blockExplorerUrl }),
  });

  container.chainAdapter.addCustomChain(customChain);

  // Recreate config with new chain
  container.updateWagmiConfig();

  return customChain;
}

/**
 * Add a custom chain (uses default container for backward compatibility)
 */
export function addCustomChain(
  chainId: number,
  name: string,
  rpcUrl: string,
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  },
  blockExplorerUrl?: string,
): Chain {
  return addCustomChainToContainer(
    getContainer(),
    chainId,
    name,
    rpcUrl,
    nativeCurrency,
    blockExplorerUrl,
  );
}

/**
 * Update a custom chain in a specific container
 */
export function updateCustomChainInContainer(
  container: Container,
  chainId: number,
  updates: {
    name?: string;
    rpcUrl?: string;
    nativeCurrency?: {
      name: string;
      symbol: string;
      decimals: number;
    };
    blockExplorerUrl?: string;
  },
): void {
  // Validate updates if provided
  if (updates.rpcUrl && !updates.rpcUrl.startsWith("http")) {
    throw new Error("RPC URL must start with http:// or https://");
  }

  if (updates.nativeCurrency) {
    const currencySchema = z.object({
      name: z.string().min(1),
      symbol: z.string().min(1),
      decimals: z.number().int().positive(),
    });

    try {
      currencySchema.parse(updates.nativeCurrency);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Invalid native currency: ${error.issues.map((e) => e.message).join(", ")}`,
        );
      }
      throw error;
    }
  }

  // Update the chain
  container.chainAdapter.updateCustomChain(chainId, updates);

  // Recreate config with updated chain
  container.updateWagmiConfig();
}

/**
 * Update a custom chain (uses default container for backward compatibility)
 */
export function updateCustomChain(
  chainId: number,
  updates: {
    name?: string;
    rpcUrl?: string;
    nativeCurrency?: {
      name: string;
      symbol: string;
      decimals: number;
    };
    blockExplorerUrl?: string;
  },
): void {
  updateCustomChainInContainer(getContainer(), chainId, updates);
}

/**
 * Remove a custom chain from a specific container
 */
export function removeCustomChainFromContainer(
  container: Container,
  chainId: number,
): void {
  const effects = container.walletEffects;

  // Check if we're currently connected to the chain being removed
  const currentChainId = effects.getChainId();
  if (currentChainId === chainId) {
    throw new Error(
      "Cannot remove the currently connected chain. Please switch to another chain first.",
    );
  }

  // Remove the chain
  container.chainAdapter.removeCustomChain(chainId);

  // Recreate config without the removed chain
  container.updateWagmiConfig();
}

/**
 * Remove a custom chain (uses default container for backward compatibility)
 */
export function removeCustomChain(chainId: number): void {
  removeCustomChainFromContainer(getContainer(), chainId);
}
