export interface Job {
  id: string;
  platform: string;
  source_url: string;
  title: string;
  description: string;
  budget_min: number | null;
  budget_max: number | null;
  currency: string | null;
  posted_at: string | null;
  status?: string;
}

export interface Prospect {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  website?: string;
  title?: string;
  industry?: string;
  custom_notes?: string;
  status: 'PENDING_RESEARCH' | 'RESEARCHING' | 'NEEDS_REVIEW' | 'QUEUED_FOR_SEND' | 'PROCESSING' | 'SENT' | 'REPLIED' | 'FAILED';
  created_at: string;
  updated_at: string;
  research?: ResearchContext;
  queue_item?: OutreachQueueItem;
}

export interface ResearchContext {
  company_summary?: string;
  key_insights?: string[];
  news_highlights?: string[];
  confidence_score?: number;
  scraped_at?: string;
}

export interface OutreachQueueItem {
  id: string;
  subject: string;
  body: string;
  status: string;
  scheduled_at?: string;
  jitter_minutes: number;
}

export interface ReviewQueueItem {
  prospect_id: string;
  email: string;
  first_name?: string;
  company?: string;
  website?: string;
  title?: string;
  company_summary?: string;
  subject: string;
  body: string;
  confidence_score: number;
  scheduled_at?: string;
}

export interface AnalyticsOverview {
  total_prospects: number;
  pending_research: number;
  needs_review: number;
  queued_for_send: number;
  total_sent: number;
  total_replied: number;
  reply_rate_percentage: number;
  daily_sends: Record<string, number>;
}

export interface RecentActivityItem {
  id: string;
  prospect_email: string;
  action: string;
  status: string;
  timestamp: string;
}
