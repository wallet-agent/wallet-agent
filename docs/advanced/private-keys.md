# Private Keys

Best practices for private key management in AI-assisted blockchain development.

## Overview

Private keys enable real blockchain transactions with actual assets. This guide covers secure private key management when working with AI agents, including import methods, security best practices, and production considerations.

**⚠️ Security Warning:** Private keys control real blockchain assets. Never share, log, or expose private keys. Always use secure storage and transmission methods.

## Private Key Basics

### Mock vs Private Key Wallets
WalletAgent supports two wallet modes:

**Mock Wallets (Testing):**
- Simulated accounts with fake balances
- No real blockchain transactions
- Perfect for development and testing
- No private key management required

**Private Key Wallets (Production):**
- Real blockchain accounts
- Actual asset transfers and transactions
- Requires secure private key management
- Used for mainnet and testnet operations

### When to Use Private Keys
**Development Scenarios:**
- "Test my contract on Sepolia testnet with real transactions"
- "Deploy my contract to Polygon mainnet"
- "Execute real token swaps on Uniswap"
- "Interact with production DeFi protocols"

## Importing Private Keys

### Encrypted Keystore (Recommended)
The most secure method for production use:

**AI Agent Prompts:**
- "Create encrypted keystore for secure private key management"
- "Import my private key with encryption and secure storage"
- "Set up encrypted key management for production use"

**Benefits:**
- AES-256-GCM encryption with master password protection
- Session-based access with automatic timeouts
- Individual key encryption with unique initialization vectors
- Enterprise-grade security with PBKDF2 key derivation

### Secure File Storage
For local development with enhanced security:

**Setup:**
```bash
# Create secure key file
echo "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" > ~/.wallet-private-key
chmod 600 ~/.wallet-private-key  # Secure file permissions
```

**AI Agent Prompts:**
- "Import private key from ~/.wallet-private-key file"
- "Load my development key from ~/keys/dev-wallet.key"
- "Use the private key stored in /secure/path/wallet.key"

**Benefits:**
- Keys stored outside project directory
- Proper file system permissions
- Easy backup and recovery
- Suitable for local development

### Direct Import (Development Only)
Only for local development with test assets:

**AI Agent Prompts:**
- "Import private key 0xac0974... directly" (only use with test keys!)
- "Use the Anvil default private key for testing"

**⚠️ Warning:** Never use direct import in production or with real assets.

## Security Best Practices

### Production Key Management

**Environment Separation:**
**Developer:** "Set up separate keys for development, staging, and production"

**AI Agent Response:** The AI will help configure:
- Development: Test keys with minimal assets
- Staging: Testnet keys mirroring production setup
- Production: Secure mainnet keys with proper controls

**Key Migration:**
**Developer:** "Help me migrate to a new private key address safely"

**AI Agent Response:** The AI will guide through:
1. Generate new key pair
2. Transfer assets to new address
3. Update environment configuration
4. Verify operations with new key
5. Securely dispose of old key

**Access Control:**
**Developer:** "Implement proper access controls for private key usage"

**AI Agent Response:** The AI will recommend:
- Role-based access to key storage
- Multi-signature for high-value operations
- Audit logging for all key usage
- Regular security reviews

### Development Key Security

**Test Key Management:**
**Developer:** "Set up secure test key management for my development environments"

**AI Agent Response:** The AI will configure:
- Environment-specific test keys for development
- Proper key storage and access methods
- Clear labeling of test vs production keys
- Environment access controls and procedures

**Local Security:**
**Developer:** "Secure my local development environment for private keys"

**AI Agent Response:** The AI will help with:
- Secure file permissions and storage
- Local encryption options
- Environment variable management
- Development workflow security

## Wallet Type Management

### Switching Between Wallet Types

**Development Workflow:**
**Developer:** "Start with mock wallet for testing, then switch to private key for deployment"

**AI Agent Response:** The AI will:
1. Set up mock wallet for initial development
2. Test all functionality with simulated transactions
3. Switch to private key wallet for real deployment
4. Maintain same workflow with real assets

**Testing to Production:**
**Developer:** "I've tested everything with mock wallets, now move to production"

**AI Agent Response:** The AI will help:
1. Verify all test scenarios pass
2. Import production private keys
3. Switch to private key wallet mode
4. Execute production deployment safely

### Multi-Environment Setup

**Environment Management:**
**Developer:** "Set up different private keys for different environments"

**AI Agent Response:** The AI will configure:
- Local development: Anvil default keys
- Staging: Testnet keys with real test ETH
- Production: Mainnet keys with proper security
- Clear environment identification and switching

## Private Key Operations

### Basic Operations

**Wallet Connection:**
**Developer:** "Connect to my private key wallet and show current balance"

**AI Agent Response:** The AI will:
1. Import the specified private key
2. Switch to private key wallet mode
3. Connect to the blockchain
4. Display current balance and address

**Transaction Execution:**
**Developer:** "Send 0.1 ETH using my private key wallet"

**AI Agent Response:** The AI will:
1. Verify sufficient balance
2. Estimate gas costs
3. Execute the transaction
4. Monitor confirmation status

### Advanced Operations

**Multi-Chain Operations:**
**Developer:** "Use my private key on both Ethereum and Polygon"

**AI Agent Response:** The AI will:
1. Configure private key for multi-chain use
2. Show balances on both networks
3. Handle network switching seamlessly
4. Manage gas tokens for each network

**Contract Interactions:**
**Developer:** "Deploy and interact with contracts using my private key"

**AI Agent Response:** The AI will:
1. Deploy contracts with proper gas estimation
2. Verify deployment success
3. Execute contract functions safely
4. Monitor all transaction confirmations

## Security Monitoring

### Transaction Monitoring

**Activity Tracking:**
**Developer:** "Monitor all transactions from my private key wallet"

**AI Agent Response:** The AI will:
- Track all outgoing transactions
- Monitor balance changes
- Report on gas usage
- Alert on unusual activity patterns

**Security Alerts:**
**Developer:** "Set up alerts for suspicious private key wallet activity"

**AI Agent Response:** The AI will configure:
- Large transaction alerts
- Unusual gas price notifications
- Failed transaction monitoring
- Balance threshold warnings

### Audit and Compliance

**Transaction History:**
**Developer:** "Generate an audit report of all private key wallet transactions"

**AI Agent Response:** The AI will provide:
- Complete transaction history
- Gas usage analysis
- Success/failure rates
- Counterparty analysis

**Compliance Reporting:**
**Developer:** "Help me maintain compliance records for private key operations"

**AI Agent Response:** The AI will help with:
- Regulatory compliance documentation
- Transaction categorization and reporting
- Tax reporting assistance
- Audit trail maintenance


## Best Practices Summary

### Do's
✅ **Use encrypted keystore for production keys**
✅ **Plan for secure key migration when needed**
✅ **Separate keys by environment (dev/staging/prod)**
✅ **Monitor and audit all private key operations**
✅ **Use secure file permissions and storage**
✅ **Test with mock wallets before using private keys**
✅ **Implement proper access controls**

### Don'ts
❌ **Never hardcode private keys in code**
❌ **Never commit private keys to version control**
❌ **Never share private keys via insecure channels**
❌ **Never use production keys for development**
❌ **Never ignore security warnings or alerts**
❌ **Never skip testing with mock wallets first**
❌ **Never use the same key across all environments**

## Related Documentation

- [Encrypted Keys](encrypted-keys.md) - Enhanced security options
- [User Instructions](user-instructions.md) - Custom security workflows
- [Security Guide](../user-guide/security.md) - General security practices
