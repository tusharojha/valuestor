import { PrismaClient } from '@prisma/client';
import type { UserValues, Valuestor } from '@valuestor/shared';
import Redis from 'ioredis';

const prisma = new PrismaClient();

export class ValuestorService {
  private redis: Redis;

  constructor(redis: Redis) {
    this.redis = redis;
  }

  async createValuestor(
    userId: string,
    address: string,
    values: UserValues
  ): Promise<Valuestor> {
    const valuestor = await prisma.valuestor.create({
      data: {
        userId,
        address,
        riskTolerance: values.riskTolerance,
        maxInvestmentPerToken: values.maxInvestmentPerToken,
        maxPortfolioAllocation: values.maxPortfolioAllocation,
        themes: values.themes,
        tradingStyle: values.tradingStyle,
        autoTrade: values.autoTrade,
        minLiquidityUSD: values.minLiquidityUSD,
        minCreatorReputation: values.minCreatorReputation,
        avoidHighConcentration: values.avoidHighConcentration,
        aiEnabled: values.aiGuidance.enabled,
        aiAggressiveness: values.aiGuidance.aggressiveness,
        requireConfirmation: values.aiGuidance.requireConfirmation,
      },
      include: {
        user: true,
      },
    });

    // Cache in Redis for the trader bot
    await this.cacheValuestor(valuestor);

    return this.toValuestor(valuestor);
  }

  async getValuestor(address: string): Promise<Valuestor | null> {
    const valuestor = await prisma.valuestor.findUnique({
      where: { address },
      include: { user: true },
    });

    if (!valuestor) return null;
    return this.toValuestor(valuestor);
  }

  async updateValuestor(
    address: string,
    values: Partial<UserValues>
  ): Promise<Valuestor> {
    const valuestor = await prisma.valuestor.update({
      where: { address },
      data: {
        ...(values.riskTolerance && { riskTolerance: values.riskTolerance }),
        ...(values.maxInvestmentPerToken !== undefined && {
          maxInvestmentPerToken: values.maxInvestmentPerToken,
        }),
        ...(values.maxPortfolioAllocation !== undefined && {
          maxPortfolioAllocation: values.maxPortfolioAllocation,
        }),
        ...(values.themes && { themes: values.themes }),
        ...(values.tradingStyle && { tradingStyle: values.tradingStyle }),
        ...(values.autoTrade !== undefined && { autoTrade: values.autoTrade }),
        ...(values.minLiquidityUSD !== undefined && {
          minLiquidityUSD: values.minLiquidityUSD,
        }),
        ...(values.minCreatorReputation !== undefined && {
          minCreatorReputation: values.minCreatorReputation,
        }),
        ...(values.avoidHighConcentration !== undefined && {
          avoidHighConcentration: values.avoidHighConcentration,
        }),
        ...(values.aiGuidance?.enabled !== undefined && {
          aiEnabled: values.aiGuidance.enabled,
        }),
        ...(values.aiGuidance?.aggressiveness !== undefined && {
          aiAggressiveness: values.aiGuidance.aggressiveness,
        }),
        ...(values.aiGuidance?.requireConfirmation !== undefined && {
          requireConfirmation: values.aiGuidance.requireConfirmation,
        }),
      },
      include: { user: true },
    });

    await this.cacheValuestor(valuestor);
    return this.toValuestor(valuestor);
  }

  async getPositions(address: string) {
    return prisma.position.findMany({
      where: {
        valuestor: { address },
      },
      include: {
        token: true,
      },
      orderBy: {
        firstBuyAt: 'desc',
      },
    });
  }

  async getTrades(address: string, limit = 50) {
    return prisma.trade.findMany({
      where: {
        valuestor: { address },
      },
      include: {
        token: true,
        decision: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  async getDecisions(address: string, limit = 50) {
    return prisma.tradeDecision.findMany({
      where: {
        valuestor: { address },
      },
      include: {
        token: true,
      },
      orderBy: {
        analyzedAt: 'desc',
      },
      take: limit,
    });
  }

  private async cacheValuestor(valuestor: any) {
    const key = `valuestor:${valuestor.address}`;
    const data = this.toValuestor(valuestor);
    await this.redis.set(key, JSON.stringify(data));
  }

  private toValuestor(valuestor: any): Valuestor {
    return {
      id: valuestor.id,
      address: valuestor.address,
      values: {
        riskTolerance: valuestor.riskTolerance as any,
        maxInvestmentPerToken: valuestor.maxInvestmentPerToken,
        maxPortfolioAllocation: valuestor.maxPortfolioAllocation,
        themes: valuestor.themes as any,
        tradingStyle: valuestor.tradingStyle as any,
        autoTrade: valuestor.autoTrade,
        minLiquidityUSD: valuestor.minLiquidityUSD,
        minCreatorReputation: valuestor.minCreatorReputation,
        avoidHighConcentration: valuestor.avoidHighConcentration,
        aiGuidance: {
          enabled: valuestor.aiEnabled,
          aggressiveness: valuestor.aiAggressiveness,
          requireConfirmation: valuestor.requireConfirmation,
        },
      },
      createdAt: valuestor.createdAt,
      updatedAt: valuestor.updatedAt,
      isActive: valuestor.isActive,
    };
  }
}
