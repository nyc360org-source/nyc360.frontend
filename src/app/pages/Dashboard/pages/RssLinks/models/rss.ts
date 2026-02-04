// Main Entity - Backend returns ALL properties in PascalCase
export interface RssSource {
  Id: number;
  Name: string;
  RssUrl: string;
  Category: number;
  Description: string;
  ImageUrl: string | null;
  IsActive: boolean;
  LastChecked: string;
}

// Create Request (Frontend uses camelCase, Service converts to PascalCase for Backend)
// Backend expects: Url, Category, Name, Description, ImageUrl, Image
export interface CreateRssRequest {
  url: string;
  category: number;
  name: string;
  description?: string;
  imageUrl?: string;
  image?: File;
}

// Response Wrapper for List (Backend returns PascalCase)
export interface RssResponse {
  IsSuccess: boolean;
  Data: RssSource[];
  Error: { Code: string; Message: string } | null;
}

// Response Wrapper for Single Source (Test) (Backend returns PascalCase)
export interface RssSingleResponse {
  IsSuccess: boolean;
  Data: RssSource;
  Error: { Code: string; Message: string } | null;
}

// RSS Request Entity - Backend returns ALL properties in PascalCase
export interface RssRequest {
  Id: number;
  Url: string;
  Category: number;
  Name: string;
  Description: string;
  ImageUrl: string;
  Status: number; // 0 = Pending, 1 = Approved, 2 = Rejected etc.
  AdminNote: string;
  RequesterId: number;
  RequesterName: string;
  CreatedAt: string;
  ProcessedAt: string;
}

// Paginated Response for Requests (Backend returns PascalCase)
export interface RssRequestResponse {
  IsSuccess: boolean;
  Data: RssRequest[];
  Page: number;
  PageSize: number;
  TotalCount: number;
  TotalPages: number;
  Error: { Code: string; Message: string } | null;
}

// Update Request Status (Frontend uses camelCase, Service converts to PascalCase)
// Backend expects: { Id, Status, AdminNote }
export interface RssRequestUpdate {
  id: number;
  status: number;
  adminNote: string;
}

