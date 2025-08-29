export const counterContract = {
  abi: [
    {
      inputs: [],
      name: "decrementCounter",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "getCount",
      outputs: [
        {
          internalType: "int256",
          name: "",
          type: "int256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "incrementCounter",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
  address: {
    31337: "0x84ea74d481ee0a5332c457a4d796187f6ba67feb",
  },
} as const
