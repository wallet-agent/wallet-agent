// Minimal working contracts with verified bytecode

export const MINIMAL_STORAGE = {
  abi: [
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
  ],
  // This is the bytecode for the Remix default contract
  // pragma solidity >=0.7.0 <0.9.0;
  // contract Storage {
  //     uint256 number;
  //     function store(uint256 num) public {
  //         number = num;
  //     }
  //     function retrieve() public view returns (uint256){
  //         return number;
  //     }
  // }
  bytecode:
    "0x608060405234801561001057600080fd5b50610150806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80632e64cec11461003b5780636057361d14610059575b600080fd5b610043610075565b60405161005091906100a1565b60405180910390f35b610073600480360381019061006e91906100ed565b61007e565b005b60008054905090565b8060008190555050565b6000819050919050565b61009b81610088565b82525050565b60006020820190506100b66000830184610092565b92915050565b600080fd5b6100ca81610088565b81146100d557600080fd5b50565b6000813590506100e7816100c1565b92915050565b600060208284031215610103576101026100bc565b5b6000610111848285016100d8565b9150509291505056fea2646970667358221220404e37f487a89a932dca5e77faaf6ca2de3b991f93e5ae9095e293939e2fce9964736f6c63430008120033",
} as const;
