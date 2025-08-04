import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { getAccount } from "@wagmi/core";
import { getAllChains } from "./chains.js";
import { customChains, getContainer } from "./container.js";
import { toolDefinitions } from "./tools/definitions.js";
import { handleToolCall } from "./tools/handlers.js";

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
  );

  // Handle tool listing
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: toolDefinitions,
    };
  });

  // Handle tool execution
  server.setRequestHandler(CallToolRequestSchema, handleToolCall);

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
        const account = getAccount(getContainer().wagmiConfig);
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
        };
      }

      default:
        throw new McpError(
          ErrorCode.InvalidRequest,
          `Unknown resource: ${uri}`,
        );
    }
  });

  return server;
}
