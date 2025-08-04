import { describe, expect, it } from "bun:test";
import {
  buildCustomChain,
  buildErrorResponse,
  buildToolResponse,
  buildTransactionParams,
} from "../../src/core/builders";

describe("builders", () => {
  describe("buildCustomChain", () => {
    it("builds a custom chain with all parameters", () => {
      const chain = buildCustomChain({
        id: 12345,
        name: "Test Chain",
        rpcUrl: "https://rpc.test.com",
        nativeCurrency: {
          name: "Test Token",
          symbol: "TEST",
          decimals: 18,
        },
        blockExplorerUrl: "https://explorer.test.com",
      });

      expect(chain.id).toBe(12345);
      expect(chain.name).toBe("Test Chain");
      expect(chain.nativeCurrency).toEqual({
        name: "Test Token",
        symbol: "TEST",
        decimals: 18,
      });
      expect(chain.rpcUrls.default.http[0]).toBe("https://rpc.test.com");
      expect(chain.blockExplorers?.default?.url).toBe(
        "https://explorer.test.com",
      );
    });

    it("builds a chain without block explorer", () => {
      const chain = buildCustomChain({
        id: 67890,
        name: "Minimal Chain",
        rpcUrl: "https://rpc.minimal.com",
        nativeCurrency: {
          name: "MIN",
          symbol: "MIN",
          decimals: 6,
        },
      });

      expect(chain.blockExplorers).toBeUndefined();
    });
  });

  describe("buildTransactionParams", () => {
    it("builds transaction params with value only", () => {
      const params = buildTransactionParams({
        to: "0x742d35Cc6634C0532925a3b844Bc9e7595f6E123",
        value: 1000000000000000000n,
      });

      expect(params.to).toBe("0x742d35Cc6634C0532925a3b844Bc9e7595f6E123");
      expect(params.value).toBe(1000000000000000000n);
      expect(params.data).toBeUndefined();
    });

    it("builds transaction params with data", () => {
      const params = buildTransactionParams({
        to: "0x742d35Cc6634C0532925a3b844Bc9e7595f6E123",
        value: 0n,
        data: "0xdeadbeef",
      });

      expect(params.data).toBe("0xdeadbeef");
    });
  });

  describe("buildErrorResponse", () => {
    it("builds error response", () => {
      const response = buildErrorResponse(400, "Invalid request");
      expect(response).toEqual({
        code: 400,
        message: "Invalid request",
        data: null,
      });
    });
  });

  describe("buildToolResponse", () => {
    it("builds tool response", () => {
      const response = buildToolResponse("Operation successful");
      expect(response).toEqual({
        content: [
          {
            type: "text",
            text: "Operation successful",
          },
        ],
      });
    });
  });
});
