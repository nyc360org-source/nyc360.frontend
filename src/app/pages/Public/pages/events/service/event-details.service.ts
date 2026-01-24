import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { EventDetail } from '../models/event-details.model';

@Injectable({
    providedIn: 'root'
})
export class EventDetailsService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiBaseUrl}/events/details`;

    getEventDetails(id: string): Observable<EventDetail> {
        const url = `${this.baseUrl}/${id}`;
        return this.http.get<any>(url).pipe(
            map(res => res.data || res.Data || res),
            catchError(err => {
                console.error('Error fetching event details:', err);
                return of(this.getMockEvent(id));
            })
        );
    }

    private getMockEvent(id: any): EventDetail {
        return {
            Id: id,
            Title: 'Broadway in Manhattan: The Great Show',
            Description: `Experience the magic of Broadway in the heart of NYC. This award-winning production features a star-studded cast and breathtaking choreography. <br><br> Join us for an unforgettable evening of theater. The show explores themes of love, loss, and the pursuit of dreams in the big city. Perfect for families, date nights, or anyone looking to experience the true spirit of New York.`,
            Category: 2,
            StartDateTime: new Date().toISOString(),
            EndDateTime: new Date(new Date().getTime() + 10800000).toISOString(), // +3 hours
            VenueName: 'Majestic Theatre',
            BannerUrl: 'https://images.unsplash.com/photo-1503095396549-807039045349?auto=format&fit=crop&w=1200&q=80',
            Address: {
                Street: '245 W 44th St',
                BuildingNumber: '',
                ZipCode: '10036'
            },
            Tiers: [
                { Name: 'Orchestra Front', Price: 150, Description: 'Best seats in the house with perfect views.' },
                { Name: 'Mezzanine', Price: 95, Description: 'Great overhead views of the entire stage.' },
                { Name: 'Balcony', Price: 45, Description: 'Affordable seating with good acoustics.' }
            ],
            OrganizerName: 'Broadway NYC Productions',
            Tags: ['Broadway', 'Theater', 'Musical', 'NYC Events']
        };
    }
}
