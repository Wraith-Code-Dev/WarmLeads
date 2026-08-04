'use client';
import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Mail, MessageSquare, Zap } from 'lucide-react';
import { api } from '@/lib/api';
import { AnalyticsOverview } from '@/types';

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);

  useEffect(() => {
    api.getAnalyticsOverview().then(setData).catch(console.error);
  }, []);

  return (
    <div className="space-y-8 max-w-full w-full px-2 lg:px-4">
      <div>
        <h1 className="text-3xl font-black text-black tracking-tight">Outreach Performance & Analytics</h1>
        <p className="text-black text-sm mt-1 font-bold">
          Real-time delivery statistics, Gmail API metrics, and reply rate tracking
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="clean-card p-6 space-y-2">
          <div className="flex items-center justify-between text-black text-sm font-black uppercase tracking-wider">
            <span>Total Sent (Gmail API)</span>
            <div className="w-8 h-8 rounded-lg bg-violet-200 flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Mail className="w-4 h-4 text-violet-800" />
            </div>
          </div>
          <div className="text-5xl font-black text-black pt-2">{data?.total_sent ?? 0}</div>
          <p className="text-xs text-black font-bold">Direct OAuth2 Mailbox Dispatch</p>
        </div>

        <div className="clean-card p-6 space-y-2">
          <div className="flex items-center justify-between text-black text-sm font-black uppercase tracking-wider">
            <span>Replies Ingested</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-200 flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <MessageSquare className="w-4 h-4 text-emerald-800" />
            </div>
          </div>
          <div className="text-5xl font-black text-black pt-2">{data?.total_replied ?? 0}</div>
          <p className="text-xs text-black font-bold">Tracked via Gmail History API</p>
        </div>

        <div className="clean-card p-6 space-y-2">
          <div className="flex items-center justify-between text-black text-sm font-black uppercase tracking-wider">
            <span>Reply Rate</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-200 flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <TrendingUp className="w-4 h-4 text-cyan-800" />
            </div>
          </div>
          <div className="text-5xl font-black text-black pt-2">{data?.reply_rate_percentage ?? 0}%</div>
          <p className="text-xs text-black font-bold">Targeting 15-25% response rate</p>
        </div>
      </div>

      <div className="clean-card p-6 space-y-5">
        <h3 className="text-lg font-black text-black flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-200 flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Zap className="w-4 h-4 text-violet-800" />
          </div>
          Free Tier Deliverability Rules
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-gray-100 p-5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] space-y-1.5">
            <span className="font-black text-black text-sm uppercase tracking-wider block mb-2">Daily Limits</span>
            <p className="text-black font-bold">Standard Gmail: 500 emails/day</p>
            <p className="text-black font-bold">Google Workspace: 2,000 emails/day</p>
          </div>
          <div className="bg-gray-100 p-5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] space-y-1.5">
            <span className="font-black text-black text-sm uppercase tracking-wider block mb-2">Recommended Throttle</span>
            <p className="text-black font-bold">20–30 emails/day per mailbox to maintain high sender reputation.</p>
          </div>
          <div className="bg-gray-100 p-5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] space-y-1.5">
            <span className="font-black text-black text-sm uppercase tracking-wider block mb-2">Jitter & Scheduling</span>
            <p className="text-black font-bold">Enforces 2–5 min random delay inside FastAPI worker loops.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
