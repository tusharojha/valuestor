import { Navbar } from '@/components/Navbar';
import Link from 'next/link';
import { ArrowRight, TrendingUp, Shield, Sparkles, Coins } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
            Invest in Startups That Match Your Values
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Valuestor uses AI to analyze startup tokens and automatically trade
            based on your personal values, risk tolerance, and investment goals.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/tokens"
              className="px-8 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:border-gray-400 transition"
            >
              Browse Tokens
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            How Valuestor Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard
              icon={<Sparkles className="w-8 h-8" />}
              title="Define Your Values"
              description="Set your investment themes, risk tolerance, and preferences. Our AI understands what matters to you."
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="AI-Powered Analysis"
              description="Claude AI analyzes every new token launch against your values and provides detailed reasoning."
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Auto-Trade Safely"
              description="Enable auto-trading and let our AI execute trades on your behalf with built-in risk protection."
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
            <StatCard value="$2.5M+" label="Total Volume" />
            <StatCard value="150+" label="Active Valuestors" />
            <StatCard value="500+" label="Tokens Analyzed" />
            <StatCard value="85%" label="Avg. Alignment Score" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Coins className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-4xl font-bold mb-4">
            Ready to Invest with Your Values?
          </h2>
          <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
            Join Valuestor today and start building a portfolio that reflects
            what you believe in.
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Create Your Profile
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2024 Valuestor. Built on Base.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="text-primary-600 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-4xl font-bold text-primary-600 mb-2">{value}</div>
      <div className="text-gray-600">{label}</div>
    </div>
  );
}
