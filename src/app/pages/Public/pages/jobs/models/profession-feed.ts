export interface FeedArticle {
  id: number;
  title: string;
  content: string;
  category: number;
  attachments: { id: number; url: string }[];
  author: { id: number; username: string; imageUrl: string; fullName?: string; type?: number };
  createdAt: string;
  isSavedByUser: boolean;
  imageUrl?: string;
  parentPost?: any;
}

export interface HiringJob {
  id: number;
  title: string;
  salaryMin: number;
  salaryMax: number;
  workArrangement: number;
  employmentType: number;
  companyName: string;
}

export interface ProfessionFeedData {
  heroArticle: FeedArticle;
  careerArticles: FeedArticle[];
  hiringNews: HiringJob[];
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  data: T;
  error: any;
}