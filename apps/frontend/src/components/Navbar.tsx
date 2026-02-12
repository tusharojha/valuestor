'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { Coins } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <Coins className="w-6 h-6 text-primary-600" />
              <span>Valuestor</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/tokens"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Tokens
              </Link>
              <Link
                href="/create"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Launch Token
              </Link>
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Dashboard
              </Link>
            </div>
          </div>

          <ConnectButton />
        </div>
      </div>
    </nav>
  );
}
