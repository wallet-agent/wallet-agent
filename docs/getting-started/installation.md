# Installation

Install Wallet Agent as an MCP server in your AI assistant. The process is simple and takes just a few minutes.

## Requirements

- **AI Assistant**: Claude Code or Cursor with MCP support
- **Operating System**: macOS, Linux, or Windows
- Your AI assistant will handle all technical requirements automatically

## Installation Methods

{% tabs %}
{% tab title="Claude Code" %}
The easiest way to install Wallet Agent:

```bash
claude mcp add wallet-agent bunx wallet-agent@latest
```

### Verify Installation

Check that Wallet Agent is running:

```
/mcp
```

You should see `wallet-agent` listed among your MCP servers.

### Alternative: Manual Installation

If you prefer manual setup:

```bash
# Download and configure manually
claude mcp add wallet-agent bunx wallet-agent
```

### Troubleshooting Claude Code

**"Command not found"**:
- Ensure Claude Code CLI is installed and updated
- Follow Claude Code installation instructions from official documentation

**"MCP server failed to start"**:
- Check your AI assistant's MCP configuration
- Restart your AI assistant and try again
{% endtab %}

{% tab title="Cursor" %}
Add Wallet Agent to your Cursor MCP configuration:

### 1. Open MCP Configuration

Edit your MCP configuration file:

```bash
# macOS/Linux
~/.cursor/mcp.json

# Windows  
%APPDATA%\Cursor\mcp.json
```

### 2. Add Wallet Agent

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

### 3. Restart Cursor

Close and reopen Cursor to load the MCP server.

### 4. Verify Installation

In Cursor, try a simple command:
```
List available MCP tools
```

You should see Wallet Agent tools in the response.

### Troubleshooting Cursor

**"Server failed to start"**:
- Ensure your system meets requirements
- Restart Cursor and try again
- Check Cursor logs for detailed error messages

**"MCP not responding"**:
- Restart Cursor completely
- Verify the configuration file syntax
- Try removing and re-adding the server configuration
{% endtab %}
{% endtabs %}

## Advanced Setup

For advanced users or contributors who want to customize Wallet Agent behavior, see the [Developer Guide](../developer-guide/) for detailed setup instructions.

## Advanced Configuration

For advanced configuration including private key management and custom settings, see the [Security Guide](../user-guide/security.md) and [Advanced Topics](../advanced/) sections.

## Verification

Test that Wallet Agent is working correctly:

### 1. Basic Connection Test

```
Get wallet info
```

Expected response:
```
🔧 Wallet Configuration
- Type: Mock (safe for testing)
- Available Accounts: 3
- Current Chain: Anvil (31337)
```

### 2. List Available Tools

```
What MCP tools are available?
```

You should see 60+ tools including:
- `connect_wallet`
- `send_transaction`  
- `transfer_token`
- `simulate_contract_call`
- And many more...

### 3. Try a Simple Operation

```
Connect to 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

Expected response:
```
✅ Connected to wallet successfully!
📍 Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
⛓️ Chain: Anvil (Chain ID: 31337)
💰 Balance: 10000.0 ETH
```

## Next Steps

Great! Wallet Agent is now installed and running. Let's try some basic operations:

👉 **[Continue to Quick Start →](quick-start.md)**

## Troubleshooting

### Common Issues

**"Module not found" errors**:
- Ensure your AI assistant is properly configured
- Try restarting your AI assistant

**"Permission denied" errors**:
- Check your system permissions
- Try running your AI assistant with appropriate permissions

**MCP server startup failures**:
- Check that your AI assistant supports MCP
- Verify Wallet Agent was installed correctly
- Restart your AI assistant

### Getting Help

If you encounter issues:
1. Check the [Troubleshooting Guide](../resources/troubleshooting.md)
2. Review [Common Issues](../resources/faq.md)
3. [Open an issue](https://github.com/wallet-agent/wallet-agent/issues) on GitHub

---

Need help? The community is here to support you! 💪