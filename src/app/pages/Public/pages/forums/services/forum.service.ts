import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Forum, ApiResponse } from '../models/forum';

@Injectable({
    providedIn: 'root'
})
export class ForumService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiBaseUrl}/forums`;

    getForums(): Observable<ApiResponse<Forum[]>> {
        return this.http.get<ApiResponse<Forum[]>>(this.baseUrl);
    }
}
