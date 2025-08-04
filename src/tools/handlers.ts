import type { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import type { Address } from "viem";
import { addCustomChain, mockAccounts } from "../chains.js";
import { signWalletMessage, signWalletTypedData } from "../signing.js";
import { sendWalletTransaction, switchToChain } from "../transactions.js";
import {
	connectWallet,
	disconnectWallet,
	getCurrentAccount,
	getWalletBalance,
} from "../wallet.js";
import {
	getCurrentWalletInfo,
	importPrivateKey,
	listImportedWallets,
	removePrivateKey,
	setWalletType,
} from "../wallet-manager.js";

export async function handleToolCall(request: CallToolRequest) {
	const { name, arguments: args = {} } = request.params;

	try {
		switch (name) {
			case "connect_wallet": {
				const address = args.address as Address;
				const result = await connectWallet(address);
				return {
					content: [
						{
							type: "text",
							text: `Connected to wallet: ${result.address}\nChain: ${result.chainId}`,
						},
					],
				};
			}

			case "disconnect_wallet": {
				await disconnectWallet();
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
				const account = getCurrentAccount();
				return {
					content: [
						{
							type: "text",
							text: account.isConnected
								? `Connected: ${account.address}\nChain ID: ${account.chainId}\nConnector: ${account.connector}`
								: "No wallet connected",
						},
					],
				};
			}

			case "sign_message": {
				const message = args.message as string;
				const signature = await signWalletMessage(message);
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
				const signature = await signWalletTypedData({
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
				const transactionParams: {
					to: Address;
					value: string;
					data?: `0x${string}`;
				} = {
					to: args.to as Address,
					value: args.value as string,
				};

				if (args.data) {
					transactionParams.data = args.data as `0x${string}`;
				}

				const hash = await sendWalletTransaction(transactionParams);

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
				const result = await switchToChain(chainId);
				return {
					content: [
						{
							type: "text",
							text: `Switched to ${result.chainName} (Chain ID: ${result.chainId})`,
						},
					],
				};
			}

			case "get_balance": {
				const result = await getWalletBalance(
					args.address as Address | undefined,
				);
				return {
					content: [
						{
							type: "text",
							text: `Balance: ${result.balance} ${result.symbol}`,
						},
					],
				};
			}

			case "add_custom_chain": {
				const chainId = args.chainId as number;
				const name = args.name as string;
				const rpcUrl = args.rpcUrl as string;
				const nativeCurrency = args.nativeCurrency as {
					name: string;
					symbol: string;
					decimals: number;
				};
				const blockExplorerUrl = args.blockExplorerUrl as string | undefined;

				try {
					addCustomChain(
						chainId,
						name,
						rpcUrl,
						nativeCurrency,
						blockExplorerUrl,
					);
					return {
						content: [
							{
								type: "text",
								text: `Custom chain added successfully:\n- Chain ID: ${chainId}\n- Name: ${name}\n- RPC URL: ${rpcUrl}\n- Native Currency: ${nativeCurrency.symbol}`,
							},
						],
					};
				} catch (error) {
					throw new McpError(
						ErrorCode.InvalidParams,
						error instanceof Error ? error.message : String(error),
					);
				}
			}

			case "import_private_key": {
				const privateKey = args.privateKey as `0x${string}`;
				try {
					const address = importPrivateKey(privateKey);
					return {
						content: [
							{
								type: "text",
								text: `Private key imported successfully\nAddress: ${address}\n\nUse 'set_wallet_type' with type "privateKey" to use this wallet.`,
							},
						],
					};
				} catch (error) {
					throw new McpError(
						ErrorCode.InvalidParams,
						error instanceof Error ? error.message : String(error),
					);
				}
			}

			case "list_imported_wallets": {
				const wallets = listImportedWallets();
				if (wallets.length === 0) {
					return {
						content: [
							{
								type: "text",
								text: "No private key wallets imported.",
							},
						],
					};
				}
				return {
					content: [
						{
							type: "text",
							text: `Imported wallets:\n${wallets.map((w) => `- ${w.address} (${w.type})`).join("\n")}`,
						},
					],
				};
			}

			case "remove_private_key": {
				const address = args.address as Address;
				const removed = removePrivateKey(address);
				return {
					content: [
						{
							type: "text",
							text: removed
								? `Private key removed for address: ${address}`
								: `No private key found for address: ${address}`,
						},
					],
				};
			}

			case "set_wallet_type": {
				const type = args.type as "mock" | "privateKey";
				try {
					setWalletType(type);
					return {
						content: [
							{
								type: "text",
								text: `Wallet type set to: ${type}`,
							},
						],
					};
				} catch (error) {
					throw new McpError(
						ErrorCode.InvalidParams,
						error instanceof Error ? error.message : String(error),
					);
				}
			}

			case "get_wallet_info": {
				const info = getCurrentWalletInfo();
				return {
					content: [
						{
							type: "text",
							text: `Current wallet configuration:\n- Type: ${info.type}\n- Available addresses: ${info.availableAddresses.length}\n${info.availableAddresses.map((addr) => `  - ${addr}`).join("\n")}`,
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
}
