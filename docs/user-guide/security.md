# Security

Learn essential security practices for safe Web3 operations, private key management, and protecting your assets when using WalletAgent.

## Security Fundamentals

### Web3 Security Principles

Web3 security is **your responsibility**. Unlike traditional banking, there's no central authority to reverse fraudulent transactions or recover lost funds. Key principles:

- **Private Keys = Complete Control** - Whoever has your private key owns your assets
- **Transactions are Irreversible** - No "undo" or "chargeback" options
- **Smart Contracts are Immutable** - Code flaws can be permanent
- **You are the Bank** - Complete responsibility for asset security

### WalletAgent Security Features

WalletAgent includes multiple security layers:

- **Mock Mode Default** - Safe testing environment
- **Transaction Previews** - See exactly what will happen
- **Input Validation** - Prevents common mistakes
- **Encrypted Storage** - AES-256-GCM for private keys
- **Session Management** - Automatic timeouts and cleanup
- **Never Logs Secrets** - Private keys never written to logs

## Mock Mode Security

### Why Start with Mock Mode

Mock mode provides **complete safety** for learning:

```
Get wallet info
```

**Safe Mock Mode Output:**
```
🔧 Wallet Configuration
- Type: Mock (safe for testing) ✅
- Available Accounts: 3
- Current Chain: Anvil (31337)
- Native Currency: ETH

💡 You're in mock mode - perfect for learning!
🛡️ No real funds at risk
```

### Mock Mode Benefits

- ✅ **Zero Risk** - No real money involved
- ✅ **Unlimited Funds** - Test wallets never run out
- ✅ **All Operations** - Practice everything safely
- ✅ **Reversible Learning** - Make mistakes without consequences
- ✅ **Multi-Chain** - Test on all networks

### When Mock Mode is Sufficient

Use mock mode for:
- Learning WalletAgent commands
- Testing smart contract interactions
- Experimenting with DeFi protocols
- Developing applications
- Practicing complex operations safely

## Real Wallet Security

### Encrypted Key Management

WalletAgent provides secure private key storage:

```
Create encrypted keystore with master password
```

**Security Features:**
- **AES-256-GCM** - Military-grade encryption
- **PBKDF2** - 100,000 iterations for key derivation
- **Session Management** - 30-minute automatic timeout
- **Memory Protection** - Keys cleared on session end
- **File Security** - Restrictive permissions (600)

### Private Key Best Practices

{% hint style="danger" %}
**Critical Security Rules:**
- Never share private keys in chat or messages
- Never commit private keys to code repositories
- Never store private keys in plain text files
- Never use the same private key on multiple devices
- Never take screenshots of private keys
{% endhint %}

### Secure Private Key Storage Options

**Option 1: Encrypted Keystore (Recommended)**
```
Create encrypted keystore with master password
Import encrypted private key from PRIVATE_KEY_ENV
```

**Option 2: Environment Variables**
```bash
export WALLET_PRIVATE_KEY="0x..."
```

**Option 3: Secure Files**
```bash
echo "0x..." > ~/.wallet-private-key
chmod 600 ~/.wallet-private-key
```

### Master Password Security

Choose a strong master password that:
- ✅ Is at least 12 characters long
- ✅ Includes uppercase, lowercase, numbers, symbols
- ✅ Is unique to this application
- ✅ You can remember without writing down
- ❌ Is not based on personal information
- ❌ Is not reused from other accounts

## Transaction Security

### Before Every Transaction

Always verify these details before confirming:

```
Send 1 ETH to 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

**Security Checklist:**
- ✅ **Recipient Address** - Double-check every character
- ✅ **Amount** - Verify the exact value and token type
- ✅ **Network** - Confirm you're on the correct chain
- ✅ **Gas Fee** - Ensure fee is reasonable
- ✅ **Balance** - Confirm you have sufficient funds

### Address Verification

Always verify addresses carefully:

```
# Good practices:
"Confirm this address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
"Is this the correct recipient for my payment?"
"Double-check this address format"

# Bad practices:
❌ Trusting addresses from unverified sources
❌ Not checking addresses character by character  
❌ Copying addresses from suspicious websites
```

### Transaction Simulation

Use simulation before executing transactions:

```
Simulate transfer 100 USDC to 0x7099
```

**Benefits:**
- Preview transaction results
- Identify potential failures
- Estimate accurate gas costs
- Verify contract behavior

## Smart Contract Security

### Contract Interaction Safety

When interacting with smart contracts:

```
# Safe approach:
"Get contract info for 0x..."
"Simulate mint function before executing"
"What does this contract do?"

# Risky approach:
❌ Interacting with unverified contracts
❌ Signing transactions without understanding
❌ Trusting contract addresses from untrusted sources
```

### Token Approval Security

Be extremely careful with token approvals:

```
# Conservative approach:
Approve 100 USDC for specific transaction

# Risky approach:
❌ Approve unlimited USDC for unknown contract
```

**Approval Best Practices:**
- ✅ **Minimum Required** - Only approve what you need
- ✅ **Trusted Contracts** - Only approve audited, well-known contracts
- ✅ **Regular Cleanup** - Revoke unused approvals
- ✅ **Monitor Activity** - Track approval transactions

### Revoking Dangerous Approvals

Immediately revoke suspicious approvals:

```
Revoke all USDC approvals
Check all token approvals for my wallet
```

## Network Security

### Chain Verification

Always verify you're on the correct network:

```
What chain am I on?
```

**Common Chain Confusion:**
- Sending ETH to Polygon address (funds lost)
- Using wrong network for DApp interaction
- Paying high Ethereum fees for simple operations

### Network Security

When working with different networks:

**Built-in Network Safety:**
- ✅ **Pre-configured** - Built-in networks use trusted endpoints
- ✅ **Verified Chain IDs** - All networks properly configured
- ✅ **Secure Connections** - HTTPS endpoints for all networks
- ✅ **Tested** - Networks verified for security and reliability

## Phishing Protection

### Common Phishing Attacks

Be aware of these attack vectors:

**Fake Websites:**
- Mimic legitimate DeFi protocols
- Use similar domain names (uniswap vs uniswaρ)
- Request private key or seed phrase input

**Social Engineering:**
- "Support" messages requesting private keys
- Fake airdrops requiring private key disclosure
- Urgent "security updates" requesting credentials

**Malicious Contracts:**
- Contracts that drain approved tokens
- Hidden malicious functions in code
- Fake token contracts mimicking real ones

### Protection Strategies

**Never Share Sensitive Information:**
```
❌ Never share:
- Private keys
- Seed phrases  
- Master passwords
- Session tokens

✅ Safe to share:
- Public addresses
- Transaction hashes
- Public keys
- Wallet connection status
```

**Verify Before Interacting:**
- Check website URLs carefully
- Verify contract addresses against official sources
- Use bookmarks for frequently used DApps
- Be suspicious of urgent requests

## Error Recognition & Response

### Identifying Security Issues

Recognize these warning signs:

**Suspicious Wallet Behavior:**
```
❌ Warning Signs:
- Unexpected transaction requests
- Unknown contract interactions
- Unusual token approvals
- Unfamiliar addresses receiving funds
```

**Network Issues:**
```
❌ Red Flags:
- Connection to unknown RPC endpoints
- Requests involving unknown or suspicious networks
- Network switches to unfamiliar chains
- SSL certificate warnings
```

### Incident Response

If you suspect a security issue:

1. **Immediate Actions:**
   ```
   Disconnect wallet immediately
   Lock encrypted keystore
   Check recent transactions
   ```

2. **Assessment:**
   ```
   Review transaction history
   Check token approvals
   Verify wallet balances
   ```

3. **Recovery:**
   ```
   Revoke suspicious approvals
   Transfer funds to new wallet (if compromised)
   Change all related passwords
   ```

## Multi-Chain Security

### Cross-Chain Considerations

Each blockchain has security implications:

**Ethereum:**
- High security but expensive
- Well-audited protocols
- Highest value at risk

**Layer 2 Networks (Polygon, Arbitrum):**
- Lower costs but additional complexity
- Bridge security dependencies
- Faster transactions but different risk profiles

**Testnets:**
- Perfect for learning and testing
- No real value at risk
- Same security practices for muscle memory

### Bridge Security

When using cross-chain bridges:

- ✅ **Official Bridges** - Use only official, audited bridges
- ✅ **Small Amounts** - Test with small amounts first
- ✅ **Double-Check** - Verify destination addresses
- ❌ **Unknown Bridges** - Avoid unaudited bridge protocols

## Security Monitoring

### Regular Security Audits

Perform periodic security reviews:

```
# Monthly security check:
Show my recent transactions
Check all token approvals  
Review connected contracts
What chains am I using?
```

### Transaction Monitoring

Stay aware of your wallet activity:

```
# Regular monitoring:
Show recent transactions
Get current account status
Check balances across all chains
```

### Approval Hygiene

Regularly clean up token approvals:

```
# Quarterly approval cleanup:
List all token approvals
Revoke unused approvals
Check for suspicious permissions
```

## Emergency Procedures

### Compromised Wallet Response

If your wallet is compromised:

1. **Immediate Damage Control:**
   - Stop using the compromised wallet immediately
   - Do not send more funds to compromised addresses
   - Document all suspicious transactions

2. **Asset Recovery:**
   - Transfer remaining funds to new, secure wallet
   - Revoke all token approvals if possible
   - Contact relevant protocols if large amounts involved

3. **Prevention:**
   - Generate new private keys securely
   - Review and improve security practices
   - Consider hardware wallet for future use

### Lost Access Recovery

If you lose access to your wallet:

- **Encrypted Keystore**: Use master password to recover
- **Environment Variable**: Restore from secure backup
- **File Storage**: Restore from backed-up file

{% hint style="warning" %}
**No Recovery Without Keys**: If you lose your private key/master password, funds cannot be recovered. This is a fundamental aspect of Web3.
{% endhint %}

## Security Tools & Resources

### Built-in Security Features

WalletAgent provides these security tools:

```
# Security commands:
Get wallet security status
Check transaction safety
Review token permissions
Analyze contract risks
```

### External Security Resources

**Transaction Analysis:**
- Etherscan.io - Transaction and contract verification
- DeBank.com - Portfolio and approval tracking
- Revoke.cash - Token approval management

**Contract Verification:**
- Contract source code verification
- Audit reports from security firms
- Community security discussions

### Security Communities

Stay informed through:
- Web3 security newsletters
- DeFi safety communities
- Protocol-specific security channels
- Blockchain security researchers

## Final Security Reminders

### Core Principles

Remember these essential rules:

1. **Never Share Private Keys** - Not even with "support"
2. **Start with Mock Mode** - Practice safely before using real funds
3. **Verify Everything** - Addresses, amounts, networks, contracts
4. **Use Minimal Approvals** - Only approve what's necessary
5. **Stay Informed** - Follow security best practices and updates

### Building Security Habits

- ✅ **Always Simulate First** - Use simulation before real transactions
- ✅ **Double-Check Addresses** - Verify recipient addresses
- ✅ **Monitor Regularly** - Review transactions and approvals
- ✅ **Stay Updated** - Follow security news and best practices
- ✅ **Practice in Mock Mode** - Build muscle memory safely

### When in Doubt

If you're unsure about any operation:

1. **Test in Mock Mode** - Practice the operation safely first
2. **Ask for Verification** - "Is this address/contract safe?"
3. **Start Small** - Use minimal amounts for testing
4. **Research First** - Verify contracts and protocols independently

---

Security is a journey, not a destination. Stay vigilant, keep learning, and always prioritize safety over convenience! 🛡️