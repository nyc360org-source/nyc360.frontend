import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { EventListItem, ApiResponse, PaginatedEventResponse } from '../models/events-list.model';

@Injectable({
    providedIn: 'root'
})
export class EventsListService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiBaseUrl}/events`;

    getEvents(params: any = {}): Observable<PaginatedEventResponse> {
        let httpParams = new HttpParams();

        // Add pagination defaults
        httpParams = httpParams.set('PageSize', params.PageSize || 20);
        httpParams = httpParams.set('PageNumber', params.PageNumber || 1);

        if (params.SearchTerm) httpParams = httpParams.set('SearchTerm', params.SearchTerm);
        if (params.Category) httpParams = httpParams.set('Category', params.Category);
        if (params.Status !== undefined) httpParams = httpParams.set('Status', params.Status);
        if (params.FromDate) httpParams = httpParams.set('FromDate', params.FromDate);
        if (params.ToDate) httpParams = httpParams.set('ToDate', params.ToDate);
        if (params.LocationId) httpParams = httpParams.set('LocationId', params.LocationId);

        return this.http.get<ApiResponse<PaginatedEventResponse>>(this.apiUrl, { params: httpParams }).pipe(
            map(res => res.data),
            catchError(err => {
                console.error('Error fetching events:', err);
                // Return dummy data on error to keep UI working
                return of({
                    isSuccess: false,
                    data: this.getMockEvents(),
                    page: 1,
                    pageSize: 20,
                    totalCount: 3,
                    totalPages: 1,
                    error: err
                });
            })
        );
    }

    private getMockEvents(): EventListItem[] {
        return [
            {
                id: 1,
                title: 'Broadway in Manhattan: The Great Show',
                description: 'Experience the magic of Broadway.',
                category: 2,
                startDateTime: new Date().toISOString(),
                endDateTime: new Date().toISOString(),
                status: 1,
                visibility: 1,
                isPaid: true,
                address: { addressId: 1, locationId: 1, street: 'Broadway', buildingNumber: '123', zipCode: '10001' },
                tiers: [{ id: 1, name: 'Normal', description: '', price: 45, quantityAvailable: 100, minPerOrder: 1, maxPerOrder: 10, saleStart: '', saleEnd: '' }],
                bannerUrl: 'https://images.unsplash.com/photo-1503095396549-807039045349?auto=format&fit=crop&w=800&q=80'
            },
            {
                id: 2,
                title: 'Underground Jazz Night',
                description: 'The best jazz in town.',
                category: 1,
                startDateTime: new Date().toISOString(),
                endDateTime: new Date().toISOString(),
                status: 1,
                visibility: 1,
                isPaid: true,
                address: { addressId: 2, locationId: 1, street: 'W 3rd St', buildingNumber: '131', zipCode: '10012' },
                tiers: [{ id: 2, name: 'General', description: '', price: 25, quantityAvailable: 50, minPerOrder: 1, maxPerOrder: 5, saleStart: '', saleEnd: '' }],
                bannerUrl: 'https://images.unsplash.com/photo-1514525253361-bee8d424b94e?auto=format&fit=crop&w=800&q=80'
            }
        ];
    }
}
