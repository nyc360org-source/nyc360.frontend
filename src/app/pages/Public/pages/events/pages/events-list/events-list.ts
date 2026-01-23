import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../../environments/environment';

@Component({
    selector: 'app-events-list',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './events-list.html',
    styleUrls: ['./events-list.scss']
})
export class EventsListComponent implements OnInit {
    private http = inject(HttpClient);
    private router = inject(Router);

    events: any[] = [];
    isLoading = true;
    searchTerm = '';
    selectedCategory = 0;

    categories = [
        { id: 0, name: 'All', icon: 'bi-grid' },
        { id: 1, name: 'Music', icon: 'bi-music-note-beamed' },
        { id: 2, name: 'Theater', icon: 'bi-theater-masks' },
        { id: 3, name: 'Sports', icon: 'bi-trophy' },
        { id: 4, name: 'Food & Drink', icon: 'bi-cup-hot' },
        { id: 5, name: 'Networking', icon: 'bi-people' },
        { id: 6, name: 'Community', icon: 'bi-globe' },
        { id: 7, name: 'Outdoor', icon: 'bi-tree' },
        { id: 8, name: 'Dance', icon: 'bi-activity' }
    ];

    ngOnInit() {
        this.fetchEvents();
    }

    fetchEvents() {
        this.isLoading = true;
        const url = `${environment.apiBaseUrl}/events/list`; // Assuming this endpoint exists or will exist
        this.http.get<any>(url).subscribe({
            next: (res) => {
                this.events = res.data || res.Data || res || [];
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error fetching events:', err);
                this.isLoading = false;
                // Mock data for development if API fails
                this.events = this.getMockEvents();
            }
        });
    }

    get filteredEvents() {
        return this.events.filter(event => {
            const matchesSearch = event.Title?.toLowerCase().includes(this.searchTerm.toLowerCase());
            const matchesCategory = this.selectedCategory === 0 || event.Category === this.selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }

    getCategoryIcon(id: any): string {
        const cat = this.categories.find(c => c.id == id);
        return cat ? cat.icon : 'bi-calendar-event';
    }

    getCategoryName(id: any): string {
        const cat = this.categories.find(c => c.id == id);
        return cat ? cat.name : 'Event';
    }

    getMinPrice(event: any): number {
        if (!event.Tiers || event.Tiers.length === 0) return 0;
        const prices = event.Tiers.map((t: any) => t.Price || 0);
        return Math.min(...prices);
    }

    getMockEvents() {
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
