# Valuestor 🎯

**Values-based AI Trading Platform for RobinPump Tokens**

Valuestor enables investors ("valuestors") to automatically trade startup tokens on RobinPump.fun based on their personal values and investment philosophy. An AI agent powered by Claude analyzes new token launches against each valuestor's defined values and executes trades accordingly.

## 🏗️ Architecture

```
valuestor/
├── apps/
│   ├── frontend/      # Next.js web app (TODO)
│   ├── backend/       # Express API server (TODO)
│   └── trader/        # AI trading bot ✅
├── packages/
│   ├── shared/        # Shared TypeScript types ✅
│   ├── contracts/     # RobinPump contract interfaces ✅
│   └── db/            # Database utilities (TODO)
```

## 🚀 What's Built

### ✅ Core Trading Agent (`apps/trader`)

The AI-powered trading bot that:
- **Monitors** RobinPump for new token launches in real-time
- **Analyzes** tokens using Claude AI against valuestor-defined values
- **Executes** trades automatically based on AI recommendations
- **Manages** risk through multi-factor analysis

**Key Features:**
- LLM-based decision making (Claude Sonnet 4.5)
- Values alignment scoring
- Risk assessment with configurable thresholds
- Dry-run mode for testing
- Slippage protection

### ✅ Smart Contract Integration (`packages/contracts`)

TypeScript interfaces for RobinPump contracts:
- RobinPumpFactory ABI
- Viem-based client for contract interactions
- Event monitoring (TokenCreated, TokenTraded, TokenGraduated)
- Buy/sell execution functions

### ✅ Shared Types (`packages/shared`)

Comprehensive type system with Zod validation:
- User values and preferences
- Token metadata and analysis
- Trading decisions and executions
- Risk scoring and flags
- Position tracking

## 🎯 How It Works

### 1. Valuestor Registration

Valuestors define their investment values:

```typescript
{
  riskTolerance: 'moderate',
  maxInvestmentPerToken: 0.1,  // ETH
  maxPortfolioAllocation: 20,   // %
  themes: ['sustainability', 'ai_ml', 'social_impact'],
  tradingStyle: 'holder',
  autoTrade: true,
  aiGuidance: {
    enabled: true,
    aggressiveness: 60,
    requireConfirmation: false
  }
}
```

### 2. Token Launch Detection

The bot monitors RobinPump for new token launches:
- Watches `TokenCreated` events
- Fetches token metadata from IPFS
- Analyzes bonding curve status
- Performs basic risk assessment

### 3. AI Analysis

Claude analyzes each token against valuestor values:

**Considered Factors:**
- **Values Alignment:** Does the token match investor themes?
- **Risk Assessment:** Creator reputation, liquidity, holder distribution
- **Financial Viability:** Price, market cap, liquidity depth
- **Position Management:** Hold, take profits, or sell existing positions

**Decision Output:**
```typescript
{
  decision: 'buy' | 'sell' | 'hold' | 'skip',
  confidence: 85,
  alignmentScore: 92,
  reasoning: "This sustainability-focused token aligns perfectly with...",
  recommendedAmount: "0.05"
}
```

### 4. Trade Execution

For auto-trading valuestors:
- Executes buy/sell via RobinPump contracts
- Applies slippage protection
- Tracks execution status
- Stores trade history

## 🔧 Setup & Installation

### Prerequisites

- Node.js 18+
- Redis (for caching and queues)
- PostgreSQL or MongoDB (for production)
- Anthropic API key

### Installation

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your keys

# Build packages
npm run build

# Run the trader (dry run mode)
cd apps/trader
npm run dev
```

### Environment Variables

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-api03-...
BASE_RPC_URL=https://mainnet.base.org

# For live trading
PRIVATE_KEY=0x...

# Optional
REDIS_URL=redis://localhost:6379
DRY_RUN=true
MAX_SLIPPAGE=0.05
```

## 🎨 Next Steps

### Priority 1: Find RobinPump Factory Address

**UPDATE `packages/contracts/src/addresses/base.ts`:**

You can find the factory address by:
1. Visiting https://robinpump.fun/create
2. Opening browser DevTools → Network tab
3. Creating a test token or inspecting existing transactions
4. Looking for contract calls in the network requests

Alternatively, check:
- Their documentation
- Basescan for recent token creations
- Their Twitter/Discord for announcements

### Priority 2: Frontend (`apps/frontend`)

Build Next.js app with:
- Token launch interface
- Valuestor registration flow
- Portfolio dashboard
- Trading history
- Values configuration UI

**Tech Stack:**
- Next.js 14+ (App Router)
- Tailwind CSS
- RainbowKit/Wagmi for wallet connection
- Recharts for visualizations

### Priority 3: Backend API (`apps/backend`)

Build Express API for:
- User authentication
- Valuestor CRUD operations
- Portfolio tracking
- Trade history
- WebSocket for real-time updates

**Tech Stack:**
- Express + TypeScript
- PostgreSQL (Prisma ORM)
- Redis for caching
- JWT authentication
- WebSockets (Socket.io)

### Priority 4: Database Layer (`packages/db`)

- Valuestors table
- Positions table
- Trades table
- Token metadata cache
- Creator reputation tracking

## 📊 Trading Strategies

The AI can be configured for different trading styles:

### 🏔️ Holder (Long-term)
- Focus on fundamental value alignment
- Lower trade frequency
- Higher conviction threshold
- Rides through volatility

### 📈 Swing Trader
- Medium-term positions
- Takes profits on significant gains
- Balanced risk/reward
- Monitors market sentiment

### ⚡ Day Trader
- Short-term opportunities
- Higher trade frequency
- Quick profit taking
- Lower position sizes

## 🛡️ Risk Management

Multi-layered risk protection:

1. **AI Risk Scoring** (0-100)
   - Token contract analysis
   - Creator reputation (30%)
   - Liquidity depth (25%)
   - Holder distribution (25%)

2. **Risk Flags**
   - 🚨 CRITICAL (auto-reject):
     - Hidden mint functions
     - Honeypot detection
     - Creator rug history
   - ⚠️  WARNING (proceed with caution):
     - High holder concentration
     - New creator wallet
     - Low liquidity

3. **Circuit Breakers**
   - Max daily losses
   - Max position size
   - Max portfolio allocation
   - Minimum liquidity thresholds

## 🤖 AI Decision Engine

Powered by Claude Sonnet 4.5:

**Prompt Engineering:**
- Structured analysis framework
- Values-based reasoning
- Risk-aware decision making
- Confidence scoring
- Explainable recommendations

**Context Provided:**
- Full token metadata
- Bonding curve status
- Creator history
- User values profile
- Current positions

**Output Format:**
```json
{
  "decision": "buy",
  "confidence": 88,
  "alignmentScore": 95,
  "reasoning": "Detailed explanation...",
  "recommendedAmount": "0.08",
  "keyFactors": [
    "Strong values alignment with sustainability theme",
    "Solid liquidity ($50k)",
    "Experienced creator (reputation: 85/100)"
  ]
}
```

## 📝 RobinPump Integration

Based on [RobinEdge](https://github.com/MastercodeJ/RobinEdge) architecture:

**Blockchain:** Base (Ethereum L2)

**Key Contracts:**
- `RobinPumpFactory`: Token creation and bonding curve trading
- Bonding curve model with graduation to DEX
- Events: TokenCreated, TokenTraded, TokenGraduated

**Trading Flow:**
1. Token created on bonding curve
2. Users buy/sell on curve (price increases with demand)
3. When threshold hit → "graduates" to DEX (Uniswap V2)
4. Liquidity automatically added to DEX pair

## 🧪 Testing

```bash
# Run trader in dry-run mode
DRY_RUN=true npm run dev

# Test AI decision making
# Add test valuestors to Redis
redis-cli SET valuestor:test '{"id":"test","address":"0x123...","values":{...},"isActive":true}'

# Monitor logs for decisions
```

## 🚦 Deployment

### Trader Bot

```bash
# Production mode
DRY_RUN=false npm run start

# With PM2
pm2 start dist/index.js --name valuestor-trader

# Docker
docker build -t valuestor-trader .
docker run -d valuestor-trader
```

### Monitoring

- Set up logging (Winston, Pino)
- Error tracking (Sentry)
- Metrics (Prometheus)
- Alerts (PagerDuty)

## 🤝 Contributing

Areas for contribution:
- Frontend development
- Backend API
- Database schema design
- Additional trading strategies
- Risk analysis improvements
- Testing & documentation

## 📄 License

MIT

---

**Built with:** TypeScript, Viem, Claude AI, Redis, RobinPump on Base

**Status:** 🚧 In Development - Core trading engine complete, frontend/backend needed
