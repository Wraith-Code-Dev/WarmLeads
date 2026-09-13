'use client';
import React, { useEffect, useState } from 'react';
import { JobCard } from '@/components/jobs/JobCard';
import { Loader2, Zap, RefreshCw, Filter, Search, Briefcase } from 'lucide-react';
import { Job } from '@/types';
import { api } from '@/lib/api';

const PLATFORMS = ['All', 'Upwork', 'Freelancer', 'Reddit', 'Indeed', 'LinkedIn', 'Behance', 'Guru'];

export default function JobsDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = React.useCallback(async (platform: string = selectedPlatform) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getJobs(platform);
      setJobs(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  }, [selectedPlatform]);

  useEffect(() => {
    fetchJobs(selectedPlatform);
  }, [fetchJobs, selectedPlatform]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.syncJobs();
      await fetchJobs(selectedPlatform);
    } catch (err: any) {
      alert('Ingestion triggered in background.');
    } finally {
      setSyncing(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      job.title.toLowerCase().includes(q) ||
      (job.description && job.description.toLowerCase().includes(q)) ||
      job.platform.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 max-w-full w-full px-2 lg:px-4 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
              <Briefcase className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-black tracking-tight leading-none">
                Opportunity Stream
              </h1>
              <p className="text-xs font-bold text-gray-500 mt-1">
                Multi-platform freelance & remote listings normalized for one-click proposal generation
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Ingesting Feeds...' : 'Sync Feeds Now'}
          </button>
          <button
            onClick={() => fetchJobs(selectedPlatform)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-black text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Chips & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Platform Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {PLATFORMS.map((platform) => {
            const isSelected = selectedPlatform.toLowerCase() === platform.toLowerCase();
            return (
              <button
                key={platform}
                onClick={() => setSelectedPlatform(platform)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border-2 border-black transition-all shrink-0 ${
                  isSelected
                    ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(139,92,246,1)]'
                    : 'bg-white text-black hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                {platform}
              </button>
            );
          })}
        </div>

        {/* Keyword Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search listings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border-2 border-black rounded-lg text-xs font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:shadow-[3px_3px_0px_0px_rgba(139,92,246,1)] transition-all"
          />
        </div>
      </div>

      {/* Jobs Grid / States */}
      {loading ? (
        <div className="p-16 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
          <Loader2 className="w-8 h-8 text-violet-600 animate-spin mx-auto mb-3" />
          <p className="text-xs font-black uppercase tracking-wider text-black">Synchronizing Opportunities Lake...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-100 border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-red-900">
          <h3 className="text-sm font-black uppercase tracking-wider mb-1">Error Loading Opportunities</h3>
          <p className="text-xs font-bold">{error}</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="p-16 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center space-y-3">
          <div className="w-12 h-12 bg-gray-100 border-2 border-black rounded-xl mx-auto flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Briefcase className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-black text-black uppercase tracking-tight">No Listings Found</h3>
          <p className="text-xs font-bold text-gray-500 max-w-sm mx-auto">
            {searchQuery ? `No jobs match "${searchQuery}".` : 'No opportunities in this category yet. Click "Sync Feeds Now" above.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
