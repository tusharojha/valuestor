'use client';

import { Navbar } from '@/components/Navbar';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { valuestor as valuestorAPI } from '@/lib/api';
import type { UserValues } from '@valuestor/shared';

export default function RegisterPage() {
  const { address } = useAccount();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState<Partial<UserValues>>({
    riskTolerance: 'moderate',
    maxInvestmentPerToken: 0.1,
    maxPortfolioAllocation: 20,
    themes: [],
    tradingStyle: 'holder',
    autoTrade: false,
    minLiquidityUSD: 1000,
    minCreatorReputation: 50,
    avoidHighConcentration: true,
    aiGuidance: {
      enabled: true,
      aggressiveness: 50,
      requireConfirmation: true,
    },
  });

  const themes = [
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
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    setLoading(true);
    try {
      await valuestorAPI.create(values as UserValues);
      router.push('/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = (theme: string) => {
    setValues((prev) => ({
      ...prev,
      themes: prev.themes?.includes(theme as any)
        ? prev.themes.filter((t) => t !== theme)
        : [...(prev.themes || []), theme as any],
    }));
  };

  if (!address) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-gray-600">
            Please connect your wallet to create a Valuestor profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Create Your Valuestor Profile</h1>
          <p className="text-gray-600 mb-8">
            Define your investment values and let AI trade on your behalf.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Risk Tolerance */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Risk Tolerance</h2>
              <div className="grid grid-cols-3 gap-4">
                {['conservative', 'moderate', 'aggressive'].map((risk) => (
                  <button
                    key={risk}
                    type="button"
                    onClick={() => setValues({ ...values, riskTolerance: risk as any })}
                    className={`p-4 border-2 rounded-lg capitalize ${
                      values.riskTolerance === risk
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200'
                    }`}
                  >
                    {risk}
                  </button>
                ))}
              </div>
            </div>

            {/* Investment Limits */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Investment Limits</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Max Investment Per Token (ETH)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={values.maxInvestmentPerToken}
                    onChange={(e) =>
                      setValues({
                        ...values,
                        maxInvestmentPerToken: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Max Portfolio Allocation (%)
                  </label>
                  <input
                    type="number"
                    value={values.maxPortfolioAllocation}
                    onChange={(e) =>
                      setValues({
                        ...values,
                        maxPortfolioAllocation: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Investment Themes */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Investment Themes</h2>
              <p className="text-sm text-gray-600 mb-4">
                Select the themes that align with your values
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {themes.map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => toggleTheme(theme)}
                    className={`p-3 border-2 rounded-lg capitalize text-sm ${
                      values.themes?.includes(theme as any)
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200'
                    }`}
                  >
                    {theme.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Trading Style */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Trading Style</h2>
              <div className="grid grid-cols-3 gap-4">
                {['holder', 'swing_trader', 'day_trader'].map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setValues({ ...values, tradingStyle: style as any })}
                    className={`p-4 border-2 rounded-lg capitalize ${
                      values.tradingStyle === style
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200'
                    }`}
                  >
                    {style.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Settings */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">AI Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Enable Auto-Trading</span>
                  <input
                    type="checkbox"
                    checked={values.autoTrade}
                    onChange={(e) =>
                      setValues({ ...values, autoTrade: e.target.checked })
                    }
                    className="w-5 h-5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    AI Aggressiveness: {values.aiGuidance?.aggressiveness}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={values.aiGuidance?.aggressiveness}
                    onChange={(e) =>
                      setValues({
                        ...values,
                        aiGuidance: {
                          ...values.aiGuidance!,
                          aggressiveness: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Require Confirmation</span>
                  <input
                    type="checkbox"
                    checked={values.aiGuidance?.requireConfirmation}
                    onChange={(e) =>
                      setValues({
                        ...values,
                        aiGuidance: {
                          ...values.aiGuidance!,
                          requireConfirmation: e.target.checked,
                        },
                      })
                    }
                    className="w-5 h-5"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || (values.themes?.length || 0) === 0}
              className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Profile...' : 'Create Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
