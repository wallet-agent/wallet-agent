export const counterContract = {
  abi: [
    {
      inputs: [],
      name: "decrementCounter",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [],
      name: "getCount",
      outputs: [
        {
          internalType: "int256",
          name: "",
          type: "int256"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "incrementCounter",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    }
  ],
  address: {
    31337: "0x7a2088a1bfc9d81c55368ae168c2c02570cb814f"
  }
} as const;
