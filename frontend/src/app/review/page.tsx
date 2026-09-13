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

  const fetchQueue = React.useCallback(async () => {
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
  }, [activeItem]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

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
    <div className="space-y-6 max-w-full w-full px-2 lg:px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-black tracking-tight">Human-in-the-Loop Review Queue</h1>
          <p className="text-black font-bold text-sm mt-1">
            Review side-by-side scraped context & edit AI outreach copy before dispatching to the DB Queue
          </p>
        </div>

        <button
          onClick={fetchQueue}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-black text-sm font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all uppercase tracking-wider shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Queue
        </button>
      </div>

      {loading ? (
        <div className="clean-card p-12 text-center text-black font-black uppercase tracking-widest rounded-2xl">
          Loading pending drafts...
        </div>
      ) : items.length === 0 ? (
        <div className="clean-card p-16 text-center space-y-4 rounded-2xl border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white">
          <div className="w-16 h-16 bg-emerald-200 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-800" />
          </div>
          <h3 className="text-2xl font-black text-black uppercase tracking-tight">Queue Clear!</h3>
          <p className="text-black font-bold text-sm max-w-md mx-auto">
            No pending drafts awaiting review. Ingest more prospects to trigger AI copy generation.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Pending List (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-black text-black uppercase tracking-wider px-1 mb-3">
              Pending Review ({items.length})
            </div>

            <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-1 pb-4">
              {items.map((item) => {
                const isSelected = activeItem?.prospect_id === item.prospect_id;
                return (
                  <div
                    key={item.prospect_id}
                    onClick={() => selectItem(item)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border-2 border-black ${
                      isSelected
                        ? 'bg-violet-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-1'
                        : 'bg-white hover:bg-gray-50 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-black">{item.first_name || 'Prospect'}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-black border-2 border-black uppercase">
                        {item.confidence_score}% Match
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 font-bold mt-1">{item.email}</p>
                    <p className="text-xs text-black font-semibold mt-2 line-clamp-1">
                      Subj: {item.subject}
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
              <div className="bg-white p-5 rounded-2xl space-y-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center justify-between border-b-2 border-black pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-violet-200 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center font-black text-violet-900 text-lg">
                      {activeItem.first_name?.[0] || activeItem.email[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-black text-black text-lg leading-tight">{activeItem.first_name || 'Prospect'} ({activeItem.title || 'Decision Maker'})</h3>
                      <p className="text-xs text-gray-600 font-bold mt-0.5">{activeItem.email} • {activeItem.company}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-black text-cyan-900 bg-cyan-200 px-3 py-1.5 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Draft</span>
                  </div>
                </div>

                {activeItem.company_summary && (
                  <div className="text-xs text-black bg-yellow-50 p-4 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <span className="font-black text-black uppercase tracking-wider block mb-1">Scraped Context & Pain Points: </span>
                    <span className="font-medium leading-relaxed">{activeItem.company_summary}</span>
                  </div>
                )}
              </div>

              {/* Email Copy Editor Box */}
              <div className="bg-white p-6 rounded-2xl space-y-5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-violet-600 border-r-2 border-black" />
                
                <div className="flex items-center justify-between border-b-2 border-black pb-4 pl-4">
                  <h3 className="font-black text-black text-lg flex items-center gap-2 uppercase tracking-tight">
                    <Edit3 className="w-5 h-5 text-violet-600" />
                    Email Editor
                  </h3>

                  <button
                    onClick={handleSaveDraft}
                    disabled={saving}
                    className="text-[10px] font-black text-black hover:bg-gray-100 px-3 py-1.5 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wider active:translate-y-[2px] active:shadow-none transition-all"
                  >
                    {saving ? 'Saving...' : 'Save Edits'}
                  </button>
                </div>

                <div className="space-y-5 pl-4">
                  <div>
                    <label className="block text-[10px] font-black text-black uppercase tracking-widest mb-2">Subject Line</label>
                    <input 
                      type="text" 
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white border-2 border-black text-black text-sm font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:bg-violet-50 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-black uppercase tracking-widest mb-2">Email Body</label>
                    <textarea 
                      rows={8}
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      className="w-full p-4 rounded-xl bg-white border-2 border-black text-black text-sm font-medium leading-relaxed shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:bg-violet-50 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all resize-y"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t-2 border-black pl-4">
                  <div className="flex items-center gap-2 text-[10px] font-black text-black uppercase tracking-wider bg-gray-100 px-3 py-1.5 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Send Window: Tue–Thu, 08:00–11:00 UTC</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleReject}
                      className="px-4 py-2.5 rounded-xl bg-red-200 hover:bg-red-300 text-red-900 text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Reject
                    </button>

                    <button
                      onClick={handleRegenerate}
                      disabled={regenerating}
                      className="px-4 py-2.5 rounded-xl bg-cyan-200 hover:bg-cyan-300 text-cyan-900 text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-2"
                    >
                      <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
                      {regenerating ? 'Regenerating...' : 'Regenerate'}
                    </button>

                    <button
                      onClick={handleApprove}
                      disabled={approving}
                      className="px-6 py-2.5 rounded-xl bg-black hover:bg-gray-800 text-white text-xs font-black uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_rgba(139,92,246,1)] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
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
