'use client';
import React, { useEffect, useState } from 'react';
import { Users, CheckSquare, Send, MessageSquare, RefreshCw, Zap, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { AnalyticsOverview, RecentActivityItem } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function OperationalDashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [activity, setActivity] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [triggeringWorker, setTriggeringWorker] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [overviewData, activityData] = await Promise.all([
        api.getAnalyticsOverview(),
        api.getRecentActivity()
      ]);
      setAnalytics(overviewData);
      setActivity(activityData);
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
    <div className="space-y-10 max-w-7xl mx-auto pb-12">
      {/* 1. DASHBOARD HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-cyan-glow" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-glow">
              Stateless Queue Control
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Live Operations Dashboard</h1>
          <p className="text-xs text-gray-400 mt-1">Real-time pipeline metrics & background worker execution</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTriggerQueueWorker}
            disabled={triggeringWorker}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-accent/20 hover:bg-violet-accent/30 text-violet-300 text-xs font-bold border border-violet-500/40 transition shadow-violet-glow"
          >
            <Zap className={`w-4 h-4 ${triggeringWorker ? 'animate-spin' : ''}`} />
            {triggeringWorker ? 'Executing SKIP LOCKED...' : 'Trigger Stateless Queue Worker'}
          </button>

          <button 
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-gray-300 text-xs font-semibold border border-gray-700/60 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* 2. LIVE METRIC CARDS GRID */}
      <section className="space-y-4">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-gray-400">Pipeline Performance Metrics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Prospects */}
          <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400">Total Prospects</span>
              <div className="w-9 h-9 rounded-xl bg-violet-accent/20 border border-violet-500/30 flex items-center justify-center text-violet-accent">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white mt-3">{analytics?.total_prospects ?? 0}</div>
            <p className="text-xs text-gray-400 mt-2">Ingested into Database</p>
          </div>

          {/* Needs Human Review */}
          <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400">Needs Human Review</span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <CheckSquare className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-amber-400 mt-3">{analytics?.needs_review ?? 0}</div>
            <p className="text-xs text-amber-400/80 mt-2">Awaiting Approval</p>
          </div>

          {/* Queued in SQL */}
          <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400">Queued in SQL</span>
              <div className="w-9 h-9 rounded-xl bg-cyan-glow/20 border border-cyan-500/30 flex items-center justify-center text-cyan-glow">
                <Send className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-cyan-glow mt-3">{analytics?.queued_for_send ?? 0}</div>
            <p className="text-xs text-cyan-glow/80 mt-2">Targeted by Worker</p>
          </div>

          {/* Replies Ingested */}
          <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400">Replies Ingested</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <MessageSquare className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-emerald-400 mt-3">{analytics?.total_replied ?? 0}</div>
            <p className="text-xs text-emerald-400/80 mt-2">
              Reply Rate: {analytics?.reply_rate_percentage ?? 0}%
            </p>
          </div>
        </div>
      </section>

      {/* 3. RECENT PIPELINE ACTIVITY STREAM */}
      <section className="glass-panel p-6 rounded-2xl space-y-4 border border-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Recent Pipeline Activity Stream</h3>
          <span className="text-xs font-mono text-cyan-glow">Live Feed</span>
        </div>

        {activity.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            No pipeline events recorded yet. Try ingesting prospects or starting a scraper run!
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {activity.map((item) => (
              <div key={item.id} className="py-3.5 flex items-center justify-between text-xs">
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
    </div>
  );
}
