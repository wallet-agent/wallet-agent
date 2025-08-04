import { describe, it } from "bun:test";
import {
	expectToolExecutionError,
	expectToolSuccess,
	expectToolValidationError,
	setupContainer,
	TEST_ADDRESS_1,
	TEST_ADDRESS_2,
	TEST_PRIVATE_KEY,
} from "./setup.js";

// Mock token/NFT addresses for testing (will be deployed to Anvil later)
const MOCK_TOKEN_ADDRESS = "0x1234567890123456789012345678901234567890";
const MOCK_NFT_ADDRESS = "0x2345678901234567890123456789012345678901";

describe("Token Operations Integration", () => {
	setupContainer();

	describe("transfer_token", () => {
		it("should validate required parameters", async () => {
			await expectToolValidationError("transfer_token", {
				to: TEST_ADDRESS_2,
				amount: "100",
			});
		});

		it("should validate to address format", async () => {
			await expectToolValidationError("transfer_token", {
				token: MOCK_TOKEN_ADDRESS,
				to: "invalid-address",
				amount: "100",
			});
		});

		it("should validate amount format", async () => {
			await expectToolValidationError("transfer_token", {
				token: MOCK_TOKEN_ADDRESS,
				to: TEST_ADDRESS_2,
				amount: "not-a-number",
			});
		});

		it("should fail at contract level without wallet", async () => {
			// Without wallet connection, it still tries to read contract but fails
			await expectToolExecutionError(
				"transfer_token",
				{
					token: MOCK_TOKEN_ADDRESS,
					to: TEST_ADDRESS_2,
					amount: "100",
				},
				"returned no data",
			);
		});

		it("should handle unknown token gracefully", async () => {
			await expectToolSuccess("connect_wallet", {
				address: TEST_ADDRESS_1,
			});

			// Try to use an unknown token symbol
			await expectToolExecutionError(
				"transfer_token",
				{
					token: "UNKNOWN_TOKEN",
					to: TEST_ADDRESS_2,
					amount: "100",
				},
				"Contract UNKNOWN_TOKEN not found",
			);
		});

		it("should handle well-known token symbols that don't exist on chain", async () => {
			await expectToolSuccess("connect_wallet", {
				address: TEST_ADDRESS_1,
			});

			// Switch to Anvil (default chain)
			await expectToolSuccess("switch_chain", { chainId: 31337 });

			// USDC symbol should be recognized but no contract on Anvil
			await expectToolExecutionError(
				"transfer_token",
				{
					token: "USDC", // Well-known symbol
					to: TEST_ADDRESS_2,
					amount: "100",
				},
				"Contract USDC not found", // Anvil chain doesn't have USDC
			);
		});
	});

	describe("approve_token", () => {
		it("should validate required parameters", async () => {
			await expectToolValidationError("approve_token", {
				token: MOCK_TOKEN_ADDRESS,
				amount: "1000",
			});
		});

		it("should validate spender address", async () => {
			await expectToolValidationError("approve_token", {
				token: MOCK_TOKEN_ADDRESS,
				spender: "invalid-address",
				amount: "1000",
			});
		});

		it("should fail at contract level without wallet", async () => {
			// Fails at contract interaction level before wallet check
			await expectToolExecutionError(
				"approve_token",
				{
					token: MOCK_TOKEN_ADDRESS,
					spender: TEST_ADDRESS_2,
					amount: "1000",
				},
				"returned no data",
			);
		});

		it("should accept max amount parsing", async () => {
			// Test that "max" is properly parsed - fails at wallet check
			await expectToolExecutionError(
				"approve_token",
				{
					token: MOCK_TOKEN_ADDRESS,
					spender: TEST_ADDRESS_2,
					amount: "max",
				},
				"No wallet connected",
			);
		});
	});

	describe("get_token_balance", () => {
		it("should validate address format when provided", async () => {
			await expectToolValidationError("get_token_balance", {
				token: MOCK_TOKEN_ADDRESS,
				address: "invalid-address",
			});
		});

		it("should require address when no wallet connected", async () => {
			await expectToolExecutionError(
				"get_token_balance",
				{
					token: MOCK_TOKEN_ADDRESS,
				},
				"No address provided and no wallet connected",
			);
		});

		it("should work with connected wallet", async () => {
			await expectToolSuccess("connect_wallet", {
				address: TEST_ADDRESS_1,
			});

			// Will fail at contract level but validates the flow
			await expectToolExecutionError(
				"get_token_balance",
				{
					token: MOCK_TOKEN_ADDRESS,
				},
				"returned no data",
			);
		});

		it("should work with specific address", async () => {
			// Will fail at contract level but validates parameter handling
			await expectToolExecutionError(
				"get_token_balance",
				{
					token: MOCK_TOKEN_ADDRESS,
					address: TEST_ADDRESS_2,
				},
				"returned no data",
			);
		});
	});

	describe("get_token_info", () => {
		it("should validate token parameter", async () => {
			await expectToolValidationError("get_token_info", {});
		});

		it("should handle raw addresses", async () => {
			// Will fail at contract level but validates address handling
			await expectToolExecutionError(
				"get_token_info",
				{
					token: MOCK_TOKEN_ADDRESS,
				},
				"returned no data",
			);
		});

		it("should handle well-known symbols not deployed on chain", async () => {
			// USDC symbol is recognized but not deployed on current chain
			await expectToolExecutionError(
				"get_token_info",
				{
					token: "USDC",
				},
				"Contract USDC not found",
			);
		});
	});

	describe("transfer_nft", () => {
		it("should validate required parameters", async () => {
			await expectToolValidationError("transfer_nft", {
				nft: MOCK_NFT_ADDRESS,
				to: TEST_ADDRESS_2,
			});
		});

		it("should validate tokenId format", async () => {
			await expectToolValidationError("transfer_nft", {
				nft: MOCK_NFT_ADDRESS,
				to: TEST_ADDRESS_2,
				tokenId: "not-a-number",
			});
		});

		it("should validate to address", async () => {
			await expectToolValidationError("transfer_nft", {
				nft: MOCK_NFT_ADDRESS,
				to: "invalid-address",
				tokenId: "123",
			});
		});

		it("should require wallet connection", async () => {
			await expectToolExecutionError(
				"transfer_nft",
				{
					nft: MOCK_NFT_ADDRESS,
					to: TEST_ADDRESS_2,
					tokenId: "123",
				},
				"No wallet connected",
			);
		});
	});

	describe("get_nft_owner", () => {
		it("should validate required parameters", async () => {
			await expectToolValidationError("get_nft_owner", {
				nft: MOCK_NFT_ADDRESS,
			});
		});

		it("should validate tokenId format", async () => {
			await expectToolValidationError("get_nft_owner", {
				nft: MOCK_NFT_ADDRESS,
				tokenId: "not-a-number",
			});
		});

		it("should validate nft address", async () => {
			await expectToolValidationError("get_nft_owner", {
				nft: "invalid-address",
				tokenId: "123",
			});
		});
	});

	describe("get_nft_info", () => {
		it("should validate nft parameter", async () => {
			await expectToolValidationError("get_nft_info", {});
		});

		it("should validate nft address format", async () => {
			await expectToolValidationError("get_nft_info", {
				nft: "invalid-address",
			});
		});

		it("should validate tokenId when provided", async () => {
			await expectToolValidationError("get_nft_info", {
				nft: MOCK_NFT_ADDRESS,
				tokenId: "not-a-number",
			});
		});
	});

	describe("Error Handling", () => {
		it("should handle contract resolution errors gracefully", async () => {
			await expectToolSuccess("connect_wallet", {
				address: TEST_ADDRESS_1,
			});

			// Try to use an unknown contract name
			await expectToolExecutionError(
				"transfer_token",
				{
					token: "UNKNOWN_TOKEN",
					to: TEST_ADDRESS_2,
					amount: "100",
				},
				"Contract UNKNOWN_TOKEN not found",
			);
		});

		it("should work with custom chains", async () => {
			await expectToolSuccess("connect_wallet", {
				address: TEST_ADDRESS_1,
			});

			// Add a custom chain - use correct parameter names
			await expectToolSuccess("add_custom_chain", {
				chainId: 999,
				name: "Test Chain",
				rpcUrl: "https://test-rpc.example.com",
				nativeCurrency: {
					name: "Test Token",
					symbol: "TEST",
					decimals: 18,
				},
			});

			// Switch to custom chain
			await expectToolSuccess("switch_chain", { chainId: 999 });

			// Try to use a token on custom chain - should fail at network level
			await expectToolExecutionError(
				"get_token_info",
				{
					token: MOCK_TOKEN_ADDRESS,
				},
				"HTTP request failed", // Network error from fake RPC
			);
		});

		it("should handle private key wallet operations", async () => {
			// Import private key
			await expectToolSuccess("import_private_key", {
				privateKey: TEST_PRIVATE_KEY,
			});

			// Switch to private key mode
			await expectToolSuccess("set_wallet_type", {
				type: "privateKey",
			});

			// Connect to private key wallet
			await expectToolSuccess("connect_wallet", {
				address: TEST_ADDRESS_1,
			});

			// Try token operation - should fail at contract level but validate the flow
			await expectToolExecutionError(
				"transfer_token",
				{
					token: MOCK_TOKEN_ADDRESS,
					to: TEST_ADDRESS_2,
					amount: "25.75",
				},
				"returned no data",
			);
		});
	});
});
