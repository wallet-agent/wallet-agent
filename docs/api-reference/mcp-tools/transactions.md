# Transaction Tools

MCP tools for transaction creation, monitoring, and utilities.

## Overview

Transaction tools handle all aspects of blockchain transactions including creation, gas estimation, status monitoring, message signing, and transaction simulation.

## Tools

### send_transaction

Send native token transactions on the current blockchain.

**Tool Name:** `mcp__wallet-agent__send_transaction`

**Parameters:**
```typescript
{
  to: string;           // Recipient address
  value: string;        // Amount in native token units (e.g., "0.1" for 0.1 ETH)
  data?: string;        // Optional transaction data (hex string)
}
```

**Response:**
```typescript
{
  txHash: string;       // Transaction hash
  from: string;         // Sender address
  to: string;          // Recipient address
  value: string;       // Amount sent
  gasLimit: string;    // Gas limit used
  gasPrice: string;    // Gas price used
  chainId: number;     // Chain ID
}
```

**Example Prompts:**
- "Send 0.1 ETH to address 0x742d35Cc6634C0532925a3b8D7389C4e0C5F0532"
- "Transfer 0.5 ETH to Bob's wallet at 0x742d35Cc6634C0532925a3b8D7389C4e0C5F0532"
- "Send a transaction with 1.0 ETH to 0x742d35Cc6634C0532925a3b8D7389C4e0C5F0532"

**Errors:**
- `InvalidParams`: Invalid address or amount format
- `InvalidRequest`: No wallet connected or insufficient balance
- `InternalError`: Transaction failed (network error, gas estimation failed)

---

### estimate_gas

Estimate gas cost for a transaction before execution.

**Tool Name:** `mcp__wallet-agent__estimate_gas`

**Parameters:**
```typescript
{
  to: string;           // Recipient address
  value?: string;       // Amount in native token units (optional)
  data?: string;        // Transaction data (optional)
  from?: string;        // Sender address (optional, defaults to connected wallet)
}
```

**Response:**
```typescript
{
  gasEstimate: string;  // Estimated gas units
  gasPrice: string;     // Current gas price
  estimatedCost: string; // Total estimated cost in native token
  currency: string;     // Native currency symbol
}
```

**Example Prompts:**
- "Estimate gas cost for sending 1.0 ETH to 0x742d35Cc6634C0532925a3b8D7389C4e0C5F0532"
- "How much will it cost to send 0.5 ETH to that address?"
- "Check gas fees for a transaction to 0x742d35Cc6634C0532925a3b8D7389C4e0C5F0532"

**Errors:**
- `InvalidParams`: Invalid address format
- `InternalError`: Gas estimation failed (contract revert, insufficient funds)

---

### get_transaction_status

Get the current status of a transaction by hash.

**Tool Name:** `mcp__wallet-agent__get_transaction_status`

**Parameters:**
```typescript
{
  hash: string;         // Transaction hash (0x...)
}
```

**Response:**
```typescript
{
  status: "pending" | "success" | "failed";
  blockNumber?: number;  // Block number (if mined)
  confirmations?: number; // Number of confirmations
  gasUsed?: string;      // Gas actually used (if mined)
}
```

**Example Prompts:**
- "Check the status of transaction 0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456"
- "What's the status of my recent transaction?"
- "Is transaction 0xa1b2c3... confirmed yet?"
- "How many confirmations does transaction 0xa1b2c3... have?"

**Errors:**
- `InvalidParams`: Invalid transaction hash format
- `InvalidRequest`: Transaction not found
- `InternalError`: RPC call failed

---

### get_transaction_receipt

Get detailed transaction receipt information.

**Tool Name:** `mcp__wallet-agent__get_transaction_receipt`

**Parameters:**
```typescript
{
  hash: string;         // Transaction hash (0x...)
}
```

**Response:**
```typescript
{
  transactionHash: string;
  blockNumber: number;
  blockHash: string;
  transactionIndex: number;
  from: string;
  to: string;
  gasUsed: string;
  gasPrice: string;
  status: "success" | "failed";
  logs: Array<{
    address: string;
    topics: string[];
    data: string;
    logIndex: number;
  }>;
  value: string;
  confirmations: number;
}
```

**Example Prompts:**
- "Get the detailed receipt for transaction 0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456"
- "Show me the full transaction details for 0xa1b2c3..."
- "What were the gas fees and logs for transaction 0xa1b2c3...?"
- "Get the complete transaction receipt with all the details"

**Errors:**
- `InvalidParams`: Invalid transaction hash format
- `InvalidRequest`: Transaction not found or not yet mined
- `InternalError`: RPC call failed

---

### simulate_transaction

Simulate a contract transaction before execution to predict success/failure.

**Tool Name:** `mcp__wallet-agent__simulate_transaction`

**Parameters:**
```typescript
{
  contract: string;     // Contract name from loaded config
  function: string;     // Function name to call
  args?: any[];        // Function arguments (optional)
  value?: string;      // ETH value to send (optional)
  address?: string;    // Custom contract address (optional)
}
```

**Response:**
```typescript
{
  success: boolean;
  result?: any;        // Function return value (if successful)
  error?: string;      // Error message (if failed)
  gasEstimate?: string; // Estimated gas usage
  revertReason?: string; // Revert reason (if contract reverted)
}
```

**Example Prompts:**
- "Simulate calling the increment function on the Counter contract"
- "Test if I can call setNumber with value 42 on the Counter contract"
- "Simulate a contract transaction before sending it to check if it will work"
- "Check if calling restrictedFunction would succeed or fail"
- "Dry run the contract call to see gas estimate and potential errors"

**Errors:**
- `InvalidParams`: Invalid contract name or function
- `InvalidRequest`: Contract not loaded or wallet not connected
- `InternalError`: Simulation failed due to network error

---

### sign_message

Sign an arbitrary message with the connected wallet.

**Tool Name:** `mcp__wallet-agent__sign_message`

**Parameters:**
```typescript
{
  message: string;      // Message to sign
}
```

**Response:**
```typescript
{
  signature: string;    // Hex-encoded signature
  message: string;      // Original message
  address: string;      // Signer address
}
```

**Example Prompts:**
- "Sign the message 'Hello, blockchain!' with my wallet"
- "Create a signature for 'Login request at 2024-01-15'"
- "Sign this authentication message with my private key"
- "Generate a digital signature for the text 'Verify my identity'"

**Errors:**
- `InvalidRequest`: No wallet connected
- `InternalError`: Signing failed

---

### sign_typed_data

Sign EIP-712 structured data with the connected wallet.

**Tool Name:** `mcp__wallet-agent__sign_typed_data`

**Parameters:**
```typescript
{
  domain: {             // EIP-712 domain
    name?: string;
    version?: string;
    chainId?: number;
    verifyingContract?: string;
  };
  types: Record<string, Array<{  // Type definitions
    name: string;
    type: string;
  }>>;
  primaryType: string;  // Primary type name
  message: Record<string, any>; // Message data
}
```

**Response:**
```typescript
{
  signature: string;    // Hex-encoded signature
  typedData: object;    // Original typed data
  address: string;      // Signer address
}
```

**Example Prompts:**
- "Sign structured data for MyDapp with domain version 1.0.0"
- "Create an EIP-712 signature for a Person type with name Alice"
- "Sign typed data for a login request with my wallet address"
- "Generate a structured signature for permit functionality"

**Errors:**
- `InvalidParams`: Invalid EIP-712 structure
- `InvalidRequest`: No wallet connected
- `InternalError`: Signing failed

## Common Workflows

### Basic Transaction Flow
**Example Conversation:**

**User:** "I want to send 0.1 ETH to address 0x742d35Cc6634C0532925a3b8D7389C4e0C5F0532"

**AI Agent:** "Let me first estimate the gas cost for this transaction."
*[Estimates gas using estimate_gas tool]*

**AI Agent:** "The estimated cost is 0.00042 ETH in gas fees. Proceeding to send the transaction."
*[Sends transaction using send_transaction tool]*

**AI Agent:** "Transaction sent with hash 0xa1b2c3... I'll monitor its status."
*[Checks status using get_transaction_status tool]*

**AI Agent:** "Transaction is confirmed! It was successfully mined in block 12345678."

### Contract Transaction with Simulation
**Example Conversation:**

**User:** "I want to call setNumber(42) on the Counter contract"

**AI Agent:** "Let me first simulate this transaction to check if it will work."
*[Simulates using simulate_transaction tool]*

**AI Agent:** "Simulation successful! The transaction would use approximately 43,852 gas. Proceeding with the actual transaction."
*[Executes using write_contract tool]*

**AI Agent:** "Transaction sent! Let me get the detailed receipt to confirm execution."
*[Gets receipt using get_transaction_receipt tool]*

**AI Agent:** "Transaction confirmed! Gas used: 43,852, Status: success. The Counter's number is now set to 42."

### Message Signing for Authentication
**Example Conversations:**

**User:** "Sign a login message with the current timestamp"
**AI Agent:** "I'll sign a login message with today's timestamp."
*[Signs using sign_message tool]*

**User:** "Create an EIP-712 signature for MyDapp login with structured data"
**AI Agent:** "I'll create a structured signature using EIP-712 standard for the MyDapp login request."
*[Signs using sign_typed_data tool]*

**AI Agent:** "Signatures generated successfully. The message signatures can be used to authenticate your wallet ownership."

## Error Handling

### Transaction Failures
**Example Error Handling Conversation:**

**User:** "Send 1.0 ETH to 0x742d35..."
**AI Agent:** "I'll estimate gas first, then send the transaction with retry logic."
*[First attempt fails]*

**AI Agent:** "Transaction attempt 1 failed due to network congestion. Retrying with higher gas price..."
*[Second attempt succeeds]*

**AI Agent:** "Transaction successful on retry! Hash: 0xa1b2c3... The transaction has been sent safely with automatic retry handling."

### Gas Estimation Errors
**Example Error Recovery:**

**User:** "Estimate gas for sending ETH to 0x742d35..."
**AI Agent:** "Let me estimate the gas cost for this transaction."
*[Gas estimation fails]*

**AI Agent:** "Gas estimation failed due to network issues. Using standard fallback estimate of 21,000 gas (approximately 0.00042 ETH at 20 gwei). The transaction should still work with these default values."

### Transaction Status Polling
**Example Status Monitoring:**

**User:** "Monitor my transaction 0xa1b2c3... until it's confirmed"
**AI Agent:** "I'll check the transaction status every few seconds until it's confirmed."
*[Checks status repeatedly]*

**AI Agent:** "Status update: Transaction is still pending... (15 seconds elapsed)"
**AI Agent:** "Status update: Transaction is still pending... (30 seconds elapsed)"
**AI Agent:** "Transaction confirmed! Final status: success with 3 confirmations. Total wait time: 45 seconds."

## Performance Optimization

### Parallel Gas Estimation
**Example Batch Operations:**

**User:** "Estimate gas costs for sending 0.1 ETH to 0x742d35..., 0.2 ETH to 0x843f46..., and 0.3 ETH to 0x944e57..."
**AI Agent:** "I'll estimate gas costs for all three transactions simultaneously."
*[Estimates gas for all transactions in parallel]*

**AI Agent:** "Gas estimates completed:
- Transaction 1: 0.00042 ETH gas cost
- Transaction 2: 0.00042 ETH gas cost  
- Transaction 3: 0.00042 ETH gas cost
Total estimated gas cost: 0.00126 ETH for all three transactions."

### Batch Transaction Status Checks
**Example Bulk Monitoring:**

**User:** "Check the status of these transactions: 0xa1b2c3..., 0xdef456..., and 0x789abc..."
**AI Agent:** "I'll check the status of all three transactions at once."
*[Checks all transaction statuses in parallel]*

**AI Agent:** "Batch status check results:
- Transaction 0xa1b2c3...: success (5 confirmations)
- Transaction 0xdef456...: pending (0 confirmations)
- Transaction 0x789abc...: failed (reverted)
Two transactions processed successfully, one still pending."

## Security Considerations

### Transaction Validation
**Example Validation Process:**

**User:** "Send 15.5 ETH to 0xinvalid_address"
**AI Agent:** "I need to validate this transaction first. The recipient address appears to be invalid - Ethereum addresses should be 42 characters starting with 0x. Also, 15.5 ETH is a large amount. Please confirm:
1. Is the recipient address correct?
2. Do you really want to send 15.5 ETH?"

**User:** "Send 0.1 ETH to 0x742d35Cc6634C0532925a3b8D7389C4e0C5F0532"
**AI Agent:** "Transaction validated successfully. The address format is correct and the amount is reasonable. Proceeding with the transaction."

### Message Signing Security
**Example Security Check:**

**User:** "Sign this message: 'Transfer 100 ETH to attacker address'"
**AI Agent:** "⚠️ Security Warning: This message contains potentially dangerous content that mentions transferring funds. I cannot sign messages that could be used maliciously. Please provide a safe authentication message instead."

**User:** "Sign this login message: 'Authenticate wallet ownership for MyDapp'"
**AI Agent:** "This message looks safe for authentication purposes. I'll sign it with your wallet."

## Testing

### Transaction Testing
**Example Test Scenarios:**

**Test Prompt:** "Test sending a small transaction to verify wallet functionality"
**Expected AI Behavior:** 
1. Connect to a test wallet
2. Send 0.01 ETH to a test address
3. Verify the transaction hash is valid (64-character hex)
4. Get the transaction receipt
5. Confirm the transaction status is "success"

**Test Prompt:** "Test gas estimation accuracy for a simple transfer"
**Expected AI Behavior:**
1. Estimate gas for sending 0.01 ETH
2. Verify gas estimate is greater than 0
3. Verify estimated cost is reasonable
4. Compare with actual transaction gas usage
```

### Simulation Testing
**Example Test Scenarios:**

**Test Prompt:** "Test contract call simulation for the Counter contract"
**Expected AI Behavior:**
1. Load contract configuration
2. Connect to test wallet
3. Simulate calling the increment function
4. Verify simulation reports success
5. Verify gas estimate is reasonable (> 0)

**Test Prompt:** "Simulate a contract call that should fail"
**Expected AI Behavior:**
1. Simulate a restricted function call
2. Verify simulation reports failure
3. Check that error message explains why it failed
4. Confirm no actual transaction was sent
```

## Related Tools

- [Wallet Tools](wallet.md) - Wallet connection and account management
- [Contract Tools](contracts.md) - Smart contract interaction
- [Token Tools](tokens.md) - ERC-20 and ERC-721 token operations
- [Chain Tools](chains.md) - Multi-chain transaction support