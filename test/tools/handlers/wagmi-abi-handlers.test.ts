import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test"
import { existsSync } from "node:fs"
import { readFile, rm } from "node:fs/promises"
import { join } from "node:path"
import type { Abi, Address } from "viem"
import * as contractOps from "../../../src/contract-operations.js"
import * as contractResolution from "../../../src/core/contract-resolution.js"
import {
  AnalyzeWagmiContractHandler,
  ExportWagmiAbiHandler,
  ExtractWagmiAbiHandler,
  ListWagmiEventsHandler,
  ListWagmiFunctionsHandler,
} from "../../../src/tools/handlers/wagmi-abi-handlers.js"

// Mock ERC20 ABI for testing
const mockERC20Abi: Abi = [
  {
    type: "function",
    name: "name",
    inputs: [],
    outputs: [{ type: "string", name: "" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "symbol",
    inputs: [],
    outputs: [{ type: "string", name: "" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "decimals",
    inputs: [],
    outputs: [{ type: "uint8", name: "" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalSupply",
    inputs: [],
    outputs: [{ type: "uint256", name: "" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ type: "address", name: "account" }],
    outputs: [{ type: "uint256", name: "" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "transfer",
    inputs: [
      { type: "address", name: "to" },
      { type: "uint256", name: "amount" },
    ],
    outputs: [{ type: "bool", name: "" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transferFrom",
    inputs: [
      { type: "address", name: "from" },
      { type: "address", name: "to" },
      { type: "uint256", name: "amount" },
    ],
    outputs: [{ type: "bool", name: "" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "approve",
    inputs: [
      { type: "address", name: "spender" },
      { type: "uint256", name: "amount" },
    ],
    outputs: [{ type: "bool", name: "" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "allowance",
    inputs: [
      { type: "address", name: "owner" },
      { type: "address", name: "spender" },
    ],
    outputs: [{ type: "uint256", name: "" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { type: "address", name: "from", indexed: true },
      { type: "address", name: "to", indexed: true },
      { type: "uint256", name: "value", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Approval",
    inputs: [
      { type: "address", name: "owner", indexed: true },
      { type: "address", name: "spender", indexed: true },
      { type: "uint256", name: "value", indexed: false },
    ],
  },
  {
    type: "error",
    name: "InsufficientBalance",
    inputs: [
      { type: "uint256", name: "requested" },
      { type: "uint256", name: "available" },
    ],
  },
] as const

// Mock Storage contract ABI for testing
const mockStorageAbi: Abi = [
  {
    type: "function",
    name: "getValue",
    inputs: [],
    outputs: [{ type: "uint256", name: "" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "setValue",
    inputs: [{ type: "uint256", name: "value" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "ValueChanged",
    inputs: [{ type: "uint256", name: "newValue", indexed: false }],
  },
] as const

describe("Wagmi ABI Handlers", () => {
  let tempDir: string
  let listContractsSpy: ReturnType<typeof spyOn>
  let resolveContractSpy: ReturnType<typeof spyOn>

  beforeEach(() => {
    // Create temporary directory for export tests
    tempDir = `/tmp/wagmi-abi-test-${Date.now()}-${Math.random().toString(36).slice(2)}`

    // Mock the listContracts function
    listContractsSpy = spyOn(contractOps, "listContracts").mockReturnValue([
      { name: "TestToken", chains: [1, 137] },
      { name: "Storage", chains: [1] },
    ])

    // Mock the resolveContract function
    resolveContractSpy = spyOn(contractResolution, "resolveContract").mockImplementation(
      (contractName: string) => {
        if (contractName === "TestToken") {
          return {
            name: "TestToken",
            address: "0x1234567890123456789012345678901234567890" as Address,
            abi: mockERC20Abi,
            isBuiltin: false,
          }
        }
        if (contractName === "Storage") {
          return {
            name: "Storage",
            address: "0x9876543210987654321098765432109876543210" as Address,
            abi: mockStorageAbi,
            isBuiltin: false,
          }
        }
        throw new Error(`Contract ${contractName} not found`)
      },
    )
  })

  afterEach(async () => {
    // Restore spies
    listContractsSpy?.mockRestore()
    resolveContractSpy?.mockRestore()

    // Clean up temporary files
    if (existsSync(tempDir)) {
      await rm(tempDir, { recursive: true, force: true })
    }
  })

  describe("ExtractWagmiAbiHandler", () => {
    let handler: ExtractWagmiAbiHandler

    beforeEach(() => {
      handler = new ExtractWagmiAbiHandler()
    })

    test("should extract ABI in JSON format", async () => {
      const response = await handler.execute({ contract: "TestToken" })

      expect(response.content).toHaveLength(1)
      expect(response.content[0]?.type).toBe("text")

      const content = response.content[0]?.text || ""
      expect(content).toContain("ABI for TestToken")
      expect(content).toContain("json format")
      expect(content).toContain("function")
      expect(content).toContain("transfer")
    })

    test("should extract ABI in TypeScript format", async () => {
      const response = await handler.execute({
        contract: "TestToken",
        format: "typescript",
      })

      const content = response.content[0]?.text || ""
      expect(content).toContain("typescript format")
      expect(content).toContain("export const abi =")
      expect(content).toContain("as const")
    })

    test("should extract ABI in human-readable format", async () => {
      const response = await handler.execute({
        contract: "TestToken",
        format: "human-readable",
      })

      const content = response.content[0]?.text || ""
      expect(content).toContain("human-readable format")
      expect(content).toContain("📋 **Functions:**")
      expect(content).toContain("📡 **Events:**")
      expect(content).toContain("❌ **Errors:**")
      expect(content).toContain("transfer(address to, uint256 amount)")
      expect(content).toContain("Transfer(address indexed from")
    })

    test("should fail for non-existent contract", async () => {
      await expect(handler.execute({ contract: "NonExistent" })).rejects.toThrow(
        'Contract "NonExistent" not found',
      )
    })
  })

  describe("ListWagmiFunctionsHandler", () => {
    let handler: ListWagmiFunctionsHandler

    beforeEach(() => {
      handler = new ListWagmiFunctionsHandler()
    })

    test("should list all functions by default", async () => {
      const response = await handler.execute({ contract: "TestToken" })

      const content = response.content[0]?.text || ""
      expect(content).toContain("**Functions for TestToken** (all):")
      expect(content).toContain("Found 9 functions")
      expect(content).toContain("**name**() view")
      expect(content).toContain("**transfer**(address to, uint256 amount)")
      expect(content).toContain("Returns: bool")
    })

    test("should filter view functions", async () => {
      const response = await handler.execute({
        contract: "TestToken",
        type: "view",
      })

      const content = response.content[0]?.text || ""
      expect(content).toContain("**Functions for TestToken** (view):")
      expect(content).toContain("Found 6 view functions")
      expect(content).toContain("**name**()")
      expect(content).toContain("**balanceOf**(address account)")
      expect(content).not.toContain("**transfer**")
    })

    test("should filter nonpayable functions", async () => {
      const response = await handler.execute({
        contract: "TestToken",
        type: "nonpayable",
      })

      const content = response.content[0]?.text || ""
      expect(content).toContain("**Functions for TestToken** (nonpayable):")
      expect(content).toContain("Found 3 nonpayable functions")
      expect(content).toContain("**transfer**(")
      expect(content).toContain("**approve**(")
      expect(content).not.toContain("**name**(")
    })

    test("should handle contract with no matching functions", async () => {
      const response = await handler.execute({
        contract: "TestToken",
        type: "payable",
      })

      const content = response.content[0]?.text || ""
      expect(content).toContain("No payable functions found")
    })
  })

  describe("ListWagmiEventsHandler", () => {
    let handler: ListWagmiEventsHandler

    beforeEach(() => {
      handler = new ListWagmiEventsHandler()
    })

    test("should list all events", async () => {
      const response = await handler.execute({ contract: "TestToken" })

      const content = response.content[0]?.text || ""
      expect(content).toContain("Events for TestToken")
      expect(content).toContain("Found 2 events")
      expect(content).toContain(
        "**Transfer**(address indexed from, address indexed to, uint256 value)",
      )
      expect(content).toContain(
        "**Approval**(address indexed owner, address indexed spender, uint256 value)",
      )
    })

    test("should handle contract with no events", async () => {
      // Create a mock contract with no events
      const noEventsAbi: Abi = [
        {
          type: "function",
          name: "test",
          inputs: [],
          outputs: [],
          stateMutability: "pure",
        },
      ]

      // Update mocks for this test
      listContractsSpy.mockReturnValue([{ name: "NoEvents", chains: [1] }])

      resolveContractSpy.mockImplementation((contractName: string) => {
        if (contractName === "NoEvents") {
          return {
            name: "NoEvents",
            address: "0x1111111111111111111111111111111111111111" as Address,
            abi: noEventsAbi,
            isBuiltin: false,
          }
        }
        throw new Error(`Contract ${contractName} not found`)
      })

      const response = await handler.execute({ contract: "NoEvents" })

      const content = response.content[0]?.text || ""
      expect(content).toContain("No events found in this contract")
    })
  })

  describe("ExportWagmiAbiHandler", () => {
    let handler: ExportWagmiAbiHandler

    beforeEach(() => {
      handler = new ExportWagmiAbiHandler()
    })

    test("should export ABI as JSON file", async () => {
      // Create temp dir first
      await import("node:fs/promises").then((fs) => fs.mkdir(tempDir, { recursive: true }))
      const filePath = join(tempDir, "test-token-abi.json")

      const response = await handler.execute({
        contract: "TestToken",
        filePath,
        format: "json",
      })

      const content = response.content[0]?.text || ""
      expect(content).toContain("ABI exported successfully!")
      expect(content).toContain("**Contract:** TestToken")
      expect(content).toContain(`**File:** ${filePath}`)
      expect(content).toContain("**Format:** json")

      // Verify file was created
      expect(existsSync(filePath)).toBe(true)
      const fileContent = await readFile(filePath, "utf-8")
      const parsed = JSON.parse(fileContent)
      expect(Array.isArray(parsed)).toBe(true)
      expect(parsed[0]).toHaveProperty("type")
    })

    test("should export ABI as TypeScript file", async () => {
      await import("node:fs/promises").then((fs) => fs.mkdir(tempDir, { recursive: true }))
      const filePath = join(tempDir, "test-token-abi.ts")

      const response = await handler.execute({
        contract: "TestToken",
        filePath,
        format: "typescript",
      })

      const content = response.content[0]?.text || ""
      expect(content).toContain("**Format:** typescript")

      expect(existsSync(filePath)).toBe(true)
      const fileContent = await readFile(filePath, "utf-8")
      expect(fileContent).toContain("export const abi =")
      expect(fileContent).toContain("as const")
    })
  })

  describe("AnalyzeWagmiContractHandler", () => {
    let handler: AnalyzeWagmiContractHandler

    beforeEach(() => {
      handler = new AnalyzeWagmiContractHandler()
    })

    test("should analyze ERC20 token contract", async () => {
      const response = await handler.execute({ contract: "TestToken" })

      const content = response.content[0]?.text || ""
      expect(content).toContain("Contract Analysis: TestToken")
      expect(content).toContain("Functions: 9 total")
      expect(content).toContain("Events: 2")
      expect(content).toContain("Custom Errors: 1")

      // Function breakdown
      expect(content).toContain("View (read-only): 6")
      expect(content).toContain("Non-payable (state-changing): 3")
      expect(content).toContain("Payable (accepts ETH): 0")

      // Standard detection
      expect(content).toContain("Detected Standards:")
      expect(content).toContain("- ERC-20")

      // Recommendations
      expect(content).toContain("This is a token contract - use token transfer tools")
    })

    test("should analyze simple storage contract", async () => {
      const response = await handler.execute({ contract: "Storage" })

      const content = response.content[0]?.text || ""
      expect(content).toContain("Contract Analysis: Storage")
      expect(content).toContain("Functions: 2 total")
      expect(content).toContain("Events: 1")
      expect(content).toContain("Custom Errors: 0")

      // Function breakdown
      expect(content).toContain("View (read-only): 1")
      expect(content).toContain("Non-payable (state-changing): 1")

      // No standards detected
      expect(content).toContain("No standard interfaces detected")
      expect(content).toContain("Custom contract - review functions carefully")
    })

    test("should provide appropriate recommendations", async () => {
      // Mock a contract with payable functions
      const payableAbi: Abi = [
        {
          type: "function",
          name: "deposit",
          inputs: [],
          outputs: [],
          stateMutability: "payable",
        },
        {
          type: "function",
          name: "withdraw",
          inputs: [{ type: "uint256", name: "amount" }],
          outputs: [],
          stateMutability: "nonpayable",
        },
      ]

      // Update mocks for this test
      listContractsSpy.mockReturnValue([{ name: "Payable", chains: [1] }])

      resolveContractSpy.mockImplementation((contractName: string) => {
        if (contractName === "Payable") {
          return {
            name: "Payable",
            address: "0x2222222222222222222222222222222222222222" as Address,
            abi: payableAbi,
            isBuiltin: false,
          }
        }
        throw new Error(`Contract ${contractName} not found`)
      })

      const response = await handler.execute({ contract: "Payable" })

      const content = response.content[0]?.text || ""
      expect(content).toContain("Payable (accepts ETH): 1")
      expect(content).toContain("Contract accepts ETH payments - ensure proper value handling")
    })
  })

  describe("Error handling", () => {
    test("all handlers should fail gracefully for non-existent contracts", async () => {
      const handlers = [
        new ExtractWagmiAbiHandler(),
        new ListWagmiFunctionsHandler(),
        new ListWagmiEventsHandler(),
        new ExportWagmiAbiHandler(),
        new AnalyzeWagmiContractHandler(),
      ]

      for (const handler of handlers) {
        await expect(handler.execute({ contract: "DoesNotExist" })).rejects.toThrow()
      }
    })
  })
})
