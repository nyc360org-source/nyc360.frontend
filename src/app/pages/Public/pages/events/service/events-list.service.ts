import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { EventListItem } from '../models/events-list.model';

@Injectable({
    providedIn: 'root'
})
export class EventsListService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiBaseUrl}/events/list`;

    getEvents(): Observable<EventListItem[]> {
        return this.http.get<any>(this.apiUrl).pipe(
            map(res => res.data || res.Data || res || []),
            catchError(err => {
                console.error('Error fetching events:', err);
                return of(this.getMockEvents());
            })
        );
    }

    private getMockEvents(): EventListItem[] {
        return [
            {
                Id: 1,
                Title: 'Broadway in Manhattan: The Great Show',
                Category: 2,
                StartDateTime: new Date().toISOString(),
                VenueName: 'Majestic Theatre',
                BannerUrl: 'https://images.unsplash.com/photo-1503095396549-807039045349?auto=format&fit=crop&w=800&q=80',
                Tiers: [{ Price: 45 }, { Price: 120 }]
            },
            {
                Id: 2,
                Title: 'Underground Jazz Night',
                Category: 1,
                StartDateTime: new Date().toISOString(),
                VenueName: 'Blue Note Jazz Club',
                BannerUrl: 'https://images.unsplash.com/photo-1514525253361-bee8d424b94e?auto=format&fit=crop&w=800&q=80',
                Tiers: [{ Price: 25 }]
            },
            {
                Id: 3,
                Title: 'NYC Marathon Final Stretch',
                Category: 3,
                StartDateTime: new Date().toISOString(),
                VenueName: 'Central Park',
                BannerUrl: 'https://images.unsplash.com/photo-1452621933871-dd6d0ee14cff?auto=format&fit=crop&w=800&q=80',
                Tiers: [{ Price: 0 }]
            }
        ];
    }
}
