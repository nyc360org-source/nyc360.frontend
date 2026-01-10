import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, CommunityProfileData, CommunityMember } from '../models/community-profile';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommunityProfileService {
  
  private http = inject(HttpClient);
  // تأكد إن المسار الأساسي مظبوط على /api/communities
  private apiUrl = `${environment.apiBaseUrl}/communities`; 

  // 1. Get Community Profile by Slug
  getCommunityBySlug(slug: string): Observable<ApiResponse<CommunityProfileData>> {
    return this.http.get<ApiResponse<CommunityProfileData>>(`${this.apiUrl}/${slug}`);
  }

  // 2. Get Members
  getCommunityMembers(communityId: number): Observable<ApiResponse<CommunityMember[]>> {
    return this.http.get<ApiResponse<CommunityMember[]>>(`${this.apiUrl}/${communityId}/members`);
  }

  // 3. Join Community (✅ دي الدالة اللي كانت ناقصة)
  joinCommunity(communityId: number): Observable<ApiResponse<any>> {
    const body = { CommunityId: communityId };
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/join`, body);
  }

  // 4. Leave Community (✅ دي الدالة اللي كانت ناقصة)
  leaveCommunity(communityId: number): Observable<ApiResponse<any>> {
    const body = { CommunityId: communityId };
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/leave`, body);
  }

  // 5. Remove Member
  removeMember(communityId: number, memberId: number): Observable<ApiResponse<any>> {
    const body = { CommunityId: communityId, MemberId: memberId };
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/remove-member`, body);
  }
}