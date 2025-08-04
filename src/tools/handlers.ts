import type { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import type { Address } from "viem";
import { z } from "zod";
import {
  addCustomChain,
  removeCustomChain,
  updateCustomChain,
} from "../chains.js";
import { getContainer, mockAccounts } from "../container.js";
import {
  listContracts,
  loadWagmiConfig,
  readContract,
  writeContract,
} from "../contract-operations.js";
import {
  formatTransactionReceipt,
  formatTransactionStatus,
} from "../core/transaction-helpers.js";
import {
  AddCustomChainArgsSchema,
  AddressSchema,
  ConnectWalletArgsSchema,
  EnsNameSchema,
  EstimateGasArgsSchema,
  GetBalanceArgsSchema,
  ImportPrivateKeyArgsSchema,
  RemoveCustomChainArgsSchema,
  RemovePrivateKeyArgsSchema,
  SendTransactionArgsSchema,
  SetWalletTypeArgsSchema,
  SignMessageArgsSchema,
  SignTypedDataArgsSchema,
  SwitchChainArgsSchema,
  TokenAmountSchema,
  TokenIdSchema,
  TransactionHashSchema,
  UpdateCustomChainArgsSchema,
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
            ErrorCode.InternalError,
            error instanceof Error ? error.message : String(error),
          );
        }
      }

      case "update_custom_chain": {
        try {
          const validatedArgs = UpdateCustomChainArgsSchema.parse(args);
          const updates: Parameters<typeof updateCustomChain>[1] = {};

          if (validatedArgs.name) updates.name = validatedArgs.name;
          if (validatedArgs.rpcUrl) updates.rpcUrl = validatedArgs.rpcUrl;
          if (validatedArgs.nativeCurrency)
            updates.nativeCurrency = validatedArgs.nativeCurrency;
          if (validatedArgs.blockExplorerUrl)
            updates.blockExplorerUrl = validatedArgs.blockExplorerUrl;

          updateCustomChain(validatedArgs.chainId, updates);

          const updatesList = [];
          if (updates.name) updatesList.push(`Name: ${updates.name}`);
          if (updates.rpcUrl) updatesList.push(`RPC URL: ${updates.rpcUrl}`);
          if (updates.nativeCurrency)
            updatesList.push(
              `Native Currency: ${updates.nativeCurrency.symbol}`,
            );
          if (updates.blockExplorerUrl)
            updatesList.push(`Block Explorer: ${updates.blockExplorerUrl}`);

          return {
            content: [
              {
                type: "text",
                text: `Custom chain ${validatedArgs.chainId} updated successfully:\n${updatesList.map((item) => `- ${item}`).join("\n")}`,
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
          // Chain not found errors should be treated as invalid params
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          if (
            errorMessage.includes("not found") &&
            errorMessage.includes("chain")
          ) {
            throw new McpError(ErrorCode.InvalidParams, errorMessage);
          }
          throw new McpError(ErrorCode.InternalError, errorMessage);
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
          // Private key validation errors should be treated as invalid params
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          if (
            errorMessage.includes("Private key must be 32 bytes") ||
            errorMessage.includes("Environment variable") ||
            errorMessage.includes("Invalid private key")
          ) {
            throw new McpError(ErrorCode.InvalidParams, errorMessage);
          }
          throw new McpError(ErrorCode.InternalError, errorMessage);
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
            ErrorCode.InternalError,
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
            ErrorCode.InternalError,
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
            ErrorCode.InternalError,
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
            ErrorCode.InternalError,
            error instanceof Error ? error.message : String(error),
          );
        }
      }

      case "transfer_token": {
        try {
          const { token, to, amount } = z
            .object({
              token: z.string(),
              to: AddressSchema,
              amount: TokenAmountSchema,
            })
            .parse(args);

          const container = getContainer();
          const hash = await container.tokenEffects.transferToken({
            token,
            to,
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
            ErrorCode.InternalError,
            error instanceof Error ? error.message : String(error),
          );
        }
      }

      case "approve_token": {
        try {
          const { token, spender, amount } = z
            .object({
              token: z.string(),
              spender: AddressSchema,
              amount: TokenAmountSchema,
            })
            .parse(args);

          const container = getContainer();
          const hash = await container.tokenEffects.approveToken({
            token,
            spender,
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
            ErrorCode.InternalError,
            error instanceof Error ? error.message : String(error),
          );
        }
      }

      case "get_token_balance": {
        try {
          const { token, address } = z
            .object({
              token: z.string(),
              address: AddressSchema.optional(),
            })
            .parse(args);

          const container = getContainer();
          const result = await container.tokenEffects.getTokenBalance({
            token,
            ...(address && { address }),
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
            ErrorCode.InternalError,
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
            ErrorCode.InternalError,
            error instanceof Error ? error.message : String(error),
          );
        }
      }

      case "transfer_nft": {
        try {
          const { nft, to, tokenId } = z
            .object({
              nft: z.string(),
              to: AddressSchema,
              tokenId: TokenIdSchema,
            })
            .parse(args);

          const container = getContainer();
          const hash = await container.tokenEffects.transferNFT({
            nft,
            to,
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
            ErrorCode.InternalError,
            error instanceof Error ? error.message : String(error),
          );
        }
      }

      case "get_nft_owner": {
        try {
          const { nft, tokenId } = z
            .object({
              nft: z.string(),
              tokenId: TokenIdSchema,
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
          // Contract resolution errors should be treated as invalid params
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          if (
            errorMessage.includes("not found") &&
            errorMessage.includes("Contract")
          ) {
            throw new McpError(ErrorCode.InvalidParams, errorMessage);
          }
          throw new McpError(ErrorCode.InternalError, errorMessage);
        }
      }

      case "get_nft_info": {
        try {
          const { nft, tokenId } = z
            .object({
              nft: z.string(),
              tokenId: TokenIdSchema.optional(),
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
          // Contract resolution errors should be treated as invalid params
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          if (
            errorMessage.includes("not found") &&
            errorMessage.includes("Contract")
          ) {
            throw new McpError(ErrorCode.InvalidParams, errorMessage);
          }
          throw new McpError(ErrorCode.InternalError, errorMessage);
        }
      }

      case "estimate_gas": {
        try {
          const validatedArgs = EstimateGasArgsSchema.parse(args);
          const container = getContainer();
          const result = await container.transactionEffects.estimateGas(
            validatedArgs.to,
            validatedArgs.value,
            validatedArgs.data,
            validatedArgs.from,
          );

          const chainId = container.walletEffects.getChainId();
          const chain = chainId
            ? container.chainAdapter.getChain(chainId)
            : undefined;
          const symbol = chain?.nativeCurrency.symbol || "ETH";

          return {
            content: [
              {
                type: "text",
                text: `Gas Estimation:
- Estimated Gas: ${result.gasEstimate.toString()} units
- Gas Price: ${(Number(result.gasPrice) / 1e9).toFixed(2)} Gwei
- Estimated Cost: ${result.estimatedCost} ${symbol}
- Estimated Cost (Wei): ${result.estimatedCostWei.toString()}`,
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
            ErrorCode.InternalError,
            error instanceof Error ? error.message : String(error),
          );
        }
      }

      case "get_transaction_status": {
        try {
          const { hash } = TransactionHashSchema.parse(args);
          const container = getContainer();
          const status =
            await container.transactionEffects.getTransactionStatus(hash);

          const formattedStatus = formatTransactionStatus(
            status.status,
            status.hash,
            status.status !== "not_found" && status.from
              ? {
                  ...(status.from && { from: status.from }),
                  ...(status.to !== undefined && { to: status.to }),
                  ...(status.value && { value: status.value }),
                  ...(status.blockNumber && {
                    blockNumber: status.blockNumber,
                  }),
                }
              : undefined,
          );

          return {
            content: [
              {
                type: "text",
                text: formattedStatus,
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
            ErrorCode.InternalError,
            error instanceof Error ? error.message : String(error),
          );
        }
      }

      case "get_transaction_receipt": {
        try {
          const { hash } = TransactionHashSchema.parse(args);
          const container = getContainer();
          const receipt =
            await container.transactionEffects.getTransactionReceipt(hash);

          if (!receipt) {
            return {
              content: [
                {
                  type: "text",
                  text: `No receipt found for transaction ${hash}. The transaction may be pending or not exist.`,
                },
              ],
            };
          }

          const formattedReceipt = formatTransactionReceipt(
            receipt,
            receipt.symbol,
          );

          return {
            content: [
              {
                type: "text",
                text: formattedReceipt,
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
            ErrorCode.InternalError,
            error instanceof Error ? error.message : String(error),
          );
        }
      }

      case "resolve_ens_name": {
        try {
          const { name } = EnsNameSchema.parse(args);
          const container = getContainer();
          const address =
            await container.transactionEffects.resolveEnsName(name);

          if (!address) {
            return {
              content: [
                {
                  type: "text",
                  text: `Could not resolve ENS name "${name}". The name may not exist or may not have an address set.`,
                },
              ],
            };
          }

          return {
            content: [
              {
                type: "text",
                text: `ENS Resolution:
- Name: ${name}
- Address: ${address}`,
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
            ErrorCode.InternalError,
            error instanceof Error ? error.message : String(error),
          );
        }
      }

      case "simulate_transaction": {
        try {
          const {
            contract,
            function: functionName,
            args: functionArgs,
            value,
            address,
          } = args as {
            contract: string;
            function: string;
            args?: unknown[];
            value?: string;
            address?: string;
          };

          if (!contract || !functionName) {
            throw new McpError(
              ErrorCode.InvalidParams,
              "Contract and function are required",
            );
          }

          const container = getContainer();
          const result = await container.transactionEffects.simulateTransaction(
            contract,
            functionName,
            functionArgs,
            value,
            address as Address | undefined,
          );

          if (result.success) {
            return {
              content: [
                {
                  type: "text",
                  text: `Transaction Simulation Successful:
- Contract: ${contract}
- Function: ${functionName}
- Result: ${JSON.stringify(result.result, null, 2)}
- Will Revert: No

The transaction should execute successfully.`,
                },
              ],
            };
          } else {
            return {
              content: [
                {
                  type: "text",
                  text: `Transaction Simulation Failed:
- Contract: ${contract}
- Function: ${functionName}
- Error: ${result.error}
- Will Revert: ${result.willRevert ? "Yes" : "Unknown"}

${result.willRevert ? "The transaction will revert if executed." : "The transaction may fail if executed."}`,
                },
              ],
            };
          }
        } catch (error) {
          throw new McpError(
            ErrorCode.InternalError,
            error instanceof Error ? error.message : String(error),
          );
        }
      }

      case "remove_custom_chain": {
        try {
          const { chainId } = RemoveCustomChainArgsSchema.parse(args);
          removeCustomChain(chainId);

          return {
            content: [
              {
                type: "text",
                text: `Custom chain ${chainId} removed successfully.`,
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
            ErrorCode.InternalError,
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
