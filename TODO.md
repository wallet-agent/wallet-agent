# Wallet Agent Core - TODO

## Hyperliquid Integration - Remaining Tasks

### 1. Implement Dynamic Tool Registration
- [ ] Create dynamic tool loader in `src/tools/pro-tools.ts`
- [ ] Implement tool discovery endpoint integration
- [ ] Add runtime tool registration based on API key presence
- [ ] Handle tool versioning and updates from pro server
- [ ] Add caching mechanism for discovered tools

### 2. Test with Real API Key
- [ ] Set up test environment with `WALLET_AGENT_API_KEY`
- [ ] Verify pro feature proxy works correctly
- [ ] Test signature flow between local and remote
- [ ] Validate error handling for API failures
- [ ] Performance test for API round trips

### 3. Pro Server Implementation
- [ ] Design API endpoints for tool discovery
- [ ] Implement prepare/submit pattern for complex operations
- [ ] Add rate limiting per API key
- [ ] Create usage tracking and analytics
- [ ] Implement advanced Hyperliquid features:
  - [ ] Complex order types (TWAP, iceberg, etc.)
  - [ ] Portfolio analytics
  - [ ] Risk management tools
  - [ ] Automated trading strategies
  - [ ] Market making capabilities

### 4. Documentation
- [ ] Update README with Hyperliquid setup instructions
- [ ] Document environment variables for Hyperliquid
- [ ] Create examples for common Hyperliquid operations
- [ ] Add troubleshooting guide for common issues
- [ ] Document the hybrid architecture benefits

### 5. Testing & Quality
- [ ] Add integration tests with real Hyperliquid testnet
- [ ] Create end-to-end test suite
- [ ] Add performance benchmarks
- [ ] Set up CI/CD for automated testing
- [ ] Add test coverage reporting

### 6. Security Audit
- [ ] Review private key handling in GenericWalletManager
- [ ] Audit API key transmission and storage
- [ ] Validate signature verification on pro server
- [ ] Ensure no sensitive data in logs
- [ ] Add security best practices documentation

## Future Enhancements

### Additional Exchange Support
- [ ] Research other DEX APIs (dYdX, GMX, etc.)
- [ ] Evaluate SDK availability and quality
- [ ] Design unified interface for multiple exchanges

### Advanced Features
- [ ] WebSocket support for real-time data
- [ ] Order book streaming
- [ ] Position monitoring and alerts
- [ ] Automated stop-loss and take-profit
- [ ] Cross-exchange arbitrage detection

### Developer Experience
- [ ] Add TypeScript declarations for all tools
- [ ] Create VS Code extension for tool discovery
- [ ] Build interactive playground for testing
- [ ] Add comprehensive JSDoc comments
- [ ] Create video tutorials

## Notes

- The @nktkas/hyperliquid SDK integration is complete and working
- Basic operations are available in the open-source core
- Advanced features will be available through the pro server
- Security model ensures private keys never leave local machine
- All tests are passing with the new SDK implementation

## Priority Order

1. **High Priority**: Dynamic tool registration (enables pro features)
2. **High Priority**: Real API key testing (validates the architecture)
3. **Medium Priority**: Pro server implementation (monetization)
4. **Medium Priority**: Documentation (user adoption)
5. **Low Priority**: Additional exchanges (expansion)
6. **Low Priority**: Advanced features (differentiation)

---

Last Updated: 2025-08-19