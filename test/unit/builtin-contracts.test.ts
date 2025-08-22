import { describe, expect, it } from "bun:test"
import {
  BUILTIN_CONTRACTS,
  ERC20_ABI,
  ERC721_ABI,
  getStandardName,
  isBuiltinContract,
} from "../../src/core/builtin-contracts.js"

describe("builtin-contracts.ts", () => {
  describe("isBuiltinContract", () => {
    it("should return true for builtin contract names", () => {
      expect(isBuiltinContract("builtin:ERC20")).toBe(true)
      expect(isBuiltinContract("builtin:ERC721")).toBe(true)
      expect(isBuiltinContract("builtin:CustomContract")).toBe(true)
    })

    it("should return false for non-builtin contract names", () => {
      expect(isBuiltinContract("ERC20")).toBe(false)
      expect(isBuiltinContract("MyContract")).toBe(false)
      expect(isBuiltinContract("builtin")).toBe(false)
      expect(isBuiltinContract("")).toBe(false)
    })
  })

  describe("getStandardName", () => {
    it("should extract standard name from builtin contract name", () => {
      expect(getStandardName("builtin:ERC20")).toBe("ERC20")
      expect(getStandardName("builtin:ERC721")).toBe("ERC721")
      expect(getStandardName("builtin:CustomContract")).toBe("CustomContract")
    })

    it("should handle edge cases", () => {
      expect(getStandardName("builtin:")).toBe("")
      expect(getStandardName("builtin:ERC20:Extended")).toBe("ERC20:Extended")
    })
  })

  describe("BUILTIN_CONTRACTS", () => {
    it("should contain ERC20 and ERC721 contracts", () => {
      expect(BUILTIN_CONTRACTS).toHaveLength(2)

      const erc20Contract = BUILTIN_CONTRACTS.find((c) => c.name === "builtin:ERC20")
      expect(erc20Contract).toBeDefined()
      expect(erc20Contract?.abi).toBe(ERC20_ABI)

      const erc721Contract = BUILTIN_CONTRACTS.find((c) => c.name === "builtin:ERC721")
      expect(erc721Contract).toBeDefined()
      expect(erc721Contract?.abi).toBe(ERC721_ABI)
    })
  })

  describe("ABI constants", () => {
    it("should have valid ERC20 ABI", () => {
      expect(Array.isArray(ERC20_ABI)).toBe(true)
      expect(ERC20_ABI.length).toBeGreaterThan(0)

      // Check for key ERC20 functions
      const functionNames = ERC20_ABI.filter((item) => item.type === "function").map(
        (item) => item.name,
      )

      expect(functionNames).toContain("transfer")
      expect(functionNames).toContain("balanceOf")
      expect(functionNames).toContain("approve")
    })

    it("should have valid ERC721 ABI", () => {
      expect(Array.isArray(ERC721_ABI)).toBe(true)
      expect(ERC721_ABI.length).toBeGreaterThan(0)

      // Check for key ERC721 functions
      const functionNames = ERC721_ABI.filter((item) => item.type === "function").map(
        (item) => item.name,
      )

      expect(functionNames).toContain("transferFrom")
      expect(functionNames).toContain("ownerOf")
      expect(functionNames).toContain("approve")
    })
  })
})
