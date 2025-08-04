import type { Chain } from "viem";
import { z } from "zod";
import { getContainer } from "./container.js";
import { buildCustomChain } from "./core/builders.js";
import { ChainConfigSchema } from "./schemas.js";

export function getAllChains(): Chain[] {
	return getContainer().chainAdapter.getAllChains();
}

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

	getContainer().chainAdapter.addCustomChain(customChain);

	// Recreate config with new chain
	getContainer().updateWagmiConfig();

	return customChain;
}
