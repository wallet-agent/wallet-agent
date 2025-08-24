import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js"
import {
  ImportPrivateKeyArgsSchema,
  RemovePrivateKeyArgsSchema,
  SetWalletTypeArgsSchema,
} from "../../schemas.js"
import {
  getCurrentWalletInfo,
  importPrivateKey,
  listImportedWallets,
  removePrivateKey,
  setWalletType,
} from "../../wallet-manager.js"
import { BaseToolHandler } from "../handler-registry.js"

/**
 * Handler for importing private keys
 */
export class ImportPrivateKeyHandler extends BaseToolHandler {
  constructor() {
    super(
      "import_private_key",
      "Import a private key to use as a real wallet (supports environment variables and file paths for security)",
    )
  }

  async execute(args: unknown) {
    const { privateKey } = this.validateArgs(ImportPrivateKeyArgsSchema, args)

    try {
      const address = importPrivateKey(privateKey)

      // Provide feedback about how the key was loaded
      let sourceInfo = ""
      if (privateKey.startsWith("0x")) {
        sourceInfo = "Direct private key"
      } else if (privateKey.includes("/") || privateKey.startsWith("~")) {
        sourceInfo = `File: ${privateKey}`
      } else {
        sourceInfo = `Environment variable: ${privateKey}`
      }

      return this.createTextResponse(
        `✅ Private key imported successfully!\n\n` +
          `Source: ${sourceInfo}\n` +
          `Address: ${address}\n\n` +
          `🔐 Private key is stored securely in memory only.\n\n` +
          `Next steps:\n` +
          `1. Use 'set_wallet_type' with type "privateKey" \n` +
          `2. Connect to this address to start using your wallet`,
      )
    } catch (error) {
      // Private key validation errors should be treated as invalid params
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (
        errorMessage.includes("Private key must be 32 bytes") ||
        errorMessage.includes("Environment variable") ||
        errorMessage.includes("Invalid private key") ||
        errorMessage.includes("Failed to import private key")
      ) {
        throw new McpError(ErrorCode.InvalidParams, errorMessage)
      }
      throw error
    }
  }
}

/**
 * Handler for listing imported wallets
 */
export class ListImportedWalletsHandler extends BaseToolHandler {
  constructor() {
    super("list_imported_wallets", "List all imported private key wallets")
  }

  async execute(_args: unknown) {
    const wallets = listImportedWallets()
    if (wallets.length === 0) {
      return this.createTextResponse("No private key wallets imported.")
    }
    return this.createTextResponse(
      `Imported wallets:\n${wallets.map((w) => `- ${w.address} (${w.type})`).join("\n")}`,
    )
  }
}

/**
 * Handler for removing private keys
 */
export class RemovePrivateKeyHandler extends BaseToolHandler {
  constructor() {
    super("remove_private_key", "Remove an imported private key")
  }

  async execute(args: unknown) {
    const { address } = this.validateArgs(RemovePrivateKeyArgsSchema, args)
    const removed = removePrivateKey(address)
    return this.createTextResponse(
      removed
        ? `Private key removed for address: ${address}`
        : `No private key found for address: ${address}`,
    )
  }
}

/**
 * Handler for setting wallet type
 */
export class SetWalletTypeHandler extends BaseToolHandler {
  constructor() {
    super("set_wallet_type", "Switch between mock and private key wallets")
  }

  async execute(args: unknown) {
    const { type } = this.validateArgs(SetWalletTypeArgsSchema, args)
    setWalletType(type)
    return this.createTextResponse(`Wallet type set to: ${type}`)
  }
}

/**
 * Handler for getting wallet info
 */
export class GetWalletInfoHandler extends BaseToolHandler {
  constructor() {
    super("get_wallet_info", "Get current wallet configuration info")
  }

  async execute(_args: unknown) {
    const info = getCurrentWalletInfo()
    return this.createTextResponse(
      `Current wallet configuration:\n` +
        `- Type: ${info.type}\n` +
        `- Available addresses: ${info.availableAddresses.length}\n` +
        `${info.availableAddresses.map((addr) => `  - ${addr}`).join("\n")}`,
    )
  }
}

// Export all handlers as an array for easy registration
export const walletManagementHandlers = [
  new ImportPrivateKeyHandler(),
  new ListImportedWalletsHandler(),
  new RemovePrivateKeyHandler(),
  new SetWalletTypeHandler(),
  new GetWalletInfoHandler(),
]
