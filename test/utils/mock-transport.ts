import type { Transport } from "viem";

export interface MockResponse {
  result?: any;
  error?: string;
}

export type MockResponses = Map<string, MockResponse | any>;

/**
 * Create a mock transport for testing
 * @param customResponses - Custom responses to override defaults
 */
export function createMockTransport(
  customResponses?: MockResponses,
): Transport {
  // Default responses for common RPC methods
  const defaultResponses: MockResponses = new Map([
    ["eth_chainId", "0x7a69"], // 31337 (Anvil chain ID)
    ["eth_blockNumber", "0x0"],
    ["net_version", "31337"],
    ["eth_accounts", []],
    ["eth_getBalance", "0x0"],
    ["eth_getCode", "0x"], // No contract deployed by default
    ["eth_gasPrice", "0x4a817c800"], // 20 gwei
    ["eth_estimateGas", "0x5208"], // 21000 gas
    ["eth_getTransactionCount", "0x0"],
    [
      "eth_getBlockByNumber",
      {
        number: "0x0",
        timestamp: "0x0",
        baseFeePerGas: "0x3b9aca00", // 1 gwei
      },
    ],
    ["eth_call", { error: "execution reverted" }], // Default to revert
  ]);

  // Merge custom responses with defaults
  const allResponses = new Map([
    ...defaultResponses,
    ...(customResponses || []),
  ]);

  // Return a transport function
  return () => ({
    request: async ({ method, params }: { method: string; params?: any[] }) => {
      // Check if we have a response for this method
      const response = allResponses.get(method);

      if (response === undefined) {
        throw new Error(`Mock transport: Unsupported method ${method}`);
      }

      // Handle error responses
      if (typeof response === "object" && response.error) {
        throw new Error(response.error);
      }

      // Return the mocked response
      return response;
    },
  });
}

/**
 * Helper to create mock responses for specific contract calls
 */
export function mockContractCall(
  contractAddress: string,
  functionSelector: string,
  returnValue: string | { error: string },
): [string, (params: any[]) => string] {
  return [
    "eth_call",
    (params: any[]) => {
      const [callData] = params;
      if (
        (contractAddress === "*" ||
          callData.to?.toLowerCase() === contractAddress.toLowerCase()) &&
        callData.data?.startsWith(functionSelector)
      ) {
        if (typeof returnValue === "object" && returnValue.error) {
          throw new Error(returnValue.error);
        }
        return returnValue;
      }
      throw new Error("execution reverted");
    },
  ];
}

/**
 * Common mock response presets
 */
export const MockPresets = {
  // Mock responses for a non-existent contract
  noContract: (): MockResponses =>
    new Map([
      ["eth_getCode", "0x"],
      ["eth_call", { error: "execution reverted" }],
    ]),

  // Mock responses for an address with no contract that properly handles calls
  noContractWithProperError: (address?: string): MockResponses =>
    new Map([
      ["eth_getCode", "0x"],
      [
        "eth_call",
        (params: any[]) => {
          // Return error that indicates no data returned
          throw new Error("execution reverted: returned no data");
        },
      ],
    ]),

  // Mock responses for an ERC20 token
  erc20Token: (decimals = 18): MockResponses =>
    new Map([
      ["eth_getCode", "0x606060405260043610610041576000"], // Some bytecode
      mockContractCall(
        "*",
        "0x313ce567",
        `0x${decimals.toString(16).padStart(64, "0")}`,
      ), // decimals()
      mockContractCall("*", "0x06fdde03", "0x" + "0".repeat(64)), // name()
      mockContractCall("*", "0x95d89b41", "0x" + "0".repeat(64)), // symbol()
      mockContractCall("*", "0x70a08231", "0x" + "0".repeat(64)), // balanceOf()
    ]),

  // Mock responses for transaction operations
  transactionSuccess: (txHash: string): MockResponses =>
    new Map([
      ["eth_sendRawTransaction", txHash],
      ["eth_sendTransaction", txHash],
      [
        "eth_getTransactionByHash",
        {
          hash: txHash,
          blockNumber: "0x1",
          from: "0x0000000000000000000000000000000000000000",
          to: "0x0000000000000000000000000000000000000000",
          value: "0x0",
        },
      ],
      [
        "eth_getTransactionReceipt",
        {
          transactionHash: txHash,
          blockNumber: "0x1",
          status: "0x1",
          gasUsed: "0x5208",
        },
      ],
    ]),
};
