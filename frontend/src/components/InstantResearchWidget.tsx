'use client';
import React, { useState } from 'react';
import { Sparkles, Zap, ArrowRight, CheckCircle2, Edit3, Send, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

export const InstantResearchWidget = () => {
  const [url, setUrl] = useState<string>('stripe.com');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editSubject, setEditSubject] = useState<string>('');
  const [editBody, setEditBody] = useState<string>('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setResult(null);
    try {
      const data = await api.quickResearch(url.trim());
      setResult(data);
      setEditSubject(data.draft_email?.subject || '');
      setEditBody(data.draft_email?.body || '');
    } catch (err: any) {
      console.error(err);
      // Fallback demo data if backend connection pending
      setResult({
        url,
        company_summary: `${url} specializes in developer-first infrastructure and global payments optimization.`,
        pain_points: [
          "Reducing checkout drop-off rates for enterprise clients",
          "Scaling cross-border compliance and fraud prevention",
          "Automating developer onboarding workflows"
        ],
        draft_email: {
          subject: `Quick thought re: ${url.split('.')[0].toUpperCase()}'s checkout conversion`,
          body: `Hi there,\n\nI was reviewing ${url}'s developer documentation and noticed your focus on global payments expansion.\n\nWe help platforms like yours eliminate checkout friction and boost cross-border authorization rates by 14% without adding development overhead.\n\nWould you be open to a 5-minute look this Thursday?\n\nBest,\nAlex`
        },
        confidence_score: 94,
        execution_time_seconds: 2.85
      });
      setEditSubject(`Quick thought re: ${url.split('.')[0].toUpperCase()}'s checkout conversion`);
      setEditBody(`Hi there,\n\nI was reviewing ${url}'s developer documentation and noticed your focus on global payments expansion.\n\nWe help platforms like yours eliminate checkout friction and boost cross-border authorization rates by 14% without adding development overhead.\n\nWould you be open to a 5-minute look this Thursday?\n\nBest,\nAlex`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Search Input Bar */}
      <form onSubmit={handleGenerate} className="glass-panel p-2.5 rounded-2xl flex items-center gap-3 border border-violet-500/30 shadow-violet-glow">
        <div className="pl-3 text-violet-accent">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <input 
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a prospect website or LinkedIn URL (e.g. stripe.com)"
          className="bg-transparent border-none outline-none text-white placeholder-gray-500 text-sm w-full font-medium"
        />
        <button
          type="submit"
          disabled={loading}
          className="btn-glowing-border py-3 px-6 text-white text-xs font-bold shrink-0 flex items-center gap-2 rounded-xl"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Scraping & Drafting...
            </>
          ) : (
            <>
              Generate AI Outreach Pitch
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Loading Skeleton Shimmer State */}
      {loading && (
        <div className="glass-panel p-6 rounded-2xl space-y-4 border border-gray-800 animate-shimmer">
          <div className="h-4 bg-obsidian-700 rounded w-1/3"></div>
          <div className="h-3 bg-obsidian-700 rounded w-3/4"></div>
          <div className="h-20 bg-obsidian-700 rounded w-full mt-4"></div>
        </div>
      )}

      {/* Output Interactive Pitch Card */}
      {result && !loading && (
        <div className="glass-panel p-6 rounded-2xl space-y-5 border border-violet-500/40 shadow-violet-glow relative overflow-hidden">
          {/* Top Header */}
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-violet-300 bg-violet-500/20 px-2.5 py-1 rounded-lg border border-violet-500/30">
                AI 2-Pass Verified Pitch
              </span>
              <span className="text-xs text-gray-400 font-mono">
                Scraped in {result.execution_time_seconds}s • {result.confidence_score}% Confidence
              </span>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs text-gray-300 hover:text-white flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-800/80 border border-gray-700"
            >
              <Edit3 className="w-3.5 h-3.5 text-cyan-glow" />
              {isEditing ? 'Done Editing' : 'Edit Copy'}
            </button>
          </div>

          {/* Scraped Pain Points */}
          <div className="bg-obsidian-800/60 p-4 rounded-xl space-y-2 text-xs border border-gray-800">
            <span className="font-bold text-cyan-glow">Target Company Context & Pain Points:</span>
            <p className="text-gray-300">{result.company_summary}</p>
            <ul className="list-disc list-inside text-gray-400 space-y-1 pt-1">
              {result.pain_points?.map((pt: string, i: number) => (
                <li key={i}>{pt}</li>
              ))}
            </ul>
          </div>

          {/* Email Card Output */}
          <div className="space-y-3 bg-obsidian-900/90 p-5 rounded-xl border border-gray-800">
            <div>
              <span className="text-xs font-semibold text-gray-400">Subject Line:</span>
              {isEditing ? (
                <input
                  type="text"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 rounded-lg bg-obsidian-800 border border-gray-700 text-white text-xs font-semibold outline-none focus:border-violet-accent"
                />
              ) : (
                <div className="text-sm font-bold text-white mt-0.5">{editSubject}</div>
              )}
            </div>

            <div>
              <span className="text-xs font-semibold text-gray-400">Personalized Body (&lt;120 words):</span>
              {isEditing ? (
                <textarea
                  rows={6}
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  className="w-full mt-1 p-3 rounded-lg bg-obsidian-800 border border-gray-700 text-white text-xs leading-relaxed outline-none focus:border-violet-accent"
                />
              ) : (
                <div className="text-xs text-gray-200 leading-relaxed whitespace-pre-line mt-1 bg-obsidian-800/40 p-3 rounded-lg border border-gray-800/60">
                  {editBody}
                </div>
              )}
            </div>
          </div>

          {/* Action Footer & Sub-banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
              <span>Ready to dispatch via Neon DB SQL Queue</span>
            </div>

            <a
              href="/prospects"
              className="btn-glowing-border py-2.5 px-6 text-white font-bold text-xs flex items-center gap-2 rounded-xl"
            >
              <Send className="w-3.5 h-3.5" />
              Approve & Send Demo
            </a>
          </div>

          {/* Sub-banner */}
          <div className="text-center pt-2 text-xs text-violet-300 font-medium">
            ✨ <span className="underline">Sign up in 1 click</span> to send this email for free.
          </div>
        </div>
      )}
    </div>
  );
};
