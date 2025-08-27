# Hyperliquid

Integration with Hyperliquid decentralized perpetual exchange.

## Overview

Hyperliquid is a high-performance decentralized exchange focused on perpetual futures trading. WalletAgent provides seamless integration with Hyperliquid through AI agents, enabling prompt-based trading operations, position management, and portfolio monitoring.

## Getting Started

### Account Setup

**Wallet Import:**
**Developer:** "Import my Hyperliquid trading wallet using my private key"

**AI Agent Response:** The AI will:
1. Securely import your private key for Hyperliquid operations
2. Connect to the Hyperliquid API
3. Verify account access and permissions
4. Display current account status and balances

**Account Information:**
**Developer:** "Show me my Hyperliquid account information and balances"

**AI Agent Response:** The AI will display:
- USDC balance and available margin
- Current open positions
- Unrealized PnL across all positions
- Account equity and margin utilization

### Initial Configuration

**API Connection:**
**Developer:** "Connect to Hyperliquid mainnet with my trading account"

**AI Agent Response:** The AI will:
- Establish connection to Hyperliquid's API
- Authenticate with your wallet
- Verify trading permissions
- Confirm successful connection

## Trading Operations

### Order Placement

**Market Orders:**
**Developer:** "Buy 1 BTC perp at market price"

**AI Agent Response:** The AI will:
1. Check current BTC perpetual market price
2. Verify sufficient margin for the trade
3. Place the market order
4. Report order execution and fill details

**Limit Orders:**
**Developer:** "Place a limit order to buy 0.5 ETH perp at $1800"

**AI Agent Response:** The AI will:
1. Validate the limit price against current market
2. Check margin requirements
3. Place the limit order
4. Provide order ID for tracking

**Advanced Order Types:**
**Developer:** "Set up a stop-loss at $1750 for my ETH position"

**AI Agent Response:** The AI will:
- Analyze your current ETH position
- Calculate appropriate stop-loss parameters
- Place the stop-loss order
- Confirm risk management setup

### Position Management

**Position Monitoring:**
**Developer:** "Show me all my current positions and their PnL"

**AI Agent Response:** The AI will display:
- All open positions with entry prices
- Current unrealized PnL for each position
- Position sizes and margin usage
- Overall portfolio performance

**Position Adjustment:**
**Developer:** "Reduce my BTC position by half"

**AI Agent Response:** The AI will:
1. Calculate current BTC position size
2. Determine the exact amount to close
3. Execute the position reduction
4. Report new position size and realized PnL

**Position Closing:**
**Developer:** "Close my entire SOL position at market"

**AI Agent Response:** The AI will:
1. Identify current SOL position details
2. Place market order to close the position
3. Execute the close and realize PnL
4. Update portfolio overview

### Order Management

**Order Status:**
**Developer:** "Check the status of my pending orders"

**AI Agent Response:** The AI will show:
- All open limit orders with prices and sizes
- Order fill status and remaining quantity
- Time in force and order validity
- Estimated time to fill based on market conditions

**Order Modification:**
**Developer:** "Change my ETH limit order price to $1820"

**AI Agent Response:** The AI will:
1. Cancel the existing order
2. Place new order at the updated price
3. Confirm order replacement
4. Provide new order tracking information

**Order Cancellation:**
**Developer:** "Cancel all my open orders for BTC"

**AI Agent Response:** The AI will:
1. Identify all BTC-related open orders
2. Cancel each order systematically
3. Confirm cancellation success
4. Update order book status

## Portfolio Analytics

### Performance Tracking

**PnL Analysis:**
**Developer:** "Show me my trading performance for the last 30 days"

**AI Agent Response:** The AI will provide:
- Total realized and unrealized PnL
- Win/loss ratio and average trade size
- Best and worst performing assets
- Daily PnL chart and trends

**Risk Metrics:**
**Developer:** "Analyze my current portfolio risk exposure"

**AI Agent Response:** The AI will calculate:
- Total portfolio delta and exposure
- Margin utilization and available leverage
- Concentration risk by asset
- Value at Risk (VaR) estimates

### Trade History

**Transaction History:**
**Developer:** "Show me all my trades from yesterday"

**AI Agent Response:** The AI will display:
- All executed trades with timestamps
- Entry and exit prices for each trade
- Realized PnL per trade
- Trading fees and costs

**Fill Analysis:**
**Developer:** "Analyze my order fill rates and slippage"

**AI Agent Response:** The AI will provide:
- Fill rate statistics by order type
- Average slippage on market orders
- Comparison with market conditions
- Suggestions for improving execution

## Advanced Trading Features

### Multi-Asset Strategies

**Portfolio Hedging:**
**Developer:** "Help me hedge my long ETH position with short BTC"

**AI Agent Response:** The AI will:
1. Analyze correlation between ETH and BTC
2. Calculate optimal hedge ratio
3. Suggest BTC short position size
4. Execute hedging strategy if approved

**Pair Trading:**
**Developer:** "Set up a pairs trade between ETH and SOL"

**AI Agent Response:** The AI will:
- Analyze historical price relationship
- Identify current spread opportunity
- Suggest trade sizes and entry points
- Set up both legs of the pair trade

### Risk Management

**Position Sizing:**
**Developer:** "Calculate optimal position size for 2% portfolio risk on BTC trade"

**AI Agent Response:** The AI will:
1. Analyze current portfolio value
2. Calculate 2% risk amount
3. Determine position size based on stop-loss distance
4. Recommend leverage and margin requirements

**Automated Risk Controls:**
**Developer:** "Set up automatic position limits and stop-losses"

**AI Agent Response:** The AI will configure:
- Maximum position size per asset
- Portfolio-wide leverage limits
- Automatic stop-loss percentages
- Daily loss limits and circuit breakers

## Market Analysis

### Market Data

**Price Information:**
**Developer:** "What's the current BTC perpetual price and funding rate?"

**AI Agent Response:** The AI will provide:
- Current mark price and index price
- Real-time funding rate
- Open interest and volume data
- Recent price action and volatility

**Order Book Analysis:**
**Developer:** "Show me the ETH order book depth and liquidity"

**AI Agent Response:** The AI will display:
- Current bid/ask spread
- Order book depth at various price levels
- Market impact estimates for different trade sizes
- Liquidity analysis and market conditions

### Trading Opportunities

**Market Scanning:**
**Developer:** "Scan for high-volume trading opportunities across all perpetuals"

**AI Agent Response:** The AI will identify:
- Assets with unusual volume or volatility
- Funding rate arbitrage opportunities
- Technical breakout patterns
- Market inefficiencies and spreads

## Troubleshooting

### Common Issues

**Connection Problems:**
**Developer:** "I can't connect to Hyperliquid or my orders aren't going through"

**AI Agent Response:** The AI will diagnose:
- API connectivity and authentication status
- Network connectivity issues
- Account permissions and restrictions
- Hyperliquid system status

**Trading Errors:**
**Developer:** "My trade was rejected - why did this happen?"

**AI Agent Response:** The AI will check:
- Insufficient margin or balance
- Position limits and risk controls
- Market conditions and liquidity
- Order parameters and validation

**Position Discrepancies:**
**Developer:** "My position size doesn't match what I expected"

**AI Agent Response:** The AI will verify:
- Recent trade execution history
- Partial fills and order modifications
- Funding payments and adjustments
- Account reconciliation with Hyperliquid

### Performance Issues

**Latency Problems:**
**Developer:** "My orders are executing slower than expected"

**AI Agent Response:** The AI will analyze:
- Network latency to Hyperliquid servers
- Order routing and execution paths
- Market conditions and volatility
- System performance and optimization

**Slippage Issues:**
**Developer:** "I'm experiencing high slippage on my trades"

**AI Agent Response:** The AI will review:
- Order sizing relative to market depth
- Market timing and volatility periods
- Order type optimization (limit vs market)
- Execution strategy improvements

## Best Practices

### Trading Strategy

**Risk Management:**
- Always use stop-losses for leveraged positions
- Monitor margin levels and avoid over-leveraging
- Diversify positions across multiple assets
- Set daily and weekly loss limits

**Execution Optimization:**
- Use limit orders during normal market conditions
- Monitor funding rates for cost optimization
- Time entries and exits based on market volatility
- Consider order size impact on market price

### Security and Safety

**Account Security:**
- Use secure private key storage
- Monitor account activity regularly
- Enable all available security features
- Keep trading capital separate from long-term holdings

**Operational Security:**
- Regularly backup trading strategies and settings
- Monitor API usage and permissions
- Keep software and systems updated
- Use secure networks for trading

### Performance Monitoring

**Regular Reviews:**
- Analyze trading performance weekly
- Review and adjust risk parameters
- Monitor market conditions and adapt strategies
- Track and optimize trading costs

## Integration Examples

### DeFi Yield Strategies

**Yield Arbitrage:**
**Developer:** "Help me arbitrage funding rates between Hyperliquid and other platforms"

**AI Agent Response:** The AI will:
- Compare funding rates across platforms
- Calculate arbitrage profitability
- Execute both legs of the arbitrage
- Monitor and manage the position

### Portfolio Management

**Automated Rebalancing:**
**Developer:** "Set up automated portfolio rebalancing based on my risk targets"

**AI Agent Response:** The AI will:
- Define target allocations per asset
- Monitor current portfolio weights
- Execute rebalancing trades automatically
- Report on rebalancing activities

## Related Documentation

- [Private Keys](private-keys.md) - Secure key management for trading
- [User Instructions](user-instructions.md) - Custom trading workflows
- [Transaction Tools](../api-reference/mcp-tools/transactions.md) - Transaction monitoring
- [Troubleshooting](../resources/troubleshooting.md) - General troubleshooting guide