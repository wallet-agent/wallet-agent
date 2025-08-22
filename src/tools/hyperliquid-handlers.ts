/**
 * Hyperliquid tool handlers using the @nktkas/hyperliquid SDK
 * Basic operations in core, advanced features in pro server
 */

import type { CallToolRequest } from "@modelcontextprotocol/sdk/types.js"
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js"
import * as hl from "@nktkas/hyperliquid"
import { privateKeyToAccount } from "viem/accounts"
import { z } from "zod"
import { config } from "../config/environment.js"

// Store the current wallet and clients
let currentAccount: ReturnType<typeof privateKeyToAccount> | undefined
let infoClient: hl.InfoClient | undefined
let exchangeClient: hl.ExchangeClient | undefined

// Initialize clients
function initializeClients(privateKey?: `0x${string}`) {
  const isTestnet = config.hyperliquidNetwork === "testnet"

  // Create transport
  const transport = new hl.HttpTransport({ isTestnet })

  // Info client doesn't need wallet
  infoClient = new hl.InfoClient({ transport })

  // Exchange client needs wallet for signing
  if (privateKey) {
    currentAccount = privateKeyToAccount(privateKey)
    exchangeClient = new hl.ExchangeClient({
      wallet: currentAccount,
      transport,
    })
  }
}

// Initialize info client on startup
initializeClients()

// Validation schemas
const ImportWalletSchema = z.object({
  privateKey: z.string().regex(/^0x[a-fA-F0-9]{64}$/, "Invalid private key format"),
})

const PlaceOrderSchema = z.object({
  coin: z.string(),
  isBuy: z.boolean(),
  sz: z.number().positive(),
  limitPx: z.number().positive().optional(),
  orderType: z.enum(["limit", "market"]).default("limit"),
  reduceOnly: z.boolean().default(false),
  cloid: z.string().optional(),
})

const CancelOrderSchema = z.object({
  coin: z.string(),
  orderId: z.union([z.string(), z.number()]).optional(),
})

const TransferSchema = z.object({
  destination: z.string(),
  amount: z.number().positive(),
})

const AddressSchema = z.object({
  address: z.string().optional(),
})

/**
 * Get wallet address from private key
 */
function getAddressFromPrivateKey(privateKey: `0x${string}`): string {
  const account = privateKeyToAccount(privateKey)
  return account.address
}

/**
 * Handle Hyperliquid tool calls
 */
export async function handleHyperliquidTool(request: CallToolRequest) {
  const { name, arguments: args } = request.params

  switch (name) {
    case "hl_import_wallet": {
      const { privateKey } = ImportWalletSchema.parse(args)

      // Initialize clients with the private key
      initializeClients(privateKey as `0x${string}`)

      const address = getAddressFromPrivateKey(privateKey as `0x${string}`)

      return {
        content: [
          {
            type: "text",
            text: `Hyperliquid wallet imported successfully\nAddress: ${address}`,
          },
        ],
      }
    }

    case "hl_get_account_info": {
      const { address } = AddressSchema.parse(args)

      if (!infoClient) {
        throw new McpError(ErrorCode.InternalError, "Info client not initialized")
      }

      const targetAddress = address || currentAccount?.address

      if (!targetAddress) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          "No wallet imported. Use hl_import_wallet first or provide an address",
        )
      }

      const clearinghouseState = await infoClient.clearinghouseState({
        user: targetAddress as `0x${string}`,
      })

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(clearinghouseState, null, 2),
          },
        ],
      }
    }

    case "hl_place_order": {
      const orderParams = PlaceOrderSchema.parse(args)

      if (!exchangeClient) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          "No wallet imported. Use hl_import_wallet first",
        )
      }

      // Convert to SDK order format
      // biome-ignore lint/suspicious/noExplicitAny: SDK types are complex and dynamic
      const order: any = {
        a: await getAssetIndex(orderParams.coin),
        b: orderParams.isBuy,
        p: orderParams.limitPx?.toString() || "0",
        s: orderParams.sz.toString(),
        r: orderParams.reduceOnly,
        t:
          orderParams.orderType === "market"
            ? { limit: { tif: "Ioc" } } // Use IOC for market-like behavior
            : { limit: { tif: "Gtc" } },
      }

      if (orderParams.cloid) {
        order.c = orderParams.cloid
      }

      const result = await exchangeClient.order({
        orders: [order],
        grouping: "na",
      })

      return {
        content: [
          {
            type: "text",
            text: `Order placed successfully\n${JSON.stringify(result, null, 2)}`,
          },
        ],
      }
    }

    case "hl_cancel_order": {
      const { coin, orderId } = CancelOrderSchema.parse(args)

      if (!exchangeClient) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          "No wallet imported. Use hl_import_wallet first",
        )
      }

      const assetIndex = await getAssetIndex(coin)

      const result = orderId
        ? await exchangeClient.cancel({
            cancels: [
              {
                a: assetIndex,
                o: Number(orderId),
              },
            ],
          })
        : await exchangeClient.cancelByCloid({
            cancels: [
              {
                asset: assetIndex,
                cloid: coin as `0x${string}`, // If no orderId, assume coin is the cloid
              },
            ],
          })

      return {
        content: [
          {
            type: "text",
            text: `Order cancelled successfully\n${JSON.stringify(result, null, 2)}`,
          },
        ],
      }
    }

    case "hl_get_open_orders": {
      const { address } = AddressSchema.parse(args)

      if (!infoClient) {
        throw new McpError(ErrorCode.InternalError, "Info client not initialized")
      }

      const targetAddress = address || currentAccount?.address

      if (!targetAddress) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          "No wallet imported. Use hl_import_wallet first or provide an address",
        )
      }

      const orders = await infoClient.openOrders({
        user: targetAddress as `0x${string}`,
      })

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(orders, null, 2),
          },
        ],
      }
    }

    case "hl_get_positions": {
      const { address } = AddressSchema.parse(args)

      if (!infoClient) {
        throw new McpError(ErrorCode.InternalError, "Info client not initialized")
      }

      const targetAddress = address || currentAccount?.address

      if (!targetAddress) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          "No wallet imported. Use hl_import_wallet first or provide an address",
        )
      }

      const userState = await infoClient.clearinghouseState({
        user: targetAddress as `0x${string}`,
      })

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(userState.assetPositions || [], null, 2),
          },
        ],
      }
    }

    case "hl_transfer": {
      const { destination, amount } = TransferSchema.parse(args)

      if (!exchangeClient) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          "No wallet imported. Use hl_import_wallet first",
        )
      }

      const result = await exchangeClient.usdSend({
        destination: destination as `0x${string}`,
        amount: amount.toString(),
      })

      return {
        content: [
          {
            type: "text",
            text: `Transfer completed successfully\n${JSON.stringify(result, null, 2)}`,
          },
        ],
      }
    }

    case "hl_get_all_mids": {
      if (!infoClient) {
        throw new McpError(ErrorCode.InternalError, "Info client not initialized")
      }

      const allMids = await infoClient.allMids()

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(allMids, null, 2),
          },
        ],
      }
    }

    case "hl_get_user_fills": {
      const { address } = AddressSchema.parse(args)

      if (!infoClient) {
        throw new McpError(ErrorCode.InternalError, "Info client not initialized")
      }

      const targetAddress = address || currentAccount?.address

      if (!targetAddress) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          "No wallet imported. Use hl_import_wallet first or provide an address",
        )
      }

      const fills = await infoClient.userFills({
        user: targetAddress as `0x${string}`,
      })

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(fills, null, 2),
          },
        ],
      }
    }

    default:
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`)
  }
}

/**
 * Helper function to get asset index from coin symbol
 */
async function getAssetIndex(coin: string): Promise<number> {
  if (!infoClient) {
    throw new McpError(ErrorCode.InternalError, "Info client not initialized")
  }

  const meta = await infoClient.meta()
  const assetInfo = meta.universe.find((asset) => asset.name.toUpperCase() === coin.toUpperCase())

  if (!assetInfo) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `Unknown coin: ${coin}. Available coins: ${meta.universe.map((a) => a.name).join(", ")}`,
    )
  }

  return meta.universe.indexOf(assetInfo)
}

/**
 * Clear the current wallet (for testing or security)
 */
export function clearHyperliquidWallet() {
  currentAccount = undefined
  exchangeClient = undefined
  // Keep info client as it doesn't need wallet
}

/**
 * Get current wallet address if available
 */
export function getCurrentHyperliquidAddress(): string | undefined {
  return currentAccount?.address
}
