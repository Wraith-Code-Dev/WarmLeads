'use client';
import React, { useEffect, useState } from 'react';
import { CheckCircle2, Edit3, Send, Sparkles, AlertCircle, Building2, RefreshCw, Trash2, Calendar } from 'lucide-react';
import { api } from '@/lib/api';
import { ReviewQueueItem } from '@/types';
import { UpgradeModal, ModalType } from '@/components/UpgradeModal';

export default function ReviewQueuePage() {
  const [items, setItems] = useState<ReviewQueueItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeItem, setActiveItem] = useState<ReviewQueueItem | null>(null);

  // Edit fields
  const [editSubject, setEditSubject] = useState<string>('');
  const [editBody, setEditBody] = useState<string>('');
  const [scheduledAt, setScheduledAt] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [approving, setApproving] = useState<boolean>(false);
  const [regenerating, setRegenerating] = useState<boolean>(false);

  // Upgrade Nudge Modal
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<ModalType>('LIMIT_REACHED');

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const data = await api.getReviewQueue();
      setItems(data);
      if (data.length > 0 && !activeItem) {
        selectItem(data[0]);
      }
    } catch (err) {
      console.error("Failed to load review queue", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const selectItem = (item: ReviewQueueItem) => {
    setActiveItem(item);
    setEditSubject(item.subject);
    setEditBody(item.body);
  };

  const handleSaveDraft = async () => {
    if (!activeItem) return;
    setSaving(true);
    try {
      const updated = await api.updateReviewItem(activeItem.prospect_id, editSubject, editBody);
      setActiveItem(updated);
      setItems(items.map(i => i.prospect_id === updated.prospect_id ? updated : i));
    } catch (err) {
      alert("Failed to update draft.");
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    if (!activeItem) return;
    setApproving(true);
    try {
      await api.approveOutreach(activeItem.prospect_id);
      const remaining = items.filter(i => i.prospect_id !== activeItem.prospect_id);
      setItems(remaining);
      if (remaining.length > 0) {
        selectItem(remaining[0]);
      } else {
        setActiveItem(null);
      }
    } catch (err) {
      // If limit reached, show Upgrade Modal
      setModalType('LIMIT_REACHED');
      setModalOpen(true);
    } finally {
      setApproving(false);
    }
  };

  const handleRegenerate = async () => {
    if (!activeItem) return;
    setRegenerating(true);
    try {
      const quick = await api.quickResearch(
        activeItem.website || activeItem.company || "target.com",
        activeItem.first_name,
        activeItem.company,
        activeItem.title
      );
      if (quick.draft_email) {
        setEditSubject(quick.draft_email.subject);
        setEditBody(quick.draft_email.body);
        await api.updateReviewItem(activeItem.prospect_id, quick.draft_email.subject, quick.draft_email.body);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRegenerating(false);
    }
  };

  const handleReject = () => {
    if (!activeItem) return;
    const remaining = items.filter(i => i.prospect_id !== activeItem.prospect_id);
    setItems(remaining);
    if (remaining.length > 0) {
      selectItem(remaining[0]);
    } else {
      setActiveItem(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Human-in-the-Loop Review Queue</h1>
          <p className="text-gray-400 text-sm mt-1">
            Review side-by-side scraped context & edit AI outreach copy before dispatching to Neon DB Queue
          </p>
        </div>

        <button
          onClick={fetchQueue}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-gray-200 text-sm font-medium border border-gray-700/60"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Queue
        </button>
      </div>

      {loading ? (
        <div className="glass-panel p-12 text-center text-gray-500 rounded-2xl">
          Loading pending drafts...
        </div>
      ) : items.length === 0 ? (
        <div className="glass-panel p-16 text-center space-y-3 rounded-2xl border border-gray-800">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-xl font-bold text-white">Queue Clear!</h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            No pending drafts awaiting review. Ingest more prospects to trigger Firecrawl & AI copy generation.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Pending List (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
              Pending Human Review ({items.length})
            </div>

            <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
              {items.map((item) => {
                const isSelected = activeItem?.prospect_id === item.prospect_id;
                return (
                  <div
                    key={item.prospect_id}
                    onClick={() => selectItem(item)}
                    className={`p-4 rounded-xl cursor-pointer transition border ${
                      isSelected
                        ? 'bg-violet-accent/20 border-violet-accent/60 shadow-violet-glow'
                        : 'glass-card border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">{item.first_name || 'Prospect'}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                        {item.confidence_score}% Match
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{item.email}</p>
                    <p className="text-xs text-gray-300 font-semibold mt-2 line-clamp-1">
                      Subject: {item.subject}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Side-by-Side Review & Editor (8 cols) */}
          {activeItem && (
            <div className="lg:col-span-8 space-y-6">
              {/* Top Context Box */}
              <div className="glass-panel p-5 rounded-2xl space-y-3 border border-gray-800">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-cyan-gradient flex items-center justify-center font-bold text-white text-sm">
                      {activeItem.first_name?.[0] || activeItem.email[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">{activeItem.first_name || 'Prospect'} ({activeItem.title || 'Decision Maker'})</h3>
                      <p className="text-xs text-gray-400 font-mono">{activeItem.email} • {activeItem.company}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-cyan-glow bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/20">
                    <Sparkles className="w-4 h-4" />
                    <span>azure/gpt-4o Draft</span>
                  </div>
                </div>

                {activeItem.company_summary && (
                  <div className="text-xs text-gray-300 bg-obsidian-800/80 p-3 rounded-xl border border-gray-800">
                    <span className="font-bold text-violet-300">Scraped Company Context & Pain Points: </span>
                    {activeItem.company_summary}
                  </div>
                )}
              </div>

              {/* Email Copy Editor Box */}
              <div className="glass-panel p-6 rounded-2xl space-y-4 border border-violet-500/30">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-violet-400" />
                    Personalized Cold Email Draft
                  </h3>

                  <button
                    onClick={handleSaveDraft}
                    disabled={saving}
                    className="text-xs text-gray-300 hover:text-white px-3 py-1.5 rounded-lg bg-obsidian-800 border border-gray-700"
                  >
                    {saving ? 'Saving...' : 'Save Edits'}
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Subject Line</label>
                    <input 
                      type="text" 
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-obsidian-800 border border-gray-700 text-white text-sm focus:border-violet-accent outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Email Body (&lt;120 words)</label>
                    <textarea 
                      rows={8}
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      className="w-full p-4 rounded-xl bg-obsidian-800 border border-gray-700 text-white text-sm focus:border-violet-accent outline-none font-sans leading-relaxed"
                    />
                  </div>
                </div>

                {/* Scheduling Timestamp & Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-800">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Calendar className="w-4 h-4 text-violet-400" />
                    <span>Send Window: Tue–Thu, 08:00–11:00 UTC</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleReject}
                      className="px-3 py-2.5 rounded-xl bg-gray-800 hover:bg-red-500/20 text-gray-300 hover:text-red-400 text-xs font-medium border border-gray-700 flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Reject
                    </button>

                    <button
                      onClick={handleRegenerate}
                      disabled={regenerating}
                      className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-cyan-glow text-xs font-semibold border border-cyan-500/30 flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
                      {regenerating ? 'Regenerating...' : 'Regenerate with AI'}
                    </button>

                    <button
                      onClick={handleApprove}
                      disabled={approving}
                      className="btn-glowing-border py-2.5 px-6 text-white font-bold text-xs flex items-center gap-2 rounded-xl shadow-violet-glow"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {approving ? 'Queuing...' : 'Approve & Queue'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upgrade Nudge Modal */}
      <UpgradeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
        onUpgrade={() => window.location.href = '/#pricing'}
      />
    </div>
  );
}
