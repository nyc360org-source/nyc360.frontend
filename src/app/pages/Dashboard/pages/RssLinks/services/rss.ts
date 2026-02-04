// src/app/pages/Dashboard/pages/rss/services/rss.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { CreateRssRequest, RssResponse } from '../models/rss';

@Injectable({
  providedIn: 'root'
})
export class RssService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/rss-dashboard`;

  // --- GET LIST ---
  getAllRssSources(): Observable<RssResponse> {
    return this.http.get<RssResponse>(`${this.baseUrl}/list`);
  }

  // --- TEST (Verify & Fetch Data) ---
  testRssSource(url: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/test?url=${encodeURIComponent(url)}`);
  }

  // --- CREATE (Simple JSON) 🆕 This was missing ---
  createRssSource(data: CreateRssRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/create`, data);
  }

  // --- UPDATE (Multipart/Form-Data) ---
  updateRssSource(id: number, data: any, file?: File): Observable<any> {
    const formData = new FormData();
    formData.append('id', id.toString());
    formData.append('rssUrl', data.rssUrl);
    formData.append('category', data.category.toString());
    formData.append('name', data.name);
    formData.append('description', data.description || '');
    formData.append('isActive', data.isActive.toString());

    if (file) {
      formData.append('image', file);
    }

    return this.http.put(`${this.baseUrl}/update`, formData);
  }

  // --- DELETE ---
  deleteRssSource(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`);
  }
}