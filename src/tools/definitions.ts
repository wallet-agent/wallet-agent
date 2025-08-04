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
		description: "Add a custom blockchain network",
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
		name: "import_private_key",
		description: "Import a private key to use as a real wallet",
		inputSchema: {
			type: "object",
			properties: {
				privateKey: {
					type: "string",
					description:
						"Private key starting with 0x (64 hex characters after 0x)",
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
];
