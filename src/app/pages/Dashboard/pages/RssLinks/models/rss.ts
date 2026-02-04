// src/app/pages/Dashboard/pages/rss/models/rss.models.ts

// Main Entity
export interface RssSource {
  id: number;
  name: string;
  rssUrl: string;
  category: number; // This matches the numeric ID from the shared category list
  description: string;
  imageUrl: string | null;
  isActive: boolean;
  lastChecked: string;
}

// Create Request
export interface CreateRssRequest {
  url: string;
  category: number;
  name: string;
  description?: string;
  imageUrl?: string;
}

// Response Wrapper
export interface RssResponse {
  isSuccess: boolean;
  data: RssSource[];
  error: { code: string; message: string } | null;
}