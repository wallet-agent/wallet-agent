import { describe, expect, it } from "bun:test";
import {
	AddCustomChainArgsSchema,
	AddressSchema,
	ChainConfigSchema,
	ConnectWalletArgsSchema,
	GetBalanceArgsSchema,
	HexStringSchema,
	ImportPrivateKeyArgsSchema,
	PrivateKeySchema,
	RemovePrivateKeyArgsSchema,
	SendTransactionArgsSchema,
	SetWalletTypeArgsSchema,
	SignMessageArgsSchema,
	SignTypedDataArgsSchema,
	SwitchChainArgsSchema,
} from "../src/schemas";

describe("schemas", () => {
	describe("AddressSchema", () => {
		it("validates correct addresses", () => {
			const result = AddressSchema.safeParse(
				"0x742d35Cc6634C0532925a3b844Bc9e7595f6E123",
			);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toBe("0x742d35Cc6634C0532925a3b844Bc9e7595f6E123");
			}
		});

		it("rejects invalid addresses", () => {
			expect(AddressSchema.safeParse("").success).toBe(false);
			expect(AddressSchema.safeParse("0x").success).toBe(false);
			expect(AddressSchema.safeParse("invalid").success).toBe(false);
			expect(
				AddressSchema.safeParse("0x742d35Cc6634C0532925a3b844Bc9e7595f6E12")
					.success,
			).toBe(false); // Too short
		});
	});

	describe("HexStringSchema", () => {
		it("validates hex strings", () => {
			expect(HexStringSchema.safeParse("0x").success).toBe(true);
			expect(HexStringSchema.safeParse("0x123abc").success).toBe(true);
			expect(HexStringSchema.safeParse("0xDEADBEEF").success).toBe(true);
		});

		it("rejects invalid hex strings", () => {
			expect(HexStringSchema.safeParse("").success).toBe(false);
			expect(HexStringSchema.safeParse("123").success).toBe(false);
			expect(HexStringSchema.safeParse("0xGHIJKL").success).toBe(false);
		});
	});

	describe("PrivateKeySchema", () => {
		it("validates private keys", () => {
			const result = PrivateKeySchema.safeParse(
				"0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
			);
			expect(result.success).toBe(true);
		});

		it("rejects invalid private keys with proper error message", () => {
			const result = PrivateKeySchema.safeParse("0x123");
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].message).toBe(
					"Private key must be 32 bytes (64 hex characters) prefixed with 0x",
				);
			}
		});
	});

	describe("ConnectWalletArgsSchema", () => {
		it("validates connect wallet args", () => {
			const result = ConnectWalletArgsSchema.safeParse({
				address: "0x742d35Cc6634C0532925a3b844Bc9e7595f6E123",
			});
			expect(result.success).toBe(true);
		});

		it("rejects invalid args", () => {
			expect(ConnectWalletArgsSchema.safeParse({}).success).toBe(false);
			expect(
				ConnectWalletArgsSchema.safeParse({ address: "invalid" }).success,
			).toBe(false);
		});
	});

	describe("SignMessageArgsSchema", () => {
		it("validates sign message args", () => {
			expect(
				SignMessageArgsSchema.safeParse({ message: "Hello world" }).success,
			).toBe(true);
		});

		it("rejects empty messages", () => {
			const result = SignMessageArgsSchema.safeParse({ message: "" });
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].message).toBe("Message cannot be empty");
			}
		});
	});

	describe("SendTransactionArgsSchema", () => {
		it("validates transaction args", () => {
			const result = SendTransactionArgsSchema.safeParse({
				to: "0x742d35Cc6634C0532925a3b844Bc9e7595f6E123",
				value: "1000000000000000000",
			});
			expect(result.success).toBe(true);
		});

		it("validates transaction with data", () => {
			const result = SendTransactionArgsSchema.safeParse({
				to: "0x742d35Cc6634C0532925a3b844Bc9e7595f6E123",
				value: "0",
				data: "0xdeadbeef",
			});
			expect(result.success).toBe(true);
		});

		it("rejects invalid value formats", () => {
			const result = SendTransactionArgsSchema.safeParse({
				to: "0x742d35Cc6634C0532925a3b844Bc9e7595f6E123",
				value: "1.5",
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].message).toBe(
					"Value must be a numeric string",
				);
			}
		});
	});

	describe("SwitchChainArgsSchema", () => {
		it("validates chain ID", () => {
			expect(SwitchChainArgsSchema.safeParse({ chainId: 1 }).success).toBe(
				true,
			);
			expect(SwitchChainArgsSchema.safeParse({ chainId: 137 }).success).toBe(
				true,
			);
		});

		it("rejects invalid chain IDs", () => {
			const result = SwitchChainArgsSchema.safeParse({ chainId: -1 });
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].message).toBe(
					"Chain ID must be a positive integer",
				);
			}
		});
	});

	describe("AddCustomChainArgsSchema", () => {
		const validChainArgs = {
			chainId: 12345,
			name: "Test Chain",
			rpcUrl: "https://rpc.test.com",
			nativeCurrency: {
				name: "Test Token",
				symbol: "TEST",
				decimals: 18,
			},
		};

		it("validates custom chain args", () => {
			expect(AddCustomChainArgsSchema.safeParse(validChainArgs).success).toBe(
				true,
			);
		});

		it("validates with block explorer", () => {
			const result = AddCustomChainArgsSchema.safeParse({
				...validChainArgs,
				blockExplorerUrl: "https://explorer.test.com",
			});
			expect(result.success).toBe(true);
		});

		it("rejects invalid RPC URL", () => {
			const result = AddCustomChainArgsSchema.safeParse({
				...validChainArgs,
				rpcUrl: "not-a-url",
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].message).toBe("Invalid RPC URL");
			}
		});

		it("validates decimals range", () => {
			const result = AddCustomChainArgsSchema.safeParse({
				...validChainArgs,
				nativeCurrency: { ...validChainArgs.nativeCurrency, decimals: 19 },
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].message).toBe(
					"Decimals must be between 0 and 18",
				);
			}
		});
	});

	describe("SetWalletTypeArgsSchema", () => {
		it("validates wallet types", () => {
			expect(SetWalletTypeArgsSchema.safeParse({ type: "mock" }).success).toBe(
				true,
			);
			expect(
				SetWalletTypeArgsSchema.safeParse({ type: "privateKey" }).success,
			).toBe(true);
		});

		it("rejects invalid types", () => {
			expect(
				SetWalletTypeArgsSchema.safeParse({ type: "invalid" }).success,
			).toBe(false);
		});
	});

	describe("ChainConfigSchema", () => {
		it("validates complete chain config", () => {
			const config = {
				id: 1,
				name: "Ethereum",
				nativeCurrency: {
					name: "Ether",
					symbol: "ETH",
					decimals: 18,
				},
				rpcUrls: {
					default: {
						http: ["https://mainnet.infura.io/v3/YOUR-PROJECT-ID"],
					},
				},
				blockExplorers: {
					default: {
						name: "Etherscan",
						url: "https://etherscan.io",
					},
				},
			};
			expect(ChainConfigSchema.safeParse(config).success).toBe(true);
		});

		it("validates minimal chain config", () => {
			const config = {
				id: 1,
				name: "Ethereum",
				nativeCurrency: {
					name: "Ether",
					symbol: "ETH",
					decimals: 18,
				},
				rpcUrls: {
					default: {
						http: ["https://mainnet.infura.io/v3/YOUR-PROJECT-ID"],
					},
				},
			};
			expect(ChainConfigSchema.safeParse(config).success).toBe(true);
		});
	});
});
