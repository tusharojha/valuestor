'use client';

import { Navbar } from '@/components/Navbar';
import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';
import { valuestor as valuestorAPI } from '@/lib/api';
import { formatCurrency, formatPercentage, formatAddress } from '@/lib/utils';
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { address } = useAccount();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (address) {
      loadData();
    }
  }, [address]);

  const loadData = async () => {
    try {
      const [profile, positions, trades, decisions] = await Promise.all([
        valuestorAPI.get(address!).then((r) => r.data),
        valuestorAPI.getPositions(address!).then((r) => r.data),
        valuestorAPI.getTrades(address!, 10).then((r) => r.data),
        valuestorAPI.getDecisions(address!, 10).then((r) => r.data),
      ]);

      setData({ profile, positions, trades, decisions });
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!address) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-gray-600">
            Please connect your wallet to view your dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data?.profile) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">No Profile Found</h1>
          <p className="text-gray-600 mb-8">
            You haven't created a Valuestor profile yet.
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700"
          >
            Create Profile
          </Link>
        </div>
      </div>
    );
  }

  const positions = data.positions || [];
  const totalValue = positions.reduce(
    (sum: number, p: any) => sum + parseFloat(p.currentValue || '0'),
    0
  );
  const totalInvested = positions.reduce(
    (sum: number, p: any) => sum + parseFloat(p.totalInvested || '0'),
    0
  );
  const totalPnL = totalValue - totalInvested;
  const pnlPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<DollarSign />}
            label="Portfolio Value"
            value={formatCurrency(totalValue)}
            color="blue"
          />
          <StatCard
            icon={totalPnL >= 0 ? <TrendingUp /> : <TrendingDown />}
            label="Total P&L"
            value={formatCurrency(totalPnL)}
            subValue={formatPercentage(pnlPercent)}
            color={totalPnL >= 0 ? 'green' : 'red'}
          />
          <StatCard
            icon={<Activity />}
            label="Active Positions"
            value={positions.length.toString()}
            color="purple"
          />
          <StatCard
            icon={<DollarSign />}
            label="Total Invested"
            value={formatCurrency(totalInvested)}
            color="gray"
          />
        </div>

        {/* Positions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Your Positions</h2>
          {positions.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No positions yet</p>
          ) : (
            <div className="space-y-4">
              {positions.map((position: any) => (
                <div
                  key={position.id}
                  className="border rounded-lg p-4 hover:border-primary-300 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {position.token.name} ({position.token.symbol})
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatAddress(position.token.address)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatCurrency(parseFloat(position.currentValue || '0'))}
                      </div>
                      <div
                        className={`text-sm ${
                          (position.unrealizedPnLPercent || 0) >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {formatPercentage(position.unrealizedPnLPercent || 0)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Amount</div>
                      <div className="font-medium">{position.amount}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Avg Buy Price</div>
                      <div className="font-medium">{position.averageBuyPrice} ETH</div>
                    </div>
                    <div>
                      <div className="text-gray-600">P&L</div>
                      <div className="font-medium">
                        {formatCurrency(parseFloat(position.unrealizedPnL || '0'))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Decisions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-4">Recent AI Decisions</h2>
          {(data.decisions || []).length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No decisions yet. The AI will analyze new tokens automatically.
            </p>
          ) : (
            <div className="space-y-4">
              {data.decisions.map((decision: any) => (
                <div key={decision.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">
                        {decision.token.name} ({decision.token.symbol})
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(decision.analyzedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          decision.decision === 'buy'
                            ? 'bg-green-100 text-green-700'
                            : decision.decision === 'sell'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {decision.decision}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                        {decision.confidence}% confident
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{decision.reasoning}</p>
                  <div className="text-sm text-gray-600">
                    Alignment Score: {decision.alignmentScore}/100
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subValue,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    gray: 'bg-gray-50 text-gray-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className={`inline-flex p-2 rounded-lg mb-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
        {icon}
      </div>
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
      {subValue && <div className="text-sm text-gray-600 mt-1">{subValue}</div>}
    </div>
  );
}
