import { describe, expect, it } from "bun:test";
import {
	addressExists,
	isValidAddress,
	isValidChainId,
	isValidHex,
	isValidPrivateKey,
	isValidTransactionValue,
} from "../../src/core/validators";

describe("validators", () => {
	describe("isValidAddress", () => {
		it("validates correct Ethereum addresses", () => {
			expect(isValidAddress("0x742d35Cc6634C0532925a3b844Bc9e7595f6E123")).toBe(
				true,
			);
			expect(isValidAddress("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")).toBe(
				true,
			);
		});

		it("rejects invalid addresses", () => {
			expect(isValidAddress("")).toBe(false);
			expect(isValidAddress("0x")).toBe(false);
			expect(isValidAddress("0x123")).toBe(false);
			expect(isValidAddress("not-an-address")).toBe(false);
			expect(
				isValidAddress("0xGGGGd35Cc6634C0532925a3b844Bc9e7595f6E123"),
			).toBe(false);
		});
	});

	describe("isValidHex", () => {
		it("validates hex strings", () => {
			expect(isValidHex("0x")).toBe(true);
			expect(isValidHex("0x123abc")).toBe(true);
			expect(isValidHex("0xDEADBEEF")).toBe(true);
		});

		it("rejects invalid hex strings", () => {
			expect(isValidHex("")).toBe(false);
			expect(isValidHex("123")).toBe(false);
			expect(isValidHex("0xGHIJKL")).toBe(false);
		});
	});

	describe("isValidPrivateKey", () => {
		it("validates private keys", () => {
			expect(
				isValidPrivateKey(
					"0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
				),
			).toBe(true);
		});

		it("rejects invalid private keys", () => {
			expect(isValidPrivateKey("")).toBe(false);
			expect(isValidPrivateKey("0x")).toBe(false);
			expect(isValidPrivateKey("0x123")).toBe(false);
			expect(isValidPrivateKey("not-a-key")).toBe(false);
			// Wrong length
			expect(isValidPrivateKey("0xac0974bec39a17e36ba4a6b4d238ff944")).toBe(
				false,
			);
		});
	});

	describe("isValidChainId", () => {
		it("validates chain IDs", () => {
			expect(isValidChainId(1)).toBe(true);
			expect(isValidChainId(137)).toBe(true);
			expect(isValidChainId(31337)).toBe(true);
		});

		it("rejects invalid chain IDs", () => {
			expect(isValidChainId(0)).toBe(false);
			expect(isValidChainId(-1)).toBe(false);
			expect(isValidChainId(1.5)).toBe(false);
			expect(isValidChainId(Number.NaN)).toBe(false);
		});
	});

	describe("addressExists", () => {
		const addresses = [
			"0x742d35Cc6634C0532925a3b844Bc9e7595f6E123",
			"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
		] as const;

		it("finds addresses case-insensitively", () => {
			expect(
				addressExists("0x742d35Cc6634C0532925a3b844Bc9e7595f6E123", addresses),
			).toBe(true);
			expect(
				addressExists("0x742D35CC6634C0532925A3B844BC9E7595F6E123", addresses),
			).toBe(true);
			expect(
				addressExists("0x742d35cc6634c0532925a3b844bc9e7595f6e123", addresses),
			).toBe(true);
		});

		it("returns false for non-existent addresses", () => {
			expect(
				addressExists("0x0000000000000000000000000000000000000000", addresses),
			).toBe(false);
		});
	});

	describe("isValidTransactionValue", () => {
		it("validates transaction values", () => {
			expect(isValidTransactionValue("0")).toBe(true);
			expect(isValidTransactionValue("1000000000000000000")).toBe(true);
			expect(isValidTransactionValue("123456789")).toBe(true);
		});

		it("rejects invalid values", () => {
			expect(isValidTransactionValue("")).toBe(false);
			expect(isValidTransactionValue("-1")).toBe(false);
			expect(isValidTransactionValue("1.5")).toBe(false);
			expect(isValidTransactionValue("abc")).toBe(false);
			expect(isValidTransactionValue("1e18")).toBe(false);
		});
	});
});
