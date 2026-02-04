import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class HousingAuthService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiBaseUrl}/housing/create/authoring`;

    createHousingAuthorization(data: any): Observable<any> {
        const formData = new FormData();

        const append = (key: string, val: any) => {
            if (val !== null && val !== undefined) {
                formData.append(key, String(val));
            }
        };

        append('HouseListingId', data.HouseListingId);
        append('FullName', data.FullName);
        append('OrganizationName', data.OrganizationName || '');
        append('Email', data.Email);
        append('PhoneNumber', data.PhoneNumber);

        // Dates & Times
        const formatDate = (date: any) => {
            if (!date) return '';
            const d = new Date(date);
            return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
        };

        const formatTime = (time: any) => {
            if (!time) return '';
            if (typeof time === 'string' && time.length === 5) return time + ':00';
            return time;
        };

        // Availabilities
        if (data.Availabilities && Array.isArray(data.Availabilities)) {
            data.Availabilities.forEach((avail: any, index: number) => {
                formData.append(`Availabilities[${index}].AvailabilityType`, String(avail.AvailabilityType));

                if (avail.Dates && Array.isArray(avail.Dates)) {
                    avail.Dates.forEach((date: any, dIndex: number) => {
                        formData.append(`Availabilities[${index}].Dates[${dIndex}]`, formatDate(date));
                    });
                }

                formData.append(`Availabilities[${index}].TimeFrom`, formatTime(avail.TimeFrom));
                formData.append(`Availabilities[${index}].TimeTo`, formatTime(avail.TimeTo));
            });
        }

        // Enums (Ensure they are sent as numbers/strings that backend expects)
        formData.append('AuthorizationType', String(data.AuthorizationType ?? 0));
        formData.append('ListingAuthorizationDocument', String(data.ListingAuthorizationDocument ?? 0));

        if (data.AuthorizationValidationDate) append('AuthorizationValidationDate', formatDate(data.AuthorizationValidationDate));

        append('SaveThisAuthorizationForFutureListings', data.SaveThisAuthorizationForFutureListings ? 'true' : 'false');

        // Attachments
        if (data.Attachments && Array.isArray(data.Attachments)) {
            data.Attachments.forEach((file: any) => {
                if (file instanceof File) {
                    formData.append('Attachments', file);
                }
            });
        }

        return this.http.post(this.apiUrl, formData);
    }
}
