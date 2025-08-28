# Hyperliquid Tools

MCP tools for decentralized perpetual futures trading on Hyperliquid exchange.

## Overview

Hyperliquid tools enable AI agents to perform professional-grade perpetual futures trading operations on Hyperliquid, a high-performance decentralized exchange. These tools provide comprehensive trading functionality including order placement, position management, portfolio monitoring, and account operations.

**🏛️ Exchange Features:**
- High-performance decentralized perpetual futures
- Institutional-grade order matching engine
- On-chain settlement with off-chain matching
- No gas fees for trading operations
- Advanced order types and risk management

## Tools

### hl_import_wallet

Import a private key wallet for Hyperliquid trading operations.

**Tool Name:** `hl_import_wallet`

**What you provide:**
- Private key (64-character hex string starting with 0x)

**What the AI returns:**
- Confirmation that wallet was imported successfully
- Ethereum address derived from the private key
- Trading access status for Hyperliquid

**Example Prompts:**
- "Import my Hyperliquid trading wallet using private key 0x..."
- "Set up my wallet for Hyperliquid trading operations"
- "Connect my private key for Hyperliquid trading"

**Errors:**
- `InvalidParams` - Invalid private key format (must be 0x + 64 hex characters)
- `InternalError` - Failed to initialize Hyperliquid clients

---

### hl_get_account_info

Get comprehensive account information including balances, positions, and margin details.

**Tool Name:** `hl_get_account_info`

**What you provide:**
- Optional: Ethereum address (uses imported wallet if not provided)

**What the AI returns:**
- USDC balance and available margin
- Current open positions with unrealized PnL
- Total account equity and margin utilization
- Withdrawal eligibility and restrictions

**Example Prompts:**
- "Show my Hyperliquid account balance and positions"
- "Get my current trading account status"
- "Check my Hyperliquid portfolio and margin usage"
- "What's the account info for address 0x..."

**Errors:**
- `InvalidRequest` - No wallet imported and no address provided
- `InternalError` - Failed to fetch account information from Hyperliquid

---

### hl_place_order

Place limit or market orders for perpetual futures trading.

**Tool Name:** `hl_place_order`

**What you provide:**
- `coin` - Trading pair symbol (e.g., 'BTC', 'ETH', 'SOL')
- `isBuy` - True for buy/long orders, false for sell/short orders
- `sz` - Order size (position size, not notional value)
- `limitPx` - Limit price (optional, creates market order if not provided)
- `orderType` - "limit" or "market" (defaults to "limit")
- `reduceOnly` - True if order should only reduce existing position (defaults to false)
- `cloid` - Optional client order ID for tracking

**What the AI returns:**
- Order placement confirmation with order ID
- Order details including filled amount and remaining size
- Transaction hash for on-chain settlement
- Estimated execution price and fees

**Example Prompts:**
- "Buy 0.1 BTC at $45000 on Hyperliquid"
- "Place market sell order for 1 ETH on Hyperliquid"
- "Set limit buy for 2 SOL at $100 as reduce-only order"
- "Long 0.5 BTC with limit price $44500"

**Errors:**
- `InvalidRequest` - No wallet imported for trading operations
- `InvalidParams` - Invalid coin symbol, negative size, or invalid price
- `InternalError` - Order placement failed due to exchange or network issues

---

### hl_cancel_order

Cancel open orders on Hyperliquid.

**Tool Name:** `hl_cancel_order`

**What you provide:**
- `coin` - Trading pair symbol for the order
- `orderId` - Optional specific order ID to cancel (cancels all orders for coin if not provided)

**What the AI returns:**
- Cancellation confirmation with affected order details
- Number of orders cancelled
- Remaining open orders for the trading pair

**Example Prompts:**
- "Cancel all my BTC orders on Hyperliquid"
- "Cancel order ID 12345 for ETH"
- "Cancel my open SOL orders"

**Errors:**
- `InvalidRequest` - No wallet imported for trading operations
- `InvalidParams` - Invalid coin symbol or order ID
- `InternalError` - Order cancellation failed

---

### hl_get_open_orders

Get all current open orders across all trading pairs.

**Tool Name:** `hl_get_open_orders`

**What you provide:**
- Optional: Ethereum address (uses imported wallet if not provided)

**What the AI returns:**
- List of all open orders with details (coin, size, price, side)
- Order IDs and client order IDs
- Order status and fill information
- Time stamps and order types

**Example Prompts:**
- "Show all my open orders on Hyperliquid"
- "List current pending trades"
- "What orders do I have waiting to fill?"
- "Get open orders for address 0x..."

**Errors:**
- `InvalidRequest` - No wallet imported and no address provided
- `InternalError` - Failed to fetch open orders from Hyperliquid

---

### hl_get_positions

Get current open positions and their profit/loss status.

**Tool Name:** `hl_get_positions`

**What you provide:**
- Optional: Ethereum address (uses imported wallet if not provided)

**What the AI returns:**
- All open positions with coin, size, and direction
- Unrealized PnL for each position
- Entry prices and current mark prices
- Position leverage and margin requirements

**Example Prompts:**
- "Show my current Hyperliquid positions"
- "What positions am I holding and their PnL?"
- "Check my trading positions and profits"
- "Get positions for address 0x..."

**Errors:**
- `InvalidRequest` - No wallet imported and no address provided
- `InternalError` - Failed to fetch positions from Hyperliquid

---

### hl_transfer

Transfer USDC funds on Hyperliquid network.

**Tool Name:** `hl_transfer`

**What you provide:**
- `destination` - Recipient Ethereum address
- `amount` - Amount of USDC to transfer

**What the AI returns:**
- Transfer confirmation with transaction details
- Transaction hash for on-chain verification
- Updated account balance after transfer
- Transfer fees (if applicable)

**Example Prompts:**
- "Transfer 1000 USDC to 0x742d35Cc6634C0532925a3b8D7389C4e0C5F0532"
- "Send 500 USDC to my other Hyperliquid account"
- "Move 100 USDC to address 0x..."

**Errors:**
- `InvalidRequest` - No wallet imported for transfer operations
- `InvalidParams` - Invalid destination address or negative amount
- `InternalError` - Transfer failed due to insufficient balance or network issues

---

### hl_get_all_mids

Get current mid prices for all available trading pairs.

**Tool Name:** `hl_get_all_mids`

**Parameters:** None

**What the AI returns:**
- Mid prices for all trading pairs (BTC, ETH, SOL, etc.)
- Real-time market data with bid-ask spreads
- Price precision and minimum tick sizes
- Market status and trading availability

**Example Prompts:**
- "Get current prices for all Hyperliquid trading pairs"
- "Show me the mid prices across all markets"
- "What are the current trading prices on Hyperliquid?"

**Errors:**
- `InternalError` - Failed to fetch market data from Hyperliquid

---

### hl_get_user_fills

Get trade execution history and fill details for a user.

**Tool Name:** `hl_get_user_fills`

**What you provide:**
- Optional: Ethereum address (uses imported wallet if not provided)

**What the AI returns:**
- Recent trade executions with timestamps
- Fill prices, sizes, and trading fees
- Order IDs associated with each fill
- Trading pair and side (buy/sell) information

**Example Prompts:**
- "Show my recent trade executions on Hyperliquid"
- "Get my trading history and fill details"
- "What trades have executed for my account?"
- "Show fill history for address 0x..."

**Errors:**
- `InvalidRequest` - No wallet imported and no address provided
- `InternalError` - Failed to fetch trade history from Hyperliquid

## Trading Architecture

### Exchange Integration

**Hyperliquid SDK Integration:**
- Built on `@nktkas/hyperliquid` SDK for reliable API access
- Automatic testnet/mainnet environment detection
- Robust error handling and retry logic
- Type-safe parameters and responses

**Client Management:**
- `InfoClient` - Market data and account information (no wallet required)
- `ExchangeClient` - Trading operations and transfers (requires wallet)
- Automatic client initialization and connection management
- Secure private key handling with viem account abstraction

### Order Management

**Order Types:**
- **Limit Orders** - Specify exact price with guaranteed execution price
- **Market Orders** - Immediate execution at best available price using IOC (Immediate or Cancel)
- **Reduce-Only Orders** - Can only decrease existing position size

**Order Parameters:**
- `coin` - Trading pair (automatically maps to asset index)
- `isBuy` - Order direction (true = buy/long, false = sell/short)
- `sz` - Position size (not notional value)
- `limitPx` - Price level for limit orders
- `reduceOnly` - Position reduction constraint
- `cloid` - Client order ID for tracking

### Risk Management

**Position Limits:**
- Automatic margin requirement calculations
- Position size validation against available balance
- Reduce-only order enforcement for position management
- Real-time position and margin monitoring

**Error Handling:**
- Invalid coin symbol detection with available alternatives
- Insufficient balance validation before order placement
- Network connectivity and API availability checks
- Comprehensive error messages with actionable guidance

## Trading Workflows

### Basic Trading Operations

**Setup and Account Management:**
```
"Import my Hyperliquid wallet using private key"
"Check my Hyperliquid account balance and positions"
"Get current mid prices for all trading pairs"
```

**Order Placement:**
```
"Buy 0.1 BTC at $45000 on Hyperliquid"
"Place market sell for 1 ETH"
"Set limit buy for 2 SOL at $100"
```

**Position Management:**
```
"Show my current Hyperliquid positions"
"Cancel all my BTC orders"
"Check my recent trade executions"
```

### Advanced Trading Strategies

**Scaled Order Entry:**
```
"Place limit buy for 0.5 BTC at $44000"
"Place another limit buy for 0.3 BTC at $43500"
"Place final limit buy for 0.2 BTC at $43000"
```

**Position Reduction:**
```
"Place reduce-only sell for 0.3 BTC at $46000"
"Set reduce-only market sell for 0.2 BTC"
```

**Portfolio Monitoring:**
```
"Show my current positions and their PnL"
"Get my account balance and margin usage"
"Check recent fills and execution prices"
```

### Risk Management Workflows

**Position Sizing:**
```
"Check my account balance before placing large orders"
"What's my available margin for new positions?"
"Show current positions to assess risk exposure"
```

**Stop-Loss Management:**
```
"Place reduce-only sell for my BTC position at $42000"
"Cancel existing orders and place market exit for ETH position"
```

## Market Data and Analysis

### Real-Time Data Access

**Price Discovery:**
- Mid price aggregation across all trading pairs
- Real-time bid-ask spread information
- Market depth and liquidity metrics
- Price precision and minimum tick sizes

**Account Analytics:**
- Position-level PnL tracking
- Margin utilization monitoring
- Trade execution analysis
- Portfolio performance metrics

### Trading Pair Information

**Available Markets:**
- BTC-USD perpetual futures
- ETH-USD perpetual futures
- SOL-USD perpetual futures
- Additional altcoin perpetuals
- Custom asset listings

**Market Specifications:**
- Minimum position sizes per trading pair
- Price tick sizes and precision
- Maximum position limits
- Funding rate schedules

## Security and Risk Considerations

### Wallet Security

**Private Key Management:**
- Secure in-memory storage during trading sessions
- No persistence of private keys to disk
- Automatic cleanup on session end
- Integration with encrypted keystore systems

**Transaction Security:**
- All trades signed locally with private key
- On-chain settlement verification
- Transaction hash tracking for audit trails
- Automatic nonce management

### Trading Risk Controls

**Position Limits:**
- Automatic margin requirement validation
- Position size constraints based on account equity
- Reduce-only order enforcement for risk management
- Real-time balance and margin monitoring

**Error Prevention:**
- Invalid trading pair detection
- Price reasonableness checks
- Size validation against account limits
- Network connectivity verification

### Operational Security

**API Security:**
- Secure HTTP transport for all API calls
- Automatic retry with exponential backoff
- Rate limiting compliance
- Error handling without sensitive data exposure

**Audit and Compliance:**
- Complete transaction history tracking
- Order placement and cancellation logs
- Position change notifications
- Balance and margin monitoring

## Production Deployment

### Environment Configuration

**Network Selection:**
```javascript
// Testnet for development and testing
config.hyperliquidNetwork = "testnet"

// Mainnet for production trading
config.hyperliquidNetwork = "mainnet"
```

**Wallet Management:**
```
# Secure private key storage
export HYPERLIQUID_TRADING_KEY="0x..."

# Account verification
"Import Hyperliquid wallet from HYPERLIQUID_TRADING_KEY"
"Verify account access and trading permissions"
```

### Trading Bot Integration

**Automated Trading Setup:**
```
"Import trading wallet for automated operations"
"Check account balance and position limits"
"Verify API connectivity and trading permissions"
```

**Strategy Implementation:**
```
"Monitor BTC price and place buy orders below $44000"
"Set automated position sizing based on account equity"
"Implement stop-loss orders for all open positions"
```

### Monitoring and Alerting

**Account Monitoring:**
```
"Check account balance every hour"
"Monitor position PnL and margin usage"
"Alert if account equity drops below threshold"
```

**Trading Performance:**
```
"Track daily trading volumes and fees"
"Monitor fill rates and execution quality"
"Analyze position performance and risk metrics"
```

## Error Handling and Troubleshooting

### Common Issues

**Wallet Connection:**
```
Error: "No wallet imported. Use hl_import_wallet first"
Solution: "Import my Hyperliquid wallet with private key"
```

**Invalid Trading Pairs:**
```
Error: "Unknown coin: XYZ. Available coins: BTC, ETH, SOL..."
Solution: Use the coin symbols listed in the error message
```

**Insufficient Balance:**
```
Error: "Insufficient margin for position size"
Solution: "Check account balance" or reduce position size
```

### Network and API Issues

**Connectivity Problems:**
```
Error: "Failed to fetch market data"
Solution: Check network connectivity and try again
```

**Order Placement Failures:**
```
Error: "Order placement failed"
Solution: Verify account balance, position limits, and market status
```

### Position Management Issues

**Position Limits:**
```
Error: "Position size exceeds account limits"
Solution: Reduce order size or increase account margin
```

**Reduce-Only Constraints:**
```
Error: "Reduce-only order exceeds current position"
Solution: Check current positions and adjust order size
```

## Integration Examples

### AI Agent Trading Commands

**Natural Language Trading:**
```
"I want to go long 0.1 BTC at $45000"
→ AI places limit buy order for 0.1 BTC at $45000

"Close half my ETH position"
→ AI checks position size and places reduce-only market sell

"What's my trading performance today?"
→ AI shows fills, positions, and PnL summary
```

**Portfolio Management:**
```
"Rebalance my portfolio to 60% BTC, 40% ETH"
→ AI calculates required trades and executes orders

"Set stop-losses at 5% below entry for all positions"
→ AI places reduce-only orders with calculated stop prices
```

### Custom Trading Strategies

**DCA (Dollar-Cost Averaging):**
```
"Buy $1000 worth of BTC every hour for the next 8 hours"
→ AI calculates sizes and places scheduled orders

"Scale into SOL position with 5 orders between $90-100"
→ AI places multiple limit orders at different price levels
```

**Risk Management:**
```
"If my account equity drops below $50000, close all positions"
→ AI monitors equity and executes emergency exit if triggered

"Limit total position size to 50% of account equity"
→ AI validates all new orders against equity limits
```

## Performance Optimization

### Order Execution

**Latency Optimization:**
- Direct SDK integration for minimal latency
- Efficient order batching for multiple operations
- Automatic retry with exponential backoff
- Connection pooling for sustained trading

**Fill Rate Improvement:**
- Market price analysis for optimal limit orders
- Dynamic price adjustment based on market conditions
- Order size optimization for better execution
- Smart routing for large position entries/exits

### Risk Management

**Real-Time Monitoring:**
- Continuous position and margin tracking
- Automated alert systems for risk thresholds
- Performance analytics for strategy optimization
- Comprehensive audit trails for compliance

## Next Steps

- **[Advanced Topics →](../../advanced/hyperliquid.md)** - Complete trading strategies and integration
- **[User Guide →](../../user-guide/)** - Basic operations and security practices
- **[Developer Guide →](../../developer-guide/)** - Custom strategy development
- **[Testing Tools →](testing.md)** - Development and simulation tools