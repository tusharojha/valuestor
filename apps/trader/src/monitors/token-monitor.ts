import { RobinPumpClient } from '@valuestor/contracts';
import type {
  TokenCreatedEvent,
  TokenTradedEvent,
  TokenMetadata,
  TokenAnalysis,
} from '@valuestor/shared';
import type { Address } from 'viem';

export interface TokenMonitorCallbacks {
  onTokenCreated: (event: TokenCreatedEvent, analysis: TokenAnalysis) => void;
  onTokenTraded?: (event: TokenTradedEvent) => void;
}

export class TokenMonitor {
  private client: RobinPumpClient;
  private callbacks: TokenMonitorCallbacks;
  private unwatchCreated?: () => void;
  private unwatchTraded?: () => void;

  constructor(client: RobinPumpClient, callbacks: TokenMonitorCallbacks) {
    this.client = client;
    this.callbacks = callbacks;
  }

  async start() {
    console.log('Starting token monitor...');

    // Watch for new token creations
    this.unwatchCreated = await this.client.watchTokenCreated(async (event) => {
      console.log(`New token created: ${event.name} (${event.symbol})`);
      console.log(`  Token: ${event.token}`);
      console.log(`  Creator: ${event.creator}`);

      try {
        // Analyze the token
        const analysis = await this.analyzeNewToken(event);
        this.callbacks.onTokenCreated(event, analysis);
      } catch (error) {
        console.error(`Failed to analyze token ${event.token}:`, error);
      }
    });

    // Watch for trades (optional)
    if (this.callbacks.onTokenTraded) {
      this.unwatchTraded = await this.client.watchTokenTraded((event) => {
        this.callbacks.onTokenTraded!(event);
      });
    }

    console.log('Token monitor started');
  }

  stop() {
    console.log('Stopping token monitor...');
    this.unwatchCreated?.();
    this.unwatchTraded?.();
    console.log('Token monitor stopped');
  }

  private async analyzeNewToken(event: TokenCreatedEvent): Promise<TokenAnalysis> {
    // Get bonding curve info
    const bondingCurve = await this.client.getBondingCurveInfo(
      event.token as Address
    );

    // Fetch metadata from URI
    const metadata = await this.fetchMetadata(event.uri);

    // Perform basic risk analysis
    const riskScore = this.calculateBasicRiskScore(
      event,
      bondingCurve,
      metadata
    );

    const riskFlags = this.identifyRiskFlags(event, bondingCurve);

    return {
      token: event.token,
      bondingCurve,
      metadata: {
        address: event.token,
        name: event.name,
        symbol: event.symbol,
        uri: event.uri,
        creator: event.creator,
        createdAt: new Date(event.timestamp * 1000),
        ...metadata,
      },
      riskScore,
      riskFlags,
      analyzedAt: new Date(),
    };
  }

  private async fetchMetadata(uri: string): Promise<Partial<TokenMetadata>> {
    try {
      // Handle IPFS URIs
      let url = uri;
      if (uri.startsWith('ipfs://')) {
        url = uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
      }

      const response = await fetch(url, {
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      return {
        description: data.description,
        category: data.category,
        tags: data.tags,
      };
    } catch (error) {
      console.warn(`Failed to fetch metadata from ${uri}:`, error);
      return {};
    }
  }

  private calculateBasicRiskScore(
    event: TokenCreatedEvent,
    bondingCurve: any,
    metadata: Partial<TokenMetadata>
  ): number {
    let score = 100;

    // Deduct points for missing metadata
    if (!metadata.description) score -= 10;
    if (!metadata.category) score -= 5;
    if (!metadata.tags || metadata.tags.length === 0) score -= 5;

    // Deduct points for very low liquidity
    const reserveETH = parseFloat(bondingCurve.reserveETH);
    if (reserveETH < 0.01) score -= 30;
    else if (reserveETH < 0.1) score -= 15;
    else if (reserveETH < 1) score -= 5;

    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, score));
  }

  private identifyRiskFlags(
    event: TokenCreatedEvent,
    bondingCurve: any
  ): string[] {
    const flags: string[] = [];

    // Very low initial liquidity
    const reserveETH = parseFloat(bondingCurve.reserveETH);
    if (reserveETH < 0.01) {
      flags.push('VERY_LOW_LIQUIDITY');
    }

    // New creator (this would need database to track)
    // flags.push('NEW_CREATOR'); // TODO: Check creator history

    return flags;
  }
}
