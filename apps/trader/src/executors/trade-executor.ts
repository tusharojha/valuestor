import { RobinPumpClient } from '@valuestor/contracts';
import type { TradeDecision, TradeExecution } from '@valuestor/shared';
import type { Address } from 'viem';

export interface TradeExecutorConfig {
  dryRun: boolean; // If true, don't execute actual trades
  maxSlippage: number; // Max slippage tolerance (e.g., 0.05 for 5%)
  maxGasPrice?: bigint; // Max gas price in wei
}

export class TradeExecutor {
  private client: RobinPumpClient;
  private config: TradeExecutorConfig;

  constructor(client: RobinPumpClient, config: TradeExecutorConfig) {
    this.client = client;
    this.config = config;
  }

  async executeDecision(
    decision: TradeDecision
  ): Promise<TradeExecution | null> {
    // Skip if decision is not actionable
    if (decision.decision === 'skip' || decision.decision === 'hold') {
      console.log(
        `Skipping trade for ${decision.token}: decision=${decision.decision}`
      );
      return null;
    }

    // Check if we should require confirmation
    if (decision.confidence < 70) {
      console.warn(
        `Low confidence (${decision.confidence}) for ${decision.token}, skipping`
      );
      return null;
    }

    const execution: TradeExecution = {
      id: this.generateExecutionId(),
      valuestor: decision.valuestor,
      token: decision.token,
      type: decision.decision === 'buy' ? 'buy' : 'sell',
      amount: decision.recommendedAmount || '0',
      price: '0', // Will be updated after execution
      status: 'pending',
      decision,
      createdAt: new Date(),
    };

    try {
      if (this.config.dryRun) {
        console.log('DRY RUN - Would execute:', execution);
        execution.status = 'confirmed';
        execution.txHash = '0xDRYRUN';
        return execution;
      }

      // Execute the actual trade
      if (decision.decision === 'buy') {
        const txHash = await this.executeBuy(
          decision.token as Address,
          decision.recommendedAmount!
        );
        execution.txHash = txHash;
      } else if (decision.decision === 'sell') {
        const txHash = await this.executeSell(
          decision.token as Address,
          decision.recommendedAmount!
        );
        execution.txHash = txHash;
      }

      execution.status = 'confirmed';
      execution.confirmedAt = new Date();

      console.log(`Trade executed successfully: ${execution.txHash}`);
      return execution;
    } catch (error: any) {
      console.error(`Trade execution failed:`, error);
      execution.status = 'failed';
      execution.error = error.message;
      return execution;
    }
  }

  private async executeBuy(
    tokenAddress: Address,
    ethAmount: string
  ): Promise<string> {
    console.log(`Buying ${ethAmount} ETH worth of ${tokenAddress}`);

    // Get current price and calculate max price with slippage
    const curveInfo = await this.client.getBondingCurveInfo(tokenAddress);
    const currentPrice = BigInt(curveInfo.currentPrice);
    const maxPrice =
      (currentPrice * BigInt(Math.floor((1 + this.config.maxSlippage) * 10000))) /
      BigInt(10000);

    // Execute buy
    const txHash = await this.client.buyTokens(tokenAddress, ethAmount);

    console.log(`Buy transaction submitted: ${txHash}`);
    return txHash;
  }

  private async executeSell(
    tokenAddress: Address,
    tokenAmount: string
  ): Promise<string> {
    console.log(`Selling ${tokenAmount} tokens of ${tokenAddress}`);

    // Get current price and calculate min output with slippage
    const curveInfo = await this.client.getBondingCurveInfo(tokenAddress);
    const currentPrice = BigInt(curveInfo.currentPrice);
    const amount = BigInt(tokenAmount);

    // Rough estimate of ETH output (this should be more precise in production)
    const estimatedETH = (amount * currentPrice) / BigInt(1e18);
    const minOutput =
      (estimatedETH * BigInt(Math.floor((1 - this.config.maxSlippage) * 10000))) /
      BigInt(10000);

    // Execute sell
    const txHash = await this.client.sellTokens(tokenAddress, tokenAmount);

    console.log(`Sell transaction submitted: ${txHash}`);
    return txHash;
  }

  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Execute multiple decisions in sequence
   */
  async executeMultiple(
    decisions: TradeDecision[]
  ): Promise<TradeExecution[]> {
    const executions: TradeExecution[] = [];

    for (const decision of decisions) {
      const execution = await this.executeDecision(decision);
      if (execution) {
        executions.push(execution);
      }

      // Wait a bit between trades to avoid nonce issues
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return executions;
  }
}
