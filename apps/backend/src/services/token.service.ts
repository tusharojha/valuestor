import { PrismaClient } from '@prisma/client';
import { RobinPumpClient } from '@valuestor/contracts';
import type { Address } from 'viem';

const prisma = new PrismaClient();

export class TokenService {
  private robinPump: RobinPumpClient;

  constructor(rpcUrl: string) {
    this.robinPump = new RobinPumpClient(rpcUrl);
  }

  async getAllTokens(filters?: {
    category?: string;
    graduated?: boolean;
    creator?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filters?.category) where.category = filters.category;
    if (filters?.graduated !== undefined) where.graduated = filters.graduated;
    if (filters?.creator) where.creator = filters.creator;

    const [tokens, total] = await Promise.all([
      prisma.token.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
      }),
      prisma.token.count({ where }),
    ]);

    return { tokens, total };
  }

  async getToken(address: string) {
    let token = await prisma.token.findUnique({
      where: { address },
      include: {
        analyses: {
          orderBy: { analyzedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!token) {
      // Token not in DB, fetch from chain
      token = await this.fetchAndStoreToken(address);
    } else {
      // Update bonding curve data if stale (>1 min)
      const now = Date.now();
      const lastUpdate = token.lastUpdatedAt.getTime();
      if (now - lastUpdate > 60000) {
        token = await this.updateTokenData(address);
      }
    }

    return token;
  }

  async createToken(data: {
    address: string;
    name: string;
    symbol: string;
    description?: string;
    uri: string;
    creator: string;
    category?: string;
    tags?: string[];
    createdAt: Date;
  }) {
    // Fetch initial bonding curve data
    const curveInfo = await this.robinPump.getBondingCurveInfo(
      data.address as Address
    );

    return prisma.token.create({
      data: {
        ...data,
        currentPrice: curveInfo.currentPrice,
        totalSupply: curveInfo.totalSupply,
        reserveETH: curveInfo.reserveETH,
        marketCap: curveInfo.marketCap,
        graduated: curveInfo.graduated,
        liquidityUSD: curveInfo.liquidityUSD,
      },
    });
  }

  async updateTokenData(address: string) {
    const curveInfo = await this.robinPump.getBondingCurveInfo(
      address as Address
    );

    return prisma.token.update({
      where: { address },
      data: {
        currentPrice: curveInfo.currentPrice,
        totalSupply: curveInfo.totalSupply,
        reserveETH: curveInfo.reserveETH,
        marketCap: curveInfo.marketCap,
        graduated: curveInfo.graduated,
        liquidityUSD: curveInfo.liquidityUSD,
      },
    });
  }

  async getTokenTrades(address: string, limit = 50) {
    return prisma.trade.findMany({
      where: { tokenAddress: address },
      include: {
        valuestor: {
          select: {
            address: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  private async fetchAndStoreToken(address: string) {
    // This would fetch from chain and store
    // For now, return null if not found
    return null;
  }
}
