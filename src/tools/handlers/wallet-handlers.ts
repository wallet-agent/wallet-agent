import { mockAccounts } from "../../container.js"
import { ConnectWalletArgsSchema, GetBalanceArgsSchema } from "../../schemas.js"
import {
  connectWallet,
  disconnectWallet,
  getCurrentAccount,
  getWalletBalance,
} from "../../wallet.js"
import { BaseToolHandler } from "../handler-registry.js"

/**
 * Handler for connecting to a wallet
 */
export class ConnectWalletHandler extends BaseToolHandler {
  constructor() {
    super("connect_wallet", "Connect to a wallet using the specified address")
  }

  async execute(args: unknown) {
    const { address } = this.validateArgs(ConnectWalletArgsSchema, args)
    const result = await connectWallet(address)
    return this.createTextResponse(
      `Connected to wallet: ${result.address}\nChain: ${result.chainId}`,
    )
  }
}

/**
 * Handler for disconnecting wallet
 */
export class DisconnectWalletHandler extends BaseToolHandler {
  constructor() {
    super("disconnect_wallet", "Disconnect the currently connected wallet")
  }

  async execute(_args: unknown) {
    await disconnectWallet()
    return this.createTextResponse("Wallet disconnected")
  }
}

/**
 * Handler for getting available accounts
 */
export class GetAccountsHandler extends BaseToolHandler {
  constructor() {
    super("get_accounts", "Get the list of available mock accounts")
  }

  async execute(_args: unknown) {
    return this.createTextResponse(`Available mock accounts:\n${mockAccounts.join("\n")}`)
  }
}

/**
 * Handler for getting current account info
 */
export class GetCurrentAccountHandler extends BaseToolHandler {
  constructor() {
    super("get_current_account", "Get the currently connected account information")
  }

  async execute(_args: unknown) {
    const account = getCurrentAccount()
    const text = account.isConnected
      ? `Connected: ${account.address}\nChain ID: ${account.chainId}\nConnector: ${account.connector}`
      : "No wallet connected"
    return this.createTextResponse(text)
  }
}

/**
 * Handler for getting wallet balance
 */
export class GetBalanceHandler extends BaseToolHandler {
  constructor() {
    super("get_balance", "Get the balance of an address")
  }

  async execute(args: unknown) {
    const { address } = this.validateArgs(GetBalanceArgsSchema, args)
    const balance = await getWalletBalance(address)
    return this.createTextResponse(
      `Balance: ${balance.balance} ${balance.symbol}\nRaw: ${balance.balanceRaw} wei`,
    )
  }
}

// Export all handlers as an array for easy registration
export const walletHandlers = [
  new ConnectWalletHandler(),
  new DisconnectWalletHandler(),
  new GetAccountsHandler(),
  new GetCurrentAccountHandler(),
  new GetBalanceHandler(),
]
