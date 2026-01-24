import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventsListService } from '../../service/events-list.service';
import { EventListItem } from '../../models/events-list.model';

@Component({
    selector: 'app-events-list',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './events-list.html',
    styleUrls: ['./events-list.scss']
})
export class EventsListComponent implements OnInit {
    private eventsService = inject(EventsListService);
    private router = inject(Router);

    events: EventListItem[] = [];
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
        this.eventsService.getEvents().subscribe({
            next: (data) => {
                this.events = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error fetching events:', err);
                this.isLoading = false;
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
}
