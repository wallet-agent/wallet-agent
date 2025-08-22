import { getContainer } from "./container.js"

export async function signWalletMessage(message: string) {
  return getContainer().walletEffects.signMessage(message)
}

export async function signWalletTypedData(params: {
  domain: Record<string, unknown>
  types: Record<string, unknown>
  primaryType: string
  message: Record<string, unknown>
}) {
  return getContainer().walletEffects.signTypedData(params)
}
