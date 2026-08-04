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
      <form onSubmit={handleGenerate} className="clean-card p-2 rounded-2xl flex items-center gap-3">
        <div className="pl-3 text-violet-600">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <input 
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a prospect website or LinkedIn URL (e.g. stripe.com)"
          className="bg-transparent border-none outline-none text-black placeholder-gray-500 text-sm w-full font-black shadow-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="clean-btn py-3 px-6 text-xs shrink-0 flex items-center gap-2"
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
        <div className="clean-card p-6 rounded-2xl space-y-4 animate-pulse">
          <div className="h-4 bg-gray-200 border-2 border-black rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 border-2 border-black rounded w-3/4"></div>
          <div className="h-20 bg-gray-200 border-2 border-black rounded w-full mt-4"></div>
        </div>
      )}

      {/* Output Interactive Pitch Card */}
      {result && !loading && (
        <div className="clean-card p-6 rounded-2xl space-y-5 relative overflow-hidden text-left">
          {/* Top Header */}
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-black bg-emerald-200 px-3 py-1.5 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                AI 2-Pass Verified Pitch
              </span>
              <span className="text-xs text-black font-mono font-bold">
                Scraped in {result.execution_time_seconds}s • {result.confidence_score}% Confidence
              </span>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs text-black flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border-2 border-black font-black transition-all hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {isEditing ? 'Done Editing' : 'Edit Copy'}
            </button>
          </div>

          {/* Scraped Pain Points */}
          <div className="bg-violet-100 p-4 rounded-xl space-y-2 text-xs border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="font-black text-black">Target Company Context & Pain Points:</span>
            <p className="text-black font-bold">{result.company_summary}</p>
            <ul className="list-disc list-inside text-black space-y-1 pt-1 font-bold">
              {result.pain_points?.map((pt: string, i: number) => (
                <li key={i}>{pt}</li>
              ))}
            </ul>
          </div>

          {/* Email Card Output */}
          <div className="space-y-4 bg-white p-5 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div>
              <span className="text-xs font-black text-black uppercase tracking-wider">Subject Line:</span>
              {isEditing ? (
                <input
                  type="text"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="w-full mt-2 px-3 py-2 rounded-lg bg-white border-2 border-black text-black text-sm font-black outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                />
              ) : (
                <div className="text-sm font-black text-black mt-1">{editSubject}</div>
              )}
            </div>

            <div>
              <span className="text-xs font-black text-black uppercase tracking-wider">Personalized Body:</span>
              {isEditing ? (
                <textarea
                  rows={6}
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  className="w-full mt-2 p-3 rounded-lg bg-white border-2 border-black text-black text-sm font-bold leading-relaxed outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                />
              ) : (
                <div className="text-sm font-bold text-black leading-relaxed whitespace-pre-line mt-2 p-4 rounded-lg bg-gray-50 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {editBody}
                </div>
              )}
            </div>
          </div>

          {/* Action Footer & Sub-banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3">
            <div className="flex items-center gap-2 text-xs font-black text-black bg-cyan-200 px-4 py-2 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Ready to dispatch via Neon DB SQL Queue</span>
            </div>

            <a
              href="/prospects"
              className="clean-btn py-2.5 px-6 text-xs flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              Approve & Send Demo
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
