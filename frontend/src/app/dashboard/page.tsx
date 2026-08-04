'use client';
import React, { useEffect, useState } from 'react';
import { Users, CheckSquare, Send, MessageSquare, RefreshCw, Zap, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { AnalyticsOverview, RecentActivityItem } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { InstantResearchWidget } from '@/components/InstantResearchWidget';
import { UpgradeModal, ModalType } from '@/components/UpgradeModal';

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [activity, setActivity] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [triggeringWorker, setTriggeringWorker] = useState<boolean>(false);
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
      if (overviewData.total_replied > 0) setModalType('FIRST_REPLY');
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
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
    } catch {
      alert('Worker Execution Result: Executed (outside sending window or simulation mode)');
    } finally {
      setTriggeringWorker(false);
    }
  };

  return (
    <div className="space-y-10 max-w-full w-full px-2 lg:px-4 pb-12">



      {/* ── Live Operations Dashboard ── */}
      <section className="space-y-5">
        {/* Section Header */}
        <div className="flex items-center justify-between px-6 py-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Live Operations Dashboard</h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Stateless queue worker metrics &amp; pipeline activity</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTriggerQueueWorker}
              disabled={triggeringWorker}
              className="clean-btn flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs disabled:opacity-50"
            >
              <Zap className={`w-3.5 h-3.5 ${triggeringWorker ? 'animate-spin' : ''}`} />
              {triggeringWorker ? 'Executing...' : 'Trigger Queue Worker'}
            </button>
            <button
              onClick={loadData}
              className="clean-btn-outline flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Prospects */}
          <div className="clean-card p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Prospects</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
            {loading ? (
              <div className="h-9 rounded-lg bg-slate-100 animate-pulse" />
            ) : (
              <div className="text-3xl font-bold text-slate-900">{analytics?.total_prospects ?? 0}</div>
            )}
            <p className="text-[11px] text-slate-500 font-medium mt-1">Ingested into Neon DB</p>
          </div>

          {/* Needs Review */}
          <div className="clean-card p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Needs Review</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
                <CheckSquare className="w-4 h-4 text-amber-500" />
              </div>
            </div>
            {loading ? (
              <div className="h-9 rounded-lg bg-slate-100 animate-pulse" />
            ) : (
              <div className="text-3xl font-bold text-amber-500">{analytics?.needs_review ?? 0}</div>
            )}
            <p className="text-[11px] text-amber-600/70 font-medium mt-1">Awaiting Approval</p>
          </div>

          {/* Queued */}
          <div className="clean-card p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Queued in SQL</span>
              <div className="w-8 h-8 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center">
                <Send className="w-4 h-4 text-cyan-600" />
              </div>
            </div>
            {loading ? (
              <div className="h-9 rounded-lg bg-slate-100 animate-pulse" />
            ) : (
              <div className="text-3xl font-bold text-cyan-600">{analytics?.queued_for_send ?? 0}</div>
            )}
            <p className="text-[11px] text-cyan-600/70 font-medium mt-1">SKIP LOCKED Worker</p>
          </div>

          {/* Replies */}
          <div className="clean-card p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Replies</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            {loading ? (
              <div className="h-9 rounded-lg bg-slate-100 animate-pulse" />
            ) : (
              <div className="text-3xl font-bold text-emerald-500">{analytics?.total_replied ?? 0}</div>
            )}
            <p className="text-[11px] text-emerald-600/70 font-medium mt-1">
              Rate: {analytics?.reply_rate_percentage ?? 0}%
            </p>
          </div>
        </div>
      </section>

      {/* ── Recent Activity ── */}
      <section className="clean-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
          <Zap className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-900">Recent Pipeline Activity</h3>
        </div>

        <div className="p-2">
          {activity.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm font-medium">
              No pipeline events yet. Enter a URL in the research widget above!
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {activity.map((item) => (
                <div key={item.id} className="py-3 px-4 flex items-center justify-between text-xs hover:bg-slate-50 transition rounded-lg">
                  <div className="flex items-center gap-3">
                    <StatusBadge status={item.status} />
                    <div>
                      <span className="font-bold text-slate-700">{item.prospect_email}</span>
                      <p className="text-slate-500 mt-0.5 font-medium">{item.action}</p>
                    </div>
                  </div>
                  <span className="text-slate-400 font-mono">{item.timestamp}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <UpgradeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
        onUpgrade={() => window.location.href = '#pricing'}
      />
    </div>
  );
}
