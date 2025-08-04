import { describe, expect, it } from "bun:test";
import {
  formatTokenAmount,
  getTokenInfoByAddress,
  getTokenInfoBySymbol,
  parseTokenAmount,
  resolveTokenAddress,
} from "../../src/core/token-registry";

describe("Token Registry", () => {
  describe("formatTokenAmount", () => {
    it("formats token amount with 18 decimals", () => {
      const amount = 1234567890123456789012n;
      const formatted = formatTokenAmount(amount, 18);
      expect(formatted).toBe("1234.567890123456789012");
    });

    it("formats token amount with 6 decimals (USDC)", () => {
      const amount = 1234567890n;
      const formatted = formatTokenAmount(amount, 6);
      expect(formatted).toBe("1234.56789");
    });

    it("formats small amounts correctly", () => {
      const amount = 123n;
      const formatted = formatTokenAmount(amount, 18);
      expect(formatted).toBe("0.000000000000000123");
    });

    it("formats zero correctly", () => {
      const amount = 0n;
      const formatted = formatTokenAmount(amount, 18);
      expect(formatted).toBe("0");
    });

    it("handles amounts smaller than 1 wei", () => {
      const amount = 1n;
      const formatted = formatTokenAmount(amount, 18);
      expect(formatted).toBe("0.000000000000000001");
    });
  });

  describe("parseTokenAmount", () => {
    it("parses token amount with 18 decimals", () => {
      const parsed = parseTokenAmount("1234.567890123456789012", 18);
      expect(parsed).toBe(1234567890123456789012n);
    });

    it("parses token amount with 6 decimals (USDC)", () => {
      const parsed = parseTokenAmount("1234.56789", 6);
      expect(parsed).toBe(1234567890n);
    });

    it("parses integer amounts", () => {
      const parsed = parseTokenAmount("1000", 18);
      expect(parsed).toBe(1000000000000000000000n);
    });

    it("parses small amounts", () => {
      const parsed = parseTokenAmount("0.000000000000000001", 18);
      expect(parsed).toBe(1n);
    });

    it("handles amounts with more decimals than token precision", () => {
      const parsed = parseTokenAmount("123.4567890123456789012345", 18);
      expect(parsed).toBe(123456789012345678901n); // Truncated to 18 decimals
    });

    it("parses zero correctly", () => {
      const parsed = parseTokenAmount("0", 18);
      expect(parsed).toBe(0n);
    });

    it("parses zero with decimals correctly", () => {
      const parsed = parseTokenAmount("0.0", 18);
      expect(parsed).toBe(0n);
    });
  });

  describe("resolveTokenAddress", () => {
    it("resolves USDC on mainnet", () => {
      const address = resolveTokenAddress("USDC", 1);
      expect(address).toBe("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
    });

    it("resolves USDT on mainnet", () => {
      const address = resolveTokenAddress("USDT", 1);
      expect(address).toBe("0xdAC17F958D2ee523a2206206994597C13D831ec7");
    });

    it("resolves DAI on mainnet", () => {
      const address = resolveTokenAddress("DAI", 1);
      expect(address).toBe("0x6B175474E89094C44Da98b954EedeAC495271d0F");
    });

    it("resolves WETH on mainnet", () => {
      const address = resolveTokenAddress("WETH", 1);
      expect(address).toBe("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
    });

    it("resolves LINK on mainnet", () => {
      const address = resolveTokenAddress("LINK", 1);
      expect(address).toBe("0x514910771AF9Ca656af840dff83E8264EcF986CA");
    });

    it("returns undefined for unknown token", () => {
      const address = resolveTokenAddress("UNKNOWN", 1);
      expect(address).toBeUndefined();
    });

    it("returns undefined for known token on unsupported chain", () => {
      const address = resolveTokenAddress("USDC", 999);
      expect(address).toBeUndefined();
    });

    it("is case-insensitive", () => {
      const address1 = resolveTokenAddress("usdc", 1);
      const address2 = resolveTokenAddress("USDC", 1);
      const address3 = resolveTokenAddress("Usdc", 1);
      expect(address1).toBe(address2);
      expect(address2).toBe(address3);
    });
  });

  describe("getTokenInfoByAddress", () => {
    it("gets USDC info by address on mainnet", () => {
      const info = getTokenInfoByAddress(
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        1,
      );
      expect(info).toBeDefined();
      expect(info?.symbol).toBe("USDC");
      expect(info?.decimals).toBe(6);
    });

    it("returns undefined for unknown address", () => {
      const info = getTokenInfoByAddress(
        "0x0000000000000000000000000000000000000000",
        1,
      );
      expect(info).toBeUndefined();
    });

    it("returns undefined for known address on wrong chain", () => {
      const info = getTokenInfoByAddress(
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        999,
      );
      expect(info).toBeUndefined();
    });

    it("is case-insensitive for addresses", () => {
      const info1 = getTokenInfoByAddress(
        "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        1,
      );
      const info2 = getTokenInfoByAddress(
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        1,
      );
      expect(info1).toEqual(info2);
    });
  });

  describe("getTokenInfoBySymbol", () => {
    it("gets USDC info by symbol on mainnet", () => {
      const info = getTokenInfoBySymbol("USDC", 1);
      expect(info).toBeDefined();
      expect(info?.addresses[1]).toBe(
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      );
      expect(info?.decimals).toBe(6);
    });

    it("returns undefined for unknown symbol", () => {
      const info = getTokenInfoBySymbol("UNKNOWN", 1);
      expect(info).toBeUndefined();
    });

    it("returns undefined for known symbol on unsupported chain", () => {
      const info = getTokenInfoBySymbol("USDC", 999);
      expect(info).toBeUndefined();
    });

    it("is case-insensitive", () => {
      const info1 = getTokenInfoBySymbol("usdc", 1);
      const info2 = getTokenInfoBySymbol("USDC", 1);
      expect(info1).toEqual(info2);
    });
  });

  describe("parseTokenAmount edge cases", () => {
    it("handles scientific notation", () => {
      const parsed = parseTokenAmount("1e18", 18);
      expect(parsed).toBe(1000000000000000000000000000000000000n); // 1e18 = 1 followed by 18 zeros, then padded with 18 more decimals
    });

    it("handles negative exponents in scientific notation", () => {
      const parsed = parseTokenAmount("1e-18", 18);
      expect(parsed).toBe(1n);
    });

    it("throws error for negative amounts", () => {
      expect(() => parseTokenAmount("-100", 18)).toThrow();
    });

    it("handles leading zeros", () => {
      const parsed = parseTokenAmount("0001.5", 18);
      expect(parsed).toBe(1500000000000000000n);
    });

    it("handles trailing zeros", () => {
      const parsed = parseTokenAmount("1.5000", 18);
      expect(parsed).toBe(1500000000000000000n);
    });
  });
});
