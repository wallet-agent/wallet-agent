import { describe, expect, it } from "bun:test";
import type { WagmiContract } from "../../src/core/contracts.js";
import { InMemoryContractStore } from "../../src/effects/contract-store.js";

describe("InMemoryContractStore", () => {
  describe("registerContract", () => {
    it("should register a contract with address for specific chain", () => {
      const store = new InMemoryContractStore();

      // First add a wagmi contract
      const testContract: WagmiContract = {
        name: "TestContract",
        abi: [
          {
            inputs: [],
            name: "test",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
      };

      store.addContracts([testContract]);

      // Then register it with a specific address
      const testAddress = "0x1234567890123456789012345678901234567890" as const;
      store.registerContract("TestContract", testAddress, 1);

      // Should be able to get the registered contract
      const contract = store.getContract("TestContract", 1);
      expect(contract).toBeDefined();
      expect(contract?.address).toBe(testAddress);
      expect(contract?.chainId).toBe(1);
    });

    it("should throw error when registering unknown contract", () => {
      const store = new InMemoryContractStore();

      expect(() => {
        store.registerContract(
          "UnknownContract",
          "0x1234567890123456789012345678901234567890" as const,
          1,
        );
      }).toThrow("Contract UnknownContract not found in loaded contracts");
    });
  });

  describe("getWagmiContract", () => {
    it("should return user contract if exists", () => {
      const store = new InMemoryContractStore();

      const userContract: WagmiContract = {
        name: "MyContract",
        abi: [
          {
            inputs: [],
            name: "myFunction",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
      };

      store.addContracts([userContract]);

      const result = store.getWagmiContract("MyContract");
      expect(result).toBe(userContract);
    });

    it("should return builtin contract if user contract doesn't exist", () => {
      const store = new InMemoryContractStore();

      const result = store.getWagmiContract("builtin:ERC20");
      expect(result).toBeDefined();
      expect(result?.name).toBe("builtin:ERC20");
    });

    it("should return undefined for unknown contract", () => {
      const store = new InMemoryContractStore();

      const result = store.getWagmiContract("UnknownContract");
      expect(result).toBeUndefined();
    });

    it("should prioritize user contract over builtin with same name", () => {
      const store = new InMemoryContractStore();

      // Add a user contract with same name as builtin
      const userContract: WagmiContract = {
        name: "builtin:ERC20",
        abi: [
          {
            inputs: [],
            name: "customFunction",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
      };

      store.addContracts([userContract]);

      const result = store.getWagmiContract("builtin:ERC20");
      expect(result).toBe(userContract);
      // Check it's the user contract by looking for our custom function
      const hasCustomFunction = result?.abi.some(
        (item) => item.type === "function" && item.name === "customFunction",
      );
      expect(hasCustomFunction).toBe(true);
    });
  });

  describe("clear", () => {
    it("should clear all user contracts and registrations", () => {
      const store = new InMemoryContractStore();

      // Add some contracts
      const testContract: WagmiContract = {
        name: "TestContract",
        abi: [
          {
            inputs: [],
            name: "test",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
      };

      store.addContracts([testContract]);
      store.registerContract(
        "TestContract",
        "0x1234567890123456789012345678901234567890" as const,
        1,
      );

      // Verify they exist
      expect(store.getWagmiContract("TestContract")).toBeDefined();
      expect(store.getContract("TestContract", 1)).toBeDefined();

      // Clear everything
      store.clear();

      // Verify they're gone
      expect(store.getWagmiContract("TestContract")).toBeUndefined();
      expect(store.getContract("TestContract", 1)).toBeUndefined();

      // But builtin contracts should still exist
      expect(store.getWagmiContract("builtin:ERC20")).toBeDefined();
    });
  });
});
