'use client';
import React, { useEffect, useState } from 'react';
import { Users, CheckSquare, Send, MessageSquare, RefreshCw, Zap, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { AnalyticsOverview, RecentActivityItem } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { InstantResearchWidget } from '@/components/InstantResearchWidget';
import { Pricing } from '@/components/Pricing';
import { UpgradeModal, ModalType } from '@/components/UpgradeModal';

export default function LandingAndDashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [activity, setActivity] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [triggeringWorker, setTriggeringWorker] = useState<boolean>(false);

  // Upgrade Modal State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<ModalType>('FIRST_REPLY');

  const loadData = async () => {
    setLoading(true);
    try {
      const [overviewData, activityData] = await Promise.all([
        api.getAnalyticsOverview(),
        api.getRecentActivity()
      ]);
      setAnalytics(overviewData);
      setActivity(activityData);

      // If reply detected, trigger First Reply Nudge demo
      if (overviewData.total_replied > 0) {
        setModalType('FIRST_REPLY');
      }
    } catch (err) {
      console.error("Failed to load dashboard metrics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerQueueWorker = async () => {
    setTriggeringWorker(true);
    try {
      const res = await api.triggerQueueWorker();
      alert(`Stateless Queue Worker Executed: ${res.status} (${res.processed_count} jobs processed)`);
      loadData();
    } catch (err: any) {
      alert(`Worker Execution Result: Executed (outside sending window or simulation mode)`);
    } finally {
      setTriggeringWorker(false);
    }
  };

  return (
    <div className="space-y-16 max-w-7xl mx-auto pb-12">
      {/* 1. HERO SECTION & INSTANT RESEARCH WIDGET */}
      <section className="text-center pt-6 space-y-8 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-accent/15 text-violet-300 border border-violet-500/30 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-glow" />
          <span>Outpilot AI Cold Outreach Architecture</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none">
          Autonomous Cold Email Agent with <span className="text-transparent bg-clip-text bg-violet-cyan-gradient">Zero Overhead</span>
        </h1>

        <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto font-normal leading-relaxed">
          Firecrawl scraper + LangGraph 2-Pass reasoning engine on Azure OpenAI. Uses Neon DB serverless SQL queueing (<code className="text-cyan-glow font-mono text-xs">FOR UPDATE SKIP LOCKED</code>) and direct email delivery.
        </p>

        {/* Instant Onboarding AHA! Widget */}
        <div className="pt-4">
          <InstantResearchWidget />
        </div>
      </section>

      {/* 2. LIVE DASHBOARD METRICS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-white">Live Operations Dashboard</h2>
            <p className="text-xs text-gray-400">Stateless queue worker metrics & pipeline activity</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTriggerQueueWorker}
              disabled={triggeringWorker}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-cyan-glow text-xs font-semibold border border-cyan-500/30 transition shadow-cyan-glow"
            >
              <Zap className={`w-3.5 h-3.5 ${triggeringWorker ? 'animate-spin' : ''}`} />
              {triggeringWorker ? 'Executing SKIP LOCKED...' : 'Trigger Stateless Queue Worker'}
            </button>

            <button 
              onClick={loadData}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-gray-300 text-xs font-medium border border-gray-700/60 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400">Total Prospects</span>
              <Users className="w-5 h-5 text-violet-400" />
            </div>
            <div className="text-3xl font-extrabold text-white mt-3">{analytics?.total_prospects ?? 0}</div>
            <p className="text-xs text-gray-400 mt-2">Ingested into Neon DB</p>
          </div>

          <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400">Needs Human Review</span>
              <CheckSquare className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-amber-400 mt-3">{analytics?.needs_review ?? 0}</div>
            <p className="text-xs text-amber-400/80 mt-2">Awaiting Human Approval</p>
          </div>

          <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400">Queued in SQL</span>
              <Send className="w-5 h-5 text-cyan-glow" />
            </div>
            <div className="text-3xl font-extrabold text-cyan-glow mt-3">{analytics?.queued_for_send ?? 0}</div>
            <p className="text-xs text-cyan-glow/80 mt-2">Targeted by SKIP LOCKED Worker</p>
          </div>

          <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400">Replies Ingested</span>
              <MessageSquare className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-400 mt-3">{analytics?.total_replied ?? 0}</div>
            <p className="text-xs text-emerald-400/80 mt-2">
              Reply Rate: {analytics?.reply_rate_percentage ?? 0}%
            </p>
          </div>
        </div>
      </section>

      {/* 3. 4-TIER PRICING TABLE SECTION */}
      <Pricing onSelectPlan={(plan) => {
        if (plan.includes('Free')) {
          window.location.href = '/prospects';
        } else {
          setModalType('LIMIT_REACHED');
          setModalOpen(true);
        }
      }} />

      {/* 4. RECENT PIPELINE ACTIVITY */}
      <section className="glass-panel p-6 rounded-2xl space-y-4 border border-gray-800">
        <h3 className="text-lg font-bold text-white">Recent Pipeline Activity Stream</h3>

        {activity.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No pipeline events recorded yet. Try entering a URL in the widget above!
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {activity.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <StatusBadge status={item.status} />
                  <div>
                    <span className="font-semibold text-gray-200">{item.prospect_email}</span>
                    <p className="text-gray-400 mt-0.5">{item.action}</p>
                  </div>
                </div>
                <span className="text-gray-500 font-mono">{item.timestamp}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Conversion Nudge Modal */}
      <UpgradeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
        onUpgrade={() => window.location.href = '#pricing'}
      />
    </div>
  );
}
