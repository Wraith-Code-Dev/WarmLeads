'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CheckSquare, BarChart3, Settings, Zap, Sparkles, Tag } from 'lucide-react';

export const Sidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
    { label: 'Human Review', icon: CheckSquare, href: '/review' },
    { label: 'Prospects', icon: Users, href: '/prospects' },
    { label: 'Pricing Plans', icon: Tag, href: '/#pricing' },
    { label: 'Analytics', icon: BarChart3, href: '/analytics' },
    { label: 'Settings', icon: Settings, href: '/settings' },
  ];

  return (
    <aside className="w-64 h-screen glass-panel fixed left-0 top-0 z-30 flex flex-col justify-between p-4 border-r border-gray-800">
      <div>
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-gray-800/80">
          <div className="w-10 h-10 rounded-xl bg-violet-cyan-gradient flex items-center justify-center shadow-violet-glow shrink-0">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white tracking-tight">Outpilot</h1>
            <p className="text-[11px] text-cyan-glow font-mono font-medium">AI Outreach Agent</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-violet-accent/20 text-violet-300 border border-violet-500/40 shadow-violet-glow'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-obsidian-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-violet-accent' : 'text-gray-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="glass-card p-3.5 rounded-xl text-xs space-y-1.5 border border-gray-800">
        <div className="flex justify-between text-gray-400 text-[11px]">
          <span>Database Engine:</span>
          <span className="text-emerald-400 font-semibold font-mono">Neon DB</span>
        </div>
        <div className="flex justify-between text-gray-400 text-[11px]">
          <span>Delivery Modules:</span>
          <span className="text-cyan-glow font-semibold font-mono">Gmail / Resend</span>
        </div>
      </div>
    </aside>
  );
};
