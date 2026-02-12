import {
  createPublicClient,
  createWalletClient,
  http,
  type PublicClient,
  type WalletClient,
  type Address,
  parseEther,
  formatEther,
  decodeEventLog,
} from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { RobinPumpFactoryABI } from './abis/RobinPumpFactory';
import { BASE_ADDRESSES } from './addresses/base';
import type {
  BondingCurveInfo,
  TokenCreatedEvent,
  TokenTradedEvent,
  TokenGraduatedEvent,
} from '@valuestor/shared';

export class RobinPumpClient {
  private publicClient: PublicClient;
  private walletClient?: WalletClient;
  private factoryAddress: Address;

  constructor(rpcUrl: string, privateKey?: string) {
    this.publicClient = createPublicClient({
      chain: base,
      transport: http(rpcUrl),
    });

    if (privateKey) {
      const account = privateKeyToAccount(privateKey as `0x${string}`);
      this.walletClient = createWalletClient({
        account,
        chain: base,
        transport: http(rpcUrl),
      });
    }

    this.factoryAddress = BASE_ADDRESSES.robinPumpFactory as Address;
  }

  // ============================================================================
  // Read Methods
  // ============================================================================

  async getBondingCurveInfo(tokenAddress: Address): Promise<BondingCurveInfo> {
    const result = await this.publicClient.readContract({
      address: this.factoryAddress,
      abi: RobinPumpFactoryABI,
      functionName: 'getBondingCurveInfo',
      args: [tokenAddress],
    });

    const [currentPrice, totalSupply, reserveETH, marketCap, graduated] = result;

    return {
      currentPrice: currentPrice.toString(),
      totalSupply: totalSupply.toString(),
      reserveETH: reserveETH.toString(),
      marketCap: marketCap.toString(),
      graduated,
    };
  }

  async getGraduationThreshold(): Promise<bigint> {
    const result = await this.publicClient.readContract({
      address: this.factoryAddress,
      abi: RobinPumpFactoryABI,
      functionName: 'getGraduationThreshold',
    });

    return result;
  }

  // ============================================================================
  // Write Methods
  // ============================================================================

  async createToken(
    name: string,
    symbol: string,
    uri: string,
    initialBuyETH?: string
  ): Promise<{ hash: string; tokenAddress?: Address }> {
    if (!this.walletClient) {
      throw new Error('Wallet client not initialized. Provide private key.');
    }

    const value = initialBuyETH ? parseEther(initialBuyETH) : 0n;

    const { request } = await this.publicClient.simulateContract({
      address: this.factoryAddress,
      abi: RobinPumpFactoryABI,
      functionName: 'createToken',
      args: [name, symbol, uri],
      value,
      account: this.walletClient.account!,
    });

    const hash = await this.walletClient.writeContract(request);

    // Wait for transaction and get token address from events
    const receipt = await this.publicClient.waitForTransactionReceipt({ hash });

    // Parse TokenCreated event to get token address
    const logs = receipt.logs;
    for (const log of logs) {
      try {
        const decoded = decodeEventLog({
          abi: RobinPumpFactoryABI,
          eventName: 'TokenCreated',
          data: log.data,
          topics: log.topics,
        });

        if (decoded.eventName === 'TokenCreated') {
          return { hash, tokenAddress: decoded.args.token };
        }
      } catch (e) {
        // Not a TokenCreated event, continue
      }
    }

    return { hash };
  }

  async buyTokens(tokenAddress: Address, ethAmount: string): Promise<string> {
    if (!this.walletClient) {
      throw new Error('Wallet client not initialized. Provide private key.');
    }

    const value = parseEther(ethAmount);

    const { request } = await this.publicClient.simulateContract({
      address: this.factoryAddress,
      abi: RobinPumpFactoryABI,
      functionName: 'buyTokens',
      args: [tokenAddress],
      value,
      account: this.walletClient.account!,
    });

    const hash = await this.walletClient.writeContract(request);
    return hash;
  }

  async sellTokens(tokenAddress: Address, amount: string): Promise<string> {
    if (!this.walletClient) {
      throw new Error('Wallet client not initialized. Provide private key.');
    }

    const { request } = await this.publicClient.simulateContract({
      address: this.factoryAddress,
      abi: RobinPumpFactoryABI,
      functionName: 'sellTokens',
      args: [tokenAddress, BigInt(amount)],
      account: this.walletClient.account!,
    });

    const hash = await this.walletClient.writeContract(request);
    return hash;
  }

  // ============================================================================
  // Event Monitoring
  // ============================================================================

  async watchTokenCreated(
    callback: (event: TokenCreatedEvent) => void,
    fromBlock?: bigint
  ) {
    return this.publicClient.watchEvent({
      address: this.factoryAddress,
      event: {
        type: 'event',
        name: 'TokenCreated',
        inputs: RobinPumpFactoryABI.find((abi) => abi.name === 'TokenCreated')!.inputs,
      },
      onLogs: (logs) => {
        for (const log of logs) {
          const decoded = decodeEventLog({
            abi: RobinPumpFactoryABI,
            eventName: 'TokenCreated',
            data: log.data,
            topics: log.topics,
          });

          if (decoded.eventName === 'TokenCreated') {
            callback({
              token: decoded.args.token,
              creator: decoded.args.creator,
              name: decoded.args.name,
              symbol: decoded.args.symbol,
              uri: decoded.args.uri,
              timestamp: Number(decoded.args.timestamp),
              blockNumber: Number(log.blockNumber),
              txHash: log.transactionHash!,
            });
          }
        }
      },
      ...(fromBlock && { fromBlock }),
    });
  }

  async watchTokenTraded(
    callback: (event: TokenTradedEvent) => void,
    tokenFilter?: Address
  ) {
    return this.publicClient.watchEvent({
      address: this.factoryAddress,
      event: {
        type: 'event',
        name: 'TokenTraded',
        inputs: RobinPumpFactoryABI.find((abi) => abi.name === 'TokenTraded')!.inputs,
      },
      onLogs: (logs) => {
        for (const log of logs) {
          const decoded = decodeEventLog({
            abi: RobinPumpFactoryABI,
            eventName: 'TokenTraded',
            data: log.data,
            topics: log.topics,
          });

          if (decoded.eventName === 'TokenTraded') {
            if (tokenFilter && decoded.args.token !== tokenFilter) continue;

            callback({
              token: decoded.args.token,
              trader: decoded.args.trader,
              isBuy: decoded.args.isBuy,
              ethAmount: decoded.args.ethAmount.toString(),
              tokenAmount: decoded.args.tokenAmount.toString(),
              newPrice: decoded.args.newPrice.toString(),
              timestamp: Number(decoded.args.timestamp),
              blockNumber: Number(log.blockNumber),
              txHash: log.transactionHash!,
            });
          }
        }
      },
    });
  }

  async watchTokenGraduated(callback: (event: TokenGraduatedEvent) => void) {
    return this.publicClient.watchEvent({
      address: this.factoryAddress,
      event: {
        type: 'event',
        name: 'TokenGraduated',
        inputs: RobinPumpFactoryABI.find((abi) => abi.name === 'TokenGraduated')!.inputs,
      },
      onLogs: (logs) => {
        for (const log of logs) {
          const decoded = decodeEventLog({
            abi: RobinPumpFactoryABI,
            eventName: 'TokenGraduated',
            data: log.data,
            topics: log.topics,
          });

          if (decoded.eventName === 'TokenGraduated') {
            callback({
              token: decoded.args.token,
              pair: decoded.args.pair,
              ethLiquidity: decoded.args.ethLiquidity.toString(),
              tokenLiquidity: decoded.args.tokenLiquidity.toString(),
              timestamp: Number(decoded.args.timestamp),
              blockNumber: Number(log.blockNumber),
              txHash: log.transactionHash!,
            });
          }
        }
      },
    });
  }
}
