/**
 * Wallet Agent Library
 *
 * Main entry point for using wallet-agent as a library in other projects.
 * This module exports all the core functionality needed to build wallet
 * applications with Web3 capabilities.
 */

// Re-export viem types commonly used
export type { Address, Chain, Transport } from "viem";
export type { ContractAdapter } from "./adapters/contract-adapter.js";
export type { TokenAdapter } from "./adapters/token-adapter.js";
// Core types
export type {
  ChainAdapter,
  WalletAdapter,
} from "./adapters/wallet-adapter.js";

// Chain management
export {
  addCustomChain,
  // Container-aware versions for library users
  addCustomChainToContainer,
  getAllChains,
  getAllChainsForContainer,
  removeCustomChain,
  removeCustomChainFromContainer,
  updateCustomChain,
  updateCustomChainInContainer,
} from "./chains.js";
// Container and configuration
export {
  Container,
  type ContainerOptions,
  createContainer,
  DEFAULT_BUILTIN_CHAINS,
  DEFAULT_MOCK_ACCOUNTS,
  getContainer,
} from "./container.js";

// Contract operations
export {
  listContracts,
  loadWagmiConfig,
  readContract,
  writeContract,
} from "./contract-operations.js";
export { ContractEffects } from "./effects/contract-effects.js";
export {
  type ContractStore,
  InMemoryContractStore,
} from "./effects/contract-store.js";
export { type FileReader, NodeFileReader } from "./effects/file-reader.js";
export { TokenEffects } from "./effects/token-effects.js";
export { TransactionEffects } from "./effects/transaction-effects.js";
// Effects (for advanced users)
export { WalletEffects } from "./effects/wallet-effects.js";
// Schemas and types
export * from "./schemas.js";
// Signing operations
export {
  signWalletMessage,
  signWalletTypedData,
} from "./signing.js";
// Transaction operations
export {
  sendWalletTransaction,
  switchToChain,
} from "./transactions.js";
// Wallet operations
export {
  connectWallet,
  disconnectWallet,
  getCurrentAccount,
  getWalletBalance,
} from "./wallet.js";
// Wallet manager
export {
  getCurrentWalletInfo,
  importPrivateKey,
  removePrivateKey,
  setWalletType,
  type WalletType,
} from "./wallet-manager.js";
