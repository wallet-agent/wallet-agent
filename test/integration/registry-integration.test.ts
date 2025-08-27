import { describe, expect, test } from "bun:test"
import { toolRegistry } from "../../src/tools/handler-registry.js"
import { getAvailableTools } from "../../src/tools/handlers.js"

describe("Registry Integration", () => {
  test("should have all expected handler groups registered", () => {
    const tools = getAvailableTools()

    // Wallet handlers
    expect(tools).toContain("connect_wallet")
    expect(tools).toContain("disconnect_wallet")
    expect(tools).toContain("get_current_account")
    expect(tools).toContain("get_accounts")

    // Chain handlers
    expect(tools).toContain("add_custom_chain")
    expect(tools).toContain("update_custom_chain")
    expect(tools).toContain("remove_custom_chain")
    expect(tools).toContain("switch_chain")

    // Transaction handlers
    expect(tools).toContain("send_transaction")
    expect(tools).toContain("get_balance")
    expect(tools).toContain("estimate_gas")
    expect(tools).toContain("get_transaction_status")
    expect(tools).toContain("get_transaction_receipt")

    // Signing handlers
    expect(tools).toContain("sign_message")
    expect(tools).toContain("sign_typed_data")

    // Contract handlers
    expect(tools).toContain("load_wagmi_config")
    expect(tools).toContain("list_contracts")
    expect(tools).toContain("write_contract")
    expect(tools).toContain("read_contract")
    expect(tools).toContain("simulate_transaction")

    // Token handlers
    expect(tools).toContain("transfer_token")
    expect(tools).toContain("approve_token")
    expect(tools).toContain("get_token_balance")
    expect(tools).toContain("get_token_info")

    // NFT handlers (part of token handlers)
    expect(tools).toContain("transfer_nft")
    expect(tools).toContain("get_nft_owner")
    expect(tools).toContain("get_nft_info")

    // Wallet management handlers
    expect(tools).toContain("import_private_key")
    expect(tools).toContain("list_imported_wallets")
    expect(tools).toContain("remove_private_key")
    expect(tools).toContain("set_wallet_type")
    expect(tools).toContain("get_wallet_info")

    // Misc handlers
    expect(tools).toContain("resolve_ens_name")

    // Hyperliquid handlers
    expect(tools).toContain("hl_import_wallet")
    expect(tools).toContain("hl_get_account_info")
    expect(tools).toContain("hl_place_order")
    expect(tools).toContain("hl_cancel_order")
    expect(tools).toContain("hl_get_open_orders")
    expect(tools).toContain("hl_get_positions")
    expect(tools).toContain("hl_transfer")
    expect(tools).toContain("hl_get_all_mids")
    expect(tools).toContain("hl_get_user_fills")
  })

  test("should have correct total number of tools", () => {
    const tools = getAvailableTools()
    // Count all the tools we expect
    const expectedTools = [
      // Wallet: 4
      "connect_wallet",
      "disconnect_wallet",
      "get_current_account",
      "get_accounts",
      // Chain: 4
      "add_custom_chain",
      "update_custom_chain",
      "remove_custom_chain",
      "switch_chain",
      // Transaction: 5
      "send_transaction",
      "get_balance",
      "estimate_gas",
      "get_transaction_status",
      "get_transaction_receipt",
      // Signing: 2
      "sign_message",
      "sign_typed_data",
      // Contract: 5
      "load_wagmi_config",
      "list_contracts",
      "write_contract",
      "read_contract",
      "simulate_transaction",
      // Token: 4
      "transfer_token",
      "approve_token",
      "get_token_balance",
      "get_token_info",
      // NFT: 3
      "transfer_nft",
      "get_nft_owner",
      "get_nft_info",
      // Wallet Management: 5
      "import_private_key",
      "list_imported_wallets",
      "remove_private_key",
      "set_wallet_type",
      "get_wallet_info",
      // Misc: 1
      "resolve_ens_name",
      // Hyperliquid: 9
      "hl_import_wallet",
      "hl_get_account_info",
      "hl_place_order",
      "hl_cancel_order",
      "hl_get_open_orders",
      "hl_get_positions",
      "hl_transfer",
      "hl_get_all_mids",
      "hl_get_user_fills",
    ]

    // Updated to include 3 simulation handlers + 5 wagmi ABI extraction handlers + 9 encrypted key handlers
    expect(tools.length).toBe(expectedTools.length + 17)
    expect(tools.length).toBe(59) // Total number of tools (42 + 3 simulation + 5 wagmi ABI + 9 encrypted key)
  })

  test("all tools should be accessible through registry", () => {
    const tools = getAvailableTools()

    for (const toolName of tools) {
      const handler = toolRegistry.get(toolName)
      expect(handler).toBeDefined()
      expect(handler?.name).toBe(toolName)
      expect(handler?.description).toBeTruthy()
    }
  })

  test("should not have any duplicate tool names", () => {
    const tools = getAvailableTools()
    const uniqueTools = new Set(tools)
    expect(tools.length).toBe(uniqueTools.size)
  })
})
