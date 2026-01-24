import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CreateEventService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiBaseUrl}/events/create`;

    createEvent(formData: FormData): Observable<any> {
        return this.http.post<any>(this.apiUrl, formData);
    }
}
