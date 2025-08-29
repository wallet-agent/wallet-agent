import { expect } from "bun:test"
import type { TestResult } from "../setup.js"

/**
 * Documentation example definition with expected behavior
 */
export interface DocumentationExample {
  prompt: string
  expectedOutput?: {
    format?: RegExp | string
    contains?: string[]
    structure?: object
    exactMatch?: string
  }
  expectedTools: string[]
  description: string
  source: string // e.g., "docs/getting-started/quick-start.md:14"
  section: string // e.g., "Step 1: Check Your Setup"
}

/**
 * Format validation patterns for common output types
 */
export const FormatPatterns = {
  // Address patterns
  ETHEREUM_ADDRESS: /0x[a-fA-F0-9]{40}/,
  SHORT_HASH: /0x[a-fA-F0-9]{8,}/,
  TRANSACTION_HASH: /0x[a-fA-F0-9]{64}/,

  // Balance patterns
  ETH_BALANCE: /\d+(\.\d+)?\s*ETH/i,
  TOKEN_BALANCE: /\d+(\.\d+)?\s*[A-Z]{2,6}/,
  WEI_AMOUNT: /\d+\s*wei/i,

  // Status patterns
  CHAIN_ID: /chain.*id.*:?\s*\d+/i,
  CONNECTED_WALLET: /connected.*wallet.*:?\s*0x[a-fA-F0-9]{40}/i,

  // Transaction patterns
  TRANSACTION_SUCCESS: /transaction.*sent.*successfully|hash.*:.*0x/i,
  TRANSACTION_STATUS: /status.*:?\s*(pending|confirmed|success|failed)/i,
  GAS_INFO: /gas.*:?\s*\d+/i,

  // Token patterns
  TOKEN_INFO: /name.*:.*symbol.*:.*decimals.*:/i,
  BALANCE_DISPLAY: /balance.*:?\s*\d+(\.\d+)?/i,
}

/**
 * Validate that output matches expected format exactly
 */
export function validateExactOutput(result: TestResult, expected: string): void {
  expect(result.success).toBe(true)
  expect(result.finalResult.trim()).toBe(expected.trim())
}

/**
 * Validate output format matches expected pattern
 */
export function validateOutputFormat(result: TestResult, format: RegExp | string): void {
  expect(result.success).toBe(true)

  if (format instanceof RegExp) {
    expect(result.finalResult).toMatch(format)
  } else {
    expect(result.finalResult).toContain(format)
  }
}

/**
 * Validate output structure contains all expected elements
 */
export function validateOutputStructure(result: TestResult, structure: object): void {
  expect(result.success).toBe(true)

  const content = result.finalResult.toLowerCase()

  for (const [, value] of Object.entries(structure)) {
    if (typeof value === "string") {
      expect(content).toContain(value.toLowerCase())
    } else if (value instanceof RegExp) {
      expect(content).toMatch(value)
    } else if (Array.isArray(value)) {
      for (const item of value) {
        expect(content).toContain(item.toLowerCase())
      }
    }
  }
}

/**
 * Validate a complete documentation example
 */
export function validateDocumentationExample(
  result: TestResult,
  example: DocumentationExample,
): void {
  // Basic success check
  expect(result.success).toBe(true)

  // Validate expected tools were used
  for (const tool of example.expectedTools) {
    expect(result.toolsUsed).toContain(tool)
  }

  // Validate expected output if provided
  if (example.expectedOutput) {
    const { format, contains, structure, exactMatch } = example.expectedOutput

    if (exactMatch) {
      validateExactOutput(result, exactMatch)
    }

    if (format) {
      validateOutputFormat(result, format)
    }

    if (contains) {
      const content = result.finalResult.toLowerCase()
      for (const item of contains) {
        expect(content).toContain(item.toLowerCase())
      }
    }

    if (structure) {
      validateOutputStructure(result, structure)
    }
  }
}

/**
 * Generate detailed mismatch report for debugging
 */
export function generateMismatchReport(expected: DocumentationExample, actual: TestResult): string {
  return `
Documentation Example Validation Failed:
Expected: ${JSON.stringify(expected, null, 2)}
Actual Result:
  Success: ${actual.success}
  Tools Used: ${actual.toolsUsed.join(", ")}
  Final Result: ${actual.finalResult.substring(0, 500)}${actual.finalResult.length > 500 ? "..." : ""}
  Error: ${actual.error || "none"}
`
}

/**
 * Validate wallet info output format matches documentation
 */
export function validateWalletInfoFormat(result: TestResult): void {
  expect(result.success).toBe(true)

  const content = result.finalResult

  // Should contain wallet configuration header
  expect(content).toMatch(/current.*wallet.*configuration/i)

  // Should contain type information
  expect(content).toMatch(/type.*:?\s*(mock|privateKey)/i)

  // Should contain available addresses
  expect(content).toMatch(/available.*addresses/i)
  expect(content).toMatch(FormatPatterns.ETHEREUM_ADDRESS)
}

/**
 * Validate balance output format matches documentation
 */
export function validateBalanceFormat(result: TestResult, expectedCurrency?: string): void {
  expect(result.success).toBe(true)
  expect(result.toolsUsed).toContain("get_balance")

  const content = result.finalResult

  // Should contain balance information
  expect(content).toMatch(/balance.*:?\s*\d+(\.\d+)?/i)

  if (expectedCurrency) {
    expect(content).toMatch(new RegExp(`\\d+(\\.\\d+)?\\s*${expectedCurrency}`, "i"))
  }

  // Should contain raw wei amount for ETH
  if (!expectedCurrency || expectedCurrency.toLowerCase() === "eth") {
    expect(content).toMatch(/raw.*:?\s*\d+\s*wei/i)
  }
}

/**
 * Validate transaction output format matches documentation
 */
export function validateTransactionFormat(result: TestResult): void {
  expect(result.success).toBe(true)
  expect(result.toolsUsed).toContain("send_transaction")

  const content = result.finalResult

  // Should contain success message
  expect(content).toMatch(/transaction.*sent.*successfully/i)

  // Should contain transaction hash
  expect(content).toMatch(FormatPatterns.TRANSACTION_HASH)
}

/**
 * Validate token balance format matches documentation
 */
export function validateTokenBalanceFormat(result: TestResult, tokenSymbol: string): void {
  expect(result.success).toBe(true)
  expect(result.toolsUsed).toContain("get_token_balance")

  const content = result.finalResult

  // Should contain token balance header
  expect(content).toMatch(/token.*balance/i)

  // Should contain amount with token symbol
  expect(content).toMatch(new RegExp(`amount.*:?\\s*\\d+(\\.\\d+)?\\s*${tokenSymbol}`, "i"))

  // Should contain raw amount
  expect(content).toMatch(/raw.*:?\s*\d+/i)

  // Should contain decimals
  expect(content).toMatch(/decimals.*:?\s*\d+/i)
}

/**
 * Validate token info format matches documentation
 */
export function validateTokenInfoFormat(result: TestResult): void {
  expect(result.success).toBe(true)
  expect(result.toolsUsed).toContain("get_token_info")

  const content = result.finalResult

  // Should contain token information header
  expect(content).toMatch(/token.*information/i)

  // Should contain name, symbol, decimals
  expect(content).toMatch(/name.*:/i)
  expect(content).toMatch(/symbol.*:/i)
  expect(content).toMatch(/decimals.*:/i)
}

/**
 * Validate chain switch format matches documentation
 */
export function validateChainSwitchFormat(
  result: TestResult,
  chainName?: string,
  chainId?: number,
): void {
  expect(result.success).toBe(true)
  expect(result.toolsUsed).toContain("switch_chain")

  const content = result.finalResult

  // Should contain switch success message
  expect(content).toMatch(/switched.*to/i)

  if (chainName) {
    expect(content).toMatch(new RegExp(chainName, "i"))
  }

  if (chainId) {
    expect(content).toMatch(new RegExp(`chain.*id.*:?\\s*${chainId}`, "i"))
  }
}

/**
 * Pre-defined documentation examples from key sections
 */
export const DOCUMENTATION_EXAMPLES = {
  QUICK_START: {
    GET_WALLET_INFO: {
      prompt: "Get wallet info",
      expectedOutput: {
        format: FormatPatterns.CONNECTED_WALLET,
        contains: ["current wallet configuration", "type", "available addresses"],
        structure: {
          type: "mock",
          addresses: ["0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"],
        },
      },
      expectedTools: ["get_wallet_info"],
      description: "Check wallet configuration and status",
      source: "docs/getting-started/quick-start.md:14",
      section: "Step 1: Check Your Setup",
    } as DocumentationExample,

    CHECK_BALANCE: {
      prompt: "Check my balance",
      expectedOutput: {
        format: FormatPatterns.ETH_BALANCE,
        contains: ["balance", "eth", "wei"],
      },
      expectedTools: ["get_balance"],
      description: "Verify wallet balance",
      source: "docs/getting-started/quick-start.md:55",
      section: "Step 3: Check Your Balance",
    } as DocumentationExample,

    SEND_ETH: {
      prompt: "Send 1 ETH to 0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      expectedOutput: {
        format: FormatPatterns.TRANSACTION_SUCCESS,
        contains: ["transaction sent successfully", "hash"],
      },
      expectedTools: ["send_transaction"],
      description: "Send ETH transaction",
      source: "docs/getting-started/quick-start.md:69",
      section: "Step 4: Send Your First Transaction",
    } as DocumentationExample,

    SWITCH_POLYGON: {
      prompt: "Switch to Polygon",
      expectedOutput: {
        format: /switched.*to.*polygon.*chain.*id.*:?\s*137/i,
        contains: ["switched", "polygon", "137"],
      },
      expectedTools: ["switch_chain"],
      description: "Switch to Polygon network",
      source: "docs/getting-started/quick-start.md:85",
      section: "Step 5: Switch Chains",
    } as DocumentationExample,
  },
}
