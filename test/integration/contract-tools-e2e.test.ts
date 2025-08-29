import { beforeAll, beforeEach, describe, expect, it } from "bun:test"
import { anvil } from "viem/chains"
import {
  type DeployedContracts,
  deployTestContracts,
  isAnvilRunning,
} from "../setup/deploy-contracts.js"
import { expectToolSuccess, TEST_PRIVATE_KEY } from "./handlers/setup.js"

const useRealAnvil = process.env.USE_REAL_ANVIL === "true"

describe.skipIf(!useRealAnvil)("Contract Tools E2E Tests with Real Deployment", () => {
  let deployedContracts: DeployedContracts

  // Don't use setupContainer() as it resets wallet state before each test
  // setupContainer();

  // Helper to ensure wallet is connected
  async function ensureWalletConnected() {
    // Always reconnect to ensure clean state
    await expectToolSuccess("import_private_key", {
      privateKey: TEST_PRIVATE_KEY,
    })
    await expectToolSuccess("set_wallet_type", { type: "privateKey" })
    await expectToolSuccess("connect_wallet", {
      address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    })
    await expectToolSuccess("switch_chain", { chainId: 31337 })
  }

  beforeAll(async () => {
    console.log("Setting up E2E contract tools testing with real Anvil...")

    // Check if Anvil is running
    const anvilRunning = await isAnvilRunning()
    if (!anvilRunning) {
      throw new Error(
        "Anvil is not running. Please start Anvil with: anvil --host 0.0.0.0 --port 8545",
      )
    }

    // Deploy contracts
    console.log("Deploying test contracts for E2E testing...")
    deployedContracts = await deployTestContracts()

    // Load Storage contract ABI into wallet-agent
    await expectToolSuccess("load_wagmi_config", {
      filePath: "./test/setup/test-wagmi-config.ts",
    })

    // Import private key first
    await expectToolSuccess("import_private_key", {
      privateKey: TEST_PRIVATE_KEY,
    })

    // Set wallet type to private key
    await expectToolSuccess("set_wallet_type", { type: "privateKey" })

    // Switch to Anvil chain (31337)
    await expectToolSuccess("switch_chain", { chainId: 31337 })

    // Connect wallet using private key
    await expectToolSuccess("connect_wallet", {
      address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    })

    // The Storage contract is deployed and ready for testing
    // We'll use direct addressing for the E2E tests
    console.log(`✓ Storage contract deployed at ${deployedContracts.storage} for E2E testing`)
  })

  describe("Deployment Verification", () => {
    it("should have successfully deployed Storage contract", () => {
      expect(deployedContracts.storage).toBeDefined()
      expect(deployedContracts.storage).toMatch(/^0x[a-fA-F0-9]{40}$/)
      console.log("✓ Storage contract address valid:", deployedContracts.storage)
    })

    it("should be connected to Anvil chain", async () => {
      const { text } = await expectToolSuccess("get_current_account", {})

      expect(text).toContain("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
      expect(text).toContain("31337") // Anvil chain ID
      console.log("✓ Account connected to Anvil:", text)
    })
  })

  describe("Built-in Contract Support", () => {
    it("should list built-in contracts", async () => {
      const { text } = await expectToolSuccess("list_contracts", {})

      expect(text).toContain("ERC20")
      expect(text).toContain("ERC721")
      console.log("✓ Built-in contracts available:", text)
    })
  })

  describe("Wallet and Chain Operations", () => {
    beforeEach(async () => {
      await ensureWalletConnected()
    })

    it("should show current chain information", async () => {
      const { text } = await expectToolSuccess("get_current_account", {})

      expect(text).toContain("31337")
      expect(text).toContain("Chain ID")
      console.log("✓ Current chain info:", text)
    })

    it("should show wallet balance", async () => {
      const { text } = await expectToolSuccess("get_balance", {})

      // Anvil accounts start with 10000 ETH but some is used for gas
      expect(text).toContain("9999")
      expect(text).toContain("ETH")
      console.log("✓ Wallet balance:", text)
    })
  })

  describe("Transaction Operations", () => {
    beforeEach(async () => {
      await ensureWalletConnected()
    })

    it("should estimate gas for a simple transaction", async () => {
      const { text } = await expectToolSuccess("estimate_gas", {
        to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        value: "0.1",
      })

      expect(text).toContain("Gas Estimation")
      expect(text).toContain("21000 units") // Standard ETH transfer gas
      console.log("✓ Gas estimation:", text)
    })
  })

  describe("Contract Read/Write Operations", () => {
    beforeEach(async () => {
      await ensureWalletConnected()
    })

    it("should read from Storage contract", async () => {
      const { text } = await expectToolSuccess("read_contract", {
        contract: "Storage",
        address: deployedContracts.storage,
        function: "retrieve",
        args: [],
      })

      expect(text).toContain("Contract read result:")
      // Parse the result from the JSON in the text
      const resultMatch = text.match(/Contract read result: (.+)/)
      expect(resultMatch).toBeDefined()
      const parsedResult = resultMatch?.[1] ? JSON.parse(resultMatch[1]) : null
      expect(parsedResult).not.toBeNull()
      console.log("✓ Storage initial value:", parsedResult)
    })

    it("should write to Storage contract", async () => {
      const testValue = "42"
      const { text } = await expectToolSuccess("write_contract", {
        contract: "Storage",
        address: deployedContracts.storage,
        function: "store",
        args: [testValue],
      })

      expect(text).toContain("Transaction sent successfully!")
      // Extract hash from the text
      const hashMatch = text.match(/Hash: (0x[a-fA-F0-9]{64})/)
      expect(hashMatch).toBeDefined()
      const hash = hashMatch ? hashMatch[1] : ""
      expect(hash).toMatch(/^0x[a-fA-F0-9]{64}$/)
      console.log("✓ Write transaction hash:", hash)

      // Wait for transaction to be mined
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Verify the value was written
      const readResult = await expectToolSuccess("read_contract", {
        contract: "Storage",
        address: deployedContracts.storage,
        function: "retrieve",
        args: [],
      })

      const resultMatch = readResult.text.match(/Contract read result: (.+)/)
      expect(resultMatch).toBeDefined()
      const parsedResult = resultMatch?.[1] ? JSON.parse(resultMatch[1]) : null
      expect(parsedResult).toBe(testValue)
      console.log("✓ Verified stored value:", parsedResult)
    })

    it("should read from ERC20 token contract", async () => {
      // Get token name
      const nameResult = await expectToolSuccess("read_contract", {
        contract: deployedContracts.erc20,
        function: "name",
        args: [],
      })
      const nameMatch = nameResult.text.match(/Contract read result: (.+)/)
      expect(nameMatch).toBeDefined()
      const name = nameMatch?.[1] ? JSON.parse(nameMatch[1]) : null
      expect(name).toBe("Test Token")
      console.log("✓ Token name:", name)

      // Get token symbol
      const symbolResult = await expectToolSuccess("read_contract", {
        contract: deployedContracts.erc20,
        function: "symbol",
        args: [],
      })
      const symbolMatch = symbolResult.text.match(/Contract read result: (.+)/)
      expect(symbolMatch).toBeDefined()
      const symbol = symbolMatch?.[1] ? JSON.parse(symbolMatch[1]) : null
      expect(symbol).toBe("TEST")
      console.log("✓ Token symbol:", symbol)

      // Get deployer balance
      const balanceResult = await expectToolSuccess("read_contract", {
        contract: deployedContracts.erc20,
        function: "balanceOf",
        args: ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"],
      })
      const balanceMatch = balanceResult.text.match(/Contract read result: (.+)/)
      expect(balanceMatch).toBeDefined()
      const balance = balanceMatch?.[1] ? JSON.parse(balanceMatch[1]) : null
      expect(balance).toBe("10000000000000000000000")
      console.log("✓ Token balance:", balance)
    })

    it("should write to ERC20 token contract", async () => {
      const recipient = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
      const amount = "1000000000000000000" // 1 token

      const { text } = await expectToolSuccess("write_contract", {
        contract: deployedContracts.erc20,
        function: "transfer",
        args: [recipient, amount],
      })

      expect(text).toContain("Transaction sent successfully!")
      const hashMatch = text.match(/Hash: (0x[a-fA-F0-9]{64})/)
      expect(hashMatch).toBeDefined()
      if (hashMatch) {
        console.log("✓ Transfer transaction hash:", hashMatch[1])
      }

      // Wait and verify
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const balanceResult = await expectToolSuccess("read_contract", {
        contract: deployedContracts.erc20,
        function: "balanceOf",
        args: [recipient],
      })

      const balanceMatch = balanceResult.text.match(/Contract read result: (.+)/)
      expect(balanceMatch).toBeDefined()
      const recipientBalance = balanceMatch?.[1] ? JSON.parse(balanceMatch[1]) : null
      expect(recipientBalance).toBe(amount)
      console.log("✓ Recipient received tokens:", recipientBalance)
    })

    it.skip("should read from ERC721 NFT contract", async () => {
      // Skip: NFT contract doesn't have mint function, so no tokens exist
      // Get NFT owner
      const ownerResult = await expectToolSuccess("read_contract", {
        contract: deployedContracts.erc721,
        function: "ownerOf",
        args: ["1"],
      })
      const ownerMatch = ownerResult.text.match(/Contract read result: (.+)/)
      expect(ownerMatch).toBeDefined()
      const owner = ownerMatch?.[1] ? JSON.parse(ownerMatch[1]) : null
      expect(owner).toBe("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
      console.log("✓ NFT owner:", owner)

      // Get NFT name
      const nameResult = await expectToolSuccess("read_contract", {
        contract: deployedContracts.erc721,
        function: "name",
        args: [],
      })
      const nameMatch = nameResult.text.match(/Contract read result: (.+)/)
      expect(nameMatch).toBeDefined()
      const nftName = nameMatch?.[1] ? JSON.parse(nameMatch[1]) : null
      expect(nftName).toBe("TestNFT")
      console.log("✓ NFT collection name:", nftName)
    })

    it.skip("should write to ERC721 NFT contract", async () => {
      // Skip: NFT contract doesn't have mint function, so no tokens exist
      const spender = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
      const tokenId = "1"

      const { text } = await expectToolSuccess("write_contract", {
        contract: deployedContracts.erc721,
        function: "approve",
        args: [spender, tokenId],
      })

      expect(text).toContain("Transaction sent successfully!")
      const hashMatch = text.match(/Hash: (0x[a-fA-F0-9]{64})/)
      expect(hashMatch).toBeDefined()
      if (hashMatch) {
        console.log("✓ Approval transaction hash:", hashMatch[1])
      }

      // Wait and verify
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const approvedResult = await expectToolSuccess("read_contract", {
        contract: deployedContracts.erc721,
        function: "getApproved",
        args: [tokenId],
      })

      const approvedMatch = approvedResult.text.match(/Contract read result: (.+)/)
      expect(approvedMatch).toBeDefined()
      const approved = approvedMatch?.[1] ? JSON.parse(approvedMatch[1]) : null
      expect(approved).toBe(spender)
      console.log("✓ NFT approved to:", approved)
    })
  })

  describe("Deployment Summary", () => {
    it("should provide comprehensive test summary", async () => {
      const { text: accountText } = await expectToolSuccess("get_current_account", {})
      const { text: balanceText } = await expectToolSuccess("get_balance", {})

      console.log("\n=== CONTRACT DEPLOYMENT E2E TEST SUMMARY ===")
      console.log(`✓ Anvil chain running: ${anvil.name} (${anvil.id})`)
      console.log(`✓ Contracts deployed:`)
      console.log(`  - Storage: ${deployedContracts.storage}`)
      console.log(`  - ERC20: ${deployedContracts.erc20}`)
      console.log(`  - ERC721: ${deployedContracts.erc721}`)
      console.log(
        `✓ Account connected: ${accountText.includes("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266") ? "YES" : "NO"}`,
      )
      console.log(`✓ Account balance: ${balanceText.includes("10000") ? "10000 ETH" : "UNKNOWN"}`)
      console.log("✓ Private key wallet integration working!")
      console.log("✓ Real blockchain deployment infrastructure functional!")
      console.log("✓ MCP tools working with Anvil blockchain!")
      console.log("✓ Contract read/write operations tested!")
      console.log("============================================\n")

      // Verify all key components are working
      expect(deployedContracts.storage).toBeDefined()
      expect(deployedContracts.erc20).toBeDefined()
      expect(deployedContracts.erc721).toBeDefined()
      expect(deployedContracts.storage).toMatch(/^0x[a-fA-F0-9]{40}$/)
      expect(accountText).toContain("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
      expect(balanceText).toContain("9999")
    })
  })
})
