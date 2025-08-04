# MCP Wallet Server Usage Examples

This document shows example interactions with the MCP Wallet server through an AI assistant.

## Basic Wallet Operations

### 1. List Available Accounts
```
Use the get_accounts tool to show me the available mock accounts.
```

### 2. Connect to a Wallet
```
Connect to the first mock wallet address using the connect_wallet tool.
```

### 3. Check Connection Status
```
What's the current wallet connection status? Use get_current_account.
```

## Signing Operations

### 4. Sign a Message
```
Sign the message "Hello Web3!" with the connected wallet.
```

### 5. Sign Typed Data (EIP-712)
```
Sign this EIP-712 typed data:
- Domain: { name: "MyDApp", version: "1", chainId: 1 }
- Message: { from: [connected address], contents: "Hello typed data" }
```

## Transaction Operations

### 6. Check Balance
```
What's the ETH balance of the connected account?
```

### 7. Send Transaction
```
Send 0.1 ETH to address 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

## Chain Management

### 8. Switch Networks
```
Switch to Sepolia testnet (chain ID 11155111).
```

### 9. View Supported Chains
```
Show me the supported blockchain networks using the wallet://chains resource.
```

## Resource Access

### 10. Check Wallet State
```
Read the wallet://state resource to see the current wallet state.
```

## Complete Example Flow

Here's a complete example of interacting with a DeFi application:

1. "List the available accounts"
2. "Connect to address 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
3. "Check my current balance"
4. "Sign the message 'Authorize DeFi access'"
5. "Switch to Polygon network (chain ID 137)"
6. "Send 0.5 ETH to 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
7. "Disconnect the wallet"

## Error Handling

The server provides clear error messages for common issues:
- Trying to sign without a connected wallet
- Attempting to connect with an invalid address
- Switching to an unsupported chain
- Sending transactions without sufficient context