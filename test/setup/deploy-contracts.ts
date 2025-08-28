import { type Address, createPublicClient, createWalletClient, http } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { anvil } from "viem/chains"
import { MINIMAL_ERC20, MINIMAL_ERC721, MINIMAL_STORAGE } from "./minimal-contracts.js"

// Default Anvil private key (first account)
const ANVIL_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

export interface DeployedContracts {
  storage: Address
  erc20: Address
  erc721: Address
}

export async function deployTestContracts(): Promise<DeployedContracts> {
  const account = privateKeyToAccount(ANVIL_PRIVATE_KEY)

  const walletClient = createWalletClient({
    account,
    chain: anvil,
    transport: http("http://localhost:8545"),
  })

  const publicClient = createPublicClient({
    chain: anvil,
    transport: http("http://localhost:8545"),
  })

  console.log("Deploying test contracts...")
  console.log("Using account:", account.address)

  try {
    // Deploy Storage contract
    console.log("Deploying Storage contract...")
    const storageHash = await walletClient.deployContract({
      abi: MINIMAL_STORAGE.abi,
      bytecode: MINIMAL_STORAGE.bytecode,
    })

    const storageReceipt = await publicClient.waitForTransactionReceipt({
      hash: storageHash,
    })

    if (!storageReceipt.contractAddress) {
      throw new Error("Storage contract deployment failed - no contract address")
    }

    console.log("Storage contract deployed at:", storageReceipt.contractAddress)

    // Deploy ERC20 token
    console.log("Deploying ERC20 token...")
    const erc20Hash = await walletClient.deployContract({
      abi: MINIMAL_ERC20.abi,
      bytecode: MINIMAL_ERC20.bytecode,
    })

    const erc20Receipt = await publicClient.waitForTransactionReceipt({
      hash: erc20Hash,
    })

    if (!erc20Receipt.contractAddress) {
      throw new Error("ERC20 contract deployment failed - no contract address")
    }

    console.log("ERC20 token deployed at:", erc20Receipt.contractAddress)

    // Deploy ERC721 NFT
    console.log("Deploying ERC721 NFT...")
    const erc721Hash = await walletClient.deployContract({
      abi: MINIMAL_ERC721.abi,
      bytecode: MINIMAL_ERC721.bytecode as `0x${string}`,
    })

    const erc721Receipt = await publicClient.waitForTransactionReceipt({
      hash: erc721Hash,
    })

    if (!erc721Receipt.contractAddress) {
      throw new Error("ERC721 contract deployment failed - no contract address")
    }

    console.log("ERC721 NFT deployed at:", erc721Receipt.contractAddress)

    const deployedContracts = {
      storage: storageReceipt.contractAddress,
      erc20: erc20Receipt.contractAddress,
      erc721: erc721Receipt.contractAddress,
    }

    console.log("All contracts deployed successfully!")
    console.log("Contract addresses:")
    console.log("- Storage:", deployedContracts.storage)
    console.log("- ERC20:", deployedContracts.erc20)
    console.log("- ERC721:", deployedContracts.erc721)

    return deployedContracts
  } catch (error) {
    console.error("Contract deployment failed:", error)
    throw error
  }
}

export async function isAnvilRunning(): Promise<boolean> {
  try {
    const client = createWalletClient({
      chain: anvil,
      transport: http("http://localhost:8545"),
    })

    await client.getChainId()
    return true
  } catch (_error) {
    return false
  }
}
