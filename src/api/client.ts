/**
 * Generic API client for wallet-agent pro features
 * This client knows nothing about specific protocols - it's a generic proxy
 */

import { config } from "../config/environment.js"

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export interface ProToolDefinition {
  name: string
  description: string
  inputSchema: unknown
  requiresSignature?: boolean
}

/**
 * Generic API client that proxies requests to the pro server
 * No protocol-specific knowledge exists here
 */
export class WalletAgentAPIClient {
  private apiKey?: string
  private baseUrl: string

  constructor() {
    this.apiKey = config.apiKey
    this.baseUrl = config.apiUrl
  }

  /**
   * Check if API is configured and accessible
   */
  isConfigured(): boolean {
    return !!this.apiKey
  }

  /**
   * Generic proxy method - knows nothing about protocols
   * @param method The method name to call on the pro server
   * @param params Parameters to pass to the method
   */
  async callProAPI<T = unknown>(method: string, params: unknown): Promise<ApiResponse<T>> {
    if (!this.apiKey) {
      return {
        success: false,
        error: "WALLET_AGENT_API_KEY required for pro features",
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/call`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ method, params }),
      })

      if (!response.ok) {
        return {
          success: false,
          error: `API call failed: ${response.statusText}`,
        }
      }

      const data = (await response.json()) as T
      return {
        success: true,
        data,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  /**
   * Fetch available pro tools from the server
   */
  async getAvailableTools(): Promise<ProToolDefinition[]> {
    const response = await this.callProAPI<ProToolDefinition[]>("get_available_tools", {})
    return response.data || []
  }
}
