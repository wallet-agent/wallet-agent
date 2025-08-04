import { describe, expect, it } from "bun:test";
import {
  formatBalance,
  formatChainName,
  formatErrorMessage,
  shortenAddress,
} from "../../src/core/formatters";

describe("formatters", () => {
  describe("formatBalance", () => {
    it("formats wei to ether correctly", () => {
      expect(formatBalance(1000000000000000000n)).toBe("1");
      expect(formatBalance(1500000000000000000n)).toBe("1.5");
      expect(formatBalance(123456789000000000n)).toBe("0.1235");
      expect(formatBalance(1000000000000000n)).toBe("0.001");
    });

    it("handles zero balance", () => {
      expect(formatBalance(0n)).toBe("0");
    });

    it("respects decimal places", () => {
      expect(formatBalance(1234567890000000000n, 2)).toBe("1.23");
      expect(formatBalance(1234567890000000000n, 6)).toBe("1.234568");
    });
  });

  describe("shortenAddress", () => {
    it("shortens addresses correctly", () => {
      expect(shortenAddress("0x742d35Cc6634C0532925a3b844Bc9e7595f6E123")).toBe(
        "0x742d...E123",
      );
      expect(
        shortenAddress("0x742d35Cc6634C0532925a3b844Bc9e7595f6E123", 6),
      ).toBe("0x742d35...f6E123");
    });

    it("returns short addresses unchanged", () => {
      expect(shortenAddress("0x123")).toBe("0x123");
      expect(shortenAddress("")).toBe("");
    });
  });

  describe("formatChainName", () => {
    it("formats chain names correctly", () => {
      expect(formatChainName("ethereum-mainnet")).toBe("Ethereum Mainnet");
      expect(formatChainName("polygon_mumbai")).toBe("Polygon Mumbai");
      expect(formatChainName("anvil")).toBe("Anvil");
      expect(formatChainName("OPTIMISM-GOERLI")).toBe("Optimism Goerli");
    });
  });

  describe("formatErrorMessage", () => {
    it("formats different error types", () => {
      expect(formatErrorMessage(new Error("Test error"))).toBe("Test error");
      expect(formatErrorMessage("String error")).toBe("String error");
      expect(formatErrorMessage(123)).toBe("An unknown error occurred");
      expect(formatErrorMessage(null)).toBe("An unknown error occurred");
      expect(formatErrorMessage(undefined)).toBe("An unknown error occurred");
    });
  });
});
