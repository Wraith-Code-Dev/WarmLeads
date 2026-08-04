'use client';
import React, { useEffect, useState } from 'react';
import { Mail, Zap } from 'lucide-react';
import { api } from '@/lib/api';

export const Header = () => {
  const [gmailConnected, setGmailConnected] = useState<boolean>(false);

  useEffect(() => {
    api.getGmailStatus().then((res) => {
      setGmailConnected(res.connected);
    }).catch(() => {});
  }, []);

  return (
    <header className="h-16 ml-64 fixed top-0 right-0 left-0 z-20 flex items-center justify-between px-8 bg-white border-b-2 border-black">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-black text-black tracking-widest uppercase">
          WarmLeads Control
        </h2>
        <span className="text-[10px] px-2 py-1 rounded-md font-mono font-bold bg-violet-100 text-violet-700 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          Stateless SKIP LOCKED Engine
        </span>
      </div>

      <div className="flex items-center gap-5 text-xs">
        {/* Gmail Status */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${gmailConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
          <Mail className="w-3.5 h-3.5" />
          <span>{gmailConnected ? 'Gmail Connected' : 'Gmail Offline'}</span>
        </div>

        {/* Worker pulse */}
        <div className="flex items-center gap-2 border-l-2 border-black pl-5 h-8">
          <div className="w-2 h-2 rounded-full bg-emerald-400 border border-black animate-ping" />
          <span className="text-black font-mono text-[10px] font-bold tracking-widest uppercase">Worker Active</span>
        </div>
      </div>
    </header>
  );
};
