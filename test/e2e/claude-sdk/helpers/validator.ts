import { expect } from "bun:test"
import type { TestResult } from "../setup.js"

/**
 * Validate wallet connection results
 */
export function validateWalletConnection(result: TestResult, expectedAddress?: string) {
  expect(result.success).toBe(true)
  expect(result.toolsUsed).toContain("connect_wallet")

  const content = result.finalResult.toLowerCase()
  expect(content).toMatch(/connected.*wallet/i)

  if (expectedAddress) {
    expect(content).toContain(expectedAddress.toLowerCase())
  }
}

/**
 * Validate balance check results
 */
export function validateBalanceCheck(result: TestResult) {
  expect(result.success).toBe(true)
  expect(result.toolsUsed).toContain("get_balance")

  const content = result.finalResult
  // Should contain balance information
  expect(content).toMatch(/balance|eth|wei/i)
  // Should contain numeric values
  expect(content).toMatch(/\d+/)
}

/**
 * Validate transaction results
 */
export function validateTransaction(result: TestResult, expectedType?: "send" | "estimate") {
  expect(result.success).toBe(true)

  if (expectedType === "send") {
    expect(result.toolsUsed).toContain("send_transaction")
    expect(result.finalResult).toMatch(/transaction|hash|0x[a-fA-F0-9]/i)
  } else if (expectedType === "estimate") {
    expect(result.toolsUsed).toContain("estimate_gas")
    expect(result.finalResult).toMatch(/gas|wei|estimate/i)
  }
}

/**
 * Validate chain switching results
 */
export function validateChainSwitch(result: TestResult, expectedChainId?: number) {
  expect(result.success).toBe(true)
  expect(result.toolsUsed).toContain("switch_chain")

  const content = result.finalResult.toLowerCase()
  expect(content).toMatch(/chain|switched|network/i)

  if (expectedChainId) {
    expect(content).toContain(expectedChainId.toString())
  }
}

/**
 * Validate token operations
 */
export function validateTokenOperation(
  result: TestResult,
  operation: "transfer" | "approve" | "balance" | "info",
) {
  expect(result.success).toBe(true)

  const expectedTools = {
    transfer: "transfer_token",
    approve: "approve_token",
    balance: "get_token_balance",
    info: "get_token_info",
  }

  expect(result.toolsUsed).toContain(expectedTools[operation])

  const content = result.finalResult.toLowerCase()
  const expectedPatterns = {
    transfer: /transfer|sent|token/i,
    approve: /approve|allowance/i,
    balance: /balance|token/i,
    info: /name|symbol|decimals/i,
  }

  expect(content).toMatch(expectedPatterns[operation])
}

/**
 * Validate NFT operations
 */
export function validateNFTOperation(result: TestResult, operation: "transfer" | "owner" | "info") {
  expect(result.success).toBe(true)

  const expectedTools = {
    transfer: "transfer_nft",
    owner: "get_nft_owner",
    info: "get_nft_info",
  }

  expect(result.toolsUsed).toContain(expectedTools[operation])

  const content = result.finalResult.toLowerCase()
  const expectedPatterns = {
    transfer: /transfer|nft|token/i,
    owner: /owner|address/i,
    info: /name|symbol|uri/i,
  }

  expect(content).toMatch(expectedPatterns[operation])
}

/**
 * Validate contract operations
 */
export function validateContractOperation(
  result: TestResult,
  operation: "read" | "write" | "simulate" | "test",
) {
  expect(result.success).toBe(true)

  const expectedTools = {
    read: "read_contract",
    write: "write_contract",
    simulate: ["simulate_contract_call", "simulate_transaction"],
    test: ["test_contract_function", "test_contract"],
  }

  const tools = Array.isArray(expectedTools[operation])
    ? expectedTools[operation]
    : [expectedTools[operation]]
  const hasExpectedTool = tools.some((tool) => result.toolsUsed.includes(tool as string))
  expect(hasExpectedTool).toBe(true)
}

/**
 * Validate Wagmi config operations
 */
export function validateWagmiOperation(
  result: TestResult,
  operation: "load" | "list" | "extract" | "analyze",
) {
  expect(result.success).toBe(true)

  const expectedTools = {
    load: "load_wagmi_config",
    list: ["list_contracts", "list_wagmi_functions", "list_wagmi_events"],
    extract: "extract_wagmi_abi",
    analyze: "analyze_wagmi_contract",
  }

  const tools = Array.isArray(expectedTools[operation])
    ? expectedTools[operation]
    : [expectedTools[operation]]
  const hasExpectedTool = tools.some((tool) => result.toolsUsed.includes(tool as string))
  expect(hasExpectedTool).toBe(true)
}

/**
 * Validate ENS resolution
 */
export function validateENSResolution(result: TestResult, expectedAddress?: string) {
  expect(result.success).toBe(true)
  expect(result.toolsUsed).toContain("resolve_ens_name")

  const content = result.finalResult
  // Should contain an Ethereum address
  expect(content).toMatch(/0x[a-fA-F0-9]{40}/)

  if (expectedAddress) {
    expect(content).toContain(expectedAddress)
  }
}

/**
 * Validate key management operations
 */
export function validateKeyManagement(
  result: TestResult,
  operation: "import" | "list" | "remove" | "encrypt",
) {
  expect(result.success).toBe(true)

  const expectedTools = {
    import: ["import_private_key", "import_encrypted_private_key"],
    list: ["list_imported_wallets", "list_encrypted_keys"],
    remove: ["remove_private_key", "remove_encrypted_key"],
    encrypt: ["create_encrypted_keystore", "unlock_keystore", "lock_keystore"],
  }

  const tools = Array.isArray(expectedTools[operation])
    ? expectedTools[operation]
    : [expectedTools[operation]]
  const hasExpectedTool = tools.some((tool) => result.toolsUsed.includes(tool as string))
  expect(hasExpectedTool).toBe(true)
}

/**
 * Validate error scenarios
 */
export function validateExpectedError(result: TestResult, expectedErrorPattern?: RegExp | string) {
  expect(result.success).toBe(false)
  expect(result.error).toBeDefined()

  if (expectedErrorPattern) {
    if (typeof expectedErrorPattern === "string") {
      expect(result.error?.toLowerCase()).toContain(expectedErrorPattern.toLowerCase())
    } else {
      expect(result.error || "").toMatch(expectedErrorPattern)
    }
  }
}

/**
 * Validate Hyperliquid operations
 */
export function validateHyperliquidOperation(
  result: TestResult,
  operation: "import" | "account" | "order" | "positions",
) {
  expect(result.success).toBe(true)

  const expectedTools = {
    import: "hl_import_wallet",
    account: "hl_get_account_info",
    order: ["hl_place_order", "hl_cancel_order", "hl_get_open_orders"],
    positions: ["hl_get_positions", "hl_get_user_fills"],
  }

  const tools = Array.isArray(expectedTools[operation])
    ? expectedTools[operation]
    : [expectedTools[operation]]
  const hasExpectedTool = tools.some((tool) => result.toolsUsed.includes(tool as string))
  expect(hasExpectedTool).toBe(true)
}

/**
 * Validate multi-tool workflows
 */
export function validateWorkflow(results: TestResult[], expectedFlow: string[]) {
  expect(results.length).toBeGreaterThan(0)

  // Check that workflow completed successfully
  const success = results.every((r) => r.success)
  expect(success).toBe(true)

  // Check that expected tools were used across the workflow
  const allToolsUsed = results.flatMap((r) => r.toolsUsed)

  for (const expectedTool of expectedFlow) {
    expect(allToolsUsed).toContain(expectedTool)
  }
}

/**
 * Validate response format and structure
 */
export function validateResponseStructure(result: TestResult) {
  expect(result).toHaveProperty("success")
  expect(result).toHaveProperty("toolsUsed")
  expect(result).toHaveProperty("finalResult")

  expect(Array.isArray(result.toolsUsed)).toBe(true)
  expect(typeof result.finalResult).toBe("string")
}
