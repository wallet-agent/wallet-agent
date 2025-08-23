import { SignMessageArgsSchema, SignTypedDataArgsSchema } from "../../schemas.js"
import { signWalletMessage, signWalletTypedData } from "../../signing.js"
import { BaseToolHandler } from "../handler-registry.js"

/**
 * Handler for signing messages
 */
export class SignMessageHandler extends BaseToolHandler {
  constructor() {
    super("sign_message", "Sign a message with the connected wallet")
  }

  async execute(args: unknown) {
    const { message } = this.validateArgs(SignMessageArgsSchema, args)
    const signature = await signWalletMessage(message)
    return this.createTextResponse(`Message signed successfully\nSignature: ${signature}`)
  }
}

/**
 * Handler for signing typed data
 */
export class SignTypedDataHandler extends BaseToolHandler {
  constructor() {
    super("sign_typed_data", "Sign EIP-712 typed data")
  }

  async execute(args: unknown) {
    const validatedArgs = this.validateArgs(SignTypedDataArgsSchema, args)
    const signature = await signWalletTypedData(validatedArgs)
    return this.createTextResponse(`Typed data signed successfully\nSignature: ${signature}`)
  }
}

// Export all handlers as an array for easy registration
export const signingHandlers = [new SignMessageHandler(), new SignTypedDataHandler()]
