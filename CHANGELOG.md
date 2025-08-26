# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.2] - 2025-08-26

### Fixed
- **Critical ETH to Wei Conversion Bug**
  - Fixed `send_transaction` tool treating ETH values as wei instead of ETH
  - Users sending "1 ETH" were actually sending only 1 wei (0.000000000000000001 ETH)
  - Now correctly converts ETH to wei using `parseEther()` from viem
  - Tool definition correctly stated "Value to send in ETH" but implementation was wrong

## [0.3.1] - 2025-08-26

### Fixed
- **CLI Startup Failure**
  - Fixed MCP server connection failures (`bunx wallet-agent` failing in claude mcp list)
  - Updated package.json `bin` field to point to proper CLI entry point (`dist/cli.js`)
  - Separated library (`index.ts`) and CLI (`cli.ts`) entry points properly
  - Fixed ES module imports with proper `.js` extensions
  - Resolved module resolution errors preventing server startup

### Changed
- Cleaner separation between library and CLI usage
- Improved build process for both npm package and CLI executable

## [0.3.0] - 2025-08-26

### Added
- **Performance Optimizations**
  - Client caching in `TransactionEffects` to avoid recreating RPC clients
  - Contract resolution caching with smart invalidation
  - Parallel gas estimation and gas price fetching using `Promise.all()`
  - Automatic cache clearing when configuration changes

- **User Experience Improvements**
  - Comprehensive error message system (`src/utils/error-messages.ts`)
  - Context-aware error suggestions with `createUserFriendlyError()`
  - Standardized, actionable error messages across all tools
  - Improved error code handling (validation vs execution errors)

- **Testing Infrastructure**
  - Enhanced `TestContainer` with automatic cache clearing for isolation
  - Disabled caching in test environments to prevent interference
  - Improved test isolation patterns
  - Full TypeScript type safety in test code

- **Architecture Improvements**
  - Dependency injection container pattern
  - Cache invalidation triggers for configuration changes
  - Smart error handling separation
  - Performance-focused design patterns

### Changed
- **Error Handling**: All handlers now use standardized error messages
- **Test Architecture**: Each test gets isolated container instance
- **Performance**: 2-10x faster repeated operations through intelligent caching
- **Documentation**: Updated `CLAUDE.md` with new architecture patterns and best practices

### Technical Details
- All 653 tests pass with improved performance and reliability
- Zero linting issues with full TypeScript compliance
- Comprehensive caching strategy with automatic invalidation
- Enhanced developer experience with better error messages

## [0.2.0] - Previous release

### Added
- Initial MCP server implementation
- Wagmi integration for wallet operations
- Multi-chain support (Ethereum, Polygon, Arbitrum, Base)
- Token operations (ERC-20, ERC-721)
- Transaction management
- Private key wallet support
- Hyperliquid integration

## [0.1.0] - Initial release

### Added
- Basic wallet agent functionality
- Core MCP tool definitions
- Essential blockchain operations