import axios from 'axios';
import { Prospect, ReviewQueueItem, AnalyticsOverview, RecentActivityItem } from '@/types';
import { supabase } from './supabaseClient';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Add a request interceptor to inject the Supabase JWT token
axios.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const api = {
  // Instant Onboarding Quick-Research Route
  quickResearch: async (url: string, firstName?: string, company?: string, title?: string) => {
    const res = await axios.post(`${API_BASE}/onboarding/quick-research`, {
      url,
      first_name: firstName || "Prospect",
      company,
      title: title || "Decision Maker"
    });
    return res.data;
  },

  // Prospects
  getProspects: async (): Promise<Prospect[]> => {
    try {
      const res = await axios.get(`${API_BASE}/prospects`);
      return res.data;
    } catch (err) {
      console.warn("Could not fetch prospects (backend offline):", err);
      return [];
    }
  },

  createProspect: async (data: Partial<Prospect>): Promise<Prospect> => {
    const res = await axios.post(`${API_BASE}/prospects`, data);
    return res.data;
  },

  uploadCsv: async (file: File): Promise<{ message: string; count: number }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post(`${API_BASE}/prospects/upload-csv`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // Review Queue
  getReviewQueue: async (): Promise<ReviewQueueItem[]> => {
    try {
      const res = await axios.get(`${API_BASE}/review/queue`);
      return res.data;
    } catch (err) {
      console.warn("Could not fetch review queue (backend offline):", err);
      return [];
    }
  },

  updateReviewItem: async (prospectId: string, subject: string, body: string): Promise<ReviewQueueItem> => {
    const res = await axios.put(`${API_BASE}/review/${prospectId}`, { subject, body });
    return res.data;
  },

  approveOutreach: async (prospectId: string) => {
    const res = await axios.post(`${API_BASE}/review/${prospectId}/approve`);
    return res.data;
  },

  // Trigger Stateless Queue Worker
  triggerQueueWorker: async (cronSecret: string = "super_secret_cron_token_123") => {
    const res = await axios.post(`${API_BASE}/queue/trigger`, {}, {
      headers: { 'x-cron-secret': cronSecret }
    });
    return res.data;
  },

  // Analytics
  getAnalyticsOverview: async (): Promise<AnalyticsOverview> => {
    const res = await axios.get(`${API_BASE}/analytics/overview`, { timeout: 3000 });
    return res.data;
  },

  getRecentActivity: async (): Promise<RecentActivityItem[]> => {
    const res = await axios.get(`${API_BASE}/analytics/activity`, { timeout: 3000 });
    return res.data;
  },

  // Auth
  getGmailStatus: async () => {
    try {
      const res = await axios.get(`${API_BASE}/auth/gmail/status`);
      return res.data;
    } catch (err) {
      return {
        connected: false,
        email: null,
        message: "Backend offline. Simulation engine enabled."
      };
    }
  }
};
