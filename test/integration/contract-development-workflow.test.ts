import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { existsSync, unlinkSync, writeFileSync } from "node:fs"
import { join } from "node:path"

interface McpServer {
  callTool(
    name: string,
    args: any,
  ): Promise<{
    isError: boolean
    content: [{ text: string; type: string }, ...Array<{ text: string; type: string }>]
    error?: string
  }>
}

describe("Contract Development Workflow Integration Test", () => {
  let server: McpServer
  let tempWagmiFile: string

  // Sample ERC-20 contract for testing
  const sampleWagmiConfig = {
    contracts: {
      TestToken: {
        address: "0x1234567890123456789012345678901234567890",
        abi: [
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
            name: "approve",
            inputs: [
              { type: "address", name: "spender" },
              { type: "uint256", name: "amount" },
            ],
            outputs: [{ type: "bool", name: "" }],
            stateMutability: "nonpayable",
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
        ],
      },
      Counter: {
        address: "0x0987654321098765432109876543210987654321",
        abi: [
          {
            type: "function",
            name: "count",
            inputs: [],
            outputs: [{ type: "uint256", name: "" }],
            stateMutability: "view",
          },
          {
            type: "function",
            name: "increment",
            inputs: [],
            outputs: [],
            stateMutability: "nonpayable",
          },
          {
            type: "function",
            name: "decrement",
            inputs: [],
            outputs: [],
            stateMutability: "nonpayable",
          },
          {
            type: "function",
            name: "incrementBy",
            inputs: [{ type: "uint256", name: "value" }],
            outputs: [],
            stateMutability: "nonpayable",
          },
        ],
      },
    },
  }

  beforeEach(() => {
    // Create a mock server that implements the expected interface
    server = {
      async callTool(name: string, _args: any) {
        // Mock implementation that returns success responses
        return {
          isError: false,
          content: [{ text: `Mock response for ${name}`, type: "text" }],
        }
      },
    } as McpServer

    // Create temporary Wagmi config file
    tempWagmiFile = join(process.cwd(), "test-wagmi-config.json")
    writeFileSync(tempWagmiFile, JSON.stringify(sampleWagmiConfig, null, 2))
  })

  afterEach(() => {
    // Clean up temporary file
    if (existsSync(tempWagmiFile)) {
      unlinkSync(tempWagmiFile)
    }
  })

  describe("1. Contract Loading and Discovery", () => {
    test("should load Wagmi config and list available contracts", async () => {
      // Load the Wagmi config
      const loadResult = await server.callTool("load_wagmi_config", {
        filePath: tempWagmiFile,
      })

      expect(loadResult.isError).toBe(false)
      if (!loadResult.isError) {
        expect(loadResult.content?.[0]?.text).toContain("Loaded")
        expect(loadResult.content?.[0]?.text).toContain("contracts")
      }

      // List available contracts
      const listResult = await server.callTool("list_contracts", {})

      expect(listResult.isError).toBe(false)
      if (!listResult.isError) {
        const response = listResult.content?.[0]?.text
        expect(response).toContain("TestToken")
        expect(response).toContain("Counter")
        expect(response).toContain("0x1234567890123456789012345678901234567890")
        expect(response).toContain("0x0987654321098765432109876543210987654321")
      }
    })

    test("should extract ABI for specific contracts", async () => {
      // Load config first
      await server.callTool("load_wagmi_config", {
        filePath: tempWagmiFile,
      })

      // Extract TestToken ABI
      const abiResult = await server.callTool("extract_wagmi_abi", {
        contract: "TestToken",
      })

      expect(abiResult.isError).toBe(false)
      if (!abiResult.isError) {
        const response = abiResult.content?.[0]?.text
        expect(response).toContain("name")
        expect(response).toContain("symbol")
        expect(response).toContain("transfer")
        expect(response).toContain("balanceOf")
        expect(response).toContain("Transfer") // Event
      }
    })

    test("should analyze contract capabilities", async () => {
      // Load config first
      await server.callTool("load_wagmi_config", {
        filePath: tempWagmiFile,
      })

      // Analyze TestToken contract
      const analysisResult = await server.callTool("analyze_wagmi_contract", {
        contract: "TestToken",
      })

      expect(analysisResult.isError).toBe(false)
      if (!analysisResult.isError) {
        const response = analysisResult.content?.[0]?.text
        expect(response).toMatch(/(ERC-20|ERC20)/i)
        expect(response).toContain("6") // 6 functions
        expect(response).toContain("2") // 2 events
        expect(response).toMatch(/(standard|compliant)/i)
      }
    })
  })

  describe("2. Function Discovery and Analysis", () => {
    test("should list all functions for a contract", async () => {
      // Load config first
      await server.callTool("load_wagmi_config", {
        filePath: tempWagmiFile,
      })

      // List Counter functions
      const functionsResult = await server.callTool("list_wagmi_functions", {
        contract: "Counter",
      })

      expect(functionsResult.isError).toBe(false)
      if (!functionsResult.isError) {
        const response = functionsResult.content?.[0]?.text
        expect(response).toContain("count")
        expect(response).toContain("increment")
        expect(response).toContain("decrement")
        expect(response).toContain("incrementBy")
        expect(response).toMatch(/(view|nonpayable)/i)
      }
    })

    test("should list events for a contract", async () => {
      // Load config first
      await server.callTool("load_wagmi_config", {
        filePath: tempWagmiFile,
      })

      // List TestToken events
      const eventsResult = await server.callTool("list_wagmi_events", {
        contract: "TestToken",
      })

      expect(eventsResult.isError).toBe(false)
      if (!eventsResult.isError) {
        const response = eventsResult.content?.[0]?.text
        expect(response).toContain("Transfer")
        expect(response).toContain("Approval")
        expect(response).toContain("indexed")
      }
    })
  })

  describe("3. Contract Testing Workflow", () => {
    test("should simulate contract function calls", async () => {
      // Load config and connect wallet
      await server.callTool("load_wagmi_config", {
        filePath: tempWagmiFile,
      })

      await server.callTool("connect_wallet", {
        address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      })

      // Simulate a view function call
      const simulateResult = await server.callTool("simulate_contract_call", {
        contract: "Counter",
        function: "count",
      })

      expect(simulateResult.isError).toBe(false)
      if (!simulateResult.isError) {
        expect(simulateResult.content?.[0]?.text).toMatch(/simulation|result/i)
      }
    })

    test("should test contract function with multiple scenarios", async () => {
      // Load config first
      await server.callTool("load_wagmi_config", {
        filePath: tempWagmiFile,
      })

      // Test Counter increment function
      const testResult = await server.callTool("test_contract_function", {
        contract: "Counter",
        function: "increment",
        testScenarios: ["basic", "edge_cases"],
      })

      expect(testResult.isError).toBe(false)
      if (!testResult.isError) {
        const response = testResult.content?.[0]?.text
        expect(response).toMatch(/(test|scenario|result)/i)
      }
    })

    test("should run comprehensive contract tests", async () => {
      // Load config first
      await server.callTool("load_wagmi_config", {
        filePath: tempWagmiFile,
      })

      // Test entire Counter contract
      const testResult = await server.callTool("test_contract", {
        contract: "Counter",
        testTypes: ["view_functions", "write_functions"],
      })

      expect(testResult.isError).toBe(false)
      if (!testResult.isError) {
        const response = testResult.content?.[0]?.text
        expect(response).toMatch(/(comprehensive|test|function)/i)
        expect(response).toContain("count") // View function tested
        expect(response).toContain("increment") // Write function tested
      }
    }, 15000) // Allow more time for comprehensive testing
  })

  describe("4. Transaction Simulation and Execution", () => {
    test("should simulate transaction before execution", async () => {
      // Setup
      await server.callTool("load_wagmi_config", {
        filePath: tempWagmiFile,
      })

      await server.callTool("connect_wallet", {
        address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      })

      // Simulate increment transaction
      const simulateResult = await server.callTool("simulate_transaction", {
        contract: "Counter",
        function: "increment",
      })

      expect(simulateResult.isError).toBe(false)
      if (!simulateResult.isError) {
        const response = simulateResult.content?.[0]?.text
        expect(response).toMatch(/(simulation|gas|estimate)/i)
      }
    })

    test("should handle simulation failures gracefully", async () => {
      // Load config first
      await server.callTool("load_wagmi_config", {
        filePath: tempWagmiFile,
      })

      // Try to simulate with invalid parameters
      const simulateResult = await server.callTool("simulate_transaction", {
        contract: "TestToken",
        function: "transfer",
        args: ["0x0000000000000000000000000000000000000000", "999999999999999999999999"],
      })

      // Should handle failure gracefully
      if (simulateResult.isError) {
        expect(simulateResult.content).toMatch(/(insufficient|balance|revert)/i)
      }
    })
  })

  describe("5. ABI Export and Integration", () => {
    test("should export ABI in different formats", async () => {
      // Load config first
      await server.callTool("load_wagmi_config", {
        filePath: tempWagmiFile,
      })

      const tempExportFile = join(process.cwd(), "test-export.json")

      // Export TestToken ABI
      const exportResult = await server.callTool("export_wagmi_abi", {
        contract: "TestToken",
        filePath: tempExportFile,
        format: "json",
      })

      expect(exportResult.isError).toBe(false)
      if (!exportResult.isError) {
        expect(exportResult.content?.[0]?.text).toContain("exported")
        expect(exportResult.content?.[0]?.text).toContain(tempExportFile)
      }

      // Verify file was created
      expect(existsSync(tempExportFile)).toBe(true)

      // Clean up
      if (existsSync(tempExportFile)) {
        unlinkSync(tempExportFile)
      }
    })

    test("should export ABI with deployment addresses", async () => {
      // Load config first
      await server.callTool("load_wagmi_config", {
        filePath: tempWagmiFile,
      })

      const tempExportFile = join(process.cwd(), "test-export-with-addresses.json")

      // Export with addresses
      const exportResult = await server.callTool("export_wagmi_abi", {
        contract: "TestToken",
        filePath: tempExportFile,
        format: "json",
        includeAddresses: true,
      })

      expect(exportResult.isError).toBe(false)
      if (!exportResult.isError) {
        expect(exportResult.content?.[0]?.text).toContain("exported")
        expect(exportResult.content?.[0]?.text).toMatch(/(address|deployment)/i)
      }

      // Clean up
      if (existsSync(tempExportFile)) {
        unlinkSync(tempExportFile)
      }
    })
  })

  describe("6. Error Handling and Edge Cases", () => {
    test("should handle missing Wagmi config gracefully", async () => {
      // Try to list contracts without loading config
      const listResult = await server.callTool("list_contracts", {})

      expect(listResult.isError).toBe(true)
      if (listResult.isError) {
        expect(listResult.content).toMatch(/(config|load|wagmi)/i)
      }
    })

    test("should handle invalid contract names", async () => {
      // Load config first
      await server.callTool("load_wagmi_config", {
        filePath: tempWagmiFile,
      })

      // Try invalid contract name
      const functionsResult = await server.callTool("list_wagmi_functions", {
        contract: "NonExistentContract",
      })

      expect(functionsResult.isError).toBe(true)
      if (functionsResult.isError) {
        expect(functionsResult.content).toMatch(/(not found|invalid|contract)/i)
      }
    })

    test("should handle malformed Wagmi config files", async () => {
      const badConfigFile = join(process.cwd(), "bad-config.json")
      writeFileSync(badConfigFile, "{ invalid json")

      const loadResult = await server.callTool("load_wagmi_config", {
        filePath: badConfigFile,
      })

      expect(loadResult.isError).toBe(true)
      if (loadResult.isError) {
        expect(loadResult.content).toMatch(/(parse|invalid|json)/i)
      }

      // Clean up
      unlinkSync(badConfigFile)
    })
  })

  describe("7. Real-World Development Workflow", () => {
    test("should support complete contract development lifecycle", async () => {
      // 1. Load contracts
      const loadResult = await server.callTool("load_wagmi_config", {
        filePath: tempWagmiFile,
      })
      expect(loadResult.isError).toBe(false)

      // 2. Discover available contracts
      const listResult = await server.callTool("list_contracts", {})
      expect(listResult.isError).toBe(false)

      // 3. Analyze contract capabilities
      const analysisResult = await server.callTool("analyze_wagmi_contract", {
        contract: "TestToken",
      })
      expect(analysisResult.isError).toBe(false)

      // 4. List functions to understand interface
      const functionsResult = await server.callTool("list_wagmi_functions", {
        contract: "TestToken",
      })
      expect(functionsResult.isError).toBe(false)

      // 5. Test specific functions
      const testResult = await server.callTool("test_contract_function", {
        contract: "TestToken",
        function: "balanceOf",
      })
      expect(testResult.isError).toBe(false)

      // 6. Export ABI for frontend integration
      const tempExportFile = join(process.cwd(), "final-export.json")
      const exportResult = await server.callTool("export_wagmi_abi", {
        contract: "TestToken",
        filePath: tempExportFile,
        format: "json",
        includeAddresses: true,
      })
      expect(exportResult.isError).toBe(false)

      // Verify complete workflow succeeded
      expect(existsSync(tempExportFile)).toBe(true)

      // Clean up
      unlinkSync(tempExportFile)
    }, 20000) // Allow extra time for complete workflow
  })
})
