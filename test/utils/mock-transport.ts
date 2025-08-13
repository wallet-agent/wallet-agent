import type { Transport } from "viem";

export interface MockResponse {
  result?: unknown;
  error?: string;
}

type MockResponseFunction = (params?: unknown[]) => unknown;
export type MockResponses = Map<
  string,
  MockResponse | MockResponseFunction | unknown
>;

/**
 * Create a mock transport for testing
 * @param customResponses - Custom responses to override defaults
 */
export function createMockTransport(
  customResponses?: MockResponses,
): Transport {
  // Default responses for common RPC methods
  const defaultResponses: MockResponses = new Map([
    ["eth_chainId", "0x7a69" as unknown], // 31337 (Anvil chain ID)
    ["eth_blockNumber", "0x0" as unknown],
    ["net_version", "31337" as unknown],
    ["eth_accounts", [] as unknown],
    ["eth_getBalance", "0x0" as unknown],
    ["eth_getCode", "0x" as unknown], // No contract deployed by default
    ["eth_gasPrice", "0x4a817c800" as unknown], // 20 gwei
    ["eth_estimateGas", "0x5208" as unknown], // 21000 gas
    ["eth_getTransactionCount", "0x0" as unknown],
    [
      "eth_getBlockByNumber",
      {
        number: "0x0",
        timestamp: "0x0",
        baseFeePerGas: "0x3b9aca00", // 1 gwei
      } as unknown,
    ],
    ["eth_call", { error: "execution reverted" } as unknown], // Default to revert
  ]);

  // Merge custom responses with defaults
  const allResponses = new Map([
    ...defaultResponses,
    ...(customResponses || []),
  ]);

  // Return a transport function
  return () => ({
    config: {
      key: "mock",
      name: "Mock Transport",
      request: {} as unknown as never,
      retryCount: 3,
      retryDelay: 150,
      timeout: 10_000,
      type: "mock",
    },
    request: async ({
      method,
      params,
    }: {
      method: string;
      params?: unknown;
    }) => {
      // Check if we have a response for this method
      const response = allResponses.get(method);

      if (response === undefined) {
        throw new Error(`Mock transport: Unsupported method ${method}`);
      }

      // Handle function responses
      if (typeof response === "function") {
        return response(params);
      }

      // Handle error responses
      if (typeof response === "object" && response && "error" in response) {
        throw new Error((response as { error: string }).error);
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
): [string, unknown] {
  return [
    "eth_call",
    ((params: unknown[]) => {
      const [callData] = params as [{ to?: string; data?: string }];
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
    }) as unknown,
  ];
}

/**
 * Common mock response presets
 */
export const MockPresets = {
  // Mock responses for a non-existent contract
  noContract: (): MockResponses =>
    new Map([
      ["eth_getCode", "0x" as unknown],
      ["eth_call", { error: "execution reverted" } as unknown],
    ]),

  // Mock responses for an address with no contract that properly handles calls
  noContractWithProperError: (_address?: string): MockResponses =>
    new Map([
      ["eth_getCode", "0x" as unknown],
      [
        "eth_call",
        ((_params: unknown[]) => {
          // Return error that indicates no data returned
          throw new Error("execution reverted: returned no data");
        }) as unknown,
      ],
    ]),

  // Mock responses for an ERC20 token
  erc20Token: (decimals = 18): MockResponses =>
    new Map([
      ["eth_getCode", "0x606060405260043610610041576000" as unknown], // Some bytecode
      mockContractCall(
        "*",
        "0x313ce567",
        `0x${decimals.toString(16).padStart(64, "0")}`,
      ), // decimals()
      mockContractCall("*", "0x06fdde03", `0x${"0".repeat(64)}`), // name()
      mockContractCall("*", "0x95d89b41", `0x${"0".repeat(64)}`), // symbol()
      mockContractCall("*", "0x70a08231", `0x${"0".repeat(64)}`), // balanceOf()
    ]),

  // Mock responses for transaction operations
  transactionSuccess: (txHash: string): MockResponses =>
    new Map([
      ["eth_sendRawTransaction", txHash as unknown],
      ["eth_sendTransaction", txHash as unknown],
      [
        "eth_getTransactionByHash",
        {
          hash: txHash,
          blockNumber: "0x1",
          from: "0x0000000000000000000000000000000000000000",
          to: "0x0000000000000000000000000000000000000000",
          value: "0x0",
        } as unknown,
      ],
      [
        "eth_getTransactionReceipt",
        {
          transactionHash: txHash,
          blockNumber: "0x1",
          status: "0x1",
          gasUsed: "0x5208",
        } as unknown,
      ],
    ]),
};
