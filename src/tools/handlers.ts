import type { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { addCustomChain } from "../chains.js";
import { mockAccounts } from "../container.js";
import {
	AddCustomChainArgsSchema,
	ConnectWalletArgsSchema,
	GetBalanceArgsSchema,
	ImportPrivateKeyArgsSchema,
	RemovePrivateKeyArgsSchema,
	SendTransactionArgsSchema,
	SetWalletTypeArgsSchema,
	SignMessageArgsSchema,
	SignTypedDataArgsSchema,
	SwitchChainArgsSchema,
} from "../schemas.js";
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
				try {
					const { address } = ConnectWalletArgsSchema.parse(args);
					const result = await connectWallet(address);
					return {
						content: [
							{
								type: "text",
								text: `Connected to wallet: ${result.address}\nChain: ${result.chainId}`,
							},
						],
					};
				} catch (error) {
					if (error instanceof z.ZodError) {
						throw new McpError(
							ErrorCode.InvalidParams,
							`Invalid arguments: ${error.issues.map((e) => e.message).join(", ")}`,
						);
					}
					throw error;
				}
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
				try {
					const { message } = SignMessageArgsSchema.parse(args);
					const signature = await signWalletMessage(message);
					return {
						content: [
							{
								type: "text",
								text: `Message signed successfully\nSignature: ${signature}`,
							},
						],
					};
				} catch (error) {
					if (error instanceof z.ZodError) {
						throw new McpError(
							ErrorCode.InvalidParams,
							`Invalid arguments: ${error.issues.map((e) => e.message).join(", ")}`,
						);
					}
					throw error;
				}
			}

			case "sign_typed_data": {
				try {
					const validatedArgs = SignTypedDataArgsSchema.parse(args);
					const signature = await signWalletTypedData(validatedArgs);

					return {
						content: [
							{
								type: "text",
								text: `Typed data signed successfully\nSignature: ${signature}`,
							},
						],
					};
				} catch (error) {
					if (error instanceof z.ZodError) {
						throw new McpError(
							ErrorCode.InvalidParams,
							`Invalid arguments: ${error.issues.map((e) => e.message).join(", ")}`,
						);
					}
					throw error;
				}
			}

			case "send_transaction": {
				try {
					const validatedArgs = SendTransactionArgsSchema.parse(args);
					const transactionParams = {
						to: validatedArgs.to,
						value: validatedArgs.value,
						...(validatedArgs.data !== undefined && {
							data: validatedArgs.data,
						}),
					};
					const hash = await sendWalletTransaction(transactionParams);

					return {
						content: [
							{
								type: "text",
								text: `Transaction sent successfully\nHash: ${hash}`,
							},
						],
					};
				} catch (error) {
					if (error instanceof z.ZodError) {
						throw new McpError(
							ErrorCode.InvalidParams,
							`Invalid arguments: ${error.issues.map((e) => e.message).join(", ")}`,
						);
					}
					throw error;
				}
			}

			case "switch_chain": {
				try {
					const { chainId } = SwitchChainArgsSchema.parse(args);
					const result = await switchToChain(chainId);
					return {
						content: [
							{
								type: "text",
								text: `Switched to ${result.chainName} (Chain ID: ${result.chainId})`,
							},
						],
					};
				} catch (error) {
					if (error instanceof z.ZodError) {
						throw new McpError(
							ErrorCode.InvalidParams,
							`Invalid arguments: ${error.issues.map((e) => e.message).join(", ")}`,
						);
					}
					throw error;
				}
			}

			case "get_balance": {
				try {
					const { address } = GetBalanceArgsSchema.parse(args);
					const result = await getWalletBalance(address);
					return {
						content: [
							{
								type: "text",
								text: `Balance: ${result.balance} ${result.symbol}`,
							},
						],
					};
				} catch (error) {
					if (error instanceof z.ZodError) {
						throw new McpError(
							ErrorCode.InvalidParams,
							`Invalid arguments: ${error.issues.map((e) => e.message).join(", ")}`,
						);
					}
					throw error;
				}
			}

			case "add_custom_chain": {
				try {
					const validatedArgs = AddCustomChainArgsSchema.parse(args);
					addCustomChain(
						validatedArgs.chainId,
						validatedArgs.name,
						validatedArgs.rpcUrl,
						validatedArgs.nativeCurrency,
						validatedArgs.blockExplorerUrl,
					);
					return {
						content: [
							{
								type: "text",
								text: `Custom chain added successfully:\n- Chain ID: ${validatedArgs.chainId}\n- Name: ${validatedArgs.name}\n- RPC URL: ${validatedArgs.rpcUrl}\n- Native Currency: ${validatedArgs.nativeCurrency.symbol}`,
							},
						],
					};
				} catch (error) {
					if (error instanceof z.ZodError) {
						throw new McpError(
							ErrorCode.InvalidParams,
							`Invalid arguments: ${error.issues.map((e) => e.message).join(", ")}`,
						);
					}
					throw new McpError(
						ErrorCode.InvalidParams,
						error instanceof Error ? error.message : String(error),
					);
				}
			}

			case "import_private_key": {
				try {
					const { privateKey } = ImportPrivateKeyArgsSchema.parse(args);
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
					if (error instanceof z.ZodError) {
						throw new McpError(
							ErrorCode.InvalidParams,
							`Invalid arguments: ${error.issues.map((e) => e.message).join(", ")}`,
						);
					}
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
				try {
					const { address } = RemovePrivateKeyArgsSchema.parse(args);
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
				} catch (error) {
					if (error instanceof z.ZodError) {
						throw new McpError(
							ErrorCode.InvalidParams,
							`Invalid arguments: ${error.issues.map((e) => e.message).join(", ")}`,
						);
					}
					throw error;
				}
			}

			case "set_wallet_type": {
				try {
					const { type } = SetWalletTypeArgsSchema.parse(args);
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
					if (error instanceof z.ZodError) {
						throw new McpError(
							ErrorCode.InvalidParams,
							`Invalid arguments: ${error.issues.map((e) => e.message).join(", ")}`,
						);
					}
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
