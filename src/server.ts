import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import {
  CallToolRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js"
import { getAccount } from "@wagmi/core"
import { getAllChains } from "./chains.js"
import { customChains, getContainer } from "./container.js"
import { toolDefinitions } from "./tools/definitions.js"
import { handleToolCall } from "./tools/handlers.js"

export function createMcpServer() {
  const server = new Server(
    {
      name: "wallet-agent",
      version: "0.1.0",
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    },
  )

  // Handle tool listing
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: toolDefinitions,
    }
  })

  // Handle tool execution
  server.setRequestHandler(CallToolRequestSchema, handleToolCall)

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
        {
          uri: "wallet://instructions",
          name: "User Instructions",
          description: "Custom user instructions for wallet behavior and preferences",
          mimeType: "text/markdown",
        },
        {
          uri: "wallet://transactions",
          name: "Transaction History",
          description: "Recent transaction history (last 7 days for free tier)",
          mimeType: "application/json",
        },
      ],
    }
  })

  // Handle resource reading
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params

    switch (uri) {
      case "wallet://state": {
        const account = getAccount(getContainer().wagmiConfig)
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
        }
      }

      case "wallet://chains": {
        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: JSON.stringify(
                {
                  chains: getAllChains().map((chain) => ({
                    id: chain.id,
                    name: chain.name,
                    isCustom: customChains.has(chain.id),
                  })),
                },
                null,
                2,
              ),
            },
          ],
        }
      }

      case "wallet://instructions": {
        const container = getContainer()
        const storageManager = container.getStorageManager()

        if (!storageManager) {
          return {
            contents: [
              {
                uri,
                mimeType: "text/markdown",
                text: "# User Instructions\n\nNo storage available. Create a `.wallet-agent/instructions.md` file to customize wallet behavior.\n\n## Example:\n```markdown\n# My Wallet Instructions\n\n## Gas Settings\n- Use conservative gas prices by default\n- Warn for transactions over $50\n\n## Security\n- Always confirm high-value transfers\n- Prefer testnets for experimentation\n```",
              },
            ],
          }
        }

        const instructions = await storageManager.readInstructions()
        const defaultInstructions = `# User Instructions

This file allows you to customize how the wallet agent behaves. Write your preferences in natural language.

## Examples

### Gas Settings
- Always use "fast" gas prices for DEX trades  
- Use "standard" gas for simple transfers
- Warn me if gas cost exceeds $20

### Security Rules
- Never approve unlimited token allowances
- Always simulate high-value transactions first
- Require confirmation for contracts I haven't used before

### Preferences  
- Show transaction values in both ETH and USD
- Prefer Polygon for small transfers (<$100)
- Auto-retry failed transactions once with higher gas

### Custom Behavior
- When transferring tokens, always check recipient twice
- Default to 1 GWEI gas price for non-urgent transactions
- Show estimated USD costs before any transaction

Edit this file to customize your wallet experience!`

        return {
          contents: [
            {
              uri,
              mimeType: "text/markdown",
              text: instructions || defaultInstructions,
            },
          ],
        }
      }

      case "wallet://transactions": {
        const container = getContainer()
        const storageManager = container.getStorageManager()

        if (!storageManager) {
          return {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify(
                  {
                    error: "No storage available",
                    transactions: [],
                    summary: {
                      totalTransactions: 0,
                      successfulTransactions: 0,
                      failedTransactions: 0,
                      totalValue: "0",
                      totalGasUsed: "0",
                      chains: [],
                      oldestTimestamp: new Date().toISOString(),
                      newestTimestamp: new Date().toISOString(),
                    },
                  },
                  null,
                  2,
                ),
              },
            ],
          }
        }

        try {
          const historyManager = storageManager.getTransactionHistory()
          const [transactions, summary] = await Promise.all([
            historyManager.getTransactionHistory({ limit: 50 }),
            historyManager.getTransactionSummary(),
          ])

          return {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify(
                  {
                    transactions,
                    summary,
                    retentionPolicy: {
                      maxDays: 7,
                      tier: "free",
                    },
                  },
                  null,
                  2,
                ),
              },
            ],
          }
        } catch (error) {
          return {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify(
                  {
                    error: `Failed to load transaction history: ${error instanceof Error ? error.message : String(error)}`,
                    transactions: [],
                    summary: {
                      totalTransactions: 0,
                      successfulTransactions: 0,
                      failedTransactions: 0,
                      totalValue: "0",
                      totalGasUsed: "0",
                      chains: [],
                      oldestTimestamp: new Date().toISOString(),
                      newestTimestamp: new Date().toISOString(),
                    },
                  },
                  null,
                  2,
                ),
              },
            ],
          }
        }
      }

      default:
        throw new McpError(ErrorCode.InvalidRequest, `Unknown resource: ${uri}`)
    }
  })

  return server
}
