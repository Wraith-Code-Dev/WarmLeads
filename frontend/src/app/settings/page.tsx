'use client';
import React, { useEffect, useState } from 'react';
import { Mail, Database, Shield, Zap, CheckCircle2, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';

export default function SettingsPage() {
  const [gmailStatus, setGmailStatus] = useState<any>(null);

  useEffect(() => {
    api.getGmailStatus().then(setGmailStatus).catch(console.error);
  }, []);

  const handleConnectGmail = () => {
    window.location.href = 'http://localhost:8000/api/v1/auth/gmail/connect';
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-white">System Settings & Connections</h1>
        <p className="text-gray-400 text-sm mt-1">
          Manage Neon DB persistence, Google Cloud Gmail OAuth2 authorization, and worker limits
        </p>
      </div>

      {/* Gmail OAuth Card */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
              <Mail className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Gmail API OAuth2 Connection</h3>
              <p className="text-xs text-gray-400">Direct zero-cost email dispatch via Google Cloud OAuth2</p>
            </div>
          </div>

          {gmailStatus?.connected ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Connected ({gmailStatus.email})
            </span>
          ) : (
            <button
              onClick={handleConnectGmail}
              className="px-4 py-2 rounded-xl bg-brand-gradient hover:opacity-90 text-white font-semibold text-xs shadow-glow transition"
            >
              Connect Gmail OAuth
            </button>
          )}
        </div>

        <div className="text-xs text-gray-400 bg-gray-800/40 p-4 rounded-xl space-y-1">
          <p><span className="font-semibold text-gray-200">OAuth Scopes:</span> <code>gmail.send</code>, <code>gmail.readonly</code></p>
          <p><span className="font-semibold text-gray-200">Mode:</span> {gmailStatus?.connected ? 'Live Google OAuth Dispatch' : 'Simulated Delivery Engine (Default for local testing)'}</p>
        </div>
      </div>

      {/* Neon DB Postgres Card */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Database className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Neon DB Serverless Postgres Queue</h3>
            <p className="text-xs text-gray-400">SQL Queue Worker utilizing <code>FOR UPDATE SKIP LOCKED</code></p>
          </div>
        </div>

        <div className="text-xs text-gray-300 space-y-2">
          <p>
            Replaces Redis and BullMQ using native PostgreSQL ACID locking transactions:
          </p>
          <pre className="p-3 bg-gray-900 rounded-xl text-cyan-300 font-mono text-[11px] overflow-x-auto">
{`SELECT id, prospect_email, body 
FROM outreach_queue 
WHERE status = 'QUEUED_FOR_SEND' 
  AND scheduled_at <= NOW() 
LIMIT 1 
FOR UPDATE SKIP LOCKED;`}
          </pre>
        </div>
      </div>
    </div>
  );
}
