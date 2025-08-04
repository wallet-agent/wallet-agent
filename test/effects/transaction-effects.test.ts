import { beforeEach, describe, expect, it, mock, spyOn } from "bun:test";
import type { PublicClient } from "viem";
import { createPublicClient, http, parseEther } from "viem";
import { anvil, mainnet } from "viem/chains";
import type { ContractAdapter } from "../../src/adapters/contract-adapter.js";
import type { ChainAdapter } from "../../src/adapters/wallet-adapter.js";
import * as contractResolution from "../../src/core/contract-resolution.js";
import { TransactionEffects } from "../../src/effects/transaction-effects.js";
import type { WalletEffects } from "../../src/effects/wallet-effects.js";

describe("TransactionEffects", () => {
  let transactionEffects: TransactionEffects;
  let mockWalletEffects: WalletEffects;
  let mockChainAdapter: ChainAdapter;
  let mockContractAdapter: ContractAdapter;

  // Mock the viem module's createPublicClient
  const mockEstimateGas = mock(() => Promise.resolve(21000n));
  const mockGetGasPrice = mock(() => Promise.resolve(20000000000n));
  const mockGetTransaction = mock(() => Promise.resolve(null));
  const mockGetTransactionReceipt = mock(() => Promise.resolve(null));
  const mockGetEnsAddress = mock(() => Promise.resolve(null));
  const mockSimulateContract = mock(() => Promise.resolve({ result: "0x123" }));

  beforeEach(() => {
    // Reset mocks
    mockEstimateGas.mockClear();
    mockGetGasPrice.mockClear();
    mockGetTransaction.mockClear();
    mockGetTransactionReceipt.mockClear();
    mockGetEnsAddress.mockClear();
    mockSimulateContract.mockClear();

    // Mock createPublicClient to return our mocked client
    const createPublicClientSpy = spyOn(
      TransactionEffects.prototype as any,
      "createPublicClient",
    );
    createPublicClientSpy.mockReturnValue({
      estimateGas: mockEstimateGas,
      getGasPrice: mockGetGasPrice,
      getTransaction: mockGetTransaction,
      getTransactionReceipt: mockGetTransactionReceipt,
      getEnsAddress: mockGetEnsAddress,
      simulateContract: mockSimulateContract,
    });

    // Mock wallet effects
    mockWalletEffects = {
      getAddress: mock(() => "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"),
      getChainId: mock(() => anvil.id),
    } as any;

    // Mock chain adapter
    mockChainAdapter = {
      getChain: mock((chainId: number) => {
        if (chainId === anvil.id) return anvil;
        if (chainId === mainnet.id) return mainnet;
        return undefined;
      }),
    } as any;

    // Mock contract adapter
    mockContractAdapter = {
      getContract: mock(() => ({
        abi: [
          {
            type: "function",
            name: "transfer",
            inputs: [
              { name: "to", type: "address" },
              { name: "amount", type: "uint256" },
            ],
            outputs: [{ type: "bool" }],
          },
        ],
      })),
    } as any;

    transactionEffects = new TransactionEffects(
      mockWalletEffects,
      mockChainAdapter,
      mockContractAdapter,
    );
  });

  describe("estimateGas", () => {
    it("estimates gas for a simple transfer", async () => {
      const result = await transactionEffects.estimateGas(
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "1.0",
      );

      expect(result.gasEstimate).toBe(21000n);
      expect(result.gasPrice).toBe(20000000000n);
      expect(result.estimatedCost).toBe("0.00042");
      expect(result.estimatedCostWei).toBe(420000000000000n);

      expect(mockEstimateGas).toHaveBeenCalledWith({
        account: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        value: parseEther("1.0"),
        data: undefined,
        chain: anvil,
      });
    });

    it("estimates gas with data", async () => {
      const data = "0x123abc" as `0x${string}`;

      await transactionEffects.estimateGas(
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        undefined,
        data,
      );

      expect(mockEstimateGas).toHaveBeenCalledWith({
        account: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        value: undefined,
        data,
        chain: anvil,
      });
    });

    it("uses provided from address", async () => {
      const fromAddress = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";

      await transactionEffects.estimateGas(
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "0.5",
        undefined,
        fromAddress,
      );

      expect(mockEstimateGas).toHaveBeenCalledWith({
        account: fromAddress,
        to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        value: parseEther("0.5"),
        data: undefined,
        chain: anvil,
      });
    });

    it("throws error when no wallet connected and no from address", async () => {
      mockWalletEffects.getAddress = mock(() => undefined);

      await expect(
        transactionEffects.estimateGas(
          "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          "1.0",
        ),
      ).rejects.toThrow("No wallet connected and no from address provided");
    });

    it("throws error when chain not found", async () => {
      mockWalletEffects.getChainId = mock(() => 999);
      mockChainAdapter.getChain = mock(() => undefined);

      await expect(
        transactionEffects.estimateGas(
          "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          "1.0",
        ),
      ).rejects.toThrow("Chain with ID 999 not found");
    });
  });

  describe("getTransactionStatus", () => {
    it("returns not_found status when transaction doesn't exist", async () => {
      const hash = "0x123abc" as `0x${string}`;
      mockGetTransaction.mockResolvedValueOnce(null);

      const result = await transactionEffects.getTransactionStatus(hash);

      expect(result.status).toBe("not_found");
      expect(result.hash).toBe(hash);
      expect(result.from).toBeUndefined();
    });

    it("returns pending status for unmined transaction", async () => {
      const hash = "0x123abc" as `0x${string}`;
      mockGetTransaction.mockResolvedValueOnce({
        hash,
        from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        value: 1000000000000000000n, // 1 ETH
        blockNumber: null,
      } as any);

      const result = await transactionEffects.getTransactionStatus(hash);

      expect(result.status).toBe("pending");
      expect(result.hash).toBe(hash);
      expect(result.from).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
      expect(result.to).toBe("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
      expect(result.value).toBe("1");
      expect(result.blockNumber).toBeUndefined();
    });

    it("returns confirmed status for mined transaction", async () => {
      const hash = "0x123abc" as `0x${string}`;
      mockGetTransaction.mockResolvedValueOnce({
        hash,
        from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        value: 500000000000000000n, // 0.5 ETH
        blockNumber: 12345678n,
      } as any);

      const result = await transactionEffects.getTransactionStatus(hash);

      expect(result.status).toBe("confirmed");
      expect(result.hash).toBe(hash);
      expect(result.from).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
      expect(result.to).toBe("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
      expect(result.value).toBe("0.5");
      expect(result.blockNumber).toBe(12345678n);
    });

    it("handles zero value transactions", async () => {
      const hash = "0x123abc" as `0x${string}`;
      mockGetTransaction.mockResolvedValueOnce({
        hash,
        from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        value: 0n,
        blockNumber: 12345678n,
      } as any);

      const result = await transactionEffects.getTransactionStatus(hash);

      expect(result.value).toBe("0");
    });
  });

  describe("getTransactionReceipt", () => {
    it("returns null when receipt not found", async () => {
      const hash = "0x123abc" as `0x${string}`;
      mockGetTransactionReceipt.mockResolvedValueOnce(null);

      const result = await transactionEffects.getTransactionReceipt(hash);

      expect(result).toBeNull();
    });

    it("returns formatted receipt for successful transaction", async () => {
      const hash = "0x123abc" as `0x${string}`;
      mockGetTransactionReceipt.mockResolvedValueOnce({
        transactionHash: hash,
        status: "success",
        blockNumber: 12345678n,
        from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        contractAddress: null,
        gasUsed: 21000n,
        effectiveGasPrice: 20000000000n,
        logs: [{}, {}], // 2 logs
      } as any);

      const result = await transactionEffects.getTransactionReceipt(hash);

      expect(result).not.toBeNull();
      expect(result!.hash).toBe(hash);
      expect(result!.status).toBe("success");
      expect(result!.blockNumber).toBe(12345678n);
      expect(result!.gasUsed).toBe(21000n);
      expect(result!.effectiveGasPrice).toBe(20000000000n);
      expect(result!.totalCost).toBe("0.00042");
      expect(result!.from).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
      expect(result!.to).toBe("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
      expect(result!.contractAddress).toBeNull();
      expect(result!.logs).toBe(2);
      expect(result!.symbol).toBe("ETH"); // Anvil's native currency
    });

    it("returns formatted receipt for failed transaction", async () => {
      const hash = "0x123abc" as `0x${string}`;
      mockGetTransactionReceipt.mockResolvedValueOnce({
        transactionHash: hash,
        status: "reverted",
        blockNumber: 12345678n,
        from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        contractAddress: null,
        gasUsed: 50000n,
        effectiveGasPrice: 30000000000n,
        logs: [],
      } as any);

      const result = await transactionEffects.getTransactionReceipt(hash);

      expect(result!.status).toBe("failed");
      expect(result!.totalCost).toBe("0.0015");
      expect(result!.logs).toBe(0);
    });

    it("handles contract creation receipts", async () => {
      const hash = "0x123abc" as `0x${string}`;
      mockGetTransactionReceipt.mockResolvedValueOnce({
        transactionHash: hash,
        status: "success",
        blockNumber: 12345678n,
        from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        to: null,
        contractAddress: "0xcontractAddress",
        gasUsed: 1000000n,
        effectiveGasPrice: 20000000000n,
        logs: [{}, {}, {}, {}, {}], // 5 logs
      } as any);

      const result = await transactionEffects.getTransactionReceipt(hash);

      expect(result!.to).toBeNull();
      expect(result!.contractAddress).toBe("0xcontractAddress");
      expect(result!.logs).toBe(5);
    });
  });

  describe("resolveEnsName", () => {
    it("throws error when not on mainnet", async () => {
      await expect(
        transactionEffects.resolveEnsName("vitalik.eth"),
      ).rejects.toThrow("ENS resolution only works on Ethereum mainnet");
    });

    it("resolves ENS name on mainnet", async () => {
      mockWalletEffects.getChainId = mock(() => mainnet.id);
      mockGetEnsAddress.mockResolvedValueOnce(
        "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      );

      const result = await transactionEffects.resolveEnsName("vitalik.eth");

      expect(result).toBe("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
      expect(mockGetEnsAddress).toHaveBeenCalledWith({
        name: "vitalik.eth",
      });
    });

    it("returns null when ENS name not found", async () => {
      mockWalletEffects.getChainId = mock(() => mainnet.id);
      mockGetEnsAddress.mockResolvedValueOnce(null);

      const result = await transactionEffects.resolveEnsName("notfound.eth");

      expect(result).toBeNull();
    });

    it("throws error when mainnet not in chain list", async () => {
      mockWalletEffects.getChainId = mock(() => mainnet.id);
      mockChainAdapter.getChain = mock(() => undefined);

      await expect(
        transactionEffects.resolveEnsName("vitalik.eth"),
      ).rejects.toThrow("Ethereum mainnet not found in chain list");
    });
  });

  describe("simulateTransaction", () => {
    beforeEach(() => {
      // Mock resolveContract to return a valid contract
      const resolveContractSpy = spyOn(contractResolution, "resolveContract");
      resolveContractSpy.mockReturnValue({
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        abi: [
          {
            type: "function",
            name: "transfer",
            inputs: [
              { name: "to", type: "address" },
              { name: "amount", type: "uint256" },
            ],
            outputs: [{ type: "bool" }],
          },
        ],
        isBuiltin: true,
        name: "builtin:ERC20",
      });
    });

    it("simulates successful transaction", async () => {
      const result = await transactionEffects.simulateTransaction(
        "builtin:ERC20",
        "transfer",
        ["0x70997970C51812dc3A010C7d01b50e0d17dc79C8", 1000000000000000000n],
        undefined,
        undefined,
      );

      expect(result.success).toBe(true);
      expect(result.result).toBe("0x123");
      expect(result.willRevert).toBe(false);
      expect(result.error).toBeUndefined();
    });

    it("handles simulation with value", async () => {
      await transactionEffects.simulateTransaction(
        "builtin:ERC20",
        "transfer",
        ["0x70997970C51812dc3A010C7d01b50e0d17dc79C8", 1000000000000000000n],
        "0.1",
        undefined,
      );

      expect(mockSimulateContract).toHaveBeenCalledWith({
        address: expect.any(String),
        abi: expect.any(Array),
        functionName: "transfer",
        args: [
          "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          1000000000000000000n,
        ],
        account: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        value: parseEther("0.1"),
      });
    });

    it("uses provided address", async () => {
      const customAddress = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";

      await transactionEffects.simulateTransaction(
        "builtin:ERC20",
        "transfer",
        [],
        undefined,
        customAddress,
      );

      expect(mockSimulateContract).toHaveBeenCalledWith({
        address: expect.any(String),
        abi: expect.any(Array),
        functionName: "transfer",
        args: [],
        account: customAddress,
        value: undefined,
      });
    });

    it("throws error when no wallet connected", async () => {
      mockWalletEffects.getAddress = mock(() => undefined);

      await expect(
        transactionEffects.simulateTransaction("builtin:ERC20", "transfer", []),
      ).rejects.toThrow("No wallet connected");
    });

    it("handles revert errors", async () => {
      mockSimulateContract.mockRejectedValueOnce(
        new Error("execution reverted: Insufficient balance"),
      );

      const result = await transactionEffects.simulateTransaction(
        "builtin:ERC20",
        "transfer",
        ["0x70997970C51812dc3A010C7d01b50e0d17dc79C8", 1000000000000000000n],
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("execution reverted: Insufficient balance");
      expect(result.willRevert).toBe(true);
      expect(result.result).toBeUndefined();
    });

    it("handles non-revert errors", async () => {
      mockSimulateContract.mockRejectedValueOnce(new Error("Network error"));

      const result = await transactionEffects.simulateTransaction(
        "builtin:ERC20",
        "transfer",
        [],
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network error");
      expect(result.willRevert).toBe(false);
    });

    it("throws error when function not found in ABI", async () => {
      // Override the mock to return an ABI without the transfer function
      const resolveContractSpy = spyOn(contractResolution, "resolveContract");
      resolveContractSpy.mockReturnValue({
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        abi: [
          {
            type: "function",
            name: "approve",
            inputs: [],
            outputs: [],
          },
        ],
        isBuiltin: true,
        name: "builtin:ERC20",
      });

      const result = await transactionEffects.simulateTransaction(
        "builtin:ERC20",
        "transfer", // This function is not in the mocked ABI
        [],
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain(
        "Function transfer not found in contract ABI",
      );
    });
  });
});
