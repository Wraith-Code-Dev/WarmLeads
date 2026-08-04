import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles: Record<string, string> = {
    PENDING_RESEARCH: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    RESEARCHING: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 animate-pulse',
    NEEDS_REVIEW: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-glow',
    QUEUED_FOR_SEND: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    PROCESSING: 'bg-purple-500/10 text-purple-400 border-purple-500/20 animate-pulse',
    SENT: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    REPLIED: 'bg-pink-500/10 text-pink-400 border-pink-500/20 font-bold',
    FAILED: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  const labels: Record<string, string> = {
    PENDING_RESEARCH: 'Pending Research',
    RESEARCHING: 'Scraping Web...',
    NEEDS_REVIEW: 'Needs Review',
    QUEUED_FOR_SEND: 'Queued (Neon DB)',
    PROCESSING: 'Sending (SKIP LOCKED)...',
    SENT: 'Sent (Gmail API)',
    REPLIED: 'Replied 🔥',
    FAILED: 'Failed',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current"></span>
      {labels[status] || status}
    </span>
  );
};
