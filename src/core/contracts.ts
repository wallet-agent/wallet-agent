import type { Abi, Address } from "viem"

export interface ContractConfig {
  address: Address
  abi: Abi
  name: string
  chainId?: number
}

export interface WagmiContract {
  name: string
  abi: Abi
  addresses?: Record<number, Address>
}

export interface ContractInfo {
  name: string
  chains: number[]
}

/**
 * Parse Wagmi-generated content to extract contract definitions
 * This is a pure function that doesn't use eval for security
 */
export function parseWagmiContent(content: string): WagmiContract[] {
  const contracts: WagmiContract[] = []

  // Parse ABI exports
  const abiMatches = content.matchAll(/export const (\w+)ABI = (\[[\s\S]*?\]) as const/g)

  const abiMap = new Map<string, Abi>()

  for (const match of abiMatches) {
    const [, contractName, abiString] = match
    if (!contractName || !abiString) continue

    try {
      // Parse ABI JSON safely
      const abi = JSON.parse(
        abiString
          .replace(/(\w+):/g, '"$1":') // Add quotes to keys
          .replace(/'/g, '"') // Replace single quotes with double
          .replace(/,\s*}/g, "}") // Remove trailing commas
          .replace(/,\s*]/g, "]"),
      ) as Abi

      abiMap.set(contractName, abi)
    } catch (error) {
      console.warn(`Failed to parse ABI for ${contractName}:`, error)
      // For complex ABIs that can't be parsed safely, we'll need eval
      // This should be handled at a higher level with proper security context
    }
  }

  // Parse address exports
  const addressMatches = content.matchAll(/export const (\w+)Address = ({[\s\S]*?}) as const/g)

  const addressMap = new Map<string, Record<number, Address>>()

  for (const match of addressMatches) {
    const [, contractName, addressString] = match
    if (!contractName || !addressString) continue

    try {
      // Parse address object safely
      const addresses = JSON.parse(
        addressString
          .replace(/(\d+):/g, '"$1":') // Quote numeric keys
          .replace(/'/g, '"') // Replace single quotes
          .replace(/0x([\da-fA-F]+)/g, '"0x$1"') // Quote hex addresses
          .replace(/,\s*}/g, "}"), // Remove trailing commas
      ) as Record<string, Address>

      // Convert string keys back to numbers
      const numericAddresses: Record<number, Address> = {}
      for (const [key, value] of Object.entries(addresses)) {
        numericAddresses[Number(key)] = value
      }

      addressMap.set(contractName, numericAddresses)
    } catch (error) {
      console.warn(`Failed to parse addresses for ${contractName}:`, error)
    }
  }

  // Combine ABIs and addresses
  for (const [name, abi] of abiMap) {
    const addresses = addressMap.get(name)
    contracts.push({
      name,
      abi,
      ...(addresses && { addresses }),
    })
  }

  return contracts
}

/**
 * Resolve contract address for a specific chain
 */
export function resolveContractAddress(
  contract: WagmiContract,
  chainId: number,
): Address | undefined {
  return contract.addresses?.[chainId]
}

/**
 * Get contract info from a list of contracts
 */
export function getContractInfo(contracts: WagmiContract[]): ContractInfo[] {
  const contractMap = new Map<string, Set<number>>()

  for (const contract of contracts) {
    const chains = contractMap.get(contract.name) || new Set()

    if (contract.addresses) {
      for (const chainId of Object.keys(contract.addresses)) {
        chains.add(Number(chainId))
      }
    }

    contractMap.set(contract.name, chains)
  }

  return Array.from(contractMap.entries()).map(([name, chains]) => ({
    name,
    chains: Array.from(chains),
  }))
}
