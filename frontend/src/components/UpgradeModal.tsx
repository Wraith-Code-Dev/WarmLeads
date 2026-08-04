'use client';
import React from 'react';
import { Sparkles, X, Zap, Check, ShieldAlert, PartyPopper } from 'lucide-react';

export type ModalType = 'FIRST_REPLY' | 'LIMIT_REACHED';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: ModalType;
  prospectName?: string;
  onUpgrade?: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  type,
  prospectName = 'Alex',
  onUpgrade
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="glass-panel max-w-md w-full p-6 rounded-3xl space-y-6 border border-violet-500/40 shadow-violet-glow relative">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content depending on type */}
        {type === 'FIRST_REPLY' ? (
          <div className="space-y-4 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-violet-accent/20 border border-violet-accent/40 flex items-center justify-center text-violet-300 shadow-violet-glow">
              <PartyPopper className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-extrabold text-white">🎉 First Prospect Reply Detected!</h3>
            <p className="text-sm text-gray-300">
              You received a positive response from <span className="font-bold text-violet-300">{prospectName}</span>!
            </p>
            <div className="bg-obsidian-800/80 p-3 rounded-xl text-xs text-gray-300 border border-gray-800">
              Upgrade to <span className="font-bold text-cyan-glow">Starter Tier (₹5,000/mo)</span> to scale your campaigns to 300 prospects this month with custom domain delivery.
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-amber-glow">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-extrabold text-white">Free Tier Limit Reached</h3>
            <p className="text-sm text-gray-300">
              You've used all 50 monthly emails or 15 research credits on the Free plan.
            </p>
            <div className="bg-obsidian-800/80 p-3 rounded-xl text-xs text-gray-300 border border-gray-800">
              Unlock <span className="font-bold text-cyan-glow">300 monthly emails</span>, unlimited scraping, and Resend custom domain sending on the Starter Tier.
            </div>
          </div>
        )}

        {/* Upgrade Features Checklist */}
        <div className="space-y-2 text-xs text-gray-300 pt-2 border-t border-gray-800">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-cyan-glow shrink-0" />
            <span>300 verified dispatches / month</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-cyan-glow shrink-0" />
            <span>Resend Custom Domain (DKIM / SPF)</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-cyan-glow shrink-0" />
            <span>Remove Outpilot branding</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={() => {
              onUpgrade?.();
              onClose();
            }}
            className="w-full btn-glowing-border py-3 text-white font-bold text-xs rounded-xl shadow-violet-glow"
          >
            Upgrade to Starter Tier (₹5,000/mo)
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 text-xs text-gray-400 hover:text-gray-200"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};
