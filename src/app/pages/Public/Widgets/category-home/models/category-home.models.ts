export interface CategoryPost {
  id: number;
  title: string;
  content: string | null;
  category: number;
  createdAt: string;
  author: { 
    id: number; 
    username?: string; 
    name?: string; 
    imageUrl: string 
  };
  attachments: { id: number; url: string }[];
  stats: { views: number; likes: number; shares: number; comments: number };
  parentPost?: CategoryPost; 
  isSavedByUser: boolean;
  sourceType?: number;
}

export interface CategoryHomeData {
  featured: CategoryPost[];
  latest: CategoryPost[];
  trending: CategoryPost[];
}

export interface CategoryHomeResponse {
  isSuccess: boolean;
  data: CategoryHomeData;
  error: any;
}