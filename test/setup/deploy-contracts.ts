import {
  type Address,
  createPublicClient,
  createWalletClient,
  http,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { anvil } from "viem/chains";
import { MINIMAL_STORAGE } from "./minimal-contracts.js";

// Default Anvil private key (first account)
const ANVIL_PRIVATE_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

export interface DeployedContracts {
  storage: Address;
}

export async function deployTestContracts(): Promise<DeployedContracts> {
  const account = privateKeyToAccount(ANVIL_PRIVATE_KEY);

  const walletClient = createWalletClient({
    account,
    chain: anvil,
    transport: http("http://localhost:8545"),
  });

  const publicClient = createPublicClient({
    chain: anvil,
    transport: http("http://localhost:8545"),
  });

  console.log("Deploying test contracts...");
  console.log("Using account:", account.address);

  try {
    // Deploy Storage contract
    console.log("Deploying Storage contract...");
    const storageHash = await walletClient.deployContract({
      abi: MINIMAL_STORAGE.abi,
      bytecode: MINIMAL_STORAGE.bytecode,
    });

    const storageReceipt = await publicClient.waitForTransactionReceipt({
      hash: storageHash,
    });

    if (!storageReceipt.contractAddress) {
      throw new Error(
        "Storage contract deployment failed - no contract address",
      );
    }

    console.log(
      "Storage contract deployed at:",
      storageReceipt.contractAddress,
    );

    const deployedContracts = {
      storage: storageReceipt.contractAddress,
    };

    console.log("All contracts deployed successfully!");
    console.log("Contract addresses:");
    console.log("- Storage:", deployedContracts.storage);

    return deployedContracts;
  } catch (error) {
    console.error("Contract deployment failed:", error);
    throw error;
  }
}

export async function isAnvilRunning(): Promise<boolean> {
  try {
    const client = createWalletClient({
      chain: anvil,
      transport: http("http://localhost:8545"),
    });

    await client.getChainId();
    return true;
  } catch (_error) {
    return false;
  }
}
