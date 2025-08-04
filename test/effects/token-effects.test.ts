import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { Address, Hex } from "viem";
import type { ContractAdapter } from "../../src/adapters/contract-adapter";
import type {
  ContractReadParams,
  ContractWriteParams,
} from "../../src/contract-operations";
import { ERC20_ABI, ERC721_ABI } from "../../src/core/builtin-contracts";
import { TokenEffects } from "../../src/effects/token-effects";
import type { WalletEffects } from "../../src/effects/wallet-effects";

describe("TokenEffects", () => {
  let tokenEffects: TokenEffects;
  let mockContractAdapter: ContractAdapter;
  let mockWalletEffects: WalletEffects;
  let mockReadContract: (params: ContractReadParams) => Promise<unknown>;
  let mockWriteContract: (params: ContractWriteParams) => Promise<Hex>;
  let mockGetCurrentAccount: () => { address: Address } | undefined;

  const testAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as Address;
  const testAccount = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" as Address;

  beforeEach(() => {
    // Reset all mocks to ensure clean state
    mock.restore();

    // Mock contract adapter
    mockContractAdapter = {
      loadFromFile: mock(async () => {}),
      getContract: mock((name: string, chainId: number) => {
        if (name === "MyToken" && chainId === 1) {
          return {
            name: "MyToken",
            address: testAddress,
            abi: ERC20_ABI,
          };
        }
        if (name === "MyNFT" && chainId === 1) {
          return {
            name: "MyNFT",
            address: testAddress,
            abi: ERC721_ABI,
          };
        }
        return undefined;
      }),
      getAbi: mock((name: string) => {
        if (name === "builtin:ERC20") return ERC20_ABI;
        if (name === "builtin:ERC721") return ERC721_ABI;
        if (name === "MyToken") return ERC20_ABI;
        if (name === "MyNFT") return ERC721_ABI;
        return undefined;
      }),
      listContracts: mock(() => []),
      registerContract: mock(() => {}),
      clear: mock(() => {}),
    };

    // Mock wallet effects
    mockWalletEffects = {
      getCurrentChainId: mock(() => 1),
    } as unknown as WalletEffects;

    // Mock read contract
    mockReadContract = mock(async (params: ContractReadParams) => {
      if (params.function === "decimals") return 6;
      if (params.function === "symbol") return "USDC";
      if (params.function === "name") return "USD Coin";
      if (params.function === "balanceOf") return 1000000000n; // 1000 USDC
      if (params.function === "ownerOf") return testAccount;
      if (params.function === "tokenURI") return "https://example.com/token/1";
      return undefined;
    });

    // Mock write contract
    mockWriteContract = mock(
      async () =>
        "0x1234567890123456789012345678901234567890123456789012345678901234" as Hex,
    );

    // Mock get current account
    mockGetCurrentAccount = mock(() => ({ address: testAccount }));

    // Create token effects instance
    tokenEffects = new TokenEffects(
      mockContractAdapter,
      mockWalletEffects,
      mockReadContract,
      mockWriteContract,
      mockGetCurrentAccount,
    );
  });

  describe("ERC-20 Operations", () => {
    describe("transferToken", () => {
      it("transfers tokens successfully", async () => {
        const params = {
          token: "USDC",
          to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" as Address,
          amount: "100.5",
        };

        const hash = await tokenEffects.transferToken(params);

        expect(hash).toBe(
          "0x1234567890123456789012345678901234567890123456789012345678901234",
        );
        expect(mockReadContract).toHaveBeenCalledWith({
          contract: "builtin:ERC20",
          address: testAddress,
          function: "decimals",
        });
        expect(mockWriteContract).toHaveBeenCalledWith({
          contract: "builtin:ERC20",
          address: testAddress,
          function: "transfer",
          args: [params.to, 100500000n], // 100.5 * 10^6
        });
      });

      it("resolves custom contract name", async () => {
        const params = {
          token: "MyToken",
          to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" as Address,
          amount: "50",
        };

        await tokenEffects.transferToken(params);

        expect(mockWriteContract).toHaveBeenCalledWith({
          contract: "MyToken",
          address: testAddress,
          function: "transfer",
          args: [params.to, 50000000n],
        });
      });
    });

    describe("approveToken", () => {
      it("approves token spending", async () => {
        const params = {
          token: "USDC",
          spender: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" as Address,
          amount: "1000",
        };

        const hash = await tokenEffects.approveToken(params);

        expect(hash).toBe(
          "0x1234567890123456789012345678901234567890123456789012345678901234",
        );
        expect(mockWriteContract).toHaveBeenCalledWith({
          contract: "builtin:ERC20",
          address: testAddress,
          function: "approve",
          args: [params.spender, 1000000000n], // 1000 * 10^6
        });
      });

      it("approves max amount", async () => {
        const params = {
          token: "USDC",
          spender: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" as Address,
          amount: "max",
        };

        await tokenEffects.approveToken(params);

        expect(mockWriteContract).toHaveBeenCalledWith({
          contract: "builtin:ERC20",
          address: testAddress,
          function: "approve",
          args: [params.spender, 2n ** 256n - 1n], // Max uint256
        });
      });

      it("handles MAX case-insensitive", async () => {
        const params = {
          token: "USDC",
          spender: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" as Address,
          amount: "MAX",
        };

        await tokenEffects.approveToken(params);

        expect(mockWriteContract).toHaveBeenCalledWith({
          contract: "builtin:ERC20",
          address: testAddress,
          function: "approve",
          args: [params.spender, 2n ** 256n - 1n],
        });
      });
    });

    describe("getTokenBalance", () => {
      it("gets token balance for current account", async () => {
        const result = await tokenEffects.getTokenBalance({
          token: "USDC",
        });

        expect(result.balance).toBe("1000");
        expect(result.balanceRaw).toBe(1000000000n);
        expect(result.symbol).toBe("USDC");
        expect(result.decimals).toBe(6);
      });

      it("gets token balance for specific address", async () => {
        const specificAddress =
          "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" as Address;
        await tokenEffects.getTokenBalance({
          token: "USDC",
          address: specificAddress,
        });

        expect(mockReadContract).toHaveBeenCalledWith({
          contract: "builtin:ERC20",
          address: testAddress,
          function: "balanceOf",
          args: [specificAddress],
        });
      });

      it("throws error when no address and no wallet connected", async () => {
        mockGetCurrentAccount = mock(() => undefined);
        tokenEffects = new TokenEffects(
          mockContractAdapter,
          mockWalletEffects,
          mockReadContract,
          mockWriteContract,
          mockGetCurrentAccount,
        );

        expect(tokenEffects.getTokenBalance({ token: "USDC" })).rejects.toThrow(
          "No address provided and no wallet connected",
        );
      });
    });

    describe("getTokenInfo", () => {
      it("gets token information", async () => {
        const info = await tokenEffects.getTokenInfo("USDC");

        expect(info.name).toBe("USD Coin");
        expect(info.symbol).toBe("USDC");
        expect(info.decimals).toBe(6);
        expect(info.address).toBe(testAddress);
        expect(info.isWellKnown).toBe(true);
      });

      it("identifies non-well-known tokens", async () => {
        // Mock a different address that's not in the registry
        const customAddress =
          "0x1234567890123456789012345678901234567890" as Address;
        mockContractAdapter.getContract = mock(() => ({
          name: "MyCustomToken",
          address: customAddress,
          abi: ERC20_ABI,
        }));

        const info = await tokenEffects.getTokenInfo("MyCustomToken");

        expect(info.isWellKnown).toBe(false);
      });
    });
  });

  describe("ERC-721 Operations", () => {
    describe("transferNFT", () => {
      it("transfers NFT successfully", async () => {
        const params = {
          nft: "MyNFT",
          to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" as Address,
          tokenId: "123",
        };

        const hash = await tokenEffects.transferNFT(params);

        expect(hash).toBe(
          "0x1234567890123456789012345678901234567890123456789012345678901234",
        );
        expect(mockWriteContract).toHaveBeenCalledWith({
          contract: "MyNFT",
          address: testAddress,
          function: "safeTransferFrom",
          args: [testAccount, params.to, 123n],
        });
      });

      it("throws error when wallet not connected", async () => {
        // Create token effects with no connected account
        const disconnectedTokenEffects = new TokenEffects(
          mockContractAdapter,
          mockWalletEffects,
          mockReadContract,
          mockWriteContract,
          () => undefined, // No account connected
        );

        const params = {
          nft: "MyNFT",
          to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" as Address,
          tokenId: "123",
        };

        expect(disconnectedTokenEffects.transferNFT(params)).rejects.toThrow(
          "No wallet connected",
        );
      });
    });

    describe("getNFTOwner", () => {
      it("gets NFT owner", async () => {
        const params = {
          nft: "MyNFT",
          tokenId: "123",
        };

        const owner = await tokenEffects.getNFTOwner(params);

        expect(owner).toBe(testAccount);
        expect(mockReadContract).toHaveBeenCalledWith({
          contract: "MyNFT",
          address: testAddress,
          function: "ownerOf",
          args: [123n],
        });
      });
    });

    describe("getNFTInfo", () => {
      it("gets NFT info without token ID", async () => {
        const info = await tokenEffects.getNFTInfo({
          nft: "MyNFT",
        });

        expect(info.name).toBe("USD Coin"); // Mock returns this
        expect(info.symbol).toBe("USDC"); // Mock returns this
        expect(info.tokenURI).toBeUndefined();
      });

      it("gets NFT info with token ID", async () => {
        const info = await tokenEffects.getNFTInfo({
          nft: "MyNFT",
          tokenId: "123",
        });

        expect(info.name).toBe("USD Coin");
        expect(info.symbol).toBe("USDC");
        expect(info.tokenURI).toBe("https://example.com/token/1");
        expect(mockReadContract).toHaveBeenCalledWith({
          contract: "MyNFT",
          address: testAddress,
          function: "tokenURI",
          args: [123n],
        });
      });
    });
  });

  describe("Contract Resolution", () => {
    it("uses builtin contracts for well-known tokens", async () => {
      await tokenEffects.transferToken({
        token: "USDC",
        to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" as Address,
        amount: "10",
      });

      expect(mockWriteContract).toHaveBeenCalledWith(
        expect.objectContaining({
          contract: "builtin:ERC20",
          address: testAddress,
        }),
      );
    });

    it("uses user contracts when available", async () => {
      await tokenEffects.transferToken({
        token: "MyToken",
        to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" as Address,
        amount: "10",
      });

      expect(mockWriteContract).toHaveBeenCalledWith(
        expect.objectContaining({
          contract: "MyToken",
          address: testAddress,
        }),
      );
    });

    it("handles raw addresses", async () => {
      const randomAddress =
        "0x1111111111111111111111111111111111111111" as Address;
      await tokenEffects.getTokenBalance({
        token: randomAddress,
      });

      expect(mockReadContract).toHaveBeenCalledWith(
        expect.objectContaining({
          contract: "builtin:ERC20",
          address: randomAddress,
        }),
      );
    });
  });
});
