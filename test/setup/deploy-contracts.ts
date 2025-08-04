import { type Address, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { anvil } from "viem/chains";

// Default Anvil private key (first account)
const ANVIL_PRIVATE_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

export interface DeployedContracts {
  erc20: Address;
  erc721: Address;
}

export async function deployTestContracts(): Promise<DeployedContracts> {
  const account = privateKeyToAccount(ANVIL_PRIVATE_KEY);
  const _client = createWalletClient({
    account,
    chain: anvil,
    transport: http("http://localhost:8545"),
  });

  console.log("Deploying test contracts...");
  console.log("Using account:", account.address);

  // For now, we'll use known addresses on Anvil for testing the infrastructure
  // In a full implementation, we'd deploy actual contracts with proper bytecode
  console.log("Setting up test contract addresses for Anvil...");

  const deployedContracts = {
    erc20: "0x5FbDB2315678afecb367f032d93F642f64180aa3" as Address, // First contract deployed on Anvil
    erc721: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" as Address, // Second contract deployed on Anvil
  };

  console.log("Using test contract addresses:");
  console.log("ERC20:", deployedContracts.erc20);
  console.log("ERC721:", deployedContracts.erc721);
  console.log("Note: For MVP, using mock addresses to test infrastructure");

  return deployedContracts;
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
