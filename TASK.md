# Test Coverage Improvement Plan

## 🎯 **Objective**
Increase test coverage from 74% to 90%+ by focusing on critical business logic and integration points.

## 📊 **Current Coverage Analysis**

**Overall Coverage**: 74.08% functions, 77.18% lines

### 🔴 **Critically Low Coverage Areas**

1. **`src/core/contracts.ts`** - 0% functions, 2.02% lines
2. **`src/effects/contract-effects.ts`** - 37.50% functions, 14.29% lines  
3. **`src/effects/file-reader.ts`** - 0% functions, 57.14% lines
4. **`src/contract-operations.ts`** - 62.50% functions, 53.70% lines

### 🟡 **Moderate Coverage Gaps**

1. **`src/effects/contract-store.ts`** - 37.50% functions, 52.86% lines
2. **`src/chains.ts`** - 66.67% functions, 81.40% lines
3. **`src/core/builtin-contracts.ts`** - 50% functions, 99.67% lines

### ⚪ **Missing Test Files Entirely**

1. **`src/server.ts`** - MCP server setup and request handlers
2. **`src/index.ts`** - Entry point and main function
3. **`src/wallet.ts`** - Core wallet functionality
4. **`src/wallet-manager.ts`** - Private key wallet management
5. **`src/transactions.ts`** - Transaction sending operations
6. **`src/adapters/*.ts`** - Various adapter classes

## 📋 **Phase 1: Critical Coverage (High Priority)**

### 1. **Contract System Testing**
- **Create** `test/core/contracts.test.ts`
  - Test `parseWagmiContent()` with various input formats
  - Test ABI parsing edge cases and error handling
  - Test address parsing from contract definitions

- **Enhance** `test/effects/contract-effects.test.ts` 
  - Test `loadFromFile()` with real and mock files
  - Test safe vs unsafe parsing paths
  - Test error scenarios and file reading failures

- **Create** `test/effects/file-reader.test.ts`
  - Test file reading with different file types
  - Test error handling for missing/invalid files
  - Mock filesystem operations

### 2. **Contract Operations Testing**
- **Create** `test/contract-operations.test.ts`
  - Test `readContract()` with different contract types
  - Test `writeContract()` with mock and private key wallets
  - Test error scenarios (no wallet, invalid chain, etc.)
  - Test contract resolution integration

### 3. **Core Infrastructure Testing**
- **Create** `test/effects/contract-store.test.ts`
  - Test contract storage and retrieval
  - Test contract updates and overrides
  - Test memory management and cleanup

## 📋 **Phase 2: Server & Integration Testing (Medium Priority)**

### 4. **MCP Server Testing**
- **Create** `test/server.test.ts`
  - Test MCP server creation and initialization
  - Test tool listing and registration
  - Test resource handling (chains endpoint)
  - Test error responses and status codes

### 5. **Main Entry Point Testing**
- **Create** `test/index.test.ts`
  - Test server startup process
  - Test error handling in main()
  - Test transport connection

### 6. **Core Module Testing**
- **Enhance** `test/chains.test.ts`
  - Test custom chain management edge cases
  - Test chain validation and error scenarios
  - Test RPC endpoint handling

## 📋 **Phase 3: Adapter & Integration Testing (Lower Priority)**

### 7. **Adapter Testing**
- **Create** `test/adapters/` directory with tests for:
  - `wagmi-adapter.test.ts` - Wagmi integration points
  - `contract-adapter.test.ts` - Contract loading interface
  - `token-adapter.test.ts` - Token operations interface
  - `wallet-adapter.test.ts` - Wallet connection interface

### 8. **Legacy Module Testing**
- **Create** tests for remaining modules:
  - `test/wallet.test.ts` - Core wallet operations
  - `test/wallet-manager.test.ts` - Private key management
  - `test/transactions.test.ts` - Transaction operations

## 🧪 **Testing Strategy**

### **Unit Tests**
- Focus on pure functions and business logic
- Mock external dependencies (filesystem, network)
- Test error conditions and edge cases

### **Integration Tests**
- Test component interactions
- Use real Anvil blockchain for contract testing
- Test end-to-end tool execution flows

### **Mock Strategy**
- Mock filesystem operations with `mock-fs`
- Mock Wagmi operations for deterministic tests
- Create test fixtures for contract files and ABIs

## 📈 **Success Metrics**

### **Target Coverage**
- **Overall**: 90%+ lines, 85%+ functions
- **Critical modules**: 95%+ coverage
- **All files**: Minimum 70% coverage

### **Quality Metrics**
- Zero uncovered critical error paths
- All public APIs tested
- All MCP tool handlers fully covered

## 🛠 **Implementation Steps**

1. **Setup enhanced testing infrastructure** (mocks, fixtures)
2. **Implement Phase 1** (critical contract system tests)
3. **Implement Phase 2** (server and integration tests)  
4. **Implement Phase 3** (adapter and remaining tests)
5. **Optimize and refine** based on coverage reports

## ⏱ **Timeline**
- **Phase 1**: 2-3 days (highest impact)
- **Phase 2**: 1-2 days (server stability)
- **Phase 3**: 2-3 days (completeness)
- **Total**: ~1 week for comprehensive coverage improvement

## 🎯 **Priority Order**

1. **`src/core/contracts.ts`** - Critical 0% coverage
2. **`src/effects/contract-effects.ts`** - Core contract loading
3. **`src/contract-operations.ts`** - Contract read/write operations
4. **`src/server.ts`** - MCP server functionality
5. **`src/effects/file-reader.ts`** - File system operations
6. **`src/effects/contract-store.ts`** - Contract storage
7. **Adapter classes** - Interface implementations
8. **Legacy modules** - Remaining functionality

This plan prioritizes the most critical untested code paths while ensuring we achieve robust coverage across the entire codebase.