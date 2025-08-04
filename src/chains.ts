import { mock } from "@wagmi/connectors";
import { createConfig } from "@wagmi/core";
import type { Address } from "viem";
import { type Chain, defineChain, http } from "viem";
import { anvil, mainnet, polygon, sepolia } from "viem/chains";
import { z } from "zod";
import { ChainConfigSchema } from "./schemas.js";

// Built-in chains (Anvil first as default)
export const builtInChains = [anvil, mainnet, sepolia, polygon];

// Custom chains storage
export const customChains = new Map<number, Chain>();

// Mock accounts
export const mockAccounts = [
	"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
	"0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
	"0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
] as const satisfies readonly Address[];

// Private key wallets storage
export const privateKeyWallets = new Map<Address, `0x${string}`>();

// Current wallet type
export type WalletType = "mock" | "privateKey";
export let currentWalletType: WalletType = "mock";

// Set wallet type
export function setCurrentWalletType(type: WalletType) {
	currentWalletType = type;
}

// Helper to get all chains (built-in + custom)
export function getAllChains(): Chain[] {
	return [...builtInChains, ...customChains.values()];
}

// Helper to create transports for all chains
export function createTransports(): Record<number, ReturnType<typeof http>> {
	const transports: Record<number, ReturnType<typeof http>> = {};
	for (const chain of getAllChains()) {
		transports[chain.id] = http(chain.rpcUrls.default.http[0]);
	}
	return transports;
}

// Create initial Wagmi config
export let config = createConfig({
	chains: [anvil, mainnet, sepolia, polygon],
	connectors: [
		mock({
			accounts: mockAccounts,
			features: {
				reconnect: true,
			},
		}),
	],
	transports: {
		[anvil.id]: http(),
		[mainnet.id]: http(),
		[sepolia.id]: http(),
		[polygon.id]: http(),
	},
});

// Helper to recreate config with new chains
export function updateConfig() {
	const allChains = getAllChains();
	// Ensure we always have at least one chain
	if (allChains.length === 0) {
		throw new Error("No chains available");
	}
	// @ts-expect-error - Dynamic chains require bypassing static typing
	config = createConfig({
		chains: allChains as [Chain, ...Chain[]],
		connectors: [
			mock({
				accounts: mockAccounts,
				features: {
					reconnect: true,
				},
			}),
		],
		transports: createTransports(),
	});
}

// Add a custom chain
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
	// Check if chain already exists
	if (
		builtInChains.some((chain) => chain.id === chainId) ||
		customChains.has(chainId)
	) {
		throw new Error(`Chain with ID ${chainId} already exists`);
	}

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

	// Create custom chain
	const customChain = defineChain(chainConfig);

	// Store custom chain
	customChains.set(chainId, customChain);

	// Recreate config with new chain
	updateConfig();

	return customChain;
}
