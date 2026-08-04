'use client';
import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Mail, CheckCircle2, MessageSquare, Zap } from 'lucide-react';
import { api } from '@/lib/api';
import { AnalyticsOverview } from '@/types';

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);

  useEffect(() => {
    api.getAnalyticsOverview().then(setData).catch(console.error);
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Outreach Performance & Analytics</h1>
        <p className="text-gray-400 text-sm mt-1">
          Real-time delivery statistics, Gmail API metrics, and reply rate tracking
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-gray-400 text-sm">
            <span>Total Sent (Gmail API)</span>
            <Mail className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-4xl font-extrabold text-white">{data?.total_sent ?? 0}</div>
          <p className="text-xs text-gray-400">Direct OAuth2 Mailbox Dispatch</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-gray-400 text-sm">
            <span>Replies Ingested</span>
            <MessageSquare className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-4xl font-extrabold text-emerald-400">{data?.total_replied ?? 0}</div>
          <p className="text-xs text-emerald-400/80">Tracked via Gmail History API</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-gray-400 text-sm">
            <span>Reply Rate</span>
            <TrendingUp className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-4xl font-extrabold text-cyan-400">{data?.reply_rate_percentage ?? 0}%</div>
          <p className="text-xs text-cyan-400/80">Targeting 15-25% response rate</p>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-indigo-400" />
          Free Tier Deliverability Rules
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="glass-card p-4 rounded-xl space-y-1">
            <span className="font-bold text-white">Daily Limits</span>
            <p className="text-gray-400">Standard Gmail: 500 emails/day</p>
            <p className="text-gray-400">Google Workspace: 2,000 emails/day</p>
          </div>
          <div className="glass-card p-4 rounded-xl space-y-1">
            <span className="font-bold text-white">Recommended Throttle</span>
            <p className="text-gray-400">20–30 emails/day per mailbox to maintain high sender reputation.</p>
          </div>
          <div className="glass-card p-4 rounded-xl space-y-1">
            <span className="font-bold text-white">Jitter & Scheduling</span>
            <p className="text-gray-400">Enforces 2–5 min random delay inside FastAPI worker loops.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
