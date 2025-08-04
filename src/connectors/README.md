# Wallet Connectors in MCP Server

## The Challenge

MCP servers run in Node.js, while wallets like MetaMask are browser extensions. This creates a fundamental incompatibility:
- MetaMask requires `window.ethereum` (browser API)
- MCP servers have no browser context
- Direct communication isn't possible

## Available Solutions

### 1. **Mock Connector** (Current Implementation)
- Perfect for testing and development
- No external dependencies
- Instant transaction approval

### 2. **Private Key Import** (Recommended for MCP)
- Import wallet's private key
- Full control in Node.js environment
- Works with any EVM account across all supported chains
- ⚠️ Security: Private keys should be stored securely

### 3. **WalletConnect** (Future Enhancement)
- Works via QR codes and deep links
- No browser needed
- Requires WalletConnect Cloud project

### 4. **Browser Automation** (Complex)
- Use Playwright to control browser
- Can interact with MetaMask
- Heavy dependencies and complexity
- Not recommended for MCP servers

## Current Implementation

We support:
1. **Mock Wallet** - For testing with predefined accounts
2. **Private Key Wallet** - For using real EVM accounts on any supported chain

To use a real wallet with this MCP server:
1. Export your wallet's private key
2. Set it as an environment variable
3. Use the `import_private_key` tool
4. All subsequent operations use this wallet on any EVM chain

## Security Considerations

- Never commit private keys to git
- Use environment variables
- Consider using hardware wallets for production
- Implement proper key management practices