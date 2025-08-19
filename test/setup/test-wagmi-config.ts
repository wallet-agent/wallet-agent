// Wagmi config for test contracts
export const StorageABI = [
  {
    inputs: [],
    name: "retrieve",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "num", type: "uint256" }],
    name: "store",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// This format is what the wallet-agent expects from Wagmi configs
export const StorageAddress = {} as const;
