import React from 'react';
import { ExternalLink, DollarSign, Calendar, Tag } from 'lucide-react';

interface Job {
  id: string;
  platform: string;
  source_url: string;
  title: string;
  description: string;
  budget_min: number | null;
  budget_max: number | null;
  currency: string | null;
  posted_at: string | null;
}

export function JobCard({ job }: { job: Job }) {
  return (
    <div className="group relative bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all duration-300 shadow-xl overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full">
            {job.platform}
          </span>
          {job.posted_at && (
            <span className="flex items-center text-xs text-zinc-400">
              <Calendar className="w-3 h-3 mr-1" />
              {new Date(job.posted_at).toLocaleDateString()}
            </span>
          )}
        </div>
        
        <h3 className="text-xl font-semibold text-white mb-2 line-clamp-2 leading-tight">
          {job.title}
        </h3>
        
        <p className="text-zinc-400 text-sm mb-6 line-clamp-3 flex-grow">
          {job.description || "No description provided."}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
          <div className="flex items-center text-emerald-400 font-medium">
            <DollarSign className="w-4 h-4 mr-1" />
            {job.budget_min || job.budget_max 
              ? `${job.budget_min || 0} - ${job.budget_max || '...'} ${job.currency || 'USD'}`
              : "Not specified"}
          </div>
          
          <a 
            href={job.source_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            View Posting
            <ExternalLink className="w-4 h-4 ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
}
