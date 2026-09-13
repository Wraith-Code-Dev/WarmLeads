'use client';
import React, { useState } from 'react';
import { ExternalLink, DollarSign, Calendar, Sparkles, Copy, Check, Loader2 } from 'lucide-react';
import { Job } from '@/types';
import { api } from '@/lib/api';

export function JobCard({ job }: { job: Job }) {
  const [draft, setDraft] = useState<string | null>(null);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateDraft = async () => {
    if (draft) {
      setDraft(null);
      return;
    }
    setLoadingDraft(true);
    try {
      const res = await api.getJobDraft(job.source_url);
      setDraft(res.draft);
    } catch (err) {
      setDraft("Hi there, I noticed your job posting and would love to help you build this out. Let me know if you are open to a brief call. Best, Alex");
    } finally {
      setLoadingDraft(false);
    }
  };

  const handleCopy = () => {
    if (!draft) return;
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Color badges based on platform
  const getBadgeStyle = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('upwork')) return 'bg-emerald-100 text-emerald-900 border-black';
    if (p.includes('freelancer')) return 'bg-cyan-100 text-cyan-900 border-black';
    if (p.includes('reddit')) return 'bg-orange-100 text-orange-900 border-black';
    if (p.includes('indeed')) return 'bg-blue-100 text-blue-900 border-black';
    if (p.includes('linkedin')) return 'bg-indigo-100 text-indigo-900 border-black';
    if (p.includes('behance')) return 'bg-pink-100 text-pink-900 border-black';
    if (p.includes('guru')) return 'bg-amber-100 text-amber-900 border-black';
    return 'bg-violet-100 text-violet-900 border-black';
  };

  return (
    <div className="bg-white border-2 border-black rounded-xl p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all flex flex-col justify-between">
      <div>
        {/* Platform & Date Header */}
        <div className="flex justify-between items-center mb-3">
          <span className={`px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider border-2 rounded-md ${getBadgeStyle(job.platform)}`}>
            {job.platform}
          </span>
          {job.posted_at && (
            <span className="flex items-center text-[11px] font-bold text-gray-500">
              <Calendar className="w-3 h-3 mr-1" />
              {new Date(job.posted_at).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-black text-black mb-2 line-clamp-2 leading-tight">
          {job.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-600 font-medium mb-4 line-clamp-3 leading-relaxed">
          {job.description || "No description provided."}
        </p>

        {/* AI Proposal Drawer */}
        {draft && (
          <div className="mb-4 p-3.5 bg-violet-50 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-[11px] font-black text-violet-900 uppercase">
                <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                AI Proposal Draft
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-black bg-white border border-black rounded hover:bg-gray-100 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-black font-medium whitespace-pre-line leading-snug">
              {draft}
            </p>
          </div>
        )}
      </div>

      <div>
        {/* Footer: Budget & Actions */}
        <div className="flex items-center justify-between pt-3 border-t-2 border-gray-100 mt-2">
          <div className="flex items-center text-xs font-black text-black">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600 mr-0.5" />
            {job.budget_min || job.budget_max 
              ? `${job.budget_min ?? 0} - ${job.budget_max ?? '...'} ${job.currency || 'USD'}`
              : "Budget Negotiable"}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateDraft}
              disabled={loadingDraft}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-violet-100 hover:bg-violet-200 text-violet-900 text-xs font-black border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none transition-all"
            >
              {loadingDraft ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
              {draft ? 'Hide Draft' : 'Draft Proposal'}
            </button>

            <a 
              href={job.source_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-gray-50 text-black text-xs font-black border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none transition-all"
            >
              View
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
