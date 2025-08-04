---
description: Wallet Agent development guidelines and architecture notes
globs: "src/**/*.ts, *.json, *.md"
alwaysApply: true
---

# Wallet Agent Development Guidelines

This document contains project-specific guidelines for AI assistants working on the Wallet Agent codebase. For general usage and features, see @README.md.

## Architecture Overview

The codebase follows a modular architecture:

```
src/
├── index.ts          # Entry point - minimal orchestration only
├── server.ts         # MCP server setup and request handlers
├── chains.ts         # Chain configuration and Wagmi config management
├── wallet.ts         # Wallet connection and account operations
├── wallet-manager.ts # Private key wallet management
├── signing.ts        # Message and typed data signing
├── transactions.ts   # Transaction sending and chain switching
└── tools/
    ├── definitions.ts # Tool schemas for MCP
    └── handlers.ts    # Tool implementation handlers
```

## Key Design Principles

1. **Separation of Concerns**: Each module has a single responsibility
2. **Type Safety**: Leverage TypeScript's strict mode and Viem's type system
3. **Security First**: Private keys are never logged or exposed
4. **Multi-Chain Support**: All operations should work across any EVM chain

## Development Standards

When building:
- Use bun instead of npm
- Use bunx instead of npx

### Adding New Tools

When adding new MCP tools:
1. Define the tool schema in `src/tools/definitions.ts`
2. Implement the handler in `src/tools/handlers.ts`
3. Keep handlers thin - delegate business logic to appropriate modules
4. Always validate input parameters
5. Return consistent error messages using `McpError`

### Chain Support

When working with chains:
- Use `getAllChains()` to get both built-in and custom chains
- Always check if a chain exists before operations
- Use the chain's native currency symbol in user-facing messages
- Support custom RPC endpoints for any chain

### Wallet Operations

Two wallet modes are supported:
- **Mock Mode**: Uses Wagmi's mock connector for testing
- **Private Key Mode**: Uses imported private keys for real transactions

Always check `currentWalletType` before performing wallet operations.

### Error Handling

Use MCP-specific error codes:
- `ErrorCode.InvalidParams` - Bad input parameters
- `ErrorCode.InvalidRequest` - Missing prerequisites (e.g., no wallet connected)
- `ErrorCode.MethodNotFound` - Unknown tool name
- `ErrorCode.InternalError` - Unexpected errors

## Testing Guidelines

When testing changes:
1. Test with both mock and private key wallets
2. Test on multiple chains (at least Anvil and one testnet)
3. Verify error messages are helpful and specific
4. Check that native currency symbols display correctly

## Security Considerations

1. **Never** log private keys or sensitive data
2. **Always** validate private key format before use
3. **Store** private keys in memory only (no persistence)
4. **Clear** sensitive data when disconnecting wallets

## Code Style

- Use Bun for all operations (not npm/yarn/pnpm)
- Run `bun run typecheck` before committing
- Run `bun run lint:fix` to format code
- Keep functions small and focused
- Use descriptive variable names

## Common Patterns

### Adding a New Chain Operation
```typescript
// Always get current chain
const currentChain = getAllChains().find(c => c.id === currentChainId);
if (!currentChain) throw new Error("Chain not found");

// Use chain-specific properties
const symbol = currentChain.nativeCurrency.symbol;
```

### Handling Wallet Types
```typescript
if (currentWalletType === "privateKey") {
  // Private key specific logic
  const walletClient = createPrivateKeyWalletClient(address, chain);
  // ...
} else {
  // Mock wallet logic
  // ...
}
```

## Performance Considerations

- Reuse wallet clients when possible
- Batch RPC calls where appropriate
- Keep the main thread responsive during async operations

## Future Enhancements

Areas for potential improvement:
- WalletConnect integration for QR code connections
- Hardware wallet support via WebUSB
- Transaction simulation before sending
- Gas estimation and optimization
- Multi-signature wallet support

## Debugging Tips

1. Check wallet connection state with `get_wallet_info`
2. Verify chain configuration with `wallet://chains` resource
3. Use `get_current_account` to debug connection issues
4. Enable verbose logging in development mode

Remember: This is an MCP server designed for AI assistants. Keep the interface simple, operations deterministic, and error messages helpful.