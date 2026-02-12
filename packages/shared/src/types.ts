import { z } from 'zod';

// ============================================================================
// User & Valuestor Types
// ============================================================================

export const UserValuesSchema = z.object({
  // Risk & Investment Profile
  riskTolerance: z.enum(['conservative', 'moderate', 'aggressive']),
  maxInvestmentPerToken: z.number().positive(),
  maxPortfolioAllocation: z.number().min(0).max(100),

  // Investment Themes & Values
  themes: z.array(z.enum([
    'sustainability',
    'social_impact',
    'innovation',
    'education',
    'health',
    'finance',
    'entertainment',
    'gaming',
    'ai_ml',
    'web3',
    'defi',
    'other'
  ])),

  // Trading Strategy
  tradingStyle: z.enum(['holder', 'swing_trader', 'day_trader']),
  autoTrade: z.boolean(),

  // Risk Filters
  minLiquidityUSD: z.number().min(0),
  minCreatorReputation: z.number().min(0).max(100),
  avoidHighConcentration: z.boolean(),

  // AI Decision Making
  aiGuidance: z.object({
    enabled: z.boolean(),
    aggressiveness: z.number().min(0).max(100), // How aggressive AI should be
    requireConfirmation: z.boolean(), // Require user confirmation before trades
  }),
});

export type UserValues = z.infer<typeof UserValuesSchema>;

export const ValuestorSchema = z.object({
  id: z.string(),
  address: z.string(), // Wallet address
  values: UserValuesSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  isActive: z.boolean(),
});

export type Valuestor = z.infer<typeof ValuestorSchema>;

// ============================================================================
// Token Types
// ============================================================================

export const TokenMetadataSchema = z.object({
  address: z.string(),
  name: z.string(),
  symbol: z.string(),
  description: z.string().optional(),
  uri: z.string(), // IPFS or metadata URI
  creator: z.string(), // Creator wallet address
  createdAt: z.date(),

  // Categorization
  category: z.enum([
    'sustainability',
    'social_impact',
    'innovation',
    'education',
    'health',
    'finance',
    'entertainment',
    'gaming',
    'ai_ml',
    'web3',
    'defi',
    'other'
  ]).optional(),
  tags: z.array(z.string()).optional(),
});

export type TokenMetadata = z.infer<typeof TokenMetadataSchema>;

export const BondingCurveInfoSchema = z.object({
  currentPrice: z.string(), // BigNumber as string
  totalSupply: z.string(),
  reserveETH: z.string(),
  marketCap: z.string(),
  graduated: z.boolean(),
  liquidityUSD: z.number().optional(),
});

export type BondingCurveInfo = z.infer<typeof BondingCurveInfoSchema>;

export const TokenAnalysisSchema = z.object({
  token: z.string(),
  bondingCurve: BondingCurveInfoSchema,
  metadata: TokenMetadataSchema,
  riskScore: z.number().min(0).max(100),
  riskFlags: z.array(z.string()),

  // Holder analysis
  holderCount: z.number().optional(),
  topHolderConcentration: z.number().optional(), // % held by top 10 holders

  // Creator analysis
  creatorReputation: z.number().min(0).max(100).optional(),
  creatorRugHistory: z.boolean().optional(),

  analyzedAt: z.date(),
});

export type TokenAnalysis = z.infer<typeof TokenAnalysisSchema>;

// ============================================================================
// Trading Types
// ============================================================================

export const TradeDecisionSchema = z.object({
  token: z.string(),
  valuestor: z.string(),

  decision: z.enum(['buy', 'sell', 'hold', 'skip']),
  confidence: z.number().min(0).max(100),

  reasoning: z.string(), // AI-generated reasoning
  alignmentScore: z.number().min(0).max(100), // How well token aligns with user values

  // Recommended trade params (if decision is buy/sell)
  recommendedAmount: z.string().optional(), // ETH amount as string
  maxPrice: z.string().optional(),
  minOutput: z.string().optional(),

  analyzedAt: z.date(),
});

export type TradeDecision = z.infer<typeof TradeDecisionSchema>;

export const TradeExecutionSchema = z.object({
  id: z.string(),
  valuestor: z.string(),
  token: z.string(),

  type: z.enum(['buy', 'sell']),
  amount: z.string(), // ETH or token amount
  price: z.string(),

  txHash: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'failed']),

  decision: TradeDecisionSchema.optional(), // The AI decision that led to this trade

  createdAt: z.date(),
  confirmedAt: z.date().optional(),
  error: z.string().optional(),
});

export type TradeExecution = z.infer<typeof TradeExecutionSchema>;

export const PositionSchema = z.object({
  valuestor: z.string(),
  token: z.string(),

  amount: z.string(), // Token balance
  averageBuyPrice: z.string(),
  totalInvested: z.string(), // Total ETH invested
  currentValue: z.string().optional(), // Current value in ETH

  unrealizedPnL: z.string().optional(),
  unrealizedPnLPercent: z.number().optional(),

  firstBuyAt: z.date(),
  lastUpdateAt: z.date(),
});

export type Position = z.infer<typeof PositionSchema>;

// ============================================================================
// Events
// ============================================================================

export const TokenCreatedEventSchema = z.object({
  token: z.string(),
  creator: z.string(),
  name: z.string(),
  symbol: z.string(),
  uri: z.string(),
  timestamp: z.number(),
  blockNumber: z.number(),
  txHash: z.string(),
});

export type TokenCreatedEvent = z.infer<typeof TokenCreatedEventSchema>;

export const TokenTradedEventSchema = z.object({
  token: z.string(),
  trader: z.string(),
  isBuy: z.boolean(),
  ethAmount: z.string(),
  tokenAmount: z.string(),
  newPrice: z.string(),
  timestamp: z.number(),
  blockNumber: z.number(),
  txHash: z.string(),
});

export type TokenTradedEvent = z.infer<typeof TokenTradedEventSchema>;

export const TokenGraduatedEventSchema = z.object({
  token: z.string(),
  pair: z.string(),
  ethLiquidity: z.string(),
  tokenLiquidity: z.string(),
  timestamp: z.number(),
  blockNumber: z.number(),
  txHash: z.string(),
});

export type TokenGraduatedEvent = z.infer<typeof TokenGraduatedEventSchema>;
