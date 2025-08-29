# Documentation Example Validation Suite

This test suite validates that every example shown in the project documentation works exactly as documented, ensuring users get the precise experience described in the docs.

## Overview

The Documentation Example Validation Suite addresses a critical gap: while the project has excellent functional test coverage, many specific phrases and expected output formats from the documentation weren't being tested. This suite ensures that:

- ✅ Every documented command phrase works exactly as shown
- ✅ Output formats match the documentation precisely
- ✅ Error messages follow documented patterns
- ✅ User workflows produce expected results

## Suite Structure

```
test/e2e/claude-sdk/documentation-examples/
├── README.md                       # This file
├── quick-start.e2e.ts             # Quick Start Guide examples
├── basic-operations.e2e.ts        # Basic Operations examples
├── transactions.e2e.ts            # Transaction examples
├── token-operations.e2e.ts        # Token operation examples
└── (future files for other doc sections can be added here)
```

## Enhanced Validation Framework

### DocumentationValidator Class

Located in `helpers/documentation-validator.ts`, this class provides:

- **Strict format validation** - Ensures output matches documented formats exactly
- **Structure validation** - Validates response structure and content
- **Error format validation** - Ensures error messages match documented patterns
- **Tool usage validation** - Verifies correct MCP tools are called

### Key Validation Methods

```typescript
// Validate complete documentation example
validateDocumentationExample(result, example)

// Validate specific output formats
validateWalletInfoFormat(result)
validateBalanceFormat(result, "ETH") 
validateTransactionFormat(result)
validateTokenBalanceFormat(result, "USDC")
validateChainSwitchFormat(result, "Polygon", 137)
```

### Format Patterns

Pre-defined regex patterns for common outputs:
- Ethereum addresses: `/0x[a-fA-F0-9]{40}/`
- Transaction hashes: `/0x[a-fA-F0-9]{64}/`
- ETH balances: `/\d+(\.\d+)?\s*ETH/i`
- Token balances: `/\d+(\.\d+)?\s*[A-Z]{2,6}/`
- Chain IDs: `/chain.*id.*:?\s*\d+/i`

## Test Categories

### 1. Quick Start Guide Tests (`quick-start.e2e.ts`)

Tests every example from `docs/getting-started/quick-start.md`:

**Step 1: Check Your Setup**
- `"Get wallet info"` - Validates exact output format with wallet configuration structure

**Step 2: Connect to a Wallet** 
- `"Connect to 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"` - Tests full address connection

**Step 3: Check Your Balance**
- `"Check my balance"` - Validates balance format with ETH amount and wei display

**Step 4: Send Your First Transaction**
- `"Send 1 ETH to 0x70997970C51812dc3A010C7d01b50e0d17dc79C8"` - Tests transaction success format

**Step 5: Switch Chains**
- `"Switch to Polygon"` - Validates chain switch response format

**Token Operations**
- `"Get my USDC balance"` - Tests token balance format
- `"Transfer 100 USDC to 0x70997970C51812dc3A010C7d01b50e0d17dc79C8"` - Tests token transfer format

**Contract Interaction**
- `"Load my contract configuration for AI interactions"` - Tests Wagmi config loading
- `"Read USDC contract balanceOf function with account 0xf39F..."` - Tests contract calls

**Hyperliquid Support**
- `"Import my Hyperliquid wallet using private key"` - Tests HL wallet import
- `"Show my Hyperliquid account balance and positions"` - Tests HL account info

### 2. Basic Operations Tests (`basic-operations.e2e.ts`)

Tests every example from `docs/user-guide/basic-operations.md`:

**Wallet Information**
- `"Get wallet info"` - Exact format validation with indentation and structure
- `"Get accounts"` - Available accounts listing format

**Wallet Connection**
- `"Connect to 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"` - Full address connection format
- `"Connect to 0xf39F"` - Short address auto-expansion
- `"Get current account"` - Current account display format

**Balance Checking**
- `"Check my balance"` - Balance format with proper currency display
- Cross-chain currency name handling (ETH, POL, etc.)

### 3. Transaction Tests (`transactions.e2e.ts`)

Tests every example from `docs/user-guide/transactions.md`:

**Basic Transfers**
- `"Send 1 ETH to 0x70997970C51812dc3A010C7d01b50e0d17dc79C8"` - Basic transfer format
- `"Send 0.5 ETH to 0x7099"` - Short address handling
- `"Send 2 ETH to 0x3C44 with fast gas"` - Custom gas speed

**Transaction Monitoring**
- `"Get transaction status 0x123..."` - Status response format
- `"Get transaction receipt 0x123..."` - Receipt details format

**Gas Management**
- `"Estimate gas for sending 1 ETH to 0x7099"` - Gas estimation format
- Custom gas parameters validation

**Advanced Features**
- `"Send all ETH to 0x70997970C51812dc3A010C7d01b50e0d17dc79C8"` - Maximum amount transfers
- `"Send 0.1 ETH to 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 with data 0x1234abcd"` - Custom transaction data

### 4. Token Operations Tests (`token-operations.e2e.ts`)

Tests every example from `docs/user-guide/token-operations.md`:

**Token Balance Checking**
- `"Get my USDC balance"` - Token balance format with amount, raw value, decimals
- `"Show me all my token balances"` - Multiple token display
- `"Get USDC token info"` - Token information format

**Token Transfers**
- `"Transfer 100 USDC to 0x70997970C51812dc3A010C7d01b50e0d17dc79C8"` - Token transfer success format
- `"Transfer all USDC to 0x70997970C51812dc3A010C7d01b50e0d17dc79C8"` - Maximum token transfer

**Token Approvals**
- `"Approve 1000 USDC for 0x70997970C51812dc3A010C7d01b50e0d17dc79C8"` - Approval success format
- `"Approve unlimited USDC for 0x70997970C51812dc3A010C7d01b50e0d17dc79C8"` - Unlimited approval handling

## Validation Levels

### Level 1: Basic Functionality
- Commands execute without errors
- Expected tools are called
- Response contains relevant keywords

### Level 2: Format Validation
- Output structure matches documentation
- Numeric formats are correct
- Address formats are proper

### Level 3: Exact Match Validation
- Specific phrases match exactly
- Indentation and formatting preserved
- Error messages match documented format

## Running the Tests

### Run All Documentation Examples
```bash
bun test ./test/e2e/claude-sdk/documentation-examples/
```

### Run Specific Documentation Section
```bash
bun test ./test/e2e/claude-sdk/documentation-examples/quick-start.e2e.ts
bun test ./test/e2e/claude-sdk/documentation-examples/basic-operations.e2e.ts
bun test ./test/e2e/claude-sdk/documentation-examples/transactions.e2e.ts
bun test ./test/e2e/claude-sdk/documentation-examples/token-operations.e2e.ts
```

### Run with Detailed Output
```bash
bun test ./test/e2e/claude-sdk/documentation-examples/ --verbose
```

## Test Environment Requirements

### Prerequisites
- Wallet Agent MCP server running locally
- Claude CLI configured with local MCP connection
- Anvil local blockchain (for token operations)
- Test environment with mock wallets

### Environment Setup
The tests automatically:
1. Set up Claude SDK test environment
2. Configure test data with known addresses
3. Switch to appropriate chains for different test scenarios
4. Handle connection management between tests

## Expected Test Behavior

### Success Cases
- Commands execute as documented
- Output formats match exactly
- Tool usage is correct
- Response content is comprehensive

### Handled Failure Cases
- Invalid addresses → Helpful error messages
- Insufficient balances → Clear explanations
- Unknown tokens → Informative responses
- Missing configurations → Setup guidance

### Graceful Degradation
- Missing Wagmi configs → Explanation of setup process
- Unavailable chains → Clear error with alternatives
- Hyperliquid without private key → Setup instructions

## Maintenance

### Adding New Documentation Examples
1. Add examples to relevant test file
2. Create `DocumentationExample` interface instances
3. Use `validateDocumentationExample()`
4. Add specific format validators as needed

### Updating Existing Examples
1. Update the `prompt` field to match documentation
2. Update `expectedOutput` patterns
3. Update `source` field with correct documentation reference
4. Test to ensure validation still passes

### Format Pattern Updates
Update `FormatPatterns` in `documentation-validator.ts` when:
- Output formats change in the application
- New response types are added
- Error message formats are updated

## Integration with CI/CD

### Automated Validation
- Run on every documentation change
- Run on every MCP tool update
- Run on release candidate builds

### Coverage Reporting
- Track which documentation examples are tested
- Alert on untested new documentation
- Measure format validation coverage

## Benefits

### For Users
- **Predictable Experience**: Commands work exactly as documented
- **Reliable Documentation**: Examples are guaranteed to work
- **Consistent Formatting**: Output always matches what's shown

### For Developers
- **Documentation Quality**: Forces documentation accuracy
- **Regression Prevention**: Catches format changes before release
- **Integration Validation**: Ensures MCP tools work as documented

### For Maintainers
- **Change Detection**: Immediately identifies breaking documentation changes
- **Quality Assurance**: Automated validation of user-facing examples
- **Confidence**: Release with certainty that docs match reality

## Future Enhancements

### Planned Additions
- NFT operations documentation tests
- Chain management documentation tests  
- Advanced features documentation tests
- Contract development workflow tests

### Potential Improvements
- Visual output comparison for complex formats
- Performance benchmarking of documented operations
- Multi-language documentation example validation
- Interactive documentation testing tool

## Troubleshooting

### Common Issues

**Test Timeouts**
- Increase timeout for slow network operations
- Check MCP server responsiveness
- Verify local blockchain is running

**Format Validation Failures**
- Check if output format changed in application
- Update format patterns in validator
- Verify documentation is current

**Connection Issues**
- Ensure MCP server is running locally
- Check Claude CLI configuration
- Verify wallet addresses are available

**Tool Not Found Errors**
- Check MCP tool definitions
- Verify tool names in examples
- Update expected tools list

### Debug Mode
Add console logging to see exact command output:
```typescript
console.log(`Command: "${example.prompt}"`)
console.log(`Result: ${JSON.stringify(result, null, 2)}`)
```

## Contributing

When adding new documentation:
1. Add corresponding test examples
2. Validate output formats match
3. Test error scenarios
4. Update this README if needed

When modifying MCP tools:
1. Run documentation tests first
2. Update format validators if needed
3. Update expected outputs in tests
4. Document any breaking changes

---

This Documentation Example Validation Suite ensures that every user following the documentation gets exactly the experience they expect - no surprises, no discrepancies, just reliable, tested examples that work as documented.