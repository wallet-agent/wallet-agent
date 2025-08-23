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
    const address = await importPrivateKey(privateKey)
    return this.createTextResponse(`Private key imported successfully\nAddress: ${address}`)
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
      return this.createTextResponse("No imported wallets")
    }
    return this.createTextResponse(`Imported wallets:\n${wallets.join("\n")}`)
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
    removePrivateKey(address)
    return this.createTextResponse(`Private key removed for address: ${address}`)
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
