# Encrypted Keys

Enhanced security options for private key management in AI-assisted blockchain development.

## Overview

Encrypted key storage provides an additional security layer when using private keys with AI agents. This guide covers encrypted key management, security enhancements, and production deployment considerations for WalletAgent.

**🔐 Security Enhancement:** Encrypted keys add protection against unauthorized access while maintaining the convenience of AI-assisted blockchain operations.

## Understanding Encrypted Keys

### Encryption vs Plain Storage

**Plain Private Keys:**
- Stored directly in files or direct import
- Immediate access but higher security risk
- Suitable for development environments
- No additional setup required

**Encrypted Private Keys:**
- Protected with AES-256-GCM encryption and master password
- Individual key encryption with unique initialization vectors
- Enterprise-grade security with PBKDF2 key derivation (100,000 iterations)
- Session-based access with automatic 30-minute timeouts
- Secure memory handling and cleanup

### WalletAgent Encrypted Key System

WalletAgent provides a complete encrypted key management system with 9 specialized MCP tools:

**Keystore Management:**
- `create_encrypted_keystore` - Initialize secure storage
- `unlock_keystore` - Begin secure session
- `lock_keystore` - End session and clear memory
- `get_keystore_status` - Monitor session and security state

**Key Operations:**
- `import_encrypted_private_key` - Add keys with individual encryption
- `list_encrypted_keys` - View stored keys (addresses only, never private keys)
- `remove_encrypted_key` - Securely delete keys
- `update_key_label` - Organize with descriptive labels

**Security Management:**
- `change_keystore_password` - Rotate master password and re-encrypt all keys

### When to Use Encrypted Keys

**Production Scenarios:**
- "Set up encrypted key storage for my mainnet operations"
- "Configure secure key management for my trading bot"
- "Implement enhanced security for high-value DeFi operations"
- "Prepare secure wallet storage for institutional use"

## Encryption Methods

### Passphrase-Based Encryption

The most common method for encrypted key storage:

**Setup Process:**
```
Set up passphrase-encrypted storage for my private keys
```

**AI Agent Response:** The AI will guide through:
1. Choose a strong passphrase for key encryption
2. Encrypt your private key with the passphrase
3. Store encrypted key in secure location
4. Configure decryption process for operations

**Usage Workflow:**
```
Import my encrypted private key with passphrase authentication
```

**AI Agent Response:** The AI will:
1. Prompt for the encrypted key location
2. Request passphrase for decryption
3. Decrypt and import the private key
4. Confirm successful wallet connection

### File-Based Encryption

For enhanced security with encrypted key files:

**Setup Process:**
```
Create an encrypted key file for production deployment
```

**AI Agent Response:** The AI will help:
1. Generate or encrypt existing private key
2. Create secure encrypted key file
3. Set proper file permissions and access controls
4. Document recovery and backup procedures

**File Management:**
```
Load my encrypted key from secure file storage
```

**AI Agent Response:** The AI will:
1. Locate and verify encrypted key file
2. Handle decryption process securely
3. Import decrypted key for operations
4. Clear sensitive data from memory when done

## Security Best Practices

### Passphrase Management

**Strong Passphrase Creation:**
```
Help me create a secure passphrase for key encryption
```

**AI Agent Response:** The AI will recommend:
- Use long, complex passphrases (20+ characters)
- Include mix of letters, numbers, and symbols  
- Avoid dictionary words or personal information
- Consider passphrase generators for maximum security

**Passphrase Storage:**
```
What's the best way to manage my encryption passphrases?
```

**AI Agent Response:** The AI will suggest:
- Use dedicated password managers
- Never store passphrases with encrypted keys
- Implement secure backup procedures
- Consider multi-factor authentication where possible

### Production Deployment

#### Environment-Specific Setup

**Development Environment:**
```
Create encrypted keystore for development testing
Import private key with label 'Development Testing'
```

**Staging Environment:**
```
Create encrypted keystore with production-strength master password
Import private key with label 'Staging Validation'
Test all encrypted key workflows before production deployment
```

**Production Environment:**
```
Create encrypted keystore with maximum security master password
Import private key with label 'Production Main'
Import backup private key with label 'Production Backup'
Verify keystore status and security configuration
```

#### Production Security Checklist

**Initial Deployment:**
- ✅ Master password meets enterprise security standards (12+ characters)
- ✅ Private keys imported from secure sources only
- ✅ All keys properly labeled with descriptive names
- ✅ Keystore file permissions restricted to service account only
- ✅ Regular backup procedures established

**Operational Security:**
- ✅ Unlock keystore only when needed for operations
- ✅ Lock keystore immediately after operation completion
- ✅ Monitor session timeouts and automatic locks
- ✅ Regular master password rotation (quarterly)
- ✅ Audit logs for all keystore operations

**Access Controls:**
```
# Service account setup
useradd -r -s /bin/false wallet-agent
chown wallet-agent:wallet-agent /path/to/keystore
chmod 600 /path/to/keystore

# Secure key file example
echo "0x..." > /secure/path/prod-key
chmod 600 /secure/path/prod-key
```

**Access Control:**
```
Implement proper access controls for encrypted key operations
```

**AI Agent Response:** The AI will help with:
- Role-based access to encrypted keys
- Audit logging for key usage
- Time-limited access tokens
- Emergency access procedures

## Advanced Encryption Options

### Hardware Security Modules (HSM)

For maximum security in enterprise environments:

**HSM Integration:**
```
Integrate with hardware security modules for key protection
```

**AI Agent Response:** The AI will guide through:
1. HSM compatibility and requirements
2. Key generation within HSM
3. Secure communication protocols
4. Backup and disaster recovery procedures

**Enterprise Setup:**
**Developer:** "Set up HSM-backed wallet operations for institutional use"

**AI Agent Response:** The AI will configure:
- HSM provider integration
- Compliance with security standards
- Multi-signature and approval workflows
- Comprehensive audit trails

### Key Derivation Functions

Enhanced security through key strengthening:

**KDF Configuration:**
**Developer:** "Use key derivation functions to strengthen my encrypted keys"

**AI Agent Response:** The AI will implement:
1. PBKDF2, Argon2, or scrypt algorithms
2. Appropriate iteration counts and memory parameters
3. Salt generation and management
4. Performance optimization for your use case

## Operational Workflows

### Development to Production Migration

**Secure Migration:**
**Developer:** "Migrate from development keys to encrypted production keys"

**AI Agent Response:** The AI will help:
1. Backup existing development setup
2. Generate new production key pairs
3. Implement encrypted storage
4. Test operations with encrypted keys
5. Securely dispose of development keys

### Key Rotation and Updates

**Secure Key Migration:**
**Developer:** "Safely migrate to new encrypted private keys"

**AI Agent Response:** The AI will guide through:
1. Generate new encrypted key pair
2. Transfer assets to new address
3. Update all system configurations
4. Verify operations with new encrypted keys
5. Securely dispose of old encrypted keys

### Multi-Environment Setup

**Multi-Environment Key Management:**
**Developer:** "Set up encrypted key management across different development environments"

**AI Agent Response:** The AI will configure:
- Environment-specific encrypted key storage
- Individual access controls and permissions for each environment
- Secure key distribution methods across environments
- Environment-specific workflow and security processes

## Troubleshooting Encrypted Keys

### Common Issues

**Decryption Failures:**
**Developer:** "My encrypted keys won't decrypt properly"

**AI Agent Response:** The AI will check:
- Passphrase accuracy and case sensitivity
- Encryption format and compatibility
- File corruption or access issues
- System compatibility and requirements

**Performance Issues:**
**Developer:** "Encrypted key operations are running slowly"

**AI Agent Response:** The AI will analyze:
- Encryption algorithm performance
- Key derivation function parameters
- System resource availability
- Optimization opportunities

**Access Problems:**
**Developer:** "I can't access my encrypted keys in production"

**AI Agent Response:** The AI will diagnose:
- File permissions and access rights
- Environment variable configuration
- Network connectivity issues
- Security policy restrictions

### Recovery Procedures

**Lost Passphrase Recovery:**
**Developer:** "I've lost the passphrase for my encrypted keys"

**AI Agent Response:** The AI will help with:
- Recovery options and backup procedures
- Alternative access methods if configured
- Asset migration to new keys if necessary
- Prevention strategies for the future

**Corruption Recovery:**
**Developer:** "My encrypted key file appears to be corrupted"

**AI Agent Response:** The AI will assist with:
- File integrity verification and repair
- Backup restoration procedures
- Data recovery techniques
- Prevention of future corruption

## Integration Examples

### CI/CD Pipeline Integration

**Automated Deployment:**
**Developer:** "Integrate encrypted keys with my deployment pipeline"

**AI Agent Response:** The AI will configure:
1. Secure key storage in CI/CD system
2. Decryption during deployment process
3. Secure cleanup after operations
4. Audit logging and monitoring

### Monitoring and Alerting

**Security Monitoring:**
**Developer:** "Set up monitoring for encrypted key operations"

**AI Agent Response:** The AI will implement:
- Key usage tracking and logging
- Unusual access pattern detection
- Failed decryption attempt monitoring
- Security incident response procedures

## Best Practices Summary

### Do's
✅ **Use strong passphrases with high entropy**
✅ **Store encrypted keys separately from passphrases**
✅ **Implement proper backup and recovery procedures**
✅ **Use appropriate key derivation functions**
✅ **Monitor and audit all key operations**
✅ **Test encryption/decryption in staging first**
✅ **Implement secure key migration procedures**

### Don'ts
❌ **Never store passphrases with encrypted keys**
❌ **Never use weak or guessable passphrases**
❌ **Never skip backup procedures for encrypted keys**
❌ **Never ignore access control and permissions**
❌ **Never store encryption keys in version control**
❌ **Never use deprecated encryption algorithms**
❌ **Never bypass security procedures for convenience**


## Related Documentation

- [Private Keys](private-keys.md) - Basic private key management
- [User Instructions](user-instructions.md) - Custom security workflows
- [Security Guide](../user-guide/security.md) - General security practices
- [Troubleshooting](../resources/troubleshooting.md) - Common issues and solutions