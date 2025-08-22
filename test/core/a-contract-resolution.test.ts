import { describe, expect, it } from "bun:test"
import type { Address } from "viem"
import type { ContractAdapter } from "../../src/adapters/contract-adapter.js"
import { ERC20_ABI, ERC721_ABI } from "../../src/core/builtin-contracts.js"
import {
  INTERFACE_IDS,
  resolveContract,
  supportsInterface,
} from "../../src/core/contract-resolution.js"

describe("Contract Resolution", () => {
  // Factory function to create mock adapter
  const createMockContractAdapter = (): ContractAdapter => {
    return {
      loadFromFile: async () => {},
      getContract: (name: string, chainId: number) => {
        if (name === "MyToken" && chainId === 1) {
          return {
            name: "MyToken",
            address: "0x1234567890123456789012345678901234567890" as Address,
            abi: ERC20_ABI,
          }
        }
        return undefined
      },
      getAbi: (name: string) => {
        if (name === "builtin:ERC20") return ERC20_ABI
        if (name === "builtin:ERC721") return ERC721_ABI
        if (name === "MyToken") return ERC20_ABI
        return undefined
      },
      listContracts: () => [],
      registerContract: () => {},
      clear: () => {},
    }
  }

  describe("resolveContract", () => {
    it("resolves user Wagmi contract by name", () => {
      const mockContractAdapter = createMockContractAdapter()
      const result = resolveContract("MyToken", undefined, 1, mockContractAdapter)

      expect(result.name).toBe("MyToken")
      expect(result.address).toBe("0x1234567890123456789012345678901234567890")
      expect(result.abi).toBe(ERC20_ABI)
      expect(result.isBuiltin).toBe(false)
    })

    it("resolves well-known token symbols", () => {
      const mockContractAdapter = createMockContractAdapter()
      const result = resolveContract(
        "USDC",
        undefined,
        1, // mainnet
        mockContractAdapter,
      )

      expect(result.name).toBe("USDC")
      expect(result.address).toBe("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48")
      expect(result.abi).toBe(ERC20_ABI)
      expect(result.isBuiltin).toBe(true)
    })

    it("resolves address with explicit contract name", () => {
      const mockContractAdapter = createMockContractAdapter()
      const address = "0x9999999999999999999999999999999999999999" as Address
      const result = resolveContract("MyToken", address, 1, mockContractAdapter)

      expect(result.name).toBe("MyToken")
      expect(result.address).toBe(address)
      expect(result.abi).toBe(ERC20_ABI)
      expect(result.isBuiltin).toBe(false)
    })

    it("resolves address without ABI to default builtin", () => {
      const mockContractAdapter = createMockContractAdapter()
      const address = "0x9999999999999999999999999999999999999999" as Address
      const result = resolveContract("UnknownContract", address, 1, mockContractAdapter)

      expect(result.name).toBe("builtin:ERC20")
      expect(result.address).toBe(address)
      expect(result.abi).toBe(ERC20_ABI)
      expect(result.isBuiltin).toBe(true)
    })

    it("resolves raw address to default builtin", () => {
      const mockContractAdapter = createMockContractAdapter()
      const address = "0x9999999999999999999999999999999999999999" as Address
      const result = resolveContract(address, undefined, 1, mockContractAdapter)

      expect(result.name).toBe("builtin:ERC20")
      expect(result.address).toBe(address)
      expect(result.abi).toBe(ERC20_ABI)
      expect(result.isBuiltin).toBe(true)
    })

    it("resolves raw address to ERC721 when specified", () => {
      const mockContractAdapter = createMockContractAdapter()
      const address = "0x9999999999999999999999999999999999999999" as Address
      const result = resolveContract(address, undefined, 1, mockContractAdapter, "builtin:ERC721")

      expect(result.name).toBe("builtin:ERC721")
      expect(result.address).toBe(address)
      expect(result.abi).toBe(ERC721_ABI)
      expect(result.isBuiltin).toBe(true)
    })

    it("throws error for builtin contract without address", () => {
      const mockContractAdapter = createMockContractAdapter()
      expect(() => resolveContract("builtin:ERC20", undefined, 1, mockContractAdapter)).toThrow(
        "Built-in contract builtin:ERC20 requires an address parameter",
      )
    })

    it("throws error for unknown contract without address", () => {
      const mockContractAdapter = createMockContractAdapter()
      expect(() => resolveContract("UnknownContract", undefined, 1, mockContractAdapter)).toThrow(
        "Contract UnknownContract not found. Provide an address or load the contract first.",
      )
    })
  })

  describe("supportsInterface", () => {
    it("detects ERC-165 support in ABI", () => {
      const abiWithSupportsInterface = [
        {
          type: "function" as const,
          name: "supportsInterface",
          inputs: [{ name: "interfaceId", type: "bytes4" }],
          outputs: [{ name: "", type: "bool" }],
          stateMutability: "view" as const,
        },
      ]

      expect(supportsInterface(abiWithSupportsInterface)).toBe(true)
    })

    it("returns false for ABI without supportsInterface", () => {
      const abiWithoutSupportsInterface = [
        {
          type: "function" as const,
          name: "transfer",
          inputs: [
            { name: "to", type: "address" },
            { name: "amount", type: "uint256" },
          ],
          outputs: [{ name: "", type: "bool" }],
          stateMutability: "nonpayable" as const,
        },
      ]

      expect(supportsInterface(abiWithoutSupportsInterface)).toBe(false)
    })

    it("returns false for undefined ABI", () => {
      expect(supportsInterface(undefined as unknown as never[])).toBe(false)
    })
  })

  describe("INTERFACE_IDS", () => {
    it("contains correct interface IDs", () => {
      expect(INTERFACE_IDS.ERC165).toBe("0x01ffc9a7")
      expect(INTERFACE_IDS.ERC20).toBe("0x36372b07")
      expect(INTERFACE_IDS.ERC721).toBe("0x80ac58cd")
      expect(INTERFACE_IDS.ERC721Metadata).toBe("0x5b5e139f")
      expect(INTERFACE_IDS.ERC1155).toBe("0xd9b67a26")
    })
  })
})
