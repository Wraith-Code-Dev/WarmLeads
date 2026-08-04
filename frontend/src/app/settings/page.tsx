'use client';
import React, { useEffect, useState } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';
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
        <h1 className="text-3xl font-black text-black tracking-tight">System Settings & Connections</h1>
        <p className="text-black text-sm mt-1 font-bold">
          Manage Google Cloud Gmail OAuth2 authorization and worker limits
        </p>
      </div>

      {/* Gmail OAuth Card */}
      <div className="clean-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-violet-200 text-violet-800 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-black text-lg">Gmail API OAuth2 Connection</h3>
              <p className="text-xs text-black font-bold mt-0.5">Direct zero-cost email dispatch via Google Cloud OAuth2</p>
            </div>
          </div>

          {gmailStatus?.connected ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-emerald-800 bg-emerald-200 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-black">
              <CheckCircle2 className="w-4 h-4" /> Connected ({gmailStatus.email})
            </span>
          ) : (
            <button
              onClick={handleConnectGmail}
              className="clean-btn px-4 py-2.5 rounded-xl text-xs"
            >
              Connect Gmail OAuth
            </button>
          )}
        </div>

        <div className="mt-5 text-xs text-black bg-gray-100 border-2 border-black p-4 rounded-xl space-y-2 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <p><span className="font-black text-black">OAuth Scopes:</span> <code className="bg-white px-1.5 py-0.5 rounded border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">gmail.send</code>, <code className="bg-white px-1.5 py-0.5 rounded border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">gmail.readonly</code></p>
          <p><span className="font-black text-black">Mode:</span> {gmailStatus?.connected ? 'Live Google OAuth Dispatch' : 'Simulated Delivery Engine (Default for local testing)'}</p>
        </div>
      </div>

    </div>
  );
}
