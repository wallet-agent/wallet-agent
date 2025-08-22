import { beforeAll, describe, expect, it } from "bun:test"
import { createPublicClient, createWalletClient, http } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { anvil } from "viem/chains"
import {
  type DeployedContracts,
  deployTestContracts,
  isAnvilRunning,
} from "../setup/deploy-contracts.js"
import { MINIMAL_STORAGE } from "../setup/minimal-contracts.js"

// Default Anvil private key (first account)
const ANVIL_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

const useRealAnvil = process.env.USE_REAL_ANVIL === "true"

describe.skipIf(!useRealAnvil)("Working Contract Deployment Tests", () => {
  let deployedContracts: DeployedContracts
  let publicClient: ReturnType<typeof createPublicClient>
  let walletClient: ReturnType<typeof createWalletClient>
  let testAccount: ReturnType<typeof privateKeyToAccount>

  beforeAll(async () => {
    console.log("Using real Anvil blockchain for contract deployment testing...")

    // Check if Anvil is running
    const anvilRunning = await isAnvilRunning()
    if (!anvilRunning) {
      throw new Error(
        "Anvil is not running. Please start Anvil with: anvil --host 0.0.0.0 --port 8545",
      )
    }

    console.log("Setting up test clients...")
    testAccount = privateKeyToAccount(ANVIL_PRIVATE_KEY)

    publicClient = createPublicClient({
      chain: anvil,
      transport: http("http://localhost:8545"),
    })

    walletClient = createWalletClient({
      account: testAccount,
      chain: anvil,
      transport: http("http://localhost:8545"),
    })

    console.log("Deploying test contracts...")
    deployedContracts = await deployTestContracts()
  })

  describe("Storage Contract - Real Deployment Tests", () => {
    it("should deploy successfully with a valid address", () => {
      expect(deployedContracts.storage).toBeDefined()
      expect(deployedContracts.storage).toMatch(/^0x[a-fA-F0-9]{40}$/)
      console.log("✓ Contract deployed at:", deployedContracts.storage)
    })

    it("should start with initial value of 0", async () => {
      const value = await publicClient.readContract({
        address: deployedContracts.storage,
        abi: MINIMAL_STORAGE.abi,
        functionName: "retrieve",
      })

      expect(value).toBe(0n)
      console.log("✓ Initial value is 0")
    })

    it("should store and retrieve a value", async () => {
      const testValue = 42n
      console.log(`Setting value to ${testValue}...`)

      const hash = await walletClient.writeContract({
        address: deployedContracts.storage,
        abi: MINIMAL_STORAGE.abi,
        functionName: "store",
        args: [testValue],
        chain: anvil,
        account: testAccount,
      })

      console.log("Transaction hash:", hash)
      await publicClient.waitForTransactionReceipt({ hash })

      const retrievedValue = await publicClient.readContract({
        address: deployedContracts.storage,
        abi: MINIMAL_STORAGE.abi,
        functionName: "retrieve",
      })

      expect(retrievedValue).toBe(testValue)
      console.log(`✓ Successfully stored and retrieved value: ${retrievedValue}`)
    })

    it("should update value multiple times", async () => {
      const values = [100n, 999n, 123456n]

      for (const [index, value] of values.entries()) {
        console.log(`Test ${index + 1}: Setting value to ${value}...`)

        const hash = await walletClient.writeContract({
          address: deployedContracts.storage,
          abi: MINIMAL_STORAGE.abi,
          functionName: "store",
          args: [value],
          chain: anvil,
          account: testAccount,
        })

        await publicClient.waitForTransactionReceipt({ hash })

        const retrievedValue = await publicClient.readContract({
          address: deployedContracts.storage,
          abi: MINIMAL_STORAGE.abi,
          functionName: "retrieve",
        })

        expect(retrievedValue).toBe(value)
        console.log(`✓ Update ${index + 1} successful: ${retrievedValue}`)
      }
    })

    it("should handle large numbers", async () => {
      const largeValue = 123456789012345678901234567890n

      const hash = await walletClient.writeContract({
        address: deployedContracts.storage,
        abi: MINIMAL_STORAGE.abi,
        functionName: "store",
        args: [largeValue],
        chain: anvil,
        account: testAccount,
      })

      await publicClient.waitForTransactionReceipt({ hash })

      const retrievedValue = await publicClient.readContract({
        address: deployedContracts.storage,
        abi: MINIMAL_STORAGE.abi,
        functionName: "retrieve",
      })

      expect(retrievedValue).toBe(largeValue)
      console.log(`✓ Large number handled correctly: ${retrievedValue}`)
    })

    it("should demonstrate real contract state persistence", async () => {
      // Set initial value
      const initialValue = 777n
      let hash = await walletClient.writeContract({
        address: deployedContracts.storage,
        abi: MINIMAL_STORAGE.abi,
        functionName: "store",
        args: [initialValue],
        chain: anvil,
        account: testAccount,
      })
      await publicClient.waitForTransactionReceipt({ hash })

      // Verify it's stored
      let value = await publicClient.readContract({
        address: deployedContracts.storage,
        abi: MINIMAL_STORAGE.abi,
        functionName: "retrieve",
      })
      expect(value).toBe(initialValue)

      // Update to new value
      const newValue = 888n
      hash = await walletClient.writeContract({
        address: deployedContracts.storage,
        abi: MINIMAL_STORAGE.abi,
        functionName: "store",
        args: [newValue],
        chain: anvil,
        account: testAccount,
      })
      await publicClient.waitForTransactionReceipt({ hash })

      // Verify state has changed
      value = await publicClient.readContract({
        address: deployedContracts.storage,
        abi: MINIMAL_STORAGE.abi,
        functionName: "retrieve",
      })
      expect(value).toBe(newValue)
      expect(value).not.toBe(initialValue)

      console.log(`✓ State persistence verified: ${initialValue} → ${newValue}`)
    })
  })

  describe("Contract Interaction Summary", () => {
    it("should provide test summary", async () => {
      const finalValue = await publicClient.readContract({
        address: deployedContracts.storage,
        abi: MINIMAL_STORAGE.abi,
        functionName: "retrieve",
      })

      console.log("\n=== TEST SUMMARY ===")
      console.log(`Contract Address: ${deployedContracts.storage}`)
      console.log(`Final Stored Value: ${finalValue}`)
      console.log(`Account Used: ${testAccount.address}`)
      console.log("✓ All contract interactions successful!")
      console.log("✓ Real contract deployment working!")
      console.log("✓ Read/write operations functional!")
      console.log("==================")

      expect(deployedContracts.storage).toBeDefined()
      expect(finalValue).toBeDefined()
    })
  })
})
