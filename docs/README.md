# Wallet Agent Documentation

![WalletAgent](https://wallet-agent.ai/og-image.png)

[![CI](https://github.com/wallet-agent/wallet-agent/actions/workflows/ci.yml/badge.svg)](https://github.com/wallet-agent/wallet-agent/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/wallet-agent/wallet-agent/graph/badge.svg)](https://codecov.io/gh/wallet-agent/wallet-agent)

**Wallet Agent** is an MCP (Model Context Protocol) server that enables Web3 wallet interactions in AI tools like Claude Code and Cursor. It provides safe testing with mock wallets and real wallet support via secure private key management.

## What is Wallet Agent?

Wallet Agent enhances AI coding agents with Web3 development capabilities by providing:

- 🔐 **Secure Wallet Management** - Mock wallets for testing, encrypted private keys for real use
- ⛽ **Gas-free Contract Testing** - Simulate contract calls without spending gas
- 🔗 **Multi-chain Support** - Works with Ethereum, Polygon, and custom EVM chains
- 📋 **Wagmi Integration** - Extract, analyze, and test smart contract ABIs
- 🛡️ **Security First** - Private keys never logged, comprehensive validation
- 🤖 **AI-Native** - Prompts for complex Web3 operations

{% hint style="warning" %}
**Beta Software Warning**

This is beta software under active development. **DO NOT use on mainnet or with wallets containing real funds.** This software has not been audited and may contain bugs that could result in loss of funds. Use only on testnets or local development environments.
{% endhint %}

## Quick Navigation

### 🚀 [Getting Started](getting-started/)
New to Wallet Agent? Start here to set up the MCP server with your AI agent.

### 👤 [User Guide](user-guide/)
Learn how to perform wallet operations, send transactions, and manage tokens using prompts.

### 🔧 [Developer Guide](developer-guide/)
Build and test smart contracts, integrate with Wagmi, and extend Wallet Agent's capabilities.

### 📚 [API Reference](api-reference/)
Complete reference for all AI agent tools and conversational commands.

### ⚡ [Advanced Topics](advanced/)
Encrypted key management, custom chains, Hyperliquid integration, and extending functionality.

## Key Features

### Safe Development Environment
- **Mock Wallets**: Pre-configured test accounts for safe development
- **Contract Simulation**: Test functions without gas costs using `eth_call`
- **Anvil Integration**: Local blockchain for accurate testing

### Production-Ready Security
- **Encrypted Key Storage**: AES-256-GCM with PBKDF2 key derivation
- **Session Management**: 30-minute timeouts with automatic key clearing
- **Environment Variables**: Secure private key loading from files or env vars

### Comprehensive Web3 Toolkit
- **Multi-chain Support**: Ethereum, Polygon, custom EVM chains
- **Token Operations**: ERC-20 transfers, approvals, balance checks
- **NFT Management**: ERC-721 transfers and metadata
- **Contract Testing**: Automated scenario generation and validation
- **Wagmi Integration**: ABI extraction, function analysis, standard detection

### AI-Optimized Experience
- **Prompts**: "Send 100 USDC to 0x..." instead of complex function calls
- **Rich Feedback**: Detailed transaction previews and error explanations
- **User Instructions**: Customize behavior with plain English preferences
- **Context Aware**: Remembers wallet state and provides relevant suggestions

## Example Workflows

### Basic Wallet Operations
```
"Connect to 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
"Check my balance"
"Send 0.1 ETH to shanev.eth"
"Switch to Polygon"
```

### Smart Contract Operations
```
"Load my contract configuration for AI interactions"
"Test the transfer function on my token contract"
"Check the balance of a specific account"
"Simulate minting an NFT before executing the transaction"
```

### Token Management
```
"Transfer 100 USDC to 0x..."
"Get my DOGE balance"  
"Approve unlimited USDC spending for 0xDEX..."
```

## Supported AI Tools

### Claude Code
```bash
claude mcp add wallet-agent bunx wallet-agent@latest
```

### Cursor
Configure in your MCP settings to enable Web3 operations through prompts with Cursor's AI agent.

## Community & Support

- **GitHub**: [wallet-agent/wallet-agent](https://github.com/wallet-agent/wallet-agent)
- **Issues**: [Report bugs or request features](https://github.com/wallet-agent/wallet-agent/issues)
- **Discussions**: Community support and questions
- **Documentation**: You're reading it! 📖

## What's Next?

1. **[Install Wallet Agent](getting-started/installation.md)** in your AI agent
2. **[Follow the Quick Start](getting-started/quick-start.md)** guide
3. **[Explore the User Guide](user-guide/)** for common operations
4. **[Dive into Development](developer-guide/)** for advanced features

---

Ready to enhance your AI agent with Web3 capabilities? Let's get started.