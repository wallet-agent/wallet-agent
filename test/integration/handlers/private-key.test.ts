import { describe, expect, test } from "bun:test";
import {
	expectToolSuccess,
	expectToolValidationError,
	setupContainer,
	TEST_ADDRESS_1,
	TEST_ADDRESS_2,
	TEST_PRIVATE_KEY,
} from "./setup.js";

describe("Private Key Management Tools Integration", () => {
	setupContainer();

	describe("import_private_key", () => {
		test("should import a valid private key", async () => {
			const { text } = await expectToolSuccess(
				"import_private_key",
				{ privateKey: TEST_PRIVATE_KEY },
				"Private key imported successfully",
			);

			expect(text).toContain(`Address: ${TEST_ADDRESS_1}`);
			expect(text).toContain("Use 'set_wallet_type' with type \"privateKey\"");
		});

		test("should validate private key format", async () => {
			await expectToolValidationError(
				"import_private_key",
				{ privateKey: "not-a-private-key" },
				"Private key must be 32 bytes",
			);
		});

		test("should validate private key is 32 bytes", async () => {
			await expectToolValidationError(
				"import_private_key",
				{ privateKey: "0x1234" },
				"Private key must be 32 bytes",
			);
		});

		test("should reject private key without 0x prefix", async () => {
			await expectToolValidationError(
				"import_private_key",
				{
					privateKey:
						"ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
				},
				"Private key must be 32 bytes",
			);
		});

		test("should handle multiple private key imports", async () => {
			// Import first key
			await expectToolSuccess("import_private_key", {
				privateKey: TEST_PRIVATE_KEY,
			});

			// Import second key
			const secondKey =
				"0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
			const { text } = await expectToolSuccess(
				"import_private_key",
				{ privateKey: secondKey },
				"Private key imported successfully",
			);

			expect(text).toContain(`Address: ${TEST_ADDRESS_2}`);
		});
	});

	describe("list_imported_wallets", () => {
		test("should show empty list when no wallets imported", async () => {
			const { text } = await expectToolSuccess(
				"list_imported_wallets",
				undefined,
				"No private key wallets imported",
			);

			expect(text).toBe("No private key wallets imported.");
		});

		test("should list imported wallets", async () => {
			// Import some keys
			await expectToolSuccess("import_private_key", {
				privateKey: TEST_PRIVATE_KEY,
			});

			const secondKey =
				"0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
			await expectToolSuccess("import_private_key", { privateKey: secondKey });

			const { text } = await expectToolSuccess(
				"list_imported_wallets",
				undefined,
				"Imported wallets:",
			);

			expect(text).toContain(`- ${TEST_ADDRESS_1} (privateKey)`);
			expect(text).toContain(`- ${TEST_ADDRESS_2} (privateKey)`);
		});
	});

	describe("remove_private_key", () => {
		test("should remove an imported private key", async () => {
			// Import a key first
			await expectToolSuccess("import_private_key", {
				privateKey: TEST_PRIVATE_KEY,
			});

			// Remove it
			const { text } = await expectToolSuccess(
				"remove_private_key",
				{ address: TEST_ADDRESS_1 },
				"Private key removed for address:",
			);

			expect(text).toContain(TEST_ADDRESS_1);

			// Verify it's gone
			const { text: listText } = await expectToolSuccess(
				"list_imported_wallets",
				undefined,
				"No private key wallets imported",
			);
			expect(listText).toBe("No private key wallets imported.");
		});

		test("should handle removing non-existent key", async () => {
			const { text } = await expectToolSuccess(
				"remove_private_key",
				{ address: TEST_ADDRESS_1 },
				"No private key found for address:",
			);

			expect(text).toContain(TEST_ADDRESS_1);
		});

		test("should validate address format", async () => {
			await expectToolValidationError(
				"remove_private_key",
				{ address: "invalid-address" },
				"Invalid Ethereum address format",
			);
		});

		test("should remove specific key when multiple imported", async () => {
			// Import two keys
			await expectToolSuccess("import_private_key", {
				privateKey: TEST_PRIVATE_KEY,
			});

			const secondKey =
				"0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
			await expectToolSuccess("import_private_key", { privateKey: secondKey });

			// Remove first one
			await expectToolSuccess("remove_private_key", {
				address: TEST_ADDRESS_1,
			});

			// Verify only second remains
			const { text } = await expectToolSuccess(
				"list_imported_wallets",
				undefined,
			);
			expect(text).not.toContain(TEST_ADDRESS_1);
			expect(text).toContain(TEST_ADDRESS_2);
		});
	});

	describe("set_wallet_type", () => {
		test("should switch to private key mode", async () => {
			// Import a key first
			await expectToolSuccess("import_private_key", {
				privateKey: TEST_PRIVATE_KEY,
			});

			const { text } = await expectToolSuccess(
				"set_wallet_type",
				{ type: "privateKey" },
				"Wallet type set to: privateKey",
			);

			expect(text).toBe("Wallet type set to: privateKey");

			// Verify wallet info shows private key mode
			const { text: infoText } = await expectToolSuccess(
				"get_wallet_info",
				undefined,
			);
			expect(infoText).toContain("Type: privateKey");
		});

		test("should switch to mock mode", async () => {
			const { text } = await expectToolSuccess(
				"set_wallet_type",
				{ type: "mock" },
				"Wallet type set to: mock",
			);

			expect(text).toBe("Wallet type set to: mock");

			// Verify wallet info shows mock mode
			const { text: infoText } = await expectToolSuccess(
				"get_wallet_info",
				undefined,
			);
			expect(infoText).toContain("Type: mock");
		});

		test("should validate wallet type enum", async () => {
			await expectToolValidationError(
				"set_wallet_type",
				{ type: "invalid-type" },
				"Invalid option: expected one of",
			);
		});

		test("should switch modes and connect appropriately", async () => {
			// Start in mock mode and connect
			await expectToolSuccess("set_wallet_type", { type: "mock" });
			await expectToolSuccess("connect_wallet", { address: TEST_ADDRESS_1 });

			// Import private key and switch
			await expectToolSuccess("import_private_key", {
				privateKey: TEST_PRIVATE_KEY,
			});
			await expectToolSuccess("set_wallet_type", { type: "privateKey" });

			// Should be able to connect with private key wallet
			await expectToolSuccess("connect_wallet", { address: TEST_ADDRESS_1 });

			// Verify we can sign with private key
			const { text } = await expectToolSuccess("sign_message", {
				message: "Test with private key",
			});
			expect(text).toContain("Message signed successfully");
		});
	});
});
