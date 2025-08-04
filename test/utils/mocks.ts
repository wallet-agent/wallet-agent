import { mock } from "bun:test";
import type { Address, Chain, WalletClient } from "viem";
import type {
	ChainAdapter,
	WalletAdapter,
	WalletClientFactory,
} from "../../src/adapters/wallet-adapter";

/**
 * Create a mock wallet adapter
 */
export function createMockWalletAdapter(): WalletAdapter {
	return {
		connect: mock(async (address: Address) => ({ address, chainId: 1 })),
		disconnect: mock(async () => {}),
		getAccount: mock(() => ({
			isConnected: false,
			address: undefined,
			chainId: undefined,
			connector: undefined,
		})),
		getBalance: mock(async () => ({
			value: 1000000000000000000n,
			decimals: 18,
			symbol: "ETH",
		})),
		signMessage: mock(async () => "0xmockedsignature"),
		signTypedData: mock(async () => "0xmockedtypedsignature"),
		sendTransaction: mock(async () => "0xmockedtxhash" as `0x${string}`),
		switchChain: mock(async () => {}),
	};
}

/**
 * Create a mock wallet client factory
 */
export function createMockWalletClientFactory(): WalletClientFactory {
	return {
		createWalletClient: mock(() => {
			const mockClient = {
				account: {
					address: testAddresses.privateKey1,
					type: "local" as const,
				},
				signMessage: mock(
					async () => "0xprivatekey-signature" as `0x${string}`,
				),
				signTypedData: mock(
					async () => "0xprivatekey-typedsignature" as `0x${string}`,
				),
				sendTransaction: mock(
					async () => "0xprivatekey-txhash" as `0x${string}`,
				),
			};
			return mockClient as unknown as WalletClient;
		}),
	};
}

/**
 * Create a mock chain adapter
 */
export function createMockChainAdapter(chains: Chain[] = []): ChainAdapter {
	const chainMap = new Map(chains.map((c) => [c.id, c]));
	return {
		getAllChains: mock(() => chains),
		getChain: mock((chainId: number) => chainMap.get(chainId)),
		addCustomChain: mock((chain: Chain) => {
			if (chainMap.has(chain.id)) {
				throw new Error(`Chain with ID ${chain.id} already exists`);
			}
			chainMap.set(chain.id, chain);
			chains.push(chain);
		}),
	};
}

/**
 * Create test addresses
 */
export const testAddresses = {
	mock1: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" as Address,
	mock2: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" as Address,
	mock3: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" as Address,
	privateKey1: "0x742d35Cc6634C0532925a3b844Bc9e7595f6E123" as Address,
	privateKey2: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199" as Address,
};

/**
 * Create test chains
 */
export const testChains = {
	anvil: {
		id: 31337,
		name: "Anvil",
		nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
		rpcUrls: { default: { http: ["http://localhost:8545"] } },
	} as Chain,
	mainnet: {
		id: 1,
		name: "Ethereum",
		nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
		rpcUrls: { default: { http: ["https://eth.llamarpc.com"] } },
	} as Chain,
};
