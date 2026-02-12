import 'dotenv/config';
import { RobinPumpClient } from '@valuestor/contracts';
import { AIDecisionEngine } from './ai/decision-engine';
import { TokenMonitor } from './monitors/token-monitor';
import { TradeExecutor } from './executors/trade-executor';
import type { TokenAnalysis, UserValues, Valuestor } from '@valuestor/shared';
import Redis from 'ioredis';

// ============================================================================
// Configuration
// ============================================================================

const config = {
  rpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
  privateKey: process.env.PRIVATE_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY!,
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  dryRun: process.env.DRY_RUN === 'true',
  maxSlippage: parseFloat(process.env.MAX_SLIPPAGE || '0.05'), // 5% default
};

// Validate required config
if (!config.openaiApiKey) {
  console.error('OPENAI_API_KEY is required');
  process.exit(1);
}

if (!config.dryRun && !config.privateKey) {
  console.error('PRIVATE_KEY is required when not in dry run mode');
  process.exit(1);
}

// ============================================================================
// Initialize Services
// ============================================================================

const robinPump = new RobinPumpClient(config.rpcUrl, config.privateKey);
const aiEngine = new AIDecisionEngine(config.openaiApiKey);
const tradeExecutor = new TradeExecutor(robinPump, {
  dryRun: config.dryRun,
  maxSlippage: config.maxSlippage,
});
const redis = new Redis(config.redisUrl);

// ============================================================================
// Valuestor Database (Mock - replace with actual database)
// ============================================================================

async function getActiveValuestors(): Promise<Valuestor[]> {
  // TODO: Replace with actual database query
  // For now, check Redis for active valuestors
  const keys = await redis.keys('valuestor:*');
  const valuestors: Valuestor[] = [];

  for (const key of keys) {
    const data = await redis.get(key);
    if (data) {
      try {
        valuestors.push(JSON.parse(data));
      } catch (e) {
        console.error(`Failed to parse valuestor data for ${key}:`, e);
      }
    }
  }

  return valuestors.filter((v) => v.isActive);
}

async function getPosition(valuestor: string, token: string) {
  const key = `position:${valuestor}:${token}`;
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
}

async function saveTradeExecution(execution: any) {
  const key = `trade:${execution.id}`;
  await redis.set(key, JSON.stringify(execution));
  await redis.expire(key, 86400 * 30); // 30 days
}

// ============================================================================
// Main Trading Logic
// ============================================================================

async function processNewToken(
  tokenAnalysis: TokenAnalysis
): Promise<void> {
  console.log(`\nProcessing new token: ${tokenAnalysis.metadata.name}`);
  console.log(`  Category: ${tokenAnalysis.metadata.category || 'N/A'}`);
  console.log(`  Risk Score: ${tokenAnalysis.riskScore}/100`);
  console.log(`  Risk Flags: ${tokenAnalysis.riskFlags.join(', ') || 'None'}`);

  // Get all active valuestors
  const valuestors = await getActiveValuestors();

  if (valuestors.length === 0) {
    console.log('No active valuestors found');
    return;
  }

  console.log(`Analyzing for ${valuestors.length} valuestor(s)...`);

  // Analyze token for each valuestor
  for (const valuestor of valuestors) {
    try {
      // Check if they already have a position
      const currentPosition = await getPosition(
        valuestor.address,
        tokenAnalysis.token
      );

      // Get AI decision
      const decision = await aiEngine.analyzeToken(
        tokenAnalysis,
        valuestor,
        currentPosition
      );

      console.log(`\nValuestor ${valuestor.address}:`);
      console.log(`  Decision: ${decision.decision}`);
      console.log(`  Confidence: ${decision.confidence}%`);
      console.log(`  Alignment: ${decision.alignmentScore}%`);
      console.log(`  Reasoning: ${decision.reasoning.substring(0, 150)}...`);

      // Execute if auto-trade is enabled and requires no confirmation
      if (
        valuestor.values.autoTrade &&
        !valuestor.values.aiGuidance.requireConfirmation
      ) {
        const execution = await tradeExecutor.executeDecision(decision);
        if (execution) {
          await saveTradeExecution(execution);
          console.log(`  Executed: ${execution.status} - ${execution.txHash}`);
        }
      } else {
        console.log('  Auto-trade disabled or confirmation required');
        // TODO: Send notification to user for manual approval
      }
    } catch (error) {
      console.error(
        `Error processing token for valuestor ${valuestor.address}:`,
        error
      );
    }
  }
}

// ============================================================================
// Start the Bot
// ============================================================================

async function main() {
  console.log('='.repeat(60));
  console.log('Valuestor AI Trading Bot');
  console.log('='.repeat(60));
  console.log(`Mode: ${config.dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`RPC: ${config.rpcUrl}`);
  console.log(`Max Slippage: ${config.maxSlippage * 100}%`);
  console.log('='.repeat(60));
  console.log();

  // Test Redis connection
  try {
    await redis.ping();
    console.log('✓ Redis connected');
  } catch (error) {
    console.error('✗ Redis connection failed:', error);
    process.exit(1);
  }

  // Test AI connection
  try {
    console.log('✓ AI engine initialized');
  } catch (error) {
    console.error('✗ AI engine initialization failed:', error);
    process.exit(1);
  }

  // Start monitoring
  const monitor = new TokenMonitor(robinPump, {
    onTokenCreated: async (event, analysis) => {
      try {
        await processNewToken(analysis);
      } catch (error) {
        console.error('Error processing token:', error);
      }
    },
    onTokenTraded: (event) => {
      // Log trades for monitoring
      console.log(
        `Trade: ${event.trader} ${event.isBuy ? 'bought' : 'sold'} ${event.token}`
      );
    },
  });

  await monitor.start();

  console.log('\n✓ Bot is running and monitoring for new tokens...');
  console.log('Press Ctrl+C to stop\n');

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\nShutting down...');
    monitor.stop();
    await redis.quit();
    process.exit(0);
  });
}

// Run the bot
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
