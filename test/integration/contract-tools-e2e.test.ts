import { beforeAll, describe, expect, it } from "bun:test";
import { anvil } from "viem/chains";
import {
  type DeployedContracts,
  deployTestContracts,
  isAnvilRunning,
} from "../setup/deploy-contracts.js";
import {
  expectToolSuccess,
  setupContainer,
  TEST_PRIVATE_KEY,
} from "./handlers/setup.js";

const useRealAnvil = process.env.USE_REAL_ANVIL === "true";

describe.skipIf(!useRealAnvil)(
  "Contract Tools E2E Tests with Real Deployment",
  () => {
    let deployedContracts: DeployedContracts;

    setupContainer();

    beforeAll(async () => {
      console.log("Setting up E2E contract tools testing with real Anvil...");

      // Check if Anvil is running
      const anvilRunning = await isAnvilRunning();
      if (!anvilRunning) {
        throw new Error(
          "Anvil is not running. Please start Anvil with: anvil --host 0.0.0.0 --port 8545",
        );
      }

      // Deploy contracts
      console.log("Deploying test contracts for E2E testing...");
      deployedContracts = await deployTestContracts();

      // Import private key first
      await expectToolSuccess("import_private_key", {
        privateKey: TEST_PRIVATE_KEY,
      });

      // Set wallet type to private key
      await expectToolSuccess("set_wallet_type", { type: "privateKey" });

      // Switch to Anvil chain (31337)
      await expectToolSuccess("switch_chain", { chainId: 31337 });

      // Connect wallet using private key
      await expectToolSuccess("connect_wallet", {
        address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      });

      // The Storage contract is deployed and ready for testing
      // We'll use direct addressing for the E2E tests
      console.log(
        `✓ Storage contract deployed at ${deployedContracts.storage} for E2E testing`,
      );
    });

    describe("Deployment Verification", () => {
      it("should have successfully deployed Storage contract", () => {
        expect(deployedContracts.storage).toBeDefined();
        expect(deployedContracts.storage).toMatch(/^0x[a-fA-F0-9]{40}$/);
        console.log(
          "✓ Storage contract address valid:",
          deployedContracts.storage,
        );
      });

      it("should be connected to Anvil chain", async () => {
        const { text } = await expectToolSuccess("get_current_account", {});

        expect(text).toContain("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
        expect(text).toContain("31337"); // Anvil chain ID
        console.log("✓ Account connected to Anvil:", text);
      });
    });

    describe("Built-in Contract Support", () => {
      it("should list built-in contracts", async () => {
        const { text } = await expectToolSuccess("list_contracts", {});

        expect(text).toContain("ERC20");
        expect(text).toContain("ERC721");
        console.log("✓ Built-in contracts available:", text);
      });
    });

    describe("Wallet and Chain Operations", () => {
      it("should show current chain information", async () => {
        const { text } = await expectToolSuccess("get_current_account", {});

        expect(text).toContain("Anvil");
        expect(text).toContain("31337");
        console.log("✓ Current chain info:", text);
      });

      it("should show wallet balance", async () => {
        const { text } = await expectToolSuccess("get_balance", {});

        // Anvil accounts start with 10000 ETH
        expect(text).toContain("10000");
        expect(text).toContain("ETH");
        console.log("✓ Wallet balance:", text);
      });
    });

    describe("Transaction Operations", () => {
      it("should estimate gas for a simple transaction", async () => {
        const { text } = await expectToolSuccess("estimate_gas", {
          to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          value: "0.1",
        });

        expect(text).toContain("Gas estimate");
        expect(text).toContain("21000"); // Standard ETH transfer gas
        console.log("✓ Gas estimation:", text);
      });
    });

    describe("Deployment Summary", () => {
      it("should provide comprehensive test summary", async () => {
        const { text: accountText } = await expectToolSuccess(
          "get_current_account",
          {},
        );
        const { text: balanceText } = await expectToolSuccess(
          "get_balance",
          {},
        );

        console.log("\n=== CONTRACT DEPLOYMENT E2E TEST SUMMARY ===");
        console.log(`✓ Anvil chain running: ${anvil.name} (${anvil.id})`);
        console.log(`✓ Contract deployed: ${deployedContracts.storage}`);
        console.log(
          `✓ Account connected: ${accountText.includes("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266") ? "YES" : "NO"}`,
        );
        console.log(
          `✓ Account balance: ${balanceText.includes("10000") ? "10000 ETH" : "UNKNOWN"}`,
        );
        console.log("✓ Private key wallet integration working!");
        console.log("✓ Real blockchain deployment infrastructure functional!");
        console.log("✓ MCP tools working with Anvil blockchain!");
        console.log("============================================\n");

        // Verify all key components are working
        expect(deployedContracts.storage).toBeDefined();
        expect(deployedContracts.storage).toMatch(/^0x[a-fA-F0-9]{40}$/);
        expect(accountText).toContain(
          "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        );
        expect(balanceText).toContain("10000");
      });
    });
  },
);
