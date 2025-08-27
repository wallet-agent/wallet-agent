# Claude Code Setup

This guide covers setting up Wallet Agent specifically for Claude Code, Anthropic's official CLI for Claude.

## Prerequisites

- **Claude Code CLI** installed and configured ([installation guide](https://docs.anthropic.com/claude/docs/claude-code))
- **Node.js 18+** or **Bun runtime**
- **Claude Pro** subscription (required for MCP)

## Installation

Add Wallet Agent to Claude Code using npx (or bunx for better performance):

```bash
# Using npx (works everywhere)
claude mcp add wallet-agent npx wallet-agent@latest

# Using bunx (recommended for better performance)
claude mcp add wallet-agent npx wallet-agent@latest
```

This command:
- Downloads the latest version of Wallet Agent
- Configures it as an MCP server  
- Makes it available in all Claude Code sessions

💡 **Performance Tip:** Use `bunx` instead of `npx` for faster startup times if you have Bun installed.

## Verification

### Check MCP Status

Verify Wallet Agent is installed and running:

```
/mcp
```

You should see output like:
```
🔧 MCP Servers

wallet-agent ✅ 
- Status: Connected
- Tools: 63 available
- Version: 1.x.x
```

### Test Basic Functionality

Try a simple command to ensure everything works:

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

## Configuration Options

### Environment Variables

Claude Code supports passing environment variables to MCP servers:

```bash
# Basic setup with environment variable
claude mcp add wallet-agent npx wallet-agent@latest -e WALLET_PRIVATE_KEY=0x...

# Multiple environment variables
claude mcp add wallet-agent npx wallet-agent@latest \
  -e WALLET_PRIVATE_KEY=0x... \
  -e DEBUG=wallet-agent:* \
  -e NODE_ENV=development
```

### Common Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `WALLET_PRIVATE_KEY` | Real wallet private key | `0x123abc...` |
| `DEBUG` | Enable debug logging | `wallet-agent:*` |
| `NODE_ENV` | Environment mode | `development` |
| `RPC_URL_ETHEREUM` | Custom Ethereum RPC | `https://eth-mainnet.g.alchemy.com/v2/...` |

{% hint style="warning" %}
**Private Key Security**: Never commit private keys to code. Use environment variables or encrypted key storage instead.
{% endhint %}

## Claude Code Features

### Natural Language Commands

Claude Code excels at interpreting natural language. You can use conversational commands:

```
"I want to send 0.1 ETH to my friend's wallet at 0x742d35Cc..."
"Can you check if I have enough USDC for a 1000 token transfer?"
"Help me test my smart contract's mint function safely"
```

### Context Awareness

Claude Code maintains context across commands:

```
"Connect to my test wallet"
"What's my balance?"
"Send 1 ETH to the second test wallet"
"Switch to Polygon and check my POL balance"
```

### Error Handling and Guidance

When things go wrong, Claude Code provides helpful explanations:

```
User: "Send 1000000 ETH to 0x123"

Claude: I can see you're trying to send a very large amount (1,000,000 ETH). 
This seems unusual - did you mean 1.0 ETH instead? 

Also, I notice you're in mock mode with test wallets that have 10,000 ETH. 
Would you like me to proceed with a smaller test amount first?
```

## Workflow Integration

### With Code Projects

Claude Code can help integrate Wallet Agent into your development workflow:

```
"Load the wagmi config from my project and analyze the contracts"
"Test all the functions in my ERC-20 contract"
"Help me deploy this contract to Sepolia testnet"
```

### With Documentation

Ask Claude Code to explain and document your Web3 operations:

```
"Explain what this transaction does and add comments"
"Generate documentation for these contract functions"  
"Create a test checklist for my DApp"
```

## Troubleshooting Claude Code

### Common Issues

**"MCP server not responding"**
```bash
# Remove and re-add the MCP server
claude mcp remove wallet-agent
claude mcp add wallet-agent npx wallet-agent@latest
```

**"Command not found: claude"**
```bash
# Check if Claude Code CLI is installed
which claude

# If not installed, follow the official Claude Code installation guide
# Visit: https://docs.anthropic.com/claude/docs/claude-code
```

**"Permission denied" errors**
```bash
# Check Node.js/Bun installation
node --version
bun --version

# Try reinstalling Wallet Agent
claude mcp remove wallet-agent
claude mcp add wallet-agent npx wallet-agent@latest
```

### Debug Mode

Enable detailed logging to troubleshoot issues:

```bash
claude mcp add wallet-agent npx wallet-agent@latest -e DEBUG=wallet-agent:*
```

Check Claude Code's output for detailed error messages and debug information.

### Reset Configuration

If you need to start fresh:

```bash
# Remove Wallet Agent
claude mcp remove wallet-agent

# Clear any cached data
rm -rf ~/.claude/mcp/wallet-agent

# Reinstall
claude mcp add wallet-agent npx wallet-agent@latest
```

## Advanced Features

### Custom Instructions

Create a `~/.claude/instructions.md` file to customize Wallet Agent behavior:

```markdown
# My Wallet Instructions

## Security Preferences
- Always simulate transactions before executing
- Warn me about gas costs over $10
- Never approve unlimited token allowances

## Development Settings  
- Prefer Anvil for testing
- Use conservative gas estimates
- Show detailed transaction breakdowns
```

### Project-Specific Configuration

Create `.claude/instructions.md` in your project:

```markdown
# Project Instructions

This project uses:
- Wagmi for contract interactions
- Sepolia testnet for testing
- OpenZeppelin contracts

Please:
- Load wagmi config from ./src/generated.ts automatically
- Test all contracts on Sepolia before mainnet suggestions
- Use the project's standard gas settings
```

## Best Practices

### Development Workflow

1. **Start with Mock Mode**: Always begin with safe test wallets
2. **Test Thoroughly**: Use contract simulation before real transactions
3. **Environment Isolation**: Keep testnet and mainnet configurations separate
4. **Security First**: Never share private keys in chat

### Using Claude Code Effectively

1. **Be Specific**: "Send 100 USDC to 0x123..." vs "send tokens"
2. **Ask for Explanations**: "Explain what this transaction does"
3. **Request Validations**: "Check if this is safe before executing"
4. **Use Context**: Reference previous operations naturally

### Error Recovery

1. **Read Error Messages**: Claude Code explains Web3 errors clearly
2. **Ask for Help**: "Why did this transaction fail?"
3. **Try Alternatives**: "Is there another way to do this?"
4. **Check Status**: "What's the current state of my wallet?"

## Next Steps

Now that Wallet Agent is configured with Claude Code:

1. **[Try the Quick Start Guide](quick-start.md)** - Learn basic operations
2. **[Explore User Operations](../user-guide/)** - Master wallet management  
3. **[Developer Features](../developer-guide/)** - Smart contract development
4. **[Advanced Topics](../advanced/)** - Real wallets and custom chains

## Getting Help

### Resources
- **[FAQ](../resources/faq.md)** - Common questions
- **[Troubleshooting](../resources/troubleshooting.md)** - Problem solving
- **[GitHub Issues](https://github.com/wallet-agent/wallet-agent/issues)** - Bug reports

### Claude Code Support
- **Claude Help**: Type `/help` in Claude Code
- **MCP Documentation**: [Claude MCP Guide](https://claude.ai/mcp)
- **Community**: Claude Code Discord/Forums

---

Ready to explore Web3 with Claude Code and Wallet Agent? Let's begin.