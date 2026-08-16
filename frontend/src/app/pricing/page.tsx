'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pricing } from '@/components/Pricing';
import { Zap, ArrowLeft, ArrowRight } from 'lucide-react';

export default function PricingPage() {
  const router = useRouter();

  const handleSelectPlan = (planName: string) => {
    router.push('/signin');
  };

  return (
    <div className="min-h-screen bg-[#f5f5f4] text-gray-900 selection:bg-violet-500 selection:text-white pb-20">
      {/* Top Floating Navigation */}
      <div className="sticky top-0 z-50 pt-4 pb-3 px-4 md:px-8 bg-[#f5f5f4]/90 backdrop-blur-sm">
        <nav className="max-w-6xl mx-auto bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] py-3 px-5 md:px-8 flex items-center justify-between gap-4">
          {/* Logo - clicking sends to home page */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 hover:opacity-80 transition-opacity">
            <div className="h-9 w-9 rounded-xl overflow-hidden flex-shrink-0 relative flex items-center justify-center border border-gray-200">
              <div className="absolute inset-0 flex flex-col">
                <div className="h-1/2 bg-violet-600" />
                <div className="h-1/2 bg-cyan-500" />
              </div>
              <Zap className="relative z-10 w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900 tracking-tight leading-none">WarmLeads</span>
              <span className="text-[11px] text-gray-400 leading-none mt-0.5">for growth teams</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
              Home
            </Link>
            <Link href="/#features" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-sm font-bold text-violet-600 transition-colors">
              Pricing
            </Link>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/signin" className="hidden sm:inline text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Sign In
            </Link>
            <Link href="/signin" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors">
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </nav>
      </div>

      {/* Main Pricing Section */}
      <main className="max-w-7xl mx-auto px-4 pt-8">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-black transition-colors px-3 py-1.5 rounded-lg border border-gray-200 bg-white shadow-sm">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>
        <Pricing onSelectPlan={handleSelectPlan} />
      </main>
    </div>
  );
}
