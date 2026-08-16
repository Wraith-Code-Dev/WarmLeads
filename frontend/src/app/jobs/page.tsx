"use client";

import React, { useEffect, useState } from 'react';
import { JobCard } from '@/components/jobs/JobCard';
import { Loader2, Zap } from 'lucide-react';

// Fallback interface, ideally imported from a types file
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

export default function JobsDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJobs() {
      try {
        // Adjust the base URL to match your FastAPI backend
        const res = await fetch('http://localhost:8000/api/v1/jobs');
        if (!res.ok) throw new Error('Failed to fetch jobs');
        const data = await res.json();
        setJobs(data);
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-blue-500/30">
      {/* Decorative background blur */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      
      <main className="max-w-7xl mx-auto px-6 py-16">
        <header className="mb-16 flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 flex items-center">
              <Zap className="w-10 h-10 mr-4 text-blue-500" />
              Opportunity Stream
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl">
              Aggregated freelance listings from Upwork, Freelancer, and Reddit, deduplicated and normalized for AI drafting.
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-2 text-sm text-zinc-500 font-medium">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span>Live Ingestion Active</span>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-zinc-400 animate-pulse">Synchronizing Data Lake...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
            <h3 className="font-semibold mb-2">Error Loading Jobs</h3>
            <p>{error}</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-zinc-400 text-lg">No jobs found in the queue.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {jobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
