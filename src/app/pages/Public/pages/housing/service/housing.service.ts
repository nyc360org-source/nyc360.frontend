import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class HousingService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiBaseUrl}/posts/create/housing`;

    createHousingPost(data: any): Observable<any> {
        const formData = new FormData();
        formData.append('Title', data.Title);
        formData.append('Content', data.Content);
        formData.append('LocationsId', data.LocationsId.toString());
        formData.append('IsRenting', data.IsRenting.toString());
        formData.append('NumberOfRooms', data.NumberOfRooms.toString());
        formData.append('NumberOfBathrooms', data.NumberOfBathrooms.toString());
        formData.append('Size', data.Size.toString());
        formData.append('StartingPrice', data.StartingPrice.toString());
        formData.append('Type', data.Type.toString());

        // Handle Tags
        if (data.Tags && Array.isArray(data.Tags)) {
            data.Tags.forEach((tagId: number) => {
                formData.append('Tags', tagId.toString());
            });
        }

        // Handle Attachments
        if (data.Attachments && Array.isArray(data.Attachments)) {
            data.Attachments.forEach((file: File) => {
                formData.append('Attachments', file);
            });
        }

        return this.http.post(this.apiUrl, formData);
    }

    getHousingHome(): Observable<any> {
        return this.http.get(`${environment.apiBaseUrl}/housing/home`);
    }
}
