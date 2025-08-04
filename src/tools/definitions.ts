import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export const toolDefinitions: Tool[] = [
  {
    name: "connect_wallet",
    description: "Connect to a wallet using the specified address",
    inputSchema: {
      type: "object",
      properties: {
        address: {
          type: "string",
          description:
            "The wallet address to connect (must be one of the mock accounts)",
        },
      },
      required: ["address"],
    },
  },
  {
    name: "disconnect_wallet",
    description: "Disconnect the currently connected wallet",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_accounts",
    description: "Get the list of available mock accounts",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_current_account",
    description: "Get the currently connected account information",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "sign_message",
    description: "Sign a message with the connected wallet",
    inputSchema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: "The message to sign",
        },
      },
      required: ["message"],
    },
  },
  {
    name: "sign_typed_data",
    description: "Sign EIP-712 typed data",
    inputSchema: {
      type: "object",
      properties: {
        domain: {
          type: "object",
          description: "EIP-712 domain",
        },
        types: {
          type: "object",
          description: "EIP-712 types",
        },
        primaryType: {
          type: "string",
          description: "Primary type name",
        },
        message: {
          type: "object",
          description: "Message to sign",
        },
      },
      required: ["domain", "types", "primaryType", "message"],
    },
  },
  {
    name: "send_transaction",
    description: "Send a transaction",
    inputSchema: {
      type: "object",
      properties: {
        to: {
          type: "string",
          description: "Recipient address",
        },
        value: {
          type: "string",
          description: "Value to send in ETH",
        },
        data: {
          type: "string",
          description: "Transaction data (optional)",
        },
      },
      required: ["to", "value"],
    },
  },
  {
    name: "switch_chain",
    description: "Switch to a different chain",
    inputSchema: {
      type: "object",
      properties: {
        chainId: {
          type: "number",
          description:
            "Chain ID to switch to (1 for mainnet, 11155111 for sepolia, 137 for polygon, 31337 for anvil)",
        },
      },
      required: ["chainId"],
    },
  },
  {
    name: "get_balance",
    description: "Get the balance of an address",
    inputSchema: {
      type: "object",
      properties: {
        address: {
          type: "string",
          description:
            "Address to check balance for (defaults to connected account)",
        },
      },
    },
  },
  {
    name: "add_custom_chain",
    description: "Add a custom EVM-compatible blockchain network",
    inputSchema: {
      type: "object",
      properties: {
        chainId: {
          type: "number",
          description: "Unique chain ID for the network",
        },
        name: {
          type: "string",
          description: "Name of the blockchain network",
        },
        rpcUrl: {
          type: "string",
          description: "RPC endpoint URL (e.g., https://rpc.example.com)",
        },
        nativeCurrency: {
          type: "object",
          description: "Native currency configuration",
          properties: {
            name: {
              type: "string",
              description: "Currency name (e.g., 'Ether')",
            },
            symbol: {
              type: "string",
              description: "Currency symbol (e.g., 'ETH')",
            },
            decimals: {
              type: "number",
              description: "Number of decimals (usually 18)",
            },
          },
          required: ["name", "symbol", "decimals"],
        },
        blockExplorerUrl: {
          type: "string",
          description: "Block explorer URL (optional)",
        },
      },
      required: ["chainId", "name", "rpcUrl", "nativeCurrency"],
    },
  },
  {
    name: "update_custom_chain",
    description: "Update an existing custom chain's configuration",
    inputSchema: {
      type: "object",
      properties: {
        chainId: {
          type: "number",
          description: "Chain ID of the custom chain to update",
        },
        name: {
          type: "string",
          description: "New name for the blockchain network (optional)",
        },
        rpcUrl: {
          type: "string",
          description: "New RPC endpoint URL (optional)",
        },
        nativeCurrency: {
          type: "object",
          description: "New native currency configuration (optional)",
          properties: {
            name: {
              type: "string",
              description: "Currency name (e.g., 'Ether')",
            },
            symbol: {
              type: "string",
              description: "Currency symbol (e.g., 'ETH')",
            },
            decimals: {
              type: "number",
              description: "Number of decimals (usually 18)",
            },
          },
          required: ["name", "symbol", "decimals"],
        },
        blockExplorerUrl: {
          type: "string",
          description: "New block explorer URL (optional)",
        },
      },
      required: ["chainId"],
    },
  },
  {
    name: "import_private_key",
    description:
      "Import a private key to use as a real wallet (supports environment variables and file paths for security)",
    inputSchema: {
      type: "object",
      properties: {
        privateKey: {
          type: "string",
          description:
            "Private key starting with 0x, OR environment variable name (e.g., 'WALLET_PRIVATE_KEY'), OR file path (e.g., '~/.wallet-private-key')",
        },
      },
      required: ["privateKey"],
    },
  },
  {
    name: "list_imported_wallets",
    description: "List all imported private key wallets",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "remove_private_key",
    description: "Remove an imported private key",
    inputSchema: {
      type: "object",
      properties: {
        address: {
          type: "string",
          description: "Address of the wallet to remove",
        },
      },
      required: ["address"],
    },
  },
  {
    name: "set_wallet_type",
    description: "Switch between mock and private key wallets",
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["mock", "privateKey"],
          description: "Wallet type to use",
        },
      },
      required: ["type"],
    },
  },
  {
    name: "get_wallet_info",
    description: "Get current wallet configuration info",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "load_wagmi_config",
    description: "Load contract ABIs from a Wagmi-generated file",
    inputSchema: {
      type: "object",
      properties: {
        filePath: {
          type: "string",
          description:
            "Path to the Wagmi generated file (e.g., './src/generated.ts')",
        },
      },
      required: ["filePath"],
    },
  },
  {
    name: "list_contracts",
    description: "List all available contracts from Wagmi config",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "write_contract",
    description: "Write to a smart contract using Wagmi-generated ABIs",
    inputSchema: {
      type: "object",
      properties: {
        contract: {
          type: "string",
          description: "Contract name from Wagmi config",
        },
        address: {
          type: "string",
          description:
            "Contract address (optional if address is in Wagmi config for current chain)",
        },
        function: {
          type: "string",
          description: "Function name to call",
        },
        args: {
          type: "array",
          description: "Function arguments",
          items: {},
        },
        value: {
          type: "string",
          description: "ETH value to send with transaction (optional)",
        },
      },
      required: ["contract", "function"],
    },
  },
  {
    name: "read_contract",
    description: "Read from a smart contract using Wagmi-generated ABIs",
    inputSchema: {
      type: "object",
      properties: {
        contract: {
          type: "string",
          description: "Contract name from Wagmi config",
        },
        address: {
          type: "string",
          description:
            "Contract address (optional if address is in Wagmi config for current chain)",
        },
        function: {
          type: "string",
          description: "Function name to call",
        },
        args: {
          type: "array",
          description: "Function arguments",
          items: {},
        },
      },
      required: ["contract", "function"],
    },
  },
  {
    name: "transfer_token",
    description: "Transfer ERC-20 tokens to another address",
    inputSchema: {
      type: "object",
      properties: {
        token: {
          type: "string",
          description: "Token contract name, symbol (USDC), or address",
        },
        to: {
          type: "string",
          description: "Recipient address",
        },
        amount: {
          type: "string",
          description:
            "Amount to transfer (in token units, e.g., '100' for 100 USDC)",
        },
      },
      required: ["token", "to", "amount"],
    },
  },
  {
    name: "approve_token",
    description: "Approve ERC-20 token spending",
    inputSchema: {
      type: "object",
      properties: {
        token: {
          type: "string",
          description: "Token contract name, symbol (USDC), or address",
        },
        spender: {
          type: "string",
          description: "Address to approve for spending",
        },
        amount: {
          type: "string",
          description:
            "Amount to approve (in token units, or 'max' for unlimited)",
        },
      },
      required: ["token", "spender", "amount"],
    },
  },
  {
    name: "get_token_balance",
    description: "Get ERC-20 token balance",
    inputSchema: {
      type: "object",
      properties: {
        token: {
          type: "string",
          description: "Token contract name, symbol (USDC), or address",
        },
        address: {
          type: "string",
          description:
            "Address to check balance for (defaults to connected wallet)",
        },
      },
      required: ["token"],
    },
  },
  {
    name: "get_token_info",
    description: "Get ERC-20 token information (name, symbol, decimals)",
    inputSchema: {
      type: "object",
      properties: {
        token: {
          type: "string",
          description: "Token contract name, symbol (USDC), or address",
        },
      },
      required: ["token"],
    },
  },
  {
    name: "transfer_nft",
    description: "Transfer an ERC-721 NFT to another address",
    inputSchema: {
      type: "object",
      properties: {
        nft: {
          type: "string",
          description: "NFT contract name or address",
        },
        to: {
          type: "string",
          description: "Recipient address",
        },
        tokenId: {
          type: "string",
          description: "Token ID to transfer",
        },
      },
      required: ["nft", "to", "tokenId"],
    },
  },
  {
    name: "get_nft_owner",
    description: "Get the owner of an ERC-721 NFT",
    inputSchema: {
      type: "object",
      properties: {
        nft: {
          type: "string",
          description: "NFT contract name or address",
        },
        tokenId: {
          type: "string",
          description: "Token ID to check",
        },
      },
      required: ["nft", "tokenId"],
    },
  },
  {
    name: "get_nft_info",
    description: "Get ERC-721 NFT information (name, symbol, tokenURI)",
    inputSchema: {
      type: "object",
      properties: {
        nft: {
          type: "string",
          description: "NFT contract name or address",
        },
        tokenId: {
          type: "string",
          description: "Token ID (optional for name/symbol)",
        },
      },
      required: ["nft"],
    },
  },
];
