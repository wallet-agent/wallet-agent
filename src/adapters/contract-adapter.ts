import type { Abi, Address } from "viem"
import type { ContractConfig, ContractInfo, WagmiContract } from "../core/contracts.js"

/**
 * Contract adapter interface for managing smart contract metadata
 */
export interface ContractAdapter {
  /**
   * Load contracts from a Wagmi-generated file
   */
  loadFromFile(filePath: string): Promise<void>

  /**
   * Register a contract with a specific address and chain
   */
  registerContract(name: string, address: Address, chainId: number): void

  /**
   * Get a contract configuration by name and chain ID
   */
  getContract(name: string, chainId: number): ContractConfig | undefined

  /**
   * Get ABI for a contract by name
   */
  getAbi(name: string): Abi | undefined

  /**
   * List all available contracts
   */
  listContracts(): ContractInfo[]

  /**
   * Clear all contracts
   */
  clear(): void
}

/**
 * File reader interface for dependency injection
 */
export interface FileReader {
  read(path: string): Promise<string>
}

/**
 * Contract store interface for managing contract state
 */
export interface ContractStore {
  addContracts(contracts: WagmiContract[]): void
  registerContract(name: string, address: Address, chainId: number): void
  getContract(name: string, chainId: number): ContractConfig | undefined
  getAbi(name: string): Abi | undefined
  getWagmiContract(name: string): WagmiContract | undefined
  getAllContracts(): WagmiContract[]
  clear(): void
}
