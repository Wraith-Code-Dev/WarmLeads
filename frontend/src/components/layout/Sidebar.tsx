'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CheckSquare, BarChart3, Settings, Zap } from 'lucide-react';

export const Sidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Human Review', icon: CheckSquare, href: '/review' },
    { label: 'Prospects', icon: Users, href: '/prospects' },
    { label: 'Analytics', icon: BarChart3, href: '/analytics' },
    { label: 'Settings', icon: Settings, href: '/settings' },
  ];

  return (
    <aside className="w-64 fixed left-0 top-0 bottom-0 z-30 flex flex-col justify-between bg-white border-r-2 border-black">
      <div>
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-5 py-6 mb-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-violet-600 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-black tracking-tight leading-none">WarmLeads</h1>
            <p className="text-[10px] font-black mt-1 text-violet-600 uppercase tracking-widest">AI OUTREACH</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-3 space-y-2 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${
                  isActive
                    ? 'bg-violet-100 text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : 'text-gray-500 border-transparent hover:text-black hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-violet-600' : 'text-gray-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4">
        <div className="px-3 py-2 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-[10px] font-bold font-mono text-black flex items-center gap-2">
          <span className="w-2 h-2 rounded-full border border-black bg-emerald-400"></span>
          SKIP LOCKED Active
        </div>
      </div>
    </aside>
  );
};
