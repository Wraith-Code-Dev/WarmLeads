'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminSignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const res = await login(email, password);
    if (res.ok) {
      router.push('/dashboard');
    } else {
      setError(res.error || 'Invalid Admin Credentials');
      setIsSubmitting(false);
    }
  };

  const handleAdminQuickLogin = async () => {
    setEmail('admin@warmleads.ai');
    setPassword('admin123');
    setIsSubmitting(true);
    setError('');

    const res = await login('admin@warmleads.ai', 'admin123');
    if (res.ok) {
      router.push('/dashboard');
    } else {
      setError(res.error || 'Failed quick login');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-cyan-gradient flex items-center justify-center shadow-violet-glow shrink-0">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-black text-white tracking-tight">WarmLeads</span>
              <span className="block text-xs font-mono font-medium text-cyan-glow">Admin Security Portal</span>
            </div>
          </Link>

          <p className="text-xs text-gray-400">
            Authenticate to access the WarmLeads cold email operations dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel p-8 rounded-3xl border border-gray-800 space-y-6 shadow-glass relative">
          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-300">Admin Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@warmleads.ai"
                  className="w-full pl-10 pr-4 py-3 bg-obsidian-900/90 border border-gray-700/60 rounded-xl text-xs font-medium text-white placeholder-gray-500 focus:outline-none focus:border-violet-accent transition"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-obsidian-900/90 border border-gray-700/60 rounded-xl text-xs font-medium text-white placeholder-gray-500 focus:outline-none focus:border-violet-accent transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-violet-cyan-gradient text-white text-xs font-extrabold shadow-violet-glow hover:opacity-95 transition flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Authenticating Admin...' : (
                <>
                  Sign In as Admin
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Button */}
          <div className="pt-4 border-t border-gray-800 text-center space-y-3">
            <button
              type="button"
              onClick={handleAdminQuickLogin}
              className="w-full py-2.5 px-3 rounded-xl bg-violet-accent/20 hover:bg-violet-accent/30 text-violet-300 border border-violet-500/40 text-xs font-bold transition flex items-center justify-center gap-2 shadow-violet-glow"
            >
              <Sparkles className="w-4 h-4 text-cyan-glow animate-pulse" />
              1-Click Admin Login (admin@warmleads.ai)
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admin Token Persistence Enabled</span>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center">
          <Link href="/" className="text-xs text-gray-400 hover:text-white transition">
            ← Return to Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
}
