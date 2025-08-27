# Encrypted Key Tools

MCP tools for secure encrypted private key management with enterprise-grade security features.

## Overview

Encrypted key tools provide advanced security for production environments where private keys must be stored with military-grade encryption. These tools implement AES-256-GCM encryption with PBKDF2 key derivation, session management, and secure memory handling for enterprise blockchain operations.

**🔐 Security Features:**
- AES-256-GCM encryption
- PBKDF2 with 100,000 iterations
- 30-minute session timeouts
- Secure memory cleanup
- Individual key encryption
- Master password protection

## Tools

### create_encrypted_keystore

Create a new encrypted keystore with master password protection.

**Tool Name:** `mcp__wallet-agent__create_encrypted_keystore`

**What you provide:**
- Master password (minimum 8 characters)

**What the AI returns:**
- Confirmation that keystore was created successfully
- Security features overview (AES-256-GCM, PBKDF2, session management)
- Next steps for importing private keys
- Security reminders about master password protection

**Example Prompts:**
- "Create an encrypted keystore with master password for production use"
- "Set up secure private key storage with encryption"
- "Initialize encrypted key management system"

**Errors:**
- `InvalidRequest` - Keystore already exists
- `InvalidParams` - Master password too short (< 8 characters)
- `InternalError` - Failed to create keystore files

---

### unlock_keystore

Unlock encrypted keystore for private key operations.

**Tool Name:** `mcp__wallet-agent__unlock_keystore`

**What you provide:**
- Master password for the keystore

**What the AI returns:**
- Session unlock confirmation with timeout information
- Available operations while unlocked
- Security reminders about automatic session timeout

**Example Prompts:**
- "Unlock my encrypted keystore with master password"
- "Access my secure private keys for wallet operations"
- "Start encrypted key session"

**Errors:**
- `InvalidRequest` - No keystore found, keystore already unlocked
- `InvalidParams` - Invalid master password
- `InternalError` - Failed to decrypt keystore

---

### lock_keystore

Lock encrypted keystore and clear all decrypted keys from memory.

**Tool Name:** `mcp__wallet-agent__lock_keystore`

**Parameters:** None

**What the AI returns:**
- Confirmation that keystore is locked
- Security confirmation that keys were cleared from memory
- Instructions for unlocking again

**Example Prompts:**
- "Lock my encrypted keystore for security"
- "Secure my private keys and end the session"
- "Clear all decrypted keys from memory"

**Errors:**
- `InternalError` - Failed to lock keystore

---

### get_keystore_status

Get current status of encrypted keystore and session information.

**Tool Name:** `mcp__wallet-agent__get_keystore_status`

**Parameters:** None

**What the AI returns:**
- Keystore status (created/not created, locked/unlocked)
- Session timeout information if unlocked
- Number of keys stored
- Security recommendations

**Example Prompts:**
- "Check my encrypted keystore status"
- "How much time is left in my key session?"
- "Show keystore information and stored keys count"

**Errors:**
- `InternalError` - Failed to check keystore status

---

### import_encrypted_private_key

Import a private key into encrypted storage with individual encryption.

**Tool Name:** `mcp__wallet-agent__import_encrypted_private_key`

**What you provide:**
- Private key (hex string, environment variable name, or file path)
- Master password for verification
- Optional label for the key

**What the AI returns:**
- Ethereum address derived from the private key
- Confirmation that key was encrypted and stored
- Label information if provided

**Example Prompts:**
- "Import private key 0x... into encrypted storage with label 'Main Trading'"
- "Encrypt and store private key from PROD_WALLET_KEY environment variable"
- "Add my private key from ~/.wallet-prod to encrypted keystore"

**Errors:**
- `InvalidRequest` - Keystore locked or not created
- `InvalidParams` - Invalid private key format, key already exists
- `InternalError` - Failed to encrypt and store private key

---

### list_encrypted_keys

List all private keys stored in encrypted keystore.

**Tool Name:** `mcp__wallet-agent__list_encrypted_keys`

**Parameters:** None

**What the AI returns:**
- List of encrypted keys with addresses and labels
- Creation dates for each key
- Security reminder that private keys are never displayed

**Example Prompts:**
- "Show all my encrypted private keys"
- "List the addresses in my secure keystore"
- "What encrypted keys do I have stored?"

**Errors:**
- `InvalidRequest` - Keystore locked or not created
- `InternalError` - Failed to read encrypted keys

---

### remove_encrypted_key

Remove a private key from encrypted storage.

**Tool Name:** `mcp__wallet-agent__remove_encrypted_key`

**What you provide:**
- Ethereum address of the key to remove

**What the AI returns:**
- Confirmation that key was securely deleted
- Address of the removed key
- Security confirmation that key was cleared from memory

**Example Prompts:**
- "Remove encrypted key for address 0x742d35Cc6634C0532925a3b8D7389C4e0C5F0532"
- "Delete private key from secure storage"
- "Securely remove encrypted key for my old wallet"

**Errors:**
- `InvalidRequest` - Keystore locked or not created
- `InvalidParams` - Key not found for specified address
- `InternalError` - Failed to remove encrypted key

---

### update_key_label

Update the label for an encrypted private key.

**Tool Name:** `mcp__wallet-agent__update_key_label`

**What you provide:**
- Ethereum address of the key
- New label for the key

**What the AI returns:**
- Confirmation that label was updated
- Address and new label information

**Example Prompts:**
- "Update label for key 0x742d35Cc6634C0532925a3b8D7389C4e0C5F0532 to 'Production Trading'"
- "Change encrypted key label to 'Main DeFi Wallet'"
- "Rename my encrypted key to 'Backup Wallet'"

**Errors:**
- `InvalidRequest` - Keystore locked or not created
- `InvalidParams` - Key not found for specified address
- `InternalError` - Failed to update key label

---

### change_keystore_password

Change the master password for encrypted keystore (re-encrypts all keys).

**Tool Name:** `mcp__wallet-agent__change_keystore_password`

**What you provide:**
- Current master password
- New master password (minimum 8 characters)

**What the AI returns:**
- Confirmation that password was changed successfully
- Security confirmation that all keys were re-encrypted
- Reminder that keystore remains unlocked

**Example Prompts:**
- "Change my keystore master password for enhanced security"
- "Update encrypted keystore password"
- "Rotate master password and re-encrypt all private keys"

**Errors:**
- `InvalidRequest` - Keystore locked or not created
- `InvalidParams` - Current password incorrect, new password too short
- `InternalError` - Failed to change master password

## Security Architecture

### Encryption Details

**Algorithm:** AES-256-GCM
- Industry-standard symmetric encryption
- Authenticated encryption with additional data (AEAD)
- Provides both confidentiality and authenticity
- Resistant to padding oracle attacks

**Key Derivation:** PBKDF2
- 100,000 iterations (OWASP recommended minimum)
- SHA-256 hash function
- Unique salt per keystore
- Protects against rainbow table attacks

**Individual Key Encryption:**
- Each private key encrypted separately
- Unique initialization vector (IV) per key
- Key-specific additional authenticated data (AAD)
- Prevents cross-key vulnerabilities

### Session Management

**Automatic Timeout:**
- 30-minute session duration
- Automatic lock after inactivity
- Keys cleared from memory on timeout
- Manual lock available anytime

**Memory Security:**
- Decrypted keys stored in secure memory
- Immediate cleanup on session end
- No swap or disk caching
- Protected against memory dumps

### File Security

**Keystore File:**
- Restrictive file permissions (600)
- Stored in user-specific directory
- Integrity verification on load
- Atomic write operations

## Production Deployment

### Environment Setup

**Development Environment:**
```bash
# Create keystore for development
"Create encrypted keystore for development use"
"Import development private key with label 'Dev Testing'"
```

**Production Environment:**
```bash
# Create production keystore
"Create encrypted keystore with strong master password"
"Import private key from PROD_PRIVATE_KEY environment variable with label 'Production Main'"
"Lock keystore when not in use"
```

### Security Best Practices

**Master Password Requirements:**
- ✅ Minimum 12 characters (8 is technical minimum)
- ✅ Mix of uppercase, lowercase, numbers, symbols
- ✅ Unique to this application
- ✅ Not based on personal information
- ✅ Stored in secure password manager

**Operational Security:**
- ✅ Always lock keystore after operations
- ✅ Use environment variables for private key input
- ✅ Regular password rotation (quarterly)
- ✅ Monitor session timeouts
- ✅ Backup keystore with separate password storage

**Access Control:**
- ✅ Restrict keystore file permissions
- ✅ Use dedicated service accounts
- ✅ Implement audit logging
- ✅ Regular security reviews

## Common Workflows

### Initial Setup
```
"Create encrypted keystore for production use"
"Import my private key from MAIN_WALLET_KEY environment variable"
"List my encrypted keys to confirm import"
"Lock keystore for security"
```

### Daily Operations
```
"Check keystore status"
"Unlock encrypted keystore for trading session"
"Connect to wallet using encrypted private key"
[Perform blockchain operations]
"Lock keystore when finished"
```

### Key Management
```
"List all encrypted keys with labels"
"Import additional private key with label 'Backup Wallet'"
"Update label for key 0x... to 'Main Trading Account'"
"Remove old encrypted key that's no longer needed"
```

### Security Maintenance
```
"Change keystore master password for security rotation"
"Check keystore status and session timeout"
"Lock keystore immediately for security"
```

## Integration with Wallet Operations

### Seamless Wallet Connection

Once keys are stored in encrypted keystore:

1. **Unlock Session:**
   ```
   "Unlock my encrypted keystore"
   ```

2. **Switch to Encrypted Keys:**
   ```
   "Switch to private key wallet mode"
   "Connect to my encrypted wallet address"
   ```

3. **Normal Operations:**
   ```
   "Send 1 ETH to 0x..."  # Uses encrypted private key transparently
   "Check my balance"      # Shows balance for encrypted key address
   ```

### Multi-Key Management

Manage multiple encrypted keys:

```
"List my encrypted keys"               # See all stored keys
"Connect to encrypted key labeled 'Trading'"  # Connect to specific key
"Switch to encrypted key for address 0x..."   # Connect by address
```

## Error Handling

### Session Management Errors

**Keystore Locked:**
```
Error: "Key store is locked. Use unlock_keystore first."
Solution: "Unlock my encrypted keystore with master password"
```

**Session Timeout:**
```
Error: "Session has expired. Please unlock keystore again."
Solution: "Unlock encrypted keystore to renew session"
```

### Password Errors

**Invalid Master Password:**
```
Error: "Invalid master password"
Solution: Verify password and try again, or use password recovery if available
```

**Weak New Password:**
```
Error: "New password must be at least 8 characters"
Solution: Choose a stronger password meeting security requirements
```

### Key Management Errors

**Key Already Exists:**
```
Error: "A key for this address is already stored"
Solution: Update existing key or use remove/re-import workflow
```

**Key Not Found:**
```
Error: "No encrypted key found for address"
Solution: Verify address and check list of available keys
```

## Recovery Procedures

### Lost Master Password

{% hint style="danger" %}
**No Password Recovery Available**
If you lose your master password, encrypted keys cannot be recovered. This is a fundamental security feature - no backdoors exist.
{% endhint %}

**Prevention:**
- Store master password in secure password manager
- Use memorable but strong passwords
- Consider password recovery hints (stored separately)
- Regular password testing in development

### Corrupted Keystore

**File Corruption:**
```
Error: "Invalid keystore format" or "Decryption failed"
```

**Recovery Options:**
- Restore from backup if available
- Re-create keystore with new master password
- Re-import private keys from secure sources
- Contact support if data recovery tools are needed

## Compliance and Auditing

### Audit Trail

**Operations Logged:**
- Keystore creation and unlocking
- Key import and removal operations
- Session timeouts and manual locks
- Password change operations

**Log Information:**
- Timestamp of all operations
- Key addresses (not private keys)
- Operation success/failure status
- Session duration information

### Compliance Features

**SOX Compliance:**
- Audit trails for all key operations
- Access control documentation
- Password policy enforcement
- Segregation of duties support

**ISO 27001:**
- Encryption standard compliance
- Key lifecycle management
- Access control frameworks
- Incident response procedures

## Advanced Configuration

### Custom Session Timeouts

While 30 minutes is the default, session timeout can be configured based on security requirements:

- **High Security**: 5-10 minutes for maximum security
- **Standard**: 30 minutes for balanced security/usability
- **Development**: Extended timeouts for debugging (not recommended for production)

### Integration with HSMs

For enterprise environments requiring Hardware Security Module integration:

- Keystore can be configured to use HSM for master key derivation
- Private keys remain encrypted even within HSM environment
- Provides additional tamper resistance and compliance capabilities

### Multi-User Keystore

For team environments:

- Individual keystores per user
- Shared keystore with role-based access
- Audit trails per user for compliance
- Separate master passwords for access control

## Next Steps

- **[Security Guide →](../../user-guide/security.md)** - General security practices
- **[Advanced Encrypted Keys →](../../advanced/encrypted-keys.md)** - Production deployment guide
- **[Private Keys →](../../advanced/private-keys.md)** - Basic private key management
- **[Wallet Tools →](wallet.md)** - Basic wallet connection and management