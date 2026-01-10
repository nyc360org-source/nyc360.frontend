import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { 
  ApiResponse, Post, FeedData, InteractionType, PostComment
} from '../models/posts';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private http = inject(HttpClient);
  
  private baseUrl = `${environment.apiBaseUrl}/posts`;
  private feedUrl = `${environment.apiBaseUrl}/feeds/all/home`;
  private communitiesUrl = `${environment.apiBaseUrl}/communities`; 

  // =================================================================
  // 1. PUBLIC METHODS
  // =================================================================
  
  getPostsFeed(): Observable<ApiResponse<FeedData>> {
    return this.http.get<ApiResponse<FeedData>>(this.feedUrl);
  }

  getPostsByTag(tag: string, page: number = 1, pageSize: number = 20): Observable<ApiResponse<Post[]>> {
    let params = new HttpParams().set('Page', page).set('PageSize', pageSize);
    return this.http.get<ApiResponse<Post[]>>(`${this.baseUrl}/tags/${encodeURIComponent(tag)}`, { params });
  }

  joinCommunity(id: number): Observable<ApiResponse<any>> {
    const body = { CommunityId: id }; 
    return this.http.post<ApiResponse<any>>(`${this.communitiesUrl}/join`, body);
  }

  savePost(id: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/${id}/save`, {});
  }

  // ✅ Share Post according to Swagger
  sharePost(id: number, content: string = ''): Observable<ApiResponse<any>> {
    const body = { content: content };
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/${id}/share`, body);
  }

  // ✅ NEW: Report Post according to Swagger
  // Endpoint: POST /api/posts/{PostId}/report
  reportPost(id: number, reason: string): Observable<ApiResponse<any>> {
    // بنبعت السبب في الـ Body عشان الباك اند يسجله لو محتاجه
    const body = { reason: reason };
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/${id}/report`, body);
  }

  // =================================================================
  // 2. EXISTING METHODS
  // =================================================================

  getAllPosts(category?: number, search?: string, page: number = 1, pageSize: number = 10): Observable<ApiResponse<Post[]>> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (category !== undefined && category !== null && category !== -1) params = params.set('category', category.toString());
    if (search) params = params.set('search', search);
    return this.http.get<ApiResponse<Post[]>>(`${this.baseUrl}/list`, { params });
  }

  getPostById(id: number): Observable<ApiResponse<Post>> {
    return this.http.get<ApiResponse<Post>>(`${this.baseUrl}/${id}`);
  }

  createPost(data: any, files?: File[]): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    if (data.category !== null) formData.append('category', data.category.toString());
    if (files && files.length > 0) files.forEach(file => formData.append('attachments', file));
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/create`, formData);
  }

  updatePost(id: number, data: any, files?: File[]): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('postId', id.toString());
    formData.append('title', data.title);
    formData.append('content', data.content);
    if (data.category !== null) formData.append('category', data.category.toString());
    if (files && files.length > 0) files.forEach(file => formData.append('addedAttachments', file));
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/edit`, formData);
  }

  deletePost(id: number): Observable<ApiResponse<any>> {
    return this.http.request<ApiResponse<any>>('delete', `${this.baseUrl}/delete`, { body: { postId: id } });
  }

  interact(postId: number, type: InteractionType): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/${postId}/interact`, { type });
  }

  addComment(postId: number, content: string, parentCommentId?: number): Observable<ApiResponse<PostComment>> {
    const body = { postId, content, parentCommentId: parentCommentId || 0 };
    return this.http.post<ApiResponse<PostComment>>(`${this.baseUrl}/comment`, body);
  }
}