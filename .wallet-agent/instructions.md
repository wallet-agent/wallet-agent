# WalletAgent Development Instructions

These are custom instructions for the WalletAgent development environment.

## Development Preferences
- Use Anvil (local) chain for testing by default
- Use mock accounts for all development work
- Never use real private keys in development
- Prefer "standard" gas settings for development testing

## Security for Development
- Always run tests with isolated containers
- Mock all external dependencies
- Use temporary directories for test storage
- Clean up test files after each test run

## Testing Guidelines
- Test both global and project storage scenarios
- Verify storage inheritance works correctly
- Test error cases (missing files, invalid data, etc.)
- Ensure proper test isolation between test runs

## Code Quality
- Run typecheck before commits
- Use consistent error messages
- Follow existing code patterns
- Document complex functionality

This file demonstrates how users can customize wallet behavior with natural language instructions!