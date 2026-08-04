'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Zap, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Database, 
  Mail, 
  CheckCircle2, 
  Layers, 
  Bot, 
  BarChart3 
} from 'lucide-react';
import { InstantResearchWidget } from '@/components/InstantResearchWidget';
import { Pricing } from '@/components/Pricing';
import { UpgradeModal, ModalType } from '@/components/UpgradeModal';

export default function LandingPage() {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<ModalType>('FIRST_REPLY');

  return (
    <div className="space-y-20 max-w-7xl mx-auto pb-16">
      {/* 1. HERO SECTION */}
      <section className="text-center pt-8 space-y-8 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-accent/15 text-violet-300 border border-violet-500/30 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-cyan-glow animate-pulse" />
          <span>WarmLeads AI Cold Outreach Architecture</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.1]">
          Autonomous Cold Email Agent with <span className="text-transparent bg-clip-text bg-violet-cyan-gradient">Zero Overhead</span>
        </h1>

        <p className="text-gray-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
          Firecrawl scraper + LangGraph 2-Pass reasoning engine on Azure OpenAI. Uses SQL queueing (<code className="text-cyan-glow font-mono text-xs">FOR UPDATE SKIP LOCKED</code>) and direct email delivery.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-violet-cyan-gradient text-white text-xs font-extrabold shadow-violet-glow hover:scale-105 transition w-full sm:w-auto"
          >
            Launch Operations Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="#research-widget"
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-gray-300 text-xs font-semibold border border-gray-700/60 transition w-full sm:w-auto"
          >
            Test Instant Scraper Demo
          </a>
        </div>
      </section>

      {/* 2. INSTANT RESEARCH DEMO WIDGET */}
      <section id="research-widget" className="scroll-mt-24">
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Instant AI Prospecting & Scraper</h2>
          <p className="text-xs text-gray-400">Enter any company domain to generate real-time AI research & personalized cold email copy</p>
        </div>

        <InstantResearchWidget />
      </section>

      {/* 3. CORE ARCHITECTURE FEATURES */}
      <section className="space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Engineered for High-Volume Outreach</h2>
          <p className="text-sm text-gray-400">Robust, stateless architecture designed for deliverability & speed</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-glow/20 border border-cyan-500/30 flex items-center justify-center text-cyan-glow">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">LangGraph 2-Pass Agent</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Dual-stage reasoning engine scores prospect relevance and crafts hyper-personalized email lines.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-accent/20 border border-violet-500/30 flex items-center justify-center text-violet-accent">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">SKIP LOCKED SQL Queue</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Stateless concurrency model guarantees zero duplicate sends across multi-worker deployments.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Direct Email Delivery</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Native support for Google Cloud OAuth2 Gmail API & Resend API for high inbox placement.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Human Review Safeguard</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Optional approval step before email dispatching ensures 100% brand safety and messaging quality.
            </p>
          </div>
        </div>
      </section>

      {/* 4. PRICING TABLE */}
      <section id="pricing" className="scroll-mt-24">
        <Pricing onSelectPlan={(plan) => {
          if (plan.includes('Free')) {
            window.location.href = '/dashboard';
          } else {
            setModalType('LIMIT_REACHED');
            setModalOpen(true);
          }
        }} />
      </section>

      {/* 5. CALL TO ACTION BANNER */}
      <section className="glass-panel p-10 rounded-3xl border border-violet-500/40 shadow-violet-glow text-center space-y-6 relative overflow-hidden">
        <h2 className="text-3xl sm:text-4xl font-black text-white">Ready to Automate Your Cold Email Pipeline?</h2>
        <p className="text-gray-300 text-xs sm:text-sm max-w-xl mx-auto">
          Start generating qualified leads with zero manual scraping or copy drafting overhead.
        </p>
        <div className="pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-violet-cyan-gradient text-white text-xs font-black shadow-violet-glow hover:scale-105 transition"
          >
            Launch Operations Dashboard Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
        onUpgrade={() => window.location.href = '#pricing'}
      />
    </div>
  );
}
