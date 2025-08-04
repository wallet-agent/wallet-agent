import { describe, expect, test } from "bun:test";
import {
  expectToolExecutionError,
  expectToolSuccess,
  expectToolValidationError,
  setupContainer,
  TEST_ADDRESS_1,
  TEST_ADDRESS_2,
} from "./setup.js";

describe("Transaction Tools Integration", () => {
  setupContainer();

  describe("estimate_gas", () => {
    test("should estimate gas for a simple transfer", async () => {
      // Connect wallet first
      await expectToolSuccess("connect_wallet", { address: TEST_ADDRESS_1 });

      const { text: response } = await expectToolSuccess("estimate_gas", {
        to: TEST_ADDRESS_2,
        value: "1.0",
      });

      expect(response).toContain("Gas Estimation:");
      expect(response).toContain("Estimated Gas:");
      expect(response).toContain("Gas Price:");
      expect(response).toContain("Estimated Cost:");
      expect(response).toContain("ETH");
    });

    test("should estimate gas with data", async () => {
      await expectToolSuccess("connect_wallet", { address: TEST_ADDRESS_1 });

      const { text: response } = await expectToolSuccess("estimate_gas", {
        to: TEST_ADDRESS_2,
        data: "0x123abc",
      });

      expect(response).toContain("Gas Estimation:");
    });

    test("should estimate gas with custom from address", async () => {
      const { text: response } = await expectToolSuccess("estimate_gas", {
        to: TEST_ADDRESS_2,
        value: "0.5",
        from: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      });

      expect(response).toContain("Gas Estimation:");
    });

    test("should validate required parameters", async () => {
      await expectToolValidationError("estimate_gas", {
        // Missing 'to' parameter
        value: "1.0",
      });
    });

    test("should validate address format", async () => {
      await expectToolValidationError("estimate_gas", {
        to: "invalid-address",
        value: "1.0",
      });
    });
  });

  describe("get_transaction_status", () => {
    test("should get transaction status", async () => {
      await expectToolSuccess("connect_wallet", { address: TEST_ADDRESS_1 });

      const { text: response } = await expectToolSuccess(
        "get_transaction_status",
        {
          hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        },
      );

      expect(response).toContain("Transaction");
      expect(response).toContain(
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      );
    });

    test("should validate hash format", async () => {
      await expectToolValidationError("get_transaction_status", {
        hash: "invalid-hash",
      });
    });

    test("should require hash parameter", async () => {
      await expectToolValidationError("get_transaction_status", {});
    });
  });

  describe("get_transaction_receipt", () => {
    test("should get transaction receipt", async () => {
      await expectToolSuccess("connect_wallet", { address: TEST_ADDRESS_1 });

      const { text: response } = await expectToolSuccess(
        "get_transaction_receipt",
        {
          hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        },
      );

      expect(response).toContain("No receipt found");
      expect(response).toContain(
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      );
    });

    test("should validate hash format", async () => {
      await expectToolValidationError(
        "get_transaction_receipt",
        { hash: "0x123" }, // Too short
      );
    });
  });

  describe("resolve_ens_name", () => {
    test("should require mainnet for ENS resolution", async () => {
      await expectToolSuccess("connect_wallet", { address: TEST_ADDRESS_1 });

      // Anvil is not mainnet, so this should fail
      await expectToolExecutionError(
        "resolve_ens_name",
        { name: "vitalik.eth" },
        "ENS resolution only works on Ethereum mainnet",
      );
    });

    test("should validate ENS name format", async () => {
      await expectToolValidationError(
        "resolve_ens_name",
        { name: "invalid..eth" }, // Double dots
      );
    });

    test("should require name parameter", async () => {
      await expectToolValidationError("resolve_ens_name", {});
    });
  });

  describe("simulate_transaction", () => {
    test("should simulate contract transaction", async () => {
      await expectToolSuccess("connect_wallet", { address: TEST_ADDRESS_1 });

      const { text: response } = await expectToolSuccess(
        "simulate_transaction",
        {
          contract: "builtin:ERC20",
          function: "transfer",
          args: [TEST_ADDRESS_2, "1000000000000000000"],
        },
      );

      expect(response).toContain("Transaction Simulation");
      // Will fail without a real contract, but should handle gracefully
    });

    test("should simulate with value", async () => {
      await expectToolSuccess("connect_wallet", { address: TEST_ADDRESS_1 });

      const { text: response } = await expectToolSuccess(
        "simulate_transaction",
        {
          contract: "builtin:ERC20",
          function: "transfer",
          args: [],
          value: "0.1",
        },
      );

      expect(response).toContain("Transaction Simulation");
    });

    test("should require contract and function parameters", async () => {
      await expectToolExecutionError(
        "simulate_transaction",
        {
          function: "transfer",
          // Missing contract
        },
        "Contract and function are required",
      );
    });

    test("should require wallet connection", async () => {
      await expectToolExecutionError(
        "simulate_transaction",
        {
          contract: "builtin:ERC20",
          function: "transfer",
          args: [],
        },
        "No wallet connected",
      );
    });
  });

  describe("remove_custom_chain", () => {
    test("should remove custom chain", async () => {
      // First add a custom chain
      await expectToolSuccess("add_custom_chain", {
        chainId: 12345,
        name: "Test Chain",
        rpcUrl: "https://test.example.com",
        nativeCurrency: {
          name: "Test Token",
          symbol: "TEST",
          decimals: 18,
        },
      });

      // Then remove it
      const { text: response } = await expectToolSuccess(
        "remove_custom_chain",
        { chainId: 12345 },
      );

      expect(response).toBe("Custom chain 12345 removed successfully.");
    });

    test("should fail to remove non-existent chain", async () => {
      await expectToolExecutionError(
        "remove_custom_chain",
        { chainId: 99999 },
        "Custom chain with ID 99999 not found",
      );
    });

    test("should validate chainId is required", async () => {
      await expectToolValidationError("remove_custom_chain", {});
    });

    test("should validate chainId is positive", async () => {
      await expectToolValidationError("remove_custom_chain", { chainId: -1 });
    });

    test("should fail to remove built-in chain", async () => {
      await expectToolExecutionError(
        "remove_custom_chain",
        { chainId: 1 }, // Mainnet - not connected, but built-in
        "Cannot remove built-in chain with ID 1",
      );
    });
  });

  describe("Cross-tool Integration", () => {
    test("should estimate gas after switching chains", async () => {
      // Add custom chain first
      await expectToolSuccess("add_custom_chain", {
        chainId: 12345,
        name: "Test Chain",
        rpcUrl: "http://127.0.0.1:8545", // Use Anvil's RPC
        nativeCurrency: {
          name: "Test Token",
          symbol: "TEST",
          decimals: 18,
        },
      });

      // Connect wallet after adding chain (since updateWagmiConfig resets connection)
      await expectToolSuccess("connect_wallet", { address: TEST_ADDRESS_1 });

      // Switch to custom chain
      await expectToolSuccess("switch_chain", { chainId: 12345 });

      // Estimate gas on custom chain
      const { text: response } = await expectToolSuccess("estimate_gas", {
        to: TEST_ADDRESS_2,
        value: "1.0",
      });

      expect(response).toContain("TEST"); // Should use custom chain's symbol
    });
  });
});
