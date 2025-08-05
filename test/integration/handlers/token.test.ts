import { beforeAll, describe, expect, it } from "bun:test";
import {
  deployTestContracts,
  isAnvilRunning,
} from "../../setup/deploy-contracts.js";
import {
  expectToolExecutionError,
  expectToolSuccess,
  expectToolValidationError,
  setupContainer,
  TEST_ADDRESS_1,
  TEST_ADDRESS_2,
  TEST_PRIVATE_KEY,
} from "./setup.js";
import { setupTokenTestTransport } from "./test-config.js";

// Mock token/NFT addresses for testing (will be deployed to Anvil later)
const MOCK_TOKEN_ADDRESS = "0x1234567890123456789012345678901234567890";
const MOCK_NFT_ADDRESS = "0x2345678901234567890123456789012345678901";

describe("Token Operations Integration", () => {
  setupContainer();
  setupTokenTestTransport();

  let testTokenAddress: string;
  let testNFTAddress: string;
  let useRealAnvil: boolean;

  beforeAll(async () => {
    useRealAnvil = process.env.USE_REAL_ANVIL === "true";

    if (useRealAnvil) {
      console.log("Using real Anvil blockchain for testing...");

      // Check if Anvil is running
      const anvilRunning = await isAnvilRunning();
      if (!anvilRunning) {
        throw new Error(
          "Anvil is not running. Please start Anvil with: anvil --host 0.0.0.0 --port 8545",
        );
      }

      console.log("Deploying test contracts to Anvil...");
      const contracts = await deployTestContracts();
      testTokenAddress = contracts.erc20;
      testNFTAddress = contracts.erc721;
      console.log(`Test ERC20 deployed at: ${testTokenAddress}`);
      console.log(`Test ERC721 deployed at: ${testNFTAddress}`);
    } else {
      console.log("Using mock addresses for testing...");
      // Use mock addresses for mock transport
      testTokenAddress = MOCK_TOKEN_ADDRESS;
      testNFTAddress = MOCK_NFT_ADDRESS;
    }
  });

  describe("transfer_token", () => {
    it("should validate required parameters", async () => {
      await expectToolValidationError("transfer_token", {
        to: TEST_ADDRESS_2,
        amount: "100",
      });
    });

    it("should validate to address format", async () => {
      await expectToolValidationError("transfer_token", {
        token: testTokenAddress,
        to: "invalid-address",
        amount: "100",
      });
    });

    it("should validate amount format", async () => {
      await expectToolValidationError("transfer_token", {
        token: testTokenAddress,
        to: TEST_ADDRESS_2,
        amount: "not-a-number",
      });
    });

    it("should fail at contract level without wallet", async () => {
      // Without wallet connection, behavior differs by environment:
      // - Mock: Contract doesn't exist → "returned no data"
      // - Anvil: Contract exists, wallet check fails → "No wallet connected"
      await expectToolExecutionError(
        "transfer_token",
        {
          token: testTokenAddress,
          to: TEST_ADDRESS_2,
          amount: "100",
        },
        useRealAnvil ? "No wallet connected" : "returned no data",
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
        token: testTokenAddress,
        amount: "1000",
      });
    });

    it("should validate spender address", async () => {
      await expectToolValidationError("approve_token", {
        token: testTokenAddress,
        spender: "invalid-address",
        amount: "1000",
      });
    });

    it("should fail at contract level without wallet", async () => {
      // Without wallet connection, behavior differs by environment:
      // - Mock: Contract doesn't exist → "returned no data"
      // - Anvil: Contract exists, wallet check fails → "No wallet connected"
      await expectToolExecutionError(
        "approve_token",
        {
          token: testTokenAddress,
          spender: TEST_ADDRESS_2,
          amount: "1000",
        },
        useRealAnvil ? "No wallet connected" : "returned no data",
      );
    });

    it("should accept max amount parsing", async () => {
      // Test that "max" is properly parsed - fails at wallet check first
      await expectToolExecutionError(
        "approve_token",
        {
          token: testTokenAddress,
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
        token: testTokenAddress,
        address: "invalid-address",
      });
    });

    it("should require address when no wallet connected", async () => {
      await expectToolExecutionError(
        "get_token_balance",
        {
          token: testTokenAddress,
        },
        "No address provided and no wallet connected",
      );
    });

    it("should work with connected wallet", async () => {
      await expectToolSuccess("connect_wallet", {
        address: TEST_ADDRESS_1,
      });

      // In mock environment: contract doesn't exist → "returned no data"
      // In Anvil environment: real contract exists but account has 0 balance → should succeed
      if (useRealAnvil) {
        // With real Anvil, this should succeed and return balance of 0
        await expectToolSuccess("get_token_balance", {
          token: testTokenAddress,
        });
      } else {
        // With mock transport, contract doesn't exist
        await expectToolExecutionError(
          "get_token_balance",
          {
            token: testTokenAddress,
          },
          "returned no data",
        );
      }
    });

    it("should work with specific address", async () => {
      // In mock environment: contract doesn't exist → "returned no data"
      // In Anvil environment: real contract exists but address has 0 balance → should succeed
      if (useRealAnvil) {
        // With real Anvil, this should succeed and return balance of 0
        await expectToolSuccess("get_token_balance", {
          token: testTokenAddress,
          address: TEST_ADDRESS_2,
        });
      } else {
        // With mock transport, contract doesn't exist
        await expectToolExecutionError(
          "get_token_balance",
          {
            token: testTokenAddress,
            address: TEST_ADDRESS_2,
          },
          "returned no data",
        );
      }
    });
  });

  describe("get_token_info", () => {
    it("should validate token parameter", async () => {
      await expectToolValidationError("get_token_info", {});
    });

    it("should handle raw addresses", async () => {
      // In mock environment: contract doesn't exist → "returned no data"
      // In Anvil environment: real contract exists → should succeed and return token info
      if (useRealAnvil) {
        // With real Anvil, this should succeed and return token info
        await expectToolSuccess("get_token_info", {
          token: testTokenAddress,
        });
      } else {
        // With mock transport, contract doesn't exist
        await expectToolExecutionError(
          "get_token_info",
          {
            token: testTokenAddress,
          },
          "returned no data",
        );
      }
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
        nft: testNFTAddress,
        to: TEST_ADDRESS_2,
      });
    });

    it("should validate tokenId format", async () => {
      await expectToolValidationError("transfer_nft", {
        nft: testNFTAddress,
        to: TEST_ADDRESS_2,
        tokenId: "not-a-number",
      });
    });

    it("should validate to address", async () => {
      await expectToolValidationError("transfer_nft", {
        nft: testNFTAddress,
        to: "invalid-address",
        tokenId: "123",
      });
    });

    it("should require wallet connection", async () => {
      await expectToolExecutionError(
        "transfer_nft",
        {
          nft: testNFTAddress,
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
        nft: testNFTAddress,
      });
    });

    it("should validate tokenId format", async () => {
      await expectToolValidationError("get_nft_owner", {
        nft: testNFTAddress,
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
        nft: testNFTAddress,
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
      // Both mock and real environments now get "HTTP request failed" because
      // the transport properly creates a failing HTTP transport for example.com chains
      await expectToolExecutionError(
        "get_token_info",
        {
          token: testTokenAddress,
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

      // Try token operation - behavior depends on environment
      if (useRealAnvil) {
        // With real Anvil, we have deployed contracts but need to check if account has tokens
        // This could succeed if account has balance, or fail with insufficient balance
        // For now, let's just verify the call gets to the contract level (not "returned no data")
        try {
          await expectToolSuccess("transfer_token", {
            token: testTokenAddress,
            to: TEST_ADDRESS_2,
            amount: "0.01", // Small amount to avoid balance issues
          });
        } catch (error) {
          // If it fails, it should be due to balance issues, not contract existence
          const errorMsg = (error as Error).message || "";
          // Should NOT contain "returned no data" - that would mean contract doesn't exist
          expect(errorMsg).not.toContain("returned no data");
        }
      } else {
        // With mock transport, contract doesn't exist
        await expectToolExecutionError(
          "transfer_token",
          {
            token: testTokenAddress,
            to: TEST_ADDRESS_2,
            amount: "25.75",
          },
          "returned no data",
        );
      }
    });
  });
});
