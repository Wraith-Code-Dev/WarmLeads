'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Mail, Database, Zap, Sparkles, LogOut, UserCheck, LogIn } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export const Header = () => {
  const [gmailConnected, setGmailConnected] = useState<boolean>(false);
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    api.getGmailStatus().then((res) => {
      setGmailConnected(res.connected);
    }).catch(() => {});
  }, []);

  return (
    <header className="h-16 ml-64 glass-panel fixed top-0 right-0 left-0 z-20 flex items-center justify-between px-6 border-b border-gray-800">
      <div className="flex items-center gap-3">
        <h2 className="text-xs font-extrabold text-white tracking-wide uppercase">WarmLeads Control Center</h2>
        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-violet-accent/20 text-violet-300 border border-violet-500/30 font-mono font-semibold">
          Stateless SKIP LOCKED Engine
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
          <span className="text-gray-400 font-mono text-[11px]">Worker Active</span>
        </div>

        {isAuthenticated && user ? (
          <div className="flex items-center gap-3 border-l border-gray-800 pl-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-obsidian-800 border border-gray-700/60 text-gray-200 text-xs font-mono">
              <UserCheck className="w-3.5 h-3.5 text-cyan-glow" />
              {user.email}
            </span>
            
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-obsidian-800 hover:bg-red-500/20 text-gray-300 hover:text-red-400 text-xs font-bold border border-gray-700/60 hover:border-red-500/30 transition"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="border-l border-gray-800 pl-4">
            <Link
              href="/signin"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-cyan-gradient text-white text-xs font-extrabold shadow-violet-glow hover:opacity-95 transition"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Admin Sign In</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
