#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
	CallToolRequestSchema,
	ErrorCode,
	ListResourcesRequestSchema,
	ListToolsRequestSchema,
	McpError,
	ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { mock } from "@wagmi/connectors";
import {
	connect,
	createConfig,
	disconnect,
	getAccount,
	getBalance,
	sendTransaction,
	signMessage,
	signTypedData,
	switchChain,
} from "@wagmi/core";
import { type Address, formatEther, http, parseEther } from "viem";
import { mainnet, polygon, sepolia } from "viem/chains";

// Initialize mock accounts
const mockAccounts = [
	"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
	"0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
	"0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
] as const satisfies readonly Address[];

// Create Wagmi config with mock connector
const config = createConfig({
	chains: [mainnet, sepolia, polygon],
	connectors: [
		mock({
			accounts: mockAccounts,
			features: {
				reconnect: true,
			},
		}),
	],
	transports: {
		[mainnet.id]: http(),
		[sepolia.id]: http(),
		[polygon.id]: http(),
	},
});

// Server state
let connectedAddress: Address | undefined;
let currentChainId: number = mainnet.id;

// Create MCP server
const server = new Server(
	{
		name: "mcp-wallet",
		version: "0.1.0",
	},
	{
		capabilities: {
			tools: {},
			resources: {},
		},
	},
);

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
	return {
		tools: [
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
								"Chain ID to switch to (1 for mainnet, 11155111 for sepolia, 137 for polygon)",
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
		],
	};
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
	const { name, arguments: args = {} } = request.params;

	try {
		switch (name) {
			case "connect_wallet": {
				const address = args.address as Address;
				const isValidAccount = mockAccounts.some(
					(account) => account.toLowerCase() === address.toLowerCase(),
				);
				if (!isValidAccount) {
					throw new McpError(
						ErrorCode.InvalidParams,
						`Address ${address} is not in the list of mock accounts`,
					);
				}

				const connector = config.connectors[0];
				if (!connector) {
					throw new McpError(ErrorCode.InternalError, "No connector available");
				}
				const result = await connect(config, {
					connector,
				});
				connectedAddress = address;

				return {
					content: [
						{
							type: "text",
							text: `Connected to wallet: ${address}\nChain: ${result.chainId}`,
						},
					],
				};
			}

			case "disconnect_wallet": {
				await disconnect(config);
				connectedAddress = undefined;

				return {
					content: [
						{
							type: "text",
							text: "Wallet disconnected",
						},
					],
				};
			}

			case "get_accounts": {
				return {
					content: [
						{
							type: "text",
							text: `Available mock accounts:\n${mockAccounts.join("\n")}`,
						},
					],
				};
			}

			case "get_current_account": {
				const account = getAccount(config);

				return {
					content: [
						{
							type: "text",
							text: account.isConnected
								? `Connected: ${account.address}\nChain ID: ${account.chainId}\nConnector: ${account.connector?.name}`
								: "No wallet connected",
						},
					],
				};
			}

			case "sign_message": {
				if (!connectedAddress) {
					throw new McpError(ErrorCode.InvalidRequest, "No wallet connected");
				}

				const message = args.message as string;
				const signature = await signMessage(config, { message });

				return {
					content: [
						{
							type: "text",
							text: `Message signed successfully\nSignature: ${signature}`,
						},
					],
				};
			}

			case "sign_typed_data": {
				if (!connectedAddress) {
					throw new McpError(ErrorCode.InvalidRequest, "No wallet connected");
				}

				const signature = await signTypedData(config, {
					domain: args.domain as Record<string, unknown>,
					types: args.types as Record<string, unknown>,
					primaryType: args.primaryType as string,
					message: args.message as Record<string, unknown>,
				});

				return {
					content: [
						{
							type: "text",
							text: `Typed data signed successfully\nSignature: ${signature}`,
						},
					],
				};
			}

			case "send_transaction": {
				if (!connectedAddress) {
					throw new McpError(ErrorCode.InvalidRequest, "No wallet connected");
				}

				const to = args.to as Address;
				const value = parseEther(args.value as string);
				const data = args.data as `0x${string}` | undefined;

				const hash = await sendTransaction(config, {
					to,
					value,
					data,
				});

				return {
					content: [
						{
							type: "text",
							text: `Transaction sent successfully\nHash: ${hash}`,
						},
					],
				};
			}

			case "switch_chain": {
				const chainId = args.chainId as number;
				await switchChain(config, { chainId: chainId as 1 | 11155111 | 137 });
				currentChainId = chainId;

				return {
					content: [
						{
							type: "text",
							text: `Switched to chain ID: ${chainId}`,
						},
					],
				};
			}

			case "get_balance": {
				const address = (args.address as Address) || connectedAddress;
				if (!address) {
					throw new McpError(
						ErrorCode.InvalidRequest,
						"No address provided and no wallet connected",
					);
				}

				const balance = await getBalance(config, {
					address,
					chainId: currentChainId as 1 | 11155111 | 137,
				});

				return {
					content: [
						{
							type: "text",
							text: `Balance: ${formatEther(balance.value)} ETH`,
						},
					],
				};
			}

			default:
				throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
		}
	} catch (error) {
		if (error instanceof McpError) {
			throw error;
		}
		throw new McpError(
			ErrorCode.InternalError,
			`Tool execution failed: ${error}`,
		);
	}
});

// Handle resource listing
server.setRequestHandler(ListResourcesRequestSchema, async () => {
	return {
		resources: [
			{
				uri: "wallet://state",
				name: "Wallet State",
				description: "Current wallet connection state and information",
				mimeType: "application/json",
			},
			{
				uri: "wallet://chains",
				name: "Supported Chains",
				description: "List of supported blockchain networks",
				mimeType: "application/json",
			},
		],
	};
});

// Handle resource reading
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
	const { uri } = request.params;

	switch (uri) {
		case "wallet://state": {
			const account = getAccount(config);
			return {
				contents: [
					{
						uri,
						mimeType: "application/json",
						text: JSON.stringify(
							{
								isConnected: account.isConnected,
								address: account.address,
								chainId: account.chainId,
								connector: account.connector?.name,
							},
							null,
							2,
						),
					},
				],
			};
		}

		case "wallet://chains": {
			return {
				contents: [
					{
						uri,
						mimeType: "application/json",
						text: JSON.stringify(
							{
								chains: [
									{ id: mainnet.id, name: mainnet.name },
									{ id: sepolia.id, name: sepolia.name },
									{ id: polygon.id, name: polygon.name },
								],
							},
							null,
							2,
						),
					},
				],
			};
		}

		default:
			throw new McpError(ErrorCode.InvalidRequest, `Unknown resource: ${uri}`);
	}
});

// Start the server
async function main() {
	const transport = new StdioServerTransport();
	await server.connect(transport);
	console.error("MCP Wallet server started");
}

main().catch((error) => {
	console.error("Fatal error:", error);
	process.exit(1);
});
