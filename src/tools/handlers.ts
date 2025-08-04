import type { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import type { Address } from "viem";
import { z } from "zod";
import { addCustomChain } from "../chains.js";
import { getContainer, mockAccounts } from "../container.js";
import {
	listContracts,
	loadWagmiConfig,
	readContract,
	writeContract,
} from "../contract-operations.js";
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
					
					// Provide feedback about how the key was loaded
					let sourceInfo = "";
					if (privateKey.startsWith("0x")) {
						sourceInfo = "Direct private key";
					} else if (privateKey.includes("/") || privateKey.startsWith("~")) {
						sourceInfo = `File: ${privateKey}`;
					} else {
						sourceInfo = `Environment variable: ${privateKey}`;
					}
					
					return {
						content: [
							{
								type: "text",
								text: `✅ Private key imported successfully!\n\nSource: ${sourceInfo}\nAddress: ${address}\n\n🔐 Private key is stored securely in memory only.\n\nNext steps:\n1. Use 'set_wallet_type' with type "privateKey" \n2. Connect to this address to start using your wallet`,
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

			case "load_wagmi_config": {
				try {
					const { filePath } = z
						.object({
							filePath: z.string(),
						})
						.parse(args);
					await loadWagmiConfig(filePath);
					const contracts = listContracts();
					return {
						content: [
							{
								type: "text",
								text: `Loaded ${contracts.length} contracts from ${filePath}:\n${contracts.map((c) => `- ${c.name} (chains: ${c.chains.join(", ")})`).join("\n")}`,
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

			case "list_contracts": {
				const contracts = listContracts();
				if (contracts.length === 0) {
					return {
						content: [
							{
								type: "text",
								text: "No contracts loaded. Use 'load_wagmi_config' to load contracts from a Wagmi-generated file.",
							},
						],
					};
				}
				return {
					content: [
						{
							type: "text",
							text: `Available contracts:\n${contracts.map((c) => `- ${c.name} (chains: ${c.chains.length > 0 ? c.chains.join(", ") : "no addresses configured"})`).join("\n")}`,
						},
					],
				};
			}

			case "write_contract": {
				try {
					const {
						contract,
						address,
						function: functionName,
						args: functionArgs,
						value,
					} = z
						.object({
							contract: z.string(),
							address: z.string().optional(),
							function: z.string(),
							args: z.array(z.unknown()).optional(),
							value: z.string().optional(),
						})
						.parse(args);

					const hash = await writeContract({
						contract,
						function: functionName,
						...(address && { address: address as Address }),
						...(functionArgs && { args: functionArgs }),
						...(value && { value }),
					});

					return {
						content: [
							{
								type: "text",
								text: `Transaction sent successfully!\nHash: ${hash}`,
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

			case "read_contract": {
				try {
					const {
						contract,
						address,
						function: functionName,
						args: functionArgs,
					} = z
						.object({
							contract: z.string(),
							address: z.string().optional(),
							function: z.string(),
							args: z.array(z.unknown()).optional(),
						})
						.parse(args);

					const result = await readContract({
						contract,
						function: functionName,
						...(address && { address: address as Address }),
						...(functionArgs && { args: functionArgs }),
					});

					return {
						content: [
							{
								type: "text",
								text: `Contract read result: ${JSON.stringify(result, null, 2)}`,
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

			case "transfer_token": {
				try {
					const { token, to, amount } = z
						.object({
							token: z.string(),
							to: z.string(),
							amount: z.string(),
						})
						.parse(args);

					const container = getContainer();
					const hash = await container.tokenEffects.transferToken({
						token,
						to: to as Address,
						amount,
					});

					return {
						content: [
							{
								type: "text",
								text: `Token transfer successful!\nHash: ${hash}`,
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

			case "approve_token": {
				try {
					const { token, spender, amount } = z
						.object({
							token: z.string(),
							spender: z.string(),
							amount: z.string(),
						})
						.parse(args);

					const container = getContainer();
					const hash = await container.tokenEffects.approveToken({
						token,
						spender: spender as Address,
						amount,
					});

					return {
						content: [
							{
								type: "text",
								text: `Token approval successful!\nHash: ${hash}`,
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

			case "get_token_balance": {
				try {
					const { token, address } = z
						.object({
							token: z.string(),
							address: z.string().optional(),
						})
						.parse(args);

					const container = getContainer();
					const result = await container.tokenEffects.getTokenBalance({
						token,
						...(address && { address: address as Address }),
					});

					return {
						content: [
							{
								type: "text",
								text: `Token Balance: ${result.balance} ${result.symbol}\nDecimals: ${result.decimals}\nRaw: ${result.balanceRaw}`,
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

			case "get_token_info": {
				try {
					const { token } = z
						.object({
							token: z.string(),
						})
						.parse(args);

					const container = getContainer();
					const info = await container.tokenEffects.getTokenInfo(token);

					return {
						content: [
							{
								type: "text",
								text: `Token Information:\nName: ${info.name}\nSymbol: ${info.symbol}\nDecimals: ${info.decimals}\nAddress: ${info.address}\nWell-known: ${info.isWellKnown ? "Yes" : "No"}`,
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

			case "transfer_nft": {
				try {
					const { nft, to, tokenId } = z
						.object({
							nft: z.string(),
							to: z.string(),
							tokenId: z.string(),
						})
						.parse(args);

					const container = getContainer();
					const hash = await container.tokenEffects.transferNFT({
						nft,
						to: to as Address,
						tokenId,
					});

					return {
						content: [
							{
								type: "text",
								text: `NFT transfer successful!\nHash: ${hash}`,
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

			case "get_nft_owner": {
				try {
					const { nft, tokenId } = z
						.object({
							nft: z.string(),
							tokenId: z.string(),
						})
						.parse(args);

					const container = getContainer();
					const owner = await container.tokenEffects.getNFTOwner({
						nft,
						tokenId,
					});

					return {
						content: [
							{
								type: "text",
								text: `NFT Owner: ${owner}`,
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

			case "get_nft_info": {
				try {
					const { nft, tokenId } = z
						.object({
							nft: z.string(),
							tokenId: z.string().optional(),
						})
						.parse(args);

					const container = getContainer();
					const info = await container.tokenEffects.getNFTInfo({
						nft,
						...(tokenId && { tokenId }),
					});

					return {
						content: [
							{
								type: "text",
								text: `NFT Information:\nName: ${info.name}\nSymbol: ${info.symbol}${info.tokenURI ? `\nToken URI: ${info.tokenURI}` : ""}`,
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
