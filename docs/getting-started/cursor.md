# Cursor Setup

This guide covers setting up WalletAgent for Cursor, the AI-first code editor built on VSCode.

## Prerequisites

- **Cursor** installed and running
- **Node.js 18+** or **Bun runtime**  
- Basic familiarity with JSON configuration files

## Installation

### Step 1: Locate MCP Configuration

Cursor stores MCP server configurations in a JSON file. The location depends on your operating system:

{% tabs %}
{% tab title="macOS" %}
```bash
~/.cursor/mcp.json
```

If the file doesn't exist, create it:
```bash
mkdir -p ~/.cursor
touch ~/.cursor/mcp.json
```
{% endtab %}

{% tab title="Linux" %}
```bash
~/.config/cursor/mcp.json
```

If the file doesn't exist, create it:
```bash
mkdir -p ~/.config/cursor
touch ~/.config/cursor/mcp.json
```
{% endtab %}

{% tab title="Windows" %}
```bash
%APPDATA%\Cursor\mcp.json
```

If the file doesn't exist, create it through File Explorer or Command Prompt:
```cmd
mkdir "%APPDATA%\Cursor"
type nul > "%APPDATA%\Cursor\mcp.json"
```
{% endtab %}
{% endtabs %}

### Step 2: Configure WalletAgent

Add WalletAgent to your MCP configuration:

```json
{
  "mcpServers": {
    "wallet-agent": {
      "command": "bunx",
      "args": ["wallet-agent"]
    }
  }
}
```

### Step 3: Restart Cursor

Close Cursor completely and reopen it to load the new MCP server.

## Configuration Options

### Basic Configuration

The minimal configuration to get started:

```json
{
  "mcpServers": {
    "wallet-agent": {
      "command": "bunx",
      "args": ["wallet-agent@latest"]
    }
  }
}
```

### Local Development

If you're developing or contributing to WalletAgent:

```json
{
  "mcpServers": {
    "wallet-agent": {
      "command": "bun",
      "args": ["/absolute/path/to/wallet-agent/dist/index.js"]
    }
  }
}
```

## Security Best Practices

{% hint style="warning" %}
**Private Key Security**: For real wallet operations, use WalletAgent's encrypted keystore or import features.
{% endhint %}

## Verification

### Test MCP Connection

In Cursor, open a new chat and try:

```
What MCP servers are available?
```

You should see WalletAgent listed among the available servers.

### Test WalletAgent

Try a basic WalletAgent command:

```
Get wallet info
```

Expected response:
```
🔧 Wallet Configuration
- Type: Mock (safe for testing)
- Available Accounts: 3
- Current Chain: Anvil (31337)
- Native Currency: ETH

💡 You're in mock mode - perfect for learning!
```

### Test Tool Access

List available WalletAgent tools:

```
List all wallet agent tools
```

You should see 60+ tools including wallet management, transactions, tokens, and contract operations.

## Cursor-Specific Features

### Code Integration

Cursor excels at integrating WalletAgent with your code projects:

```
"Analyze the smart contract in this file and test its functions"
"Generate wagmi hooks for this contract ABI"
"Help me deploy this contract to Sepolia testnet"
```

### File Context

Cursor can reference files in your workspace:

```
"Load the wagmi config from src/generated.ts"
"Test the contract defined in contracts/MyToken.sol"
"Check if this transaction in transaction.ts is valid"
```

### Multi-file Operations

```
"Review all the contracts in the contracts/ directory"
"Generate tests for each contract in my project"
"Update all the contract addresses in my config files"
```

## Project Integration

### Workspace Configuration

Create a `.cursor/mcp.json` file in your project root for project-specific settings:

```json
{
  "mcpServers": {
    "wallet-agent": {
      "command": "bunx",
      "args": ["wallet-agent"],
      "env": {
        "NODE_ENV": "development",
        "DEFAULT_CHAIN": "sepolia"
      }
    }
  }
}
```

### Package.json Integration

Add WalletAgent scripts to your `package.json`:

```json
{
  "scripts": {
    "wallet:test": "bunx wallet-agent --mode=test",
    "wallet:dev": "NODE_ENV=development bunx wallet-agent"
  }
}
```

### TypeScript Integration

If your project uses TypeScript, WalletAgent provides full type safety and intellisense support for all operations through the AI agent interface.


## Advanced Configuration

### Multiple Profiles

Configure different profiles for different environments:

```json
{
  "mcpServers": {
    "wallet-agent-dev": {
      "command": "bunx",
      "args": ["wallet-agent"],
      "env": {
        "NODE_ENV": "development",
        "DEFAULT_CHAIN": "anvil"
      }
    },
    "wallet-agent-test": {
      "command": "bunx", 
      "args": ["wallet-agent"],
      "env": {
        "NODE_ENV": "test",
        "DEFAULT_CHAIN": "sepolia"
      }
    }
  }
}
```


## Best Practices

### Development Workflow

1. **Start Simple**: Begin with basic configuration, add complexity gradually
2. **Test Locally**: Verify commands work before complex operations
3. **Use Mock Mode**: Start with safe test wallets
4. **Environment Separation**: Keep dev/test/prod configurations separate

### Security Guidelines

1. **Never Commit Keys**: Use WalletAgent's encrypted keystore
2. **Limit Permissions**: Use restrictive file permissions (600) for key files
3. **Regular Rotation**: Change private keys regularly
4. **Monitor Usage**: Keep track of transactions and gas usage

### Performance Tips

1. **Local RPC**: Use local Anvil for development
2. **Cache Results**: WalletAgent caches contract ABIs and chain data
3. **Batch Operations**: Combine multiple operations when possible

## Next Steps

Now that WalletAgent is configured with Cursor:

1. **[Complete the Quick Start](quick-start.md)** - Learn basic operations
2. **[Explore User Features](../user-guide/)** - Master wallet operations
3. **[Developer Guide](../developer-guide/)** - Smart contract development
4. **[Advanced Topics](../advanced/)** - Real wallets and extensions

## Getting Help

### Resources
- **[FAQ](../resources/faq.md)** - Common questions and answers
- **[GitHub Issues](https://github.com/wallet-agent/wallet-agent/issues)** - Bug reports and feature requests

### Community
- **Cursor Discord** - Cursor-specific help and community
- **GitHub Discussions** - General WalletAgent discussions
- **Stack Overflow** - Technical questions tagged with `wallet-agent`

---

Ready to build Web3 apps with Cursor and WalletAgent? Let's start coding.