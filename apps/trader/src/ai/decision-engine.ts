import OpenAI from 'openai';
import type {
  UserValues,
  TokenAnalysis,
  TradeDecision,
  BondingCurveInfo,
} from '@valuestor/shared';

export class AIDecisionEngine {
  private openai: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-4-turbo-preview') {
    this.openai = new OpenAI({ apiKey });
    this.model = model;
  }

  /**
   * Analyze a token against a valuestor's values and make a trading decision
   */
  async analyzeToken(
    token: TokenAnalysis,
    valuestor: { address: string; values: UserValues },
    currentPosition?: { amount: string; averageBuyPrice: string }
  ): Promise<TradeDecision> {
    const prompt = this.buildAnalysisPrompt(token, valuestor.values, currentPosition);

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are an AI trading advisor for a values-based investment platform called Valuestor. Analyze tokens and provide trading recommendations based on user values.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const responseText = response.choices[0]?.message?.content || '{}';

    // Parse the AI response
    return this.parseAIResponse(responseText, token.token, valuestor.address);
  }

  private buildAnalysisPrompt(
    token: TokenAnalysis,
    values: UserValues,
    currentPosition?: { amount: string; averageBuyPrice: string }
  ): string {
    const positionContext = currentPosition
      ? `\n\nCURRENT POSITION:
- Amount: ${currentPosition.amount} tokens
- Average Buy Price: ${currentPosition.averageBuyPrice} ETH
- Current Price: ${token.bondingCurve.currentPrice} ETH
`
      : '\n\nNo current position in this token.';

    return `You are an AI trading advisor for a values-based investment platform called Valuestor.

INVESTOR VALUES:
- Risk Tolerance: ${values.riskTolerance}
- Max Investment Per Token: ${values.maxInvestmentPerToken} ETH
- Max Portfolio Allocation: ${values.maxPortfolioAllocation}%
- Investment Themes: ${values.themes.join(', ')}
- Trading Style: ${values.tradingStyle}
- Auto Trade: ${values.autoTrade ? 'Yes' : 'No'}
- Min Liquidity USD: $${values.minLiquidityUSD}
- Min Creator Reputation: ${values.minCreatorReputation}/100
- Avoid High Concentration: ${values.avoidHighConcentration ? 'Yes' : 'No'}
- AI Aggressiveness: ${values.aiGuidance.aggressiveness}/100

TOKEN INFORMATION:
- Address: ${token.token}
- Name: ${token.metadata.name}
- Symbol: ${token.metadata.symbol}
- Description: ${token.metadata.description || 'N/A'}
- Category: ${token.metadata.category || 'N/A'}
- Tags: ${token.metadata.tags?.join(', ') || 'N/A'}
- Creator: ${token.metadata.creator}

BONDING CURVE STATUS:
- Current Price: ${token.bondingCurve.currentPrice} ETH
- Total Supply: ${token.bondingCurve.totalSupply}
- Reserve ETH: ${token.bondingCurve.reserveETH} ETH
- Market Cap: ${token.bondingCurve.marketCap} ETH
- Graduated: ${token.bondingCurve.graduated ? 'Yes' : 'No'}
- Liquidity USD: $${token.bondingCurve.liquidityUSD || 'Unknown'}

RISK ASSESSMENT:
- Risk Score: ${token.riskScore}/100
- Risk Flags: ${token.riskFlags.length > 0 ? token.riskFlags.join(', ') : 'None'}
- Holder Count: ${token.holderCount || 'Unknown'}
- Top Holder Concentration: ${token.topHolderConcentration ? `${token.topHolderConcentration}%` : 'Unknown'}
- Creator Reputation: ${token.creatorReputation || 'Unknown'}/100
- Creator Rug History: ${token.creatorRugHistory ? 'YES - HIGH RISK' : 'No'}
${positionContext}

TASK:
Analyze this token against the investor's values and provide a trading recommendation.

DECISION CRITERIA:
1. Values Alignment: Does this token's category, description, and purpose align with the investor's themes?
2. Risk Assessment: Is the risk score acceptable given the investor's risk tolerance?
3. Financial Viability: Is the liquidity sufficient? Is the price reasonable?
4. Creator Trust: Does the creator have good reputation? Any rug history?
5. Holder Distribution: Is concentration acceptable?
6. Position Management: If holding, should we take profits, hold, or sell?

RESPONSE FORMAT (JSON):
{
  "decision": "buy" | "sell" | "hold" | "skip",
  "confidence": 0-100,
  "alignmentScore": 0-100,
  "reasoning": "Your detailed reasoning here",
  "recommendedAmount": "0.01",
  "keyFactors": ["factor1", "factor2", "factor3"]
}

IMPORTANT:
- "skip" means don't trade (misaligned values or high risk)
- "buy" only if values align well and risk is acceptable
- "sell" if currently holding and should exit
- "hold" if currently holding and should continue
- Be conservative with risk - investor trust is paramount
- Consider the AI aggressiveness level: higher = more willing to take risks
- NEVER recommend buying if creator has rug history
- Match trading style: holders prefer long-term, day traders prefer quick trades

Provide your response as valid JSON only, no additional text.`;
  }

  private parseAIResponse(
    responseText: string,
    tokenAddress: string,
    valuestorAddress: string
  ): TradeDecision {
    try {
      const parsed = JSON.parse(responseText);

      // Validate required fields
      if (!parsed.decision || !parsed.confidence || !parsed.reasoning) {
        throw new Error('Missing required fields in AI response');
      }

      return {
        token: tokenAddress,
        valuestor: valuestorAddress,
        decision: parsed.decision,
        confidence: parsed.confidence,
        reasoning: parsed.reasoning,
        alignmentScore: parsed.alignmentScore || 50,
        recommendedAmount: parsed.recommendedAmount?.toString(),
        analyzedAt: new Date(),
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      console.error('Response text:', responseText);

      // Fallback to safe "skip" decision
      return {
        token: tokenAddress,
        valuestor: valuestorAddress,
        decision: 'skip',
        confidence: 0,
        reasoning: 'Failed to parse AI response. Defaulting to skip for safety.',
        alignmentScore: 0,
        analyzedAt: new Date(),
      };
    }
  }

  /**
   * Get portfolio rebalancing recommendations
   */
  async getPortfolioAdvice(
    valuestor: { address: string; values: UserValues },
    positions: Array<{
      token: string;
      tokenInfo: TokenAnalysis;
      amount: string;
      averageBuyPrice: string;
      currentValue: string;
      unrealizedPnL: string;
    }>
  ): Promise<{
    recommendations: Array<{
      token: string;
      action: 'sell' | 'hold' | 'buy_more';
      reason: string;
      urgency: 'low' | 'medium' | 'high';
    }>;
    overallPortfolioHealth: string;
  }> {
    const prompt = `You are an AI portfolio advisor for Valuestor.

INVESTOR VALUES:
- Risk Tolerance: ${valuestor.values.riskTolerance}
- Trading Style: ${valuestor.values.tradingStyle}
- Investment Themes: ${valuestor.values.themes.join(', ')}

CURRENT PORTFOLIO (${positions.length} positions):
${positions.map((p, i) => `
${i + 1}. ${p.tokenInfo.metadata.name} (${p.tokenInfo.metadata.symbol})
   - Category: ${p.tokenInfo.metadata.category || 'N/A'}
   - Amount: ${p.amount} tokens
   - Avg Buy Price: ${p.averageBuyPrice} ETH
   - Current Value: ${p.currentValue} ETH
   - Unrealized P&L: ${p.unrealizedPnL} ETH
   - Risk Score: ${p.tokenInfo.riskScore}/100
   - Risk Flags: ${p.tokenInfo.riskFlags.join(', ') || 'None'}
`).join('')}

Analyze this portfolio and provide:
1. Recommendations for each position (sell, hold, or buy more)
2. Overall portfolio health assessment
3. Any urgent actions needed

Response format (JSON):
{
  "recommendations": [
    {
      "token": "0x...",
      "action": "sell" | "hold" | "buy_more",
      "reason": "why",
      "urgency": "low" | "medium" | "high"
    }
  ],
  "overallPortfolioHealth": "Assessment here"
}`;

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are an AI portfolio advisor. Provide portfolio analysis and recommendations in JSON format.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 3000,
      response_format: { type: 'json_object' },
    });

    const responseText = response.choices[0]?.message?.content || '{}';

    try {
      return JSON.parse(responseText);
    } catch {
      return {
        recommendations: [],
        overallPortfolioHealth: 'Unable to analyze',
      };
    }
  }
}
