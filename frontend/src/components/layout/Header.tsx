'use client';
import React, { useEffect, useState } from 'react';
import { Mail, Database, Zap, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';

export const Header = () => {
  const [gmailConnected, setGmailConnected] = useState<boolean>(false);

  useEffect(() => {
    api.getGmailStatus().then((res) => {
      setGmailConnected(res.connected);
    }).catch(() => {});
  }, []);

  return (
    <header className="h-16 ml-64 glass-panel fixed top-0 right-0 left-0 z-20 flex items-center justify-between px-6 border-b border-gray-800">
      <div className="flex items-center gap-3">
        <h2 className="text-xs font-extrabold text-white tracking-wide uppercase">Outpilot System Control</h2>
        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-violet-accent/20 text-violet-300 border border-violet-500/30 font-mono font-semibold">
          Stateless SKIP LOCKED Engine
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
          <span className="text-gray-400 font-mono text-[11px]">Worker Active</span>
        </div>
      </div>
    </header>
  );
};
