import { describe, expect, it } from "bun:test";
import {
  calculateTransactionCost,
  formatTransactionReceipt,
  formatTransactionStatus,
  isRevertError,
} from "../../src/core/transaction-helpers.js";

describe("Transaction Helpers", () => {
  describe("calculateTransactionCost", () => {
    it("calculates transaction cost correctly", () => {
      const gasEstimate = 21000n; // Standard transfer
      const gasPrice = 20000000000n; // 20 Gwei

      const result = calculateTransactionCost(gasEstimate, gasPrice);

      expect(result.totalWei).toBe(420000000000000n);
      expect(result.totalEth).toBe("0.00042");
      expect(result.gasPriceGwei).toBe("20.00");
    });

    it("handles very small gas prices", () => {
      const gasEstimate = 21000n;
      const gasPrice = 1000000n; // 0.001 Gwei

      const result = calculateTransactionCost(gasEstimate, gasPrice);

      expect(result.totalWei).toBe(21000000000n);
      expect(result.totalEth).toBe("0.000000021");
      expect(result.gasPriceGwei).toBe("0.00");
    });

    it("handles large transaction costs", () => {
      const gasEstimate = 1000000n; // Complex contract interaction
      const gasPrice = 100000000000n; // 100 Gwei

      const result = calculateTransactionCost(gasEstimate, gasPrice);

      expect(result.totalWei).toBe(100000000000000000n);
      expect(result.totalEth).toBe("0.1");
      expect(result.gasPriceGwei).toBe("100.00");
    });
  });

  describe("formatTransactionStatus", () => {
    it("formats not found status", () => {
      const result = formatTransactionStatus(
        "not_found",
        "0x123abc",
      );

      expect(result).toBe(
        "Transaction 0x123abc not found. It may not exist or hasn't been broadcasted yet."
      );
    });

    it("formats pending status without details", () => {
      const result = formatTransactionStatus(
        "pending",
        "0x123abc",
      );

      expect(result).toBe(
        "Transaction Status:\n- Hash: 0x123abc\n- Status: pending"
      );
    });

    it("formats confirmed status with full details", () => {
      const result = formatTransactionStatus(
        "confirmed",
        "0x123abc",
        {
          from: "0xfrom",
          to: "0xto",
          value: "1.5",
          blockNumber: 12345678n,
        }
      );

      expect(result).toContain("Status: confirmed");
      expect(result).toContain("From: 0xfrom");
      expect(result).toContain("To: 0xto");
      expect(result).toContain("Value: 1.5 ETH");
      expect(result).toContain("Block Number: 12345678");
    });

    it("handles contract creation (null to address)", () => {
      const result = formatTransactionStatus(
        "confirmed",
        "0x123abc",
        {
          from: "0xfrom",
          to: null,
          value: "0",
          blockNumber: 12345678n,
        }
      );

      expect(result).toContain("To: Contract Creation");
    });

    it("formats pending status with details but no block number", () => {
      const result = formatTransactionStatus(
        "pending",
        "0x123abc",
        {
          from: "0xfrom",
          to: "0xto",
          value: "0.5",
        }
      );

      expect(result).toContain("Status: pending");
      expect(result).toContain("From: 0xfrom");
      expect(result).not.toContain("Block Number:");
    });
  });

  describe("formatTransactionReceipt", () => {
    it("formats successful transaction receipt", () => {
      const receipt = {
        hash: "0x123abc",
        status: "success" as const,
        blockNumber: 12345678n,
        from: "0xfrom",
        to: "0xto",
        gasUsed: 21000n,
        effectiveGasPrice: 20000000000n, // 20 Gwei
        logs: 2,
      };

      const result = formatTransactionReceipt(receipt, "ETH");

      expect(result).toContain("Hash: 0x123abc");
      expect(result).toContain("Status: success");
      expect(result).toContain("Block Number: 12345678");
      expect(result).toContain("From: 0xfrom");
      expect(result).toContain("To: 0xto");
      expect(result).toContain("Gas Used: 21000 units");
      expect(result).toContain("Effective Gas Price: 20.00 Gwei");
      expect(result).toContain("Total Cost: 0.00042 ETH");
      expect(result).toContain("Logs: 2 events");
    });

    it("formats failed transaction receipt", () => {
      const receipt = {
        hash: "0x123abc",
        status: "failed" as const,
        blockNumber: 12345678n,
        from: "0xfrom",
        to: "0xto",
        gasUsed: 50000n,
        effectiveGasPrice: 30000000000n, // 30 Gwei
        logs: 0,
      };

      const result = formatTransactionReceipt(receipt, "ETH");

      expect(result).toContain("Status: failed");
      expect(result).toContain("Total Cost: 0.0015 ETH");
    });

    it("formats contract creation receipt", () => {
      const receipt = {
        hash: "0x123abc",
        status: "success" as const,
        blockNumber: 12345678n,
        from: "0xfrom",
        to: null,
        contractAddress: "0xcontract",
        gasUsed: 1000000n,
        effectiveGasPrice: 20000000000n,
        logs: 5,
      };

      const result = formatTransactionReceipt(receipt, "ETH");

      expect(result).toContain("To: Contract Creation");
      expect(result).toContain("Contract Created: 0xcontract");
    });

    it("uses custom native currency symbol", () => {
      const receipt = {
        hash: "0x123abc",
        status: "success" as const,
        blockNumber: 12345678n,
        from: "0xfrom",
        to: "0xto",
        gasUsed: 21000n,
        effectiveGasPrice: 20000000000n,
        logs: 0,
      };

      const result = formatTransactionReceipt(receipt, "MATIC");

      expect(result).toContain("Total Cost: 0.00042 MATIC");
    });
  });

  describe("isRevertError", () => {
    it("detects revert errors", () => {
      expect(isRevertError("execution reverted")).toBe(true);
      expect(isRevertError("Transaction reverted without a reason")).toBe(true);
      expect(isRevertError("Error: VM Exception while processing transaction: revert")).toBe(true);
    });

    it("detects non-revert errors", () => {
      expect(isRevertError("insufficient funds")).toBe(false);
      expect(isRevertError("nonce too low")).toBe(false);
      expect(isRevertError("gas limit exceeded")).toBe(false);
    });

    it("is case sensitive", () => {
      expect(isRevertError("REVERT")).toBe(false);
      expect(isRevertError("Execution Reverted")).toBe(false);
    });
  });
});