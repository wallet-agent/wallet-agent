import type { Address } from "viem"
import { z } from "zod"

// Custom Zod schema for Ethereum addresses
export const AddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format")
  .transform((val) => val as Address)

// Custom Zod schema for hex strings
export const HexStringSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]*$/, "Invalid hex string format")
  .transform((val) => val as `0x${string}`)

// Custom Zod schema for private keys
export const PrivateKeySchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{64}$/, "Private key must be 32 bytes (64 hex characters) prefixed with 0x")
  .transform((val) => val as `0x${string}`)

// Tool argument schemas
export const ConnectWalletArgsSchema = z.object({
  address: AddressSchema,
})

export const SignMessageArgsSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
})

export const SignTypedDataArgsSchema = z.object({
  domain: z.record(z.string(), z.unknown()),
  types: z.record(z.string(), z.unknown()),
  primaryType: z.string().min(1, "Primary type is required"),
  message: z.record(z.string(), z.unknown()),
})

export const SendTransactionArgsSchema = z.object({
  to: AddressSchema,
  value: z.string().regex(/^\d+$/, "Value must be a numeric string"),
  data: HexStringSchema.optional(),
})

export const SwitchChainArgsSchema = z.object({
  chainId: z.number().int().positive("Chain ID must be a positive integer"),
})

export const GetBalanceArgsSchema = z.object({
  address: AddressSchema.optional(),
})

export const AddCustomChainArgsSchema = z.object({
  chainId: z.number().int().positive("Chain ID must be a positive integer"),
  name: z.string().min(1, "Chain name is required"),
  rpcUrl: z.string().url("Invalid RPC URL"),
  nativeCurrency: z.object({
    name: z.string().min(1, "Currency name is required"),
    symbol: z.string().min(1, "Currency symbol is required"),
    decimals: z.number().int().min(0).max(18, "Decimals must be between 0 and 18"),
  }),
  blockExplorerUrl: z.string().url("Invalid block explorer URL").optional(),
})

export const UpdateCustomChainArgsSchema = z.object({
  chainId: z.number().int().positive("Chain ID must be a positive integer"),
  name: z.string().min(1, "Chain name is required").optional(),
  rpcUrl: z.string().url("Invalid RPC URL").optional(),
  nativeCurrency: z
    .object({
      name: z.string().min(1, "Currency name is required"),
      symbol: z.string().min(1, "Currency symbol is required"),
      decimals: z.number().int().min(0).max(18, "Decimals must be between 0 and 18"),
    })
    .optional(),
  blockExplorerUrl: z.string().url("Invalid block explorer URL").optional(),
})

export const ImportPrivateKeyArgsSchema = z.object({
  privateKey: z.string().min(1, "Private key input is required"),
})

export const RemovePrivateKeyArgsSchema = z.object({
  address: AddressSchema,
})

export const SetWalletTypeArgsSchema = z.object({
  type: z.enum(["mock", "privateKey"]),
})

export const EstimateGasArgsSchema = z.object({
  to: AddressSchema,
  value: z.string().optional(),
  data: HexStringSchema.optional(),
  from: AddressSchema.optional(),
})

export const TransactionHashSchema = z.object({
  hash: z
    .string()
    .regex(/^0x[a-fA-F0-9]{64}$/, "Transaction hash must be 32 bytes (64 hex characters)")
    .transform((val) => val as `0x${string}`),
})

export const EnsNameSchema = z.object({
  name: z
    .string()
    .min(1, "ENS name is required")
    .regex(
      /^[a-zA-Z0-9-]+(\.eth|\.xyz|\.com|\.org|\.io|\.app|\.dev|\.art|\.nft)$/,
      "Invalid ENS name format",
    ),
})

export const RemoveCustomChainArgsSchema = z.object({
  chainId: z.number().int().positive("Chain ID must be a positive integer"),
})

// Chain configuration schema for validation
export const ChainConfigSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  nativeCurrency: z.object({
    name: z.string().min(1),
    symbol: z.string().min(1),
    decimals: z.number().int().min(0).max(18),
  }),
  rpcUrls: z.object({
    default: z.object({
      http: z.array(z.string().url()),
    }),
  }),
  blockExplorers: z
    .object({
      default: z.object({
        name: z.string(),
        url: z.string().url(),
      }),
    })
    .optional(),
})

// Schema for numeric amount strings (used for token amounts)
export const NumericStringSchema = z
  .string()
  .regex(/^\d*\.?\d+$/, "Invalid numeric value")
  .refine((val) => {
    try {
      const num = parseFloat(val)
      return !Number.isNaN(num) && num >= 0
    } catch {
      return false
    }
  }, "Must be a valid non-negative number")

// Schema for token amounts (accepts numeric values or "max")
export const TokenAmountSchema = z.string().refine((val) => {
  if (val.toLowerCase() === "max") return true
  return /^\d*\.?\d+$/.test(val) && parseFloat(val) >= 0
}, "Must be a valid non-negative number or 'max'")

// Schema for NFT token IDs (must be numeric string)
export const TokenIdSchema = z.string().regex(/^\d+$/, "Token ID must be numeric")
