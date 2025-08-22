/**
 * Hyperliquid tools using the @nktkas/hyperliquid SDK
 * Basic operations in core, advanced features in pro package
 */

import type { Tool } from "@modelcontextprotocol/sdk/types.js"

/**
 * Hyperliquid tools available in the open-source core
 * Uses the official community SDK for robust implementation
 */
export const hyperliquidTools: Tool[] = [
  {
    name: "hl_import_wallet",
    description: "Import a Hyperliquid wallet using private key",
    inputSchema: {
      type: "object",
      properties: {
        privateKey: {
          type: "string",
          description: "Private key starting with 0x (will be stored securely in memory)",
        },
      },
      required: ["privateKey"],
    },
  },
  {
    name: "hl_get_account_info",
    description: "Get Hyperliquid account information including balance and positions",
    inputSchema: {
      type: "object",
      properties: {
        address: {
          type: "string",
          description: "Wallet address (optional, uses imported wallet if not provided)",
        },
      },
    },
  },
  {
    name: "hl_place_order",
    description: "Place a basic limit or market order on Hyperliquid",
    inputSchema: {
      type: "object",
      properties: {
        coin: {
          type: "string",
          description: "Trading pair symbol (e.g., 'BTC', 'ETH')",
        },
        isBuy: {
          type: "boolean",
          description: "True for buy order, false for sell order",
        },
        sz: {
          type: "number",
          description: "Order size",
        },
        limitPx: {
          type: "number",
          description: "Limit price (optional, if not provided creates market order)",
        },
        orderType: {
          type: "string",
          enum: ["limit", "market"],
          description: "Order type",
          default: "limit",
        },
        reduceOnly: {
          type: "boolean",
          description: "If true, order can only reduce position",
          default: false,
        },
        cloid: {
          type: "string",
          description: "Client order ID for tracking (optional)",
        },
      },
      required: ["coin", "isBuy", "sz"],
    },
  },
  {
    name: "hl_cancel_order",
    description: "Cancel an open order on Hyperliquid",
    inputSchema: {
      type: "object",
      properties: {
        coin: {
          type: "string",
          description: "Trading pair symbol",
        },
        orderId: {
          type: "string",
          description: "Order ID to cancel (optional, cancels all orders for coin if not provided)",
        },
      },
      required: ["coin"],
    },
  },
  {
    name: "hl_get_open_orders",
    description: "Get all open orders",
    inputSchema: {
      type: "object",
      properties: {
        address: {
          type: "string",
          description: "Wallet address (optional, uses imported wallet if not provided)",
        },
      },
    },
  },
  {
    name: "hl_get_positions",
    description: "Get current positions",
    inputSchema: {
      type: "object",
      properties: {
        address: {
          type: "string",
          description: "Wallet address (optional, uses imported wallet if not provided)",
        },
      },
    },
  },
  {
    name: "hl_transfer",
    description: "Transfer USDC on Hyperliquid",
    inputSchema: {
      type: "object",
      properties: {
        destination: {
          type: "string",
          description: "Destination address",
        },
        amount: {
          type: "number",
          description: "Amount of USDC to transfer",
        },
      },
      required: ["destination", "amount"],
    },
  },
  {
    name: "hl_get_all_mids",
    description: "Get mid prices for all trading pairs",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "hl_get_user_fills",
    description: "Get trade fill history for a user",
    inputSchema: {
      type: "object",
      properties: {
        address: {
          type: "string",
          description: "Wallet address (optional, uses imported wallet if not provided)",
        },
      },
    },
  },
]
