# Installation

Install Wallet Agent as an MCP server in your AI assistant. The process is simple and takes just a few minutes.

## System Requirements

- **Node.js 18+** or **Bun runtime**
- **AI Assistant**: Claude Code or Cursor with MCP support
- **Operating System**: macOS, Linux, or Windows

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
- Ensure Claude Code CLI is installed and in your PATH
- Update to the latest Claude Code version

**"MCP server failed to start"**:
- Check that Node.js or Bun is installed: `node --version` or `bun --version`
- Try: `bunx wallet-agent` manually to see error messages
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
- Ensure `bunx` is in your PATH: `bunx --version`
- Try running `bunx wallet-agent` manually
- Check Cursor logs for detailed error messages

**"MCP not responding"**:
- Restart Cursor completely
- Verify the JSON syntax in `mcp.json`
- Try removing and re-adding the server configuration
{% endtab %}
{% endtabs %}

## Development Installation

For development or contributing to Wallet Agent:

### 1. Clone the Repository

```bash
git clone https://github.com/wallet-agent/wallet-agent.git
cd wallet-agent
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Build the Project

```bash
bun run build
```

### 4. Link Locally

{% tabs %}
{% tab title="Claude Code" %}
```bash
claude mcp add wallet-agent bun /path/to/wallet-agent/dist/index.js
```
{% endtab %}

{% tab title="Cursor" %}
Update your `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "wallet-agent": {
      "command": "bun",
      "args": ["/path/to/wallet-agent/dist/index.js"]
    }
  }
}
```
{% endtab %}
{% endtabs %}

## Environment Variables (Optional)

Wallet Agent supports optional environment variables for advanced configuration:

```bash
# Add to your shell profile or MCP config
export WALLET_PRIVATE_KEY="0x..."  # For real wallet mode
export DEBUG="wallet-agent:*"      # Enable debug logging
export NODE_ENV="development"      # Development mode
```

### Adding Environment Variables to MCP

{% tabs %}
{% tab title="Claude Code" %}
```bash
claude mcp add wallet-agent bunx wallet-agent -e WALLET_PRIVATE_KEY=0x...
```
{% endtab %}

{% tab title="Cursor" %}
```json
{
  "mcpServers": {
    "wallet-agent": {
      "command": "bunx",
      "args": ["wallet-agent"],
      "env": {
        "WALLET_PRIVATE_KEY": "0x...",
        "DEBUG": "wallet-agent:*"
      }
    }
  }
}
```
{% endtab %}
{% endtabs %}

{% hint style="warning" %}
**Never commit private keys to version control!** Use environment variables or encrypted key storage instead.
{% endhint %}

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
- Ensure Node.js 18+ is installed
- Try clearing npm/bun cache: `bun pm cache rm`

**"Permission denied" errors**:
- Check file permissions on the installation directory
- Try running with appropriate permissions

**MCP server startup failures**:
- Run `bunx wallet-agent` manually to see detailed errors
- Check that all dependencies are installed
- Verify your AI assistant supports MCP

### Getting Help

If you encounter issues:
1. Check the [Troubleshooting Guide](../resources/troubleshooting.md)
2. Review [Common Issues](../resources/faq.md)
3. [Open an issue](https://github.com/wallet-agent/wallet-agent/issues) on GitHub

---

Need help? The community is here to support you! 💪