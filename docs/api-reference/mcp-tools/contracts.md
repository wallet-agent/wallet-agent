# Contract Tools

MCP tools for smart contract interaction and management with AI agents.

## Overview

Contract tools enable AI agents to interact with smart contracts through prompts. These tools handle contract loading, reading contract state, and executing contract functions.

## Tools

### load_wagmi_config

Load Wagmi-generated contract configuration from a file.

**Tool Name:** `mcp__wallet-agent__load_wagmi_config`

**What you provide:**
- File path to your Wagmi-generated configuration file

**What the AI returns:**
- List of loaded contracts with names, addresses, and supported chains
- Summary of chains where contracts are deployed
- Confirmation that contracts were loaded successfully

**Example Prompts:**
- "Load my contract configuration from ./src/generated.ts"
- "Import the Wagmi-generated contracts from the generated file"
- "Load all my smart contract ABIs and addresses"
- "Set up contract integration using my Wagmi config"

**AI Agent Response:**
The AI agent will load the specified Wagmi configuration file and make all defined contracts available for interaction. It will report which contracts were loaded and on which chains they're available.

**Errors:**
- `InvalidParams`: Invalid file path
- `InternalError`: File not found or invalid format

---

### list_contracts

List all available contracts from the loaded configuration.

**Tool Name:** `mcp__wallet-agent__list_contracts`

**Parameters:** None

**What the AI returns:**
- List of all loaded contracts with their names, addresses, and chain information
- Chain ID and human-readable chain name for each contract
- Summary of where each contract is deployed
- Confirmation of successful contract loading

**Example Prompts:**
- "Show me all available contracts"
- "List my loaded smart contracts"
- "What contracts can I interact with?"
- "Display all contract addresses and their chains"

**AI Agent Response:**
The AI agent will display a formatted list of all loaded contracts, showing their names, addresses, and which blockchain networks they're deployed on.

**Errors:**
- `InvalidRequest`: No contracts loaded (call `load_wagmi_config` first)

---

### read_contract

Read data from a smart contract function.

**Tool Name:** `mcp__wallet-agent__read_contract`

**What you provide:**
- Contract name from your loaded configuration
- Function name you want to call
- Function arguments (optional, depending on the function)
- Custom contract address (optional, if different from configuration)

**What the AI returns:**
- The function's return value in human-readable format
- Contract name that was used
- Function name that was called
- Contract address that was queried
- Chain ID where the contract exists

**Example Prompts:**
- "Read the current number from my Counter contract"
- "Get the total supply of my ERC20Token"
- "Check the balance of address 0x123... in my token contract"
- "Read the name and symbol from my NFT contract"
- "What's the current value stored in the Counter?"

**AI Agent Response:**
The AI agent will call the specified contract function and return the result in a human-readable format, explaining what the value represents.

**Errors:**
- `InvalidParams`: Invalid contract name or function
- `InvalidRequest`: Contract not loaded or wallet not connected
- `InternalError`: Contract call failed (network error, function doesn't exist)

---

### write_contract

Execute a state-changing function on a smart contract.

**Tool Name:** `mcp__wallet-agent__write_contract`

**What you provide:**
- Contract name from your loaded configuration
- Function name you want to execute
- Function arguments (optional, depending on the function)
- ETH value to send with the transaction (optional, for payable functions)
- Custom contract address (optional, if different from configuration)

**What the AI returns:**
- Transaction hash for tracking the execution
- Contract name that was used
- Function name that was called
- Arguments that were passed to the function
- ETH amount sent (if any)
- Gas estimate and actual usage information
- Contract address that was called
- Chain ID where the transaction occurred

**Example Prompts:**
- "Increment the counter in my Counter contract"
- "Set the Counter value to 42"
- "Mint 1000 tokens to my address"
- "Transfer 100 tokens to address 0x123..."
- "Approve 500 tokens for spending by address 0x456..."
- "Call the deposit function with 0.1 ETH"

**AI Agent Response:**
The AI agent will execute the contract function, wait for transaction confirmation, and report the transaction hash and status. It will also provide gas usage information and any relevant transaction details.

**Errors:**
- `InvalidParams`: Invalid contract name, function, or arguments
- `InvalidRequest`: Contract not loaded or wallet not connected
- `InternalError`: Transaction failed (insufficient funds, contract revert, network error)

## Common Workflows

### Initial Contract Setup
**Developer:** "Load my contract configuration from ./src/generated.ts and show me what contracts are available"

**AI Agent Response:** The AI will load the configuration and display something like:
- Counter contract at 0x5FbDB... on Anvil (31337)
- ERC20Token at 0x9fE46... on Anvil (31337) 
- MyNFT at 0xe7f1... on Sepolia (11155111)

### Reading Contract State
**Developer:** "Check the current number in my Counter contract"

**AI Agent Response:** The AI will read the contract and respond: "The Counter contract currently shows: 5"

### Contract Interaction
**Developer:** "Increment the counter, then read the new value to confirm it worked"

**AI Agent Response:** The AI will:
1. Execute the increment function
2. Wait for transaction confirmation  
3. Read the new value
4. Report: "Successfully incremented counter. Transaction: 0xabc123... New value: 6"

### Multi-Step Operations
**Developer:** "Approve 1000 tokens for the DEX contract, then check my remaining balance"

**AI Agent Response:** The AI will:
1. Execute the approval transaction
2. Wait for confirmation
3. Check the remaining token balance
4. Report both the approval status and current balance

## Contract Types and Examples

### ERC-20 Token Interactions
**Common Prompts:**
- "Check my token balance"
- "Transfer 100 tokens to Alice's address"
- "Approve the DEX to spend 500 of my tokens"
- "What's the total supply of this token?"

### ERC-721 NFT Interactions  
**Common Prompts:**
- "Check who owns NFT #123"
- "Transfer NFT #456 to Bob's address"
- "What's the metadata URI for NFT #789?"
- "Mint a new NFT to my address"

### Custom Contract Functions
**Common Prompts:**
- "Call the compound function with 100 as parameter"
- "Execute the emergency withdraw function"  
- "Check the current price from the oracle"
- "Update the configuration with new values"

## Multi-Chain Contract Management

### Chain-Specific Operations
**Developer:** "Switch to Polygon and read the Counter contract there"

**AI Agent Response:** The AI will switch chains and read from the Polygon deployment of the contract.

### Cross-Chain Contract Comparison
**Developer:** "Compare the Counter values on Anvil and Sepolia"

**AI Agent Response:** The AI will read from both chains and report:
- Anvil Counter: 15
- Sepolia Counter: 8

## Error Handling and Troubleshooting

### Contract Not Loaded
**Developer:** "Read the number from Counter"
**AI Response:** "I need to load your contract configuration first. Please provide the path to your Wagmi generated file."

### Function Call Failures
**Developer:** "Why did my contract call fail?"
**AI Response:** The AI will analyze the error and provide specific guidance, such as:
- "The transaction reverted because you don't have enough tokens"
- "The function doesn't exist - check the function name spelling"
- "The contract address is invalid on this chain"

### Gas Estimation Issues
**Developer:** "The transaction is failing due to gas"
**AI Response:** "Let me estimate the gas first and check if you have sufficient balance for both the transaction and gas fees."

## Advanced Contract Operations

### Contract Simulation
**Developer:** "Test calling the risky function before actually executing it"

**AI Agent Response:** The AI will simulate the transaction and report whether it would succeed or fail, including any error messages.

### Custom Contract Addresses
**Developer:** "Read from the Counter contract but use address 0x789... instead of the configured one"

**AI Agent Response:** The AI will use the specified address while maintaining the same ABI and function interface.

### Value Transactions
**Developer:** "Call the deposit function and send 0.5 ETH with it"

**AI Agent Response:** The AI will execute the payable function with the specified ETH amount and confirm both the function call and ETH transfer.

## Best Practices

### Contract Verification
- Always ask "Show me the available contracts" after loading configuration
- Verify you're on the correct chain before contract interactions
- Use simulation for risky or expensive transactions

### Error Recovery
- If a transaction fails, ask the AI to explain why
- Use read operations to verify state before write operations
- Check balances and allowances before token operations

### Gas Management
- Ask for gas estimation on expensive operations
- Monitor transaction costs on different chains
- Use batch operations when possible for efficiency

## Security Considerations

### Safe Contract Interactions
- Always verify contract addresses match expectations
- Use simulation for unfamiliar contract functions
- Double-check transaction parameters before execution

### Value Transactions
- Be explicit about ETH amounts in payable functions
- Verify contract balance and withdrawal mechanisms
- Use caution with large value transfers

## Performance Optimization

### Efficient Contract Usage
**Developer:** "Read the name, symbol, and total supply from my token contract all at once"

**AI Agent Response:** The AI will batch these read operations for better performance.

### Chain-Specific Operations
**Developer:** "Make sure contract calls work reliably on the current chain"

**AI Agent Response:** The AI will use the configured RPC endpoint for the current chain to ensure reliable contract interactions.

## Related Tools

- [Wallet Tools](wallet.md) - Wallet connection required for write operations
- [Transaction Tools](transactions.md) - Transaction monitoring for write operations
- [Chain Tools](chains.md) - Multi-chain contract deployment support
- [Testing Tools](testing.md) - Contract simulation and testing