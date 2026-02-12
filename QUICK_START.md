# Quick Start Guide 🚀

## Getting Valuestor Running in 5 Minutes

### Step 1: Find the RobinPump Factory Address ⚠️

**This is the MOST IMPORTANT step!**

You need to find the actual deployed RobinPump Factory contract address on Base.

**Option A: Inspect the Website**
```bash
# 1. Visit https://robinpump.fun/create
# 2. Open Chrome DevTools (F12)
# 3. Go to Network tab
# 4. Click "Create Token" or inspect existing tokens
# 5. Look for contract interactions
# 6. Find the factory address being called
```

**Option B: Check Recent Transactions**
```bash
# 1. Go to https://basescan.org
# 2. Search for recent token creations
# 3. Look for "TokenCreated" events
# 4. The contract emitting those events is the factory
```

**Option C: Ask Their Community**
- Check their Discord/Telegram
- Look for documentation
- Ask in their community channels

**Once you have it, update:**
```typescript
// packages/contracts/src/addresses/base.ts
export const BASE_ADDRESSES = {
  robinPumpFactory: '0xYOUR_ACTUAL_ADDRESS_HERE', // <-- REPLACE THIS
} as const;
```

### Step 2: Install Dependencies

```bash
# Install all packages
npm install

# Or if you prefer pnpm
pnpm install
```

### Step 3: Set Up Environment

```bash
# Copy the example env file
cp .env.example .env

# Edit it with your keys
nano .env
```

**Minimum required:**
```bash
ANTHROPIC_API_KEY=sk-ant-api03-YOUR_KEY_HERE
BASE_RPC_URL=https://mainnet.base.org
REDIS_URL=redis://localhost:6379
DRY_RUN=true
```

**Get an Anthropic API key:**
1. Visit https://console.anthropic.com/
2. Sign up or log in
3. Go to API Keys
4. Create a new key
5. Copy it to your `.env` file

### Step 4: Start Redis

**Option A: Docker**
```bash
docker run -d -p 6379:6379 redis:alpine
```

**Option B: Local Installation**
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu
sudo apt install redis-server
sudo systemctl start redis
```

**Verify Redis is running:**
```bash
redis-cli ping
# Should return: PONG
```

### Step 5: Build the Project

```bash
# Build all packages
npm run build
```

This will compile:
- ✅ `@valuestor/shared` - Type definitions
- ✅ `@valuestor/contracts` - Contract interfaces
- ✅ `@valuestor/trader` - Trading bot

### Step 6: Add a Test Valuestor

```bash
# Add a test valuestor to Redis
redis-cli
```

Then in the Redis CLI:
```redis
SET valuestor:test '{"id":"test","address":"0x1234567890123456789012345678901234567890","values":{"riskTolerance":"moderate","maxInvestmentPerToken":0.1,"maxPortfolioAllocation":20,"themes":["sustainability","ai_ml","innovation"],"tradingStyle":"holder","autoTrade":true,"minLiquidityUSD":1000,"minCreatorReputation":50,"avoidHighConcentration":true,"aiGuidance":{"enabled":true,"aggressiveness":60,"requireConfirmation":false}},"isActive":true,"createdAt":"2024-01-01T00:00:00.000Z","updatedAt":"2024-01-01T00:00:00.000Z"}'

GET valuestor:test
# Should return the JSON you just set

EXIT
```

### Step 7: Run the Trader Bot! 🎉

```bash
cd apps/trader
npm run dev
```

You should see:
```
============================================================
Valuestor AI Trading Bot
============================================================
Mode: DRY RUN
RPC: https://mainnet.base.org
Max Slippage: 5%
============================================================

✓ Redis connected
✓ AI engine initialized
Starting token monitor...
Token monitor started

✓ Bot is running and monitoring for new tokens...
Press Ctrl+C to stop
```

### Step 8: Test It!

**The bot will now:**
1. Monitor RobinPump for new token creations
2. When a token is created:
   - Fetch its metadata
   - Analyze risk factors
   - Send to Claude AI for decision
   - Show the decision in logs
   - (In dry run) Simulate the trade

**Example output when a token is detected:**
```
New token created: GreenEnergy (GRN)
  Token: 0xabc...
  Creator: 0xdef...

Processing new token: GreenEnergy
  Category: sustainability
  Risk Score: 85/100
  Risk Flags: None

Analyzing for 1 valuestor(s)...

Valuestor 0x1234...7890:
  Decision: buy
  Confidence: 92%
  Alignment: 95%
  Reasoning: This sustainability-focused token aligns perfectly with...
  Executed: confirmed - 0xDRYRUN
```

## Next Steps

### Test the AI Decision Making

Create different test scenarios:

```bash
# Conservative investor
redis-cli SET valuestor:conservative '{...,"riskTolerance":"conservative",...}'

# Aggressive trader
redis-cli SET valuestor:aggressive '{...,"riskTolerance":"aggressive","aiGuidance":{"aggressiveness":90},...}'

# Specific themes
redis-cli SET valuestor:defi '{...,"themes":["defi","web3"],...}'
```

### Monitor Logs

Watch the bot's decisions:
```bash
cd apps/trader
npm run dev | tee trader.log
```

### Go Live (When Ready)

1. **Get a funded wallet:**
   ```bash
   # Generate or import a wallet
   # Fund it with ETH on Base
   ```

2. **Update .env:**
   ```bash
   PRIVATE_KEY=0xYOUR_PRIVATE_KEY
   DRY_RUN=false  # CAREFUL!
   ```

3. **Start with small amounts:**
   ```bash
   # Set conservative limits
   maxInvestmentPerToken: 0.01  # Only 0.01 ETH per token
   ```

4. **Monitor closely:**
   ```bash
   # Watch every trade
   npm run dev
   ```

## Troubleshooting

### Bot not detecting tokens?

**Check factory address:**
```bash
# Make sure you updated it in packages/contracts/src/addresses/base.ts
grep "robinPumpFactory" packages/contracts/src/addresses/base.ts
```

**Check RPC connection:**
```bash
curl https://mainnet.base.org \
  -X POST \
  -H "Content-Type: application/json" \
  --data '{"method":"eth_blockNumber","params":[],"id":1,"jsonrpc":"2.0"}'
```

### AI not making decisions?

**Check API key:**
```bash
echo $ANTHROPIC_API_KEY
# Should show your key
```

**Test Claude directly:**
```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-sonnet-4-5-20250929","max_tokens":1024,"messages":[{"role":"user","content":"Hello"}]}'
```

### Redis connection failed?

**Check if Redis is running:**
```bash
redis-cli ping
```

**Check the URL:**
```bash
echo $REDIS_URL
# Should be redis://localhost:6379
```

### Build errors?

**Clean and rebuild:**
```bash
npm run clean
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Need Help?

Check:
- `README.md` - Full documentation
- Issues on GitHub
- RobinEdge reference: https://github.com/MastercodeJ/RobinEdge

---

**Happy Trading! 🚀**
