import { beforeAll, describe, test } from "bun:test"
import { validateContractOperation, validateResponseStructure } from "./helpers/validator.js"
import { setupClaudeSDKTests, TEST_DATA, testPrompt, testWorkflow } from "./setup.js"

describe("Contract Testing and Simulation via Natural Language", () => {
  beforeAll(() => {
    setupClaudeSDKTests()
  })

  beforeAll(async () => {
    // Connect wallet for contract tests
    await testPrompt(`Connect to wallet ${TEST_DATA.WALLET_ADDRESS_1}`)
  })

  describe("Contract Reading and Analysis", () => {
    test("should read contract function", async () => {
      const result = await testPrompt(
        `Read the 'name' function from contract MyToken at address ${TEST_DATA.WALLET_ADDRESS_2}`,
        {
          toolsUsed: ["read_contract"],
          resultContains: ["read", "contract", "function"],
        },
      )

      validateContractOperation(result, "read")
    })

    test("should read contract with arguments", async () => {
      const result = await testPrompt(
        `Read 'balanceOf' function from ERC20 contract ${TEST_DATA.WALLET_ADDRESS_2} with argument ${TEST_DATA.WALLET_ADDRESS_1}`,
        {
          toolsUsed: ["read_contract"],
          resultContains: ["read", "balanceOf", "argument"],
        },
      )

      validateContractOperation(result, "read")
    })

    test("should read multiple contract functions", async () => {
      const result = await testPrompt(
        `Read both 'name' and 'symbol' functions from token contract ${TEST_DATA.WALLET_ADDRESS_2}`,
        {
          toolsUsed: ["read_contract"],
          resultContains: ["read", "name", "symbol", "token"],
        },
      )

      validateResponseStructure(result)
    })

    test("should analyze contract capabilities", async () => {
      const result = await testPrompt(
        `Analyze the capabilities of the ERC20 contract at ${TEST_DATA.WALLET_ADDRESS_2}`,
        {
          resultContains: ["analyze", "capabilities", "erc20", "contract"],
        },
      )

      validateResponseStructure(result)
    })
  })

  describe("Contract Simulation", () => {
    test("should simulate contract call", async () => {
      const result = await testPrompt(
        `Simulate calling 'transfer' function on ERC20 contract ${TEST_DATA.WALLET_ADDRESS_2} with recipient ${TEST_DATA.WALLET_ADDRESS_1} and amount 100`,
        {
          toolsUsed: ["simulate_transaction"],
          resultContains: ["simulate", "transfer", "contract"],
        },
      )

      validateContractOperation(result, "simulate")
    })

    test("should simulate complex contract interaction", async () => {
      const result = await testPrompt(
        `Simulate approving 1000 tokens for spender ${TEST_DATA.WALLET_ADDRESS_1} on contract MyToken`,
        {
          toolsUsed: ["simulate_transaction"],
          resultContains: ["simulate", "approve", "tokens"],
        },
      )

      validateContractOperation(result, "simulate")
    })

    test("should dry run transaction", async () => {
      const result = await testPrompt(
        `Dry run: transfer 50 USDC to ${TEST_DATA.WALLET_ADDRESS_2} without executing`,
        {
          toolsUsed: ["simulate_transaction"],
          resultContains: ["dry", "run", "transfer", "usdc"],
        },
      )

      validateResponseStructure(result)
    })

    test("should preview transaction effects", async () => {
      const result = await testPrompt(
        `What would happen if I call mint function on contract ${TEST_DATA.WALLET_ADDRESS_2} with amount 1000? Don't execute it.`,
        {
          toolsUsed: ["simulate_transaction"],
          resultContains: ["preview", "mint", "effects"],
        },
      )

      validateResponseStructure(result)
    })
  })

  describe("Contract Function Testing", () => {
    test("should test specific contract function", async () => {
      const result = await testPrompt("Test the 'totalSupply' function of MyToken contract", {
        resultContains: ["test", "totalSupply", "function", "contract"],
      })

      validateResponseStructure(result)
    })

    test("should test function with parameters", async () => {
      const result = await testPrompt(
        `Test 'allowance' function with owner ${TEST_DATA.WALLET_ADDRESS_1} and spender ${TEST_DATA.WALLET_ADDRESS_2}`,
        {
          resultContains: ["test", "allowance", "owner", "spender"],
        },
      )

      validateResponseStructure(result)
    })

    test("should test all view functions", async () => {
      const result = await testPrompt(
        "Test all read-only functions of the ERC20 contract to verify they work correctly",
        {
          resultContains: ["test", "view", "functions", "read-only"],
        },
      )

      validateResponseStructure(result)
    })

    test("should test function edge cases", async () => {
      const result = await testPrompt(
        "Test 'balanceOf' function with edge cases: zero address and max address",
        {
          resultContains: ["test", "balanceOf", "edge", "cases", "zero"],
        },
      )

      validateResponseStructure(result)
    })
  })

  describe("Contract Validation and Verification", () => {
    test("should validate contract interface", async () => {
      const result = await testPrompt(
        `Validate that contract ${TEST_DATA.WALLET_ADDRESS_2} implements the ERC20 interface correctly`,
        {
          resultContains: ["validate", "contract", "erc20", "interface"],
        },
      )

      validateResponseStructure(result)
    })

    test("should verify contract functions exist", async () => {
      const result = await testPrompt(
        "Verify that the contract has all required ERC20 functions: name, symbol, decimals, totalSupply, balanceOf, transfer, approve, allowance",
        {
          resultContains: ["verify", "functions", "exist", "erc20"],
        },
      )

      validateResponseStructure(result)
    })

    test("should check contract state consistency", async () => {
      const result = await testPrompt(
        "Check that the token contract state is consistent: total supply equals sum of all balances",
        {
          resultContains: ["check", "state", "consistent", "supply", "balances"],
        },
      )

      validateResponseStructure(result)
    })

    test("should validate contract events", async () => {
      const result = await testPrompt(
        "Validate that the contract emits proper Transfer and Approval events",
        {
          resultContains: ["validate", "events", "Transfer", "Approval"],
        },
      )

      validateResponseStructure(result)
    })
  })

  describe("Contract Writing and Execution", () => {
    test("should write to contract function", async () => {
      const result = await testPrompt(
        `Execute 'mint' function on MyToken contract with amount 100`,
        {
          toolsUsed: ["write_contract"],
          resultContains: ["execute", "mint", "contract"],
        },
      )

      validateContractOperation(result, "write")
    })

    test("should execute contract function with ETH value", async () => {
      const result = await testPrompt(
        `Call payable function 'deposit' on contract ${TEST_DATA.WALLET_ADDRESS_2} with 0.1 ETH`,
        {
          toolsUsed: ["write_contract"],
          resultContains: ["payable", "deposit", "eth"],
        },
      )

      validateContractOperation(result, "write")
    })

    test("should batch contract operations", async () => {
      const result = await testPrompt(
        `Execute multiple operations: approve 1000 tokens for ${TEST_DATA.WALLET_ADDRESS_2}, then transfer 500 tokens to the same address`,
        {
          toolsUsed: ["write_contract"],
          resultContains: ["approve", "transfer", "batch"],
        },
      )

      validateResponseStructure(result)
    })
  })

  describe("Complete Contract Testing Workflows", () => {
    test("should execute full ERC20 testing workflow", async () => {
      const erc20TestFlow = [
        {
          prompt: "Load wagmi config if available",
          expected: {
            resultContains: ["wagmi", "config"],
          },
        },
        {
          prompt: "Test that MyToken contract implements ERC20 correctly",
          expected: {
            resultContains: ["test", "erc20", "correctly"],
          },
        },
        {
          prompt: "Read basic token information: name, symbol, decimals",
          expected: {
            toolsUsed: ["read_contract"],
            resultContains: ["name", "symbol", "decimals"],
          },
        },
        {
          prompt: "Check total supply and verify it's greater than zero",
          expected: {
            toolsUsed: ["read_contract"],
            resultContains: ["totalSupply", "zero"],
          },
        },
        {
          prompt: `Test balance queries for address ${TEST_DATA.WALLET_ADDRESS_1}`,
          expected: {
            toolsUsed: ["read_contract"],
            resultContains: ["balance", "queries"],
          },
        },
      ]

      const results = await testWorkflow("Complete ERC20 Testing", erc20TestFlow)
      results.forEach((result) => validateResponseStructure(result))
    })

    test("should handle contract deployment testing workflow", async () => {
      const deploymentTestFlow = [
        {
          prompt: "Analyze a theoretical ERC20 contract deployment",
          expected: {
            resultContains: ["analyze", "deployment", "erc20"],
          },
        },
        {
          prompt: "What tests should be run after deploying an ERC20 contract?",
          expected: {
            resultContains: ["tests", "deploying", "erc20"],
          },
        },
        {
          prompt: "Create a test plan for verifying contract functionality",
          expected: {
            resultContains: ["test", "plan", "functionality"],
          },
        },
      ]

      const results = await testWorkflow("Contract Deployment Testing", deploymentTestFlow)
      results.forEach((result) => validateResponseStructure(result))
    })

    test("should handle contract security testing", async () => {
      const securityTestFlow = [
        {
          prompt: "Analyze potential security issues in an ERC20 contract",
          expected: {
            resultContains: ["security", "issues", "erc20"],
          },
        },
        {
          prompt: "Test for common vulnerabilities: reentrancy, overflow, access control",
          expected: {
            resultContains: ["vulnerabilities", "reentrancy", "overflow", "access"],
          },
        },
        {
          prompt: "Verify proper access controls on admin functions",
          expected: {
            resultContains: ["access", "controls", "admin"],
          },
        },
      ]

      const results = await testWorkflow("Contract Security Testing", securityTestFlow)
      results.forEach((result) => validateResponseStructure(result))
    })
  })

  describe("Gas Optimization Testing", () => {
    test("should test gas costs for contract functions", async () => {
      const result = await testPrompt(
        `Estimate gas costs for calling 'transfer' function with 100 tokens to ${TEST_DATA.WALLET_ADDRESS_2}`,
        {
          toolsUsed: ["estimate_gas"],
          resultContains: ["gas", "costs", "transfer"],
        },
      )

      validateResponseStructure(result)
    })

    test("should compare gas costs of different functions", async () => {
      const result = await testPrompt(
        "Compare gas costs between 'transfer' and 'transferFrom' functions for the same amount",
        {
          toolsUsed: ["estimate_gas"],
          resultContains: ["compare", "gas", "transfer", "transferFrom"],
        },
      )

      validateResponseStructure(result)
    })

    test("should analyze gas optimization opportunities", async () => {
      const result = await testPrompt(
        "Analyze gas usage patterns in the contract and suggest optimizations",
        {
          resultContains: ["analyze", "gas", "patterns", "optimizations"],
        },
      )

      validateResponseStructure(result)
    })
  })

  describe("Contract ABI Management", () => {
    test("should extract ABI from contract", async () => {
      const result = await testPrompt("Extract ABI for MyToken contract in human-readable format", {
        resultContains: ["extract", "abi", "human-readable", "contract"],
      })

      validateResponseStructure(result)
    })

    test("should list contract functions from ABI", async () => {
      const result = await testPrompt("List all functions available in MyToken contract", {
        toolsUsed: ["list_contracts"],
        resultContains: ["list", "functions", "available"],
      })

      validateResponseStructure(result)
    })

    test("should analyze ABI compatibility", async () => {
      const result = await testPrompt(
        "Check if MyToken contract ABI is compatible with ERC20 standard",
        {
          resultContains: ["abi", "compatible", "erc20", "standard"],
        },
      )

      validateResponseStructure(result)
    })
  })

  describe("Error Handling and Edge Cases", () => {
    test("should handle contract function revert", async () => {
      const result = await testPrompt(
        `Simulate transfer of 999999999 tokens (more than balance) to ${TEST_DATA.WALLET_ADDRESS_2}`,
        {
          toolsUsed: ["simulate_transaction"],
          errorExpected: true,
          errorMessage: "insufficient",
        },
      )

      validateResponseStructure(result)
    })

    test("should handle invalid contract address", async () => {
      const result = await testPrompt(
        "Read 'name' function from contract at invalid address 0xinvalid",
        {
          toolsUsed: ["read_contract"],
          errorExpected: true,
          errorMessage: "invalid",
        },
      )

      validateResponseStructure(result)
    })

    test("should handle non-existent function", async () => {
      const result = await testPrompt(
        `Call non-existent function 'nonExistentFunc' on contract ${TEST_DATA.WALLET_ADDRESS_2}`,
        {
          toolsUsed: ["read_contract"],
          errorExpected: true,
          errorMessage: "function",
        },
      )

      validateResponseStructure(result)
    })

    test("should handle incorrect function parameters", async () => {
      const result = await testPrompt(
        "Call 'balanceOf' function without required address parameter",
        {
          toolsUsed: ["read_contract"],
          errorExpected: true,
          errorMessage: "parameter",
        },
      )

      validateResponseStructure(result)
    })
  })

  describe("Natural Language Variations", () => {
    test("should understand various contract reading phrasings", async () => {
      const readPhrases = [
        "Read from contract",
        "Call view function",
        "Query contract state",
        "Get data from contract",
        "Check contract value",
      ]

      for (const phrase of readPhrases) {
        const result = await testPrompt(
          `${phrase} 'name' on MyToken at ${TEST_DATA.WALLET_ADDRESS_2}`,
          {
            toolsUsed: ["read_contract"],
            resultContains: ["read", "contract"],
          },
        )

        validateResponseStructure(result)
      }
    })

    test("should understand various simulation phrasings", async () => {
      const simulatePhrases = [
        "Simulate transaction",
        "Dry run operation",
        "Preview contract call",
        "Test contract execution",
        "Mock contract interaction",
      ]

      for (const phrase of simulatePhrases) {
        const result = await testPrompt(
          `${phrase}: mint 100 tokens on contract ${TEST_DATA.WALLET_ADDRESS_2}`,
          {
            toolsUsed: ["simulate_transaction"],
            resultContains: ["simulate", "mint"],
          },
        )

        validateResponseStructure(result)
      }
    })

    test("should understand various testing phrasings", async () => {
      const testPhrases = [
        "Test contract function",
        "Validate contract behavior",
        "Verify contract works",
        "Check contract functionality",
        "Examine contract operation",
      ]

      for (const phrase of testPhrases) {
        const result = await testPrompt(`${phrase} 'totalSupply' of MyToken`, {
          resultContains: ["test", "contract", "totalSupply"],
        })

        validateResponseStructure(result)
      }
    })

    test("should understand various execution phrasings", async () => {
      const executePhrases = [
        "Execute contract function",
        "Run contract method",
        "Call contract function",
        "Invoke contract operation",
        "Trigger contract action",
      ]

      for (const phrase of executePhrases) {
        const result = await testPrompt(`${phrase} 'mint' with amount 50 on MyToken`, {
          toolsUsed: ["write_contract"],
          resultContains: ["execute", "mint"],
        })

        validateResponseStructure(result)
      }
    })
  })

  describe("Integration with Other Operations", () => {
    test("should combine contract testing with token operations", async () => {
      const integrationFlow = [
        {
          prompt: "Test ERC20 contract basic functions",
          expected: {
            resultContains: ["test", "erc20", "functions"],
          },
        },
        {
          prompt: "Check my token balance using the tested contract",
          expected: {
            toolsUsed: ["get_token_balance"],
            resultContains: ["balance", "token"],
          },
        },
        {
          prompt: "Simulate a token transfer and then execute it",
          expected: {
            toolsUsed: ["simulate_transaction", "transfer_token"],
            resultContains: ["simulate", "transfer", "execute"],
          },
        },
      ]

      const results = await testWorkflow("Contract Testing Integration", integrationFlow)
      results.forEach((result) => validateResponseStructure(result))
    })

    test("should combine gas estimation with contract testing", async () => {
      const gasTestingFlow = [
        {
          prompt: "Estimate gas for mint function with 1000 tokens",
          expected: {
            toolsUsed: ["estimate_gas"],
            resultContains: ["gas", "mint"],
          },
        },
        {
          prompt: "Compare gas costs across different mint amounts",
          expected: {
            toolsUsed: ["estimate_gas"],
            resultContains: ["compare", "gas", "amounts"],
          },
        },
        {
          prompt: "If gas is reasonable, execute the mint operation",
          expected: {
            toolsUsed: ["write_contract"],
            resultContains: ["execute", "mint"],
          },
        },
      ]

      const results = await testWorkflow("Gas-Aware Contract Testing", gasTestingFlow)
      results.forEach((result) => validateResponseStructure(result))
    })
  })
})
