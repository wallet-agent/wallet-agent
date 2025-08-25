---
description: Wallet Agent development guidelines and architecture notes
globs: "src/**/*.ts, *.json, *.md"
alwaysApply: true
---

# Wallet Agent Development Guidelines

This document contains project-specific guidelines for AI assistants working on the Wallet Agent codebase. For general usage and features, see @README.md.

## Architecture Overview

The codebase follows a modular architecture with dependency injection:

```
src/
├── index.ts                 # Entry point
├── server.ts                # MCP server setup and request handlers
├── container.ts             # Dependency injection container
├── test-container.ts        # Test-specific container for isolation
├── core/                    # Business logic
│   ├── contract-resolution.ts  # Contract and token resolution (cached)
│   ├── transaction-helpers.ts  # Transaction utilities
│   └── validators.ts           # Input validation
├── effects/                 # Side effect handlers
│   ├── wallet-effects.ts       # Wallet operations
│   ├── transaction-effects.ts  # Transaction operations (cached clients)
│   ├── token-effects.ts        # Token operations
│   └── contract-effects.ts     # Contract ABI management
├── adapters/                # External service adapters
│   ├── wallet-adapter.ts       # Wagmi wallet integration
│   └── contract-adapter.ts     # Contract ABI storage
├── tools/                   # MCP tool implementations
│   ├── definitions.ts          # Tool schemas
│   ├── handlers.js             # Tool orchestration
│   └── handlers/               # Individual tool handlers
└── utils/
    └── error-messages.ts       # Standardized user-friendly errors
```

## Key Design Principles

1. **Separation of Concerns**: Each module has a single responsibility
2. **Dependency Injection**: Container-based architecture for testability and modularity
3. **Type Safety**: Leverage TypeScript's strict mode and Viem's type system
4. **Security First**: Private keys are never logged or exposed
5. **Multi-Chain Support**: All operations should work across any EVM chain
6. **Performance**: Caching for frequently accessed resources (clients, contracts)
7. **User Experience**: Standardized, actionable error messages

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

Use standardized error messages from `src/utils/error-messages.ts`:
- Import: `import { ErrorMessages, createUserFriendlyError } from "../utils/error-messages.js"`
- Use predefined messages: `throw new Error(ErrorMessages.WALLET_NOT_CONNECTED)`
- For dynamic errors: `throw new Error(ErrorMessages.CHAIN_NOT_FOUND(chainId))`
- Wrap execution errors: `throw new Error(createUserFriendlyError(error, "Context"))`

MCP-specific error codes:
- `ErrorCode.InvalidParams` - Bad input parameters (validation errors)
- `ErrorCode.InvalidRequest` - Missing prerequisites (e.g., no wallet connected)
- `ErrorCode.MethodNotFound` - Unknown tool name
- `ErrorCode.InternalError` - Unexpected execution errors

**Important**: Only wrap execution errors, not validation errors from `validateArgs()`.

## Testing Guidelines

**Test Isolation**: Use `TestContainer.createForTest()` for isolated test environments:
```typescript
import { TestContainer } from "../../../src/test-container.js"

let testContainer: TestContainer
beforeEach(() => {
  testContainer = TestContainer.createForTest({})
})
```

When testing changes:
1. **Use isolated containers**: Each test gets its own container instance
2. **Test both wallet modes**: Mock and private key wallets
3. **Multi-chain testing**: Test on at least Anvil and one testnet
4. **Error message verification**: Check messages are helpful and actionable
5. **Currency symbols**: Verify native currency symbols display correctly
6. **Cache isolation**: Test container automatically clears caches between tests

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

**Caching Strategy**:
- `TransactionEffects` caches public clients per chain
- `contract-resolution.ts` caches resolved contract information
- Caches are automatically cleared when configuration changes
- Test environments disable caching to prevent test interference

**Optimization Guidelines**:
- Reuse wallet clients when possible
- Batch RPC calls with `Promise.all()` where appropriate
- Keep the main thread responsive during async operations
- Use parallel gas estimation and price fetching
- Clear caches when chains or contracts are updated

## Future Enhancements

Areas for potential improvement:
- WalletConnect integration for QR code connections
- Hardware wallet support via WebUSB
- Advanced transaction batching
- More sophisticated gas optimization
- Multi-signature wallet support
- Real-time transaction monitoring
- Cross-chain bridge integrations

## Debugging Tips

1. Check wallet connection state with `get_wallet_info`
2. Verify chain configuration with `wallet://chains` resource
3. Use `get_current_account` to debug connection issues
4. Enable verbose logging in development mode

Remember: This is an MCP server designed for AI assistants. Keep the interface simple, operations deterministic, and error messages helpful.