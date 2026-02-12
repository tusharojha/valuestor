'use client';

import { Navbar } from '@/components/Navbar';
import { useEffect, useState } from 'react';
import { tokens as tokensAPI } from '@/lib/api';
import { formatAddress } from '@/lib/utils';
import { Search, Filter } from 'lucide-react';
import Link from 'next/link';

export default function TokensPage() {
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    loadTokens();
  }, [categoryFilter]);

  const loadTokens = async () => {
    try {
      const response = await tokensAPI.getAll({
        category: categoryFilter || undefined,
        limit: 50,
      });
      setTokens(response.data.tokens);
    } catch (error) {
      console.error('Failed to load tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTokens = tokens.filter(
    (token) =>
      token.name.toLowerCase().includes(search.toLowerCase()) ||
      token.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const categories = [
    'All',
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Browse Tokens</h1>
          <Link
            href="/create"
            className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700"
          >
            Launch Token
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tokens..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg appearance-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat === 'All' ? '' : cat}>
                    {cat.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tokens Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
            <p className="mt-4 text-gray-600">Loading tokens...</p>
          </div>
        ) : filteredTokens.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600">No tokens found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTokens.map((token) => (
              <TokenCard key={token.address} token={token} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TokenCard({ token }: { token: any }) {
  return (
    <Link href={`/tokens/${token.address}`}>
      <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition cursor-pointer border border-transparent hover:border-primary-300">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold">{token.name}</h3>
            <p className="text-gray-600">{token.symbol}</p>
          </div>
          {token.category && (
            <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
              {token.category.replace('_', ' ')}
            </span>
          )}
        </div>

        {token.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {token.description}
          </p>
        )}

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Address</span>
            <span className="font-mono">{formatAddress(token.address)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Creator</span>
            <span className="font-mono">{formatAddress(token.creator)}</span>
          </div>
          {token.currentPrice && (
            <div className="flex justify-between">
              <span className="text-gray-600">Price</span>
              <span className="font-medium">{token.currentPrice} ETH</span>
            </div>
          )}
          {token.graduated !== undefined && (
            <div className="flex justify-between">
              <span className="text-gray-600">Status</span>
              <span
                className={`font-medium ${
                  token.graduated ? 'text-green-600' : 'text-blue-600'
                }`}
              >
                {token.graduated ? 'Graduated' : 'Bonding Curve'}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
