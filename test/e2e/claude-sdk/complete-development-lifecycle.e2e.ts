import { beforeAll, describe, test } from "bun:test"
import {
  validateContractOperation,
  validateResponseStructure,
  validateWagmiOperation,
  validateWorkflow,
} from "./helpers/validator.js"
import { setupClaudeSDKTests, TEST_DATA, testPrompt, testWorkflow } from "./setup.js"

describe("Complete Contract Development Lifecycle", () => {
  beforeAll(() => {
    setupClaudeSDKTests()
  })

  beforeAll(async () => {
    // Connect wallet for development lifecycle tests
    await testPrompt(`Connect to wallet ${TEST_DATA.WALLET_ADDRESS_1}`)
  })

  describe("Project Initialization and Setup", () => {
    test("should guide through complete project setup", async () => {
      const setupFlow = [
        {
          prompt: "Help me set up a new DeFi project with wallet integration",
          expected: {
            resultContains: ["setup", "defi", "project", "wallet", "integration"],
          },
        },
        {
          prompt: "Generate wagmi configuration for my contracts",
          expected: {
            toolsUsed: ["load_wagmi_config"],
            resultContains: ["wagmi", "configuration", "contracts", "generated"],
          },
        },
        {
          prompt: "List all available contracts from the wagmi config",
          expected: {
            toolsUsed: ["list_contracts"],
            resultContains: ["available", "contracts", "wagmi", "config"],
          },
        },
      ]

      const result = await testWorkflow("project_setup", setupFlow)
      validateWorkflow(result, ["load_wagmi_config", "list_contracts"])
    })

    test("should validate contract deployment configuration", async () => {
      const result = await testPrompt(
        `Validate my contract deployment configuration and check for potential issues`,
        {
          toolsUsed: ["analyze_wagmi_contract", "list_wagmi_functions"],
          resultContains: ["validate", "deployment", "configuration", "issues"],
        },
      )

      validateWagmiOperation(result, "analyze")
    })

    test("should provide development environment recommendations", async () => {
      const result = await testPrompt(
        `Recommend optimal development environment setup for smart contract development`,
        {
          toolsUsed: ["get_chain_info", "add_custom_chain"],
          resultContains: ["recommend", "development", "environment", "setup"],
        },
      )

      validateResponseStructure(result)
    })
  })

  describe("Contract Analysis and Exploration", () => {
    test("should perform comprehensive contract audit", async () => {
      const auditFlow = [
        {
          prompt: "Load my wagmi contracts and start comprehensive analysis",
          expected: {
            toolsUsed: ["load_wagmi_config", "list_contracts"],
            resultContains: ["load", "wagmi", "comprehensive", "analysis"],
          },
        },
        {
          prompt: "Analyze the security of my ERC20 token contract",
          expected: {
            toolsUsed: ["analyze_wagmi_contract", "list_wagmi_functions"],
            resultContains: ["analyze", "security", "erc20", "contract"],
          },
        },
        {
          prompt: "Check for standard compliance and potential vulnerabilities",
          expected: {
            toolsUsed: ["analyze_wagmi_contract"],
            resultContains: ["standard", "compliance", "vulnerabilities"],
          },
        },
        {
          prompt: "Generate security report with recommendations",
          expected: {
            toolsUsed: ["list_wagmi_events", "extract_wagmi_abi"],
            resultContains: ["security", "report", "recommendations"],
          },
        },
      ]

      const result = await testWorkflow("contract_audit", auditFlow)
      validateWorkflow(result, [
        "load_wagmi_config",
        "analyze_wagmi_contract",
        "list_wagmi_functions",
        "extract_wagmi_abi",
      ])
    })

    test("should map contract dependencies and interactions", async () => {
      const result = await testPrompt(
        `Map all contract dependencies and external interactions for my DeFi protocol`,
        {
          toolsUsed: ["list_contracts", "list_wagmi_functions", "analyze_wagmi_contract"],
          resultContains: ["map", "dependencies", "interactions", "defi", "protocol"],
        },
      )

      validateWagmiOperation(result, "analyze")
    })

    test("should identify gas optimization opportunities", async () => {
      const result = await testPrompt(
        `Analyze my contracts for gas optimization opportunities and provide specific recommendations`,
        {
          toolsUsed: ["analyze_wagmi_contract", "test_contract_function"],
          resultContains: ["gas", "optimization", "opportunities", "recommendations"],
        },
      )

      validateWagmiOperation(result, "analyze")
    })

    test("should generate comprehensive documentation from contracts", async () => {
      const result = await testPrompt(
        `Generate comprehensive documentation for my contract suite including all functions and events`,
        {
          toolsUsed: ["list_wagmi_functions", "list_wagmi_events", "extract_wagmi_abi"],
          resultContains: ["documentation", "comprehensive", "functions", "events"],
        },
      )

      validateWagmiOperation(result, "extract")
    })
  })

  describe("Testing and Validation Workflows", () => {
    test("should execute comprehensive test suite for all contracts", async () => {
      const testFlow = [
        {
          prompt: "Run comprehensive tests on all my contracts",
          expected: {
            toolsUsed: ["test_contract"],
            resultContains: ["comprehensive", "tests", "contracts"],
          },
        },
        {
          prompt: "Test critical functions with edge cases and boundary conditions",
          expected: {
            toolsUsed: ["test_contract_function"],
            resultContains: ["critical", "functions", "edge", "cases", "boundary"],
          },
        },
        {
          prompt: "Simulate complex multi-contract interactions",
          expected: {
            toolsUsed: ["simulate_contract_call", "simulate_transaction"],
            resultContains: ["simulate", "multi", "contract", "interactions"],
          },
        },
        {
          prompt: "Generate test coverage report with recommendations",
          expected: {
            toolsUsed: ["test_contract"],
            resultContains: ["coverage", "report", "recommendations"],
          },
        },
      ]

      const result = await testWorkflow("comprehensive_testing", testFlow)
      validateWorkflow(result, [
        "test_contract",
        "test_contract_function",
        "simulate_contract_call",
      ])
    })

    test("should validate contract upgrade scenarios", async () => {
      const result = await testPrompt(
        `Test contract upgrade scenarios and ensure backward compatibility`,
        {
          toolsUsed: ["simulate_contract_call", "test_contract_function"],
          resultContains: ["upgrade", "scenarios", "backward", "compatibility"],
        },
      )

      validateContractOperation(result, "simulate")
    })

    test("should perform stress testing under high load conditions", async () => {
      const result = await testPrompt(
        `Perform stress testing of my contracts under high transaction volume and gas pressure`,
        {
          toolsUsed: ["test_contract", "simulate_transaction", "estimate_gas"],
          resultContains: ["stress", "testing", "high", "load", "gas", "pressure"],
        },
      )

      validateContractOperation(result, "test")
    })

    test("should validate cross-chain compatibility", async () => {
      const result = await testPrompt(
        `Test my contracts across different chains to ensure cross-chain compatibility`,
        {
          toolsUsed: ["switch_chain", "test_contract", "simulate_contract_call"],
          resultContains: ["cross", "chain", "compatibility", "different", "chains"],
        },
      )

      validateResponseStructure(result)
    })
  })

  describe("Deployment and Migration Workflows", () => {
    test("should guide through secure deployment process", async () => {
      const deploymentFlow = [
        {
          prompt: "Prepare for secure contract deployment to testnet",
          expected: {
            toolsUsed: ["switch_chain", "get_chain_info"],
            resultContains: ["prepare", "secure", "deployment", "testnet"],
          },
        },
        {
          prompt: "Verify deployment configuration and gas estimates",
          expected: {
            toolsUsed: ["estimate_gas", "get_balance"],
            resultContains: ["verify", "deployment", "configuration", "gas"],
          },
        },
        {
          prompt: "Execute deployment with transaction monitoring",
          expected: {
            toolsUsed: ["send_transaction", "get_transaction_status"],
            resultContains: ["execute", "deployment", "monitoring"],
          },
        },
        {
          prompt: "Verify deployment success and contract functionality",
          expected: {
            toolsUsed: ["read_contract", "get_transaction_receipt"],
            resultContains: ["verify", "success", "functionality"],
          },
        },
      ]

      const result = await testWorkflow("secure_deployment", deploymentFlow)
      validateWorkflow(result, [
        "switch_chain",
        "estimate_gas",
        "send_transaction",
        "read_contract",
      ])
    })

    test("should handle contract verification and source code publication", async () => {
      const result = await testPrompt(
        `Verify my deployed contract on the block explorer and publish source code`,
        {
          toolsUsed: ["read_contract", "export_wagmi_abi"],
          resultContains: ["verify", "deployed", "explorer", "source", "code"],
        },
      )

      validateContractOperation(result, "read")
    })

    test("should manage contract upgrades and migrations safely", async () => {
      const result = await testPrompt(
        `Plan and execute safe contract upgrade with data migration`,
        {
          toolsUsed: ["simulate_transaction", "write_contract", "read_contract"],
          resultContains: ["upgrade", "migration", "safe", "data"],
        },
      )

      validateContractOperation(result, "write")
    })

    test("should implement emergency procedures and circuit breakers", async () => {
      const result = await testPrompt(
        `Set up emergency procedures and circuit breakers for my deployed contracts`,
        {
          toolsUsed: ["write_contract", "simulate_transaction"],
          resultContains: ["emergency", "procedures", "circuit", "breakers"],
        },
      )

      validateContractOperation(result, "write")
    })
  })

  describe("Integration and Frontend Connection", () => {
    test("should generate frontend integration artifacts", async () => {
      const integrationFlow = [
        {
          prompt: "Export ABIs for frontend integration",
          expected: {
            toolsUsed: ["export_wagmi_abi"],
            resultContains: ["export", "abis", "frontend", "integration"],
          },
        },
        {
          prompt: "Generate TypeScript types for type-safe contract interactions",
          expected: {
            toolsUsed: ["extract_wagmi_abi"],
            resultContains: ["typescript", "types", "safe", "interactions"],
          },
        },
        {
          prompt: "Create human-readable contract documentation for developers",
          expected: {
            toolsUsed: ["extract_wagmi_abi", "list_wagmi_functions"],
            resultContains: ["human", "readable", "documentation", "developers"],
          },
        },
      ]

      const result = await testWorkflow("frontend_integration", integrationFlow)
      validateWorkflow(result, ["export_wagmi_abi", "extract_wagmi_abi", "list_wagmi_functions"])
    })

    test("should test wallet connectivity and user flows", async () => {
      const result = await testPrompt(
        `Test wallet connectivity and simulate common user interaction flows`,
        {
          toolsUsed: ["connect_wallet", "read_contract", "write_contract"],
          resultContains: ["wallet", "connectivity", "user", "flows"],
        },
      )

      validateResponseStructure(result)
    })

    test("should validate transaction UX and error handling", async () => {
      const result = await testPrompt(
        `Test transaction user experience and error handling for my dApp`,
        {
          toolsUsed: ["simulate_transaction", "estimate_gas"],
          resultContains: ["transaction", "user", "experience", "error", "handling"],
        },
      )

      validateContractOperation(result, "simulate")
    })

    test("should implement real-time monitoring and alerts", async () => {
      const result = await testPrompt(
        `Set up real-time monitoring for my contracts with automated alerts`,
        {
          toolsUsed: ["read_contract", "get_transaction_status"],
          resultContains: ["real", "time", "monitoring", "automated", "alerts"],
        },
      )

      validateResponseStructure(result)
    })
  })

  describe("Production Operations and Maintenance", () => {
    test("should establish operational monitoring and health checks", async () => {
      const result = await testPrompt(
        `Set up production monitoring with health checks for contract operations`,
        {
          toolsUsed: ["read_contract", "get_balance", "get_chain_info"],
          resultContains: ["production", "monitoring", "health", "checks"],
        },
      )

      validateContractOperation(result, "read")
    })

    test("should implement automated backup and disaster recovery", async () => {
      const result = await testPrompt(
        `Implement backup procedures and disaster recovery plan for my protocol`,
        {
          toolsUsed: ["export_wagmi_abi", "read_contract"],
          resultContains: ["backup", "disaster", "recovery", "protocol"],
        },
      )

      validateResponseStructure(result)
    })

    test("should manage protocol governance and voting mechanisms", async () => {
      const result = await testPrompt(
        `Set up governance voting for protocol upgrades and parameter changes`,
        {
          toolsUsed: ["write_contract", "read_contract", "simulate_transaction"],
          resultContains: ["governance", "voting", "upgrades", "parameter", "changes"],
        },
      )

      validateContractOperation(result, "write")
    })

    test("should handle security incident response", async () => {
      const result = await testPrompt(
        `Create security incident response procedures for my DeFi protocol`,
        {
          toolsUsed: ["read_contract", "write_contract"],
          resultContains: ["security", "incident", "response", "procedures"],
        },
      )

      validateContractOperation(result, "read")
    })

    test("should optimize gas costs and protocol efficiency", async () => {
      const result = await testPrompt(
        `Analyze and optimize gas costs across my protocol for maximum efficiency`,
        {
          toolsUsed: ["estimate_gas", "test_contract", "simulate_transaction"],
          resultContains: ["optimize", "gas", "costs", "protocol", "efficiency"],
        },
      )

      validateContractOperation(result, "test")
    })
  })

  describe("Advanced Development Patterns", () => {
    test("should implement proxy patterns and upgradeability", async () => {
      const result = await testPrompt(
        `Implement proxy pattern for upgradeable contracts with proper initialization`,
        {
          toolsUsed: ["analyze_wagmi_contract", "simulate_transaction", "write_contract"],
          resultContains: ["proxy", "pattern", "upgradeable", "initialization"],
        },
      )

      validateWagmiOperation(result, "analyze")
    })

    test("should implement access control and role management", async () => {
      const result = await testPrompt(
        `Set up comprehensive access control with role-based permissions`,
        {
          toolsUsed: ["list_wagmi_functions", "write_contract", "read_contract"],
          resultContains: ["access", "control", "role", "based", "permissions"],
        },
      )

      validateContractOperation(result, "write")
    })

    test("should implement oracle integration and price feeds", async () => {
      const result = await testPrompt(
        `Integrate price oracles and implement price feed mechanisms`,
        {
          toolsUsed: ["read_contract", "write_contract", "simulate_contract_call"],
          resultContains: ["oracle", "integration", "price", "feeds"],
        },
      )

      validateContractOperation(result, "read")
    })

    test("should implement multi-signature and timelock mechanisms", async () => {
      const result = await testPrompt(
        `Set up multi-signature wallet with timelock for critical operations`,
        {
          toolsUsed: ["write_contract", "simulate_transaction"],
          resultContains: ["multi", "signature", "timelock", "critical", "operations"],
        },
      )

      validateContractOperation(result, "write")
    })

    test("should implement cross-chain bridge functionality", async () => {
      const result = await testPrompt(
        `Develop cross-chain bridge with validation and security measures`,
        {
          toolsUsed: ["switch_chain", "write_contract", "simulate_transaction"],
          resultContains: ["cross", "chain", "bridge", "validation", "security"],
        },
      )

      validateResponseStructure(result)
    })
  })
})
