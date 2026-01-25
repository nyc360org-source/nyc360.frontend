import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventsListService } from '../../service/events-list.service';
import { EventListItem } from '../../models/events-list.model';
import { CATEGORY_THEMES } from '../../../../Widgets/feeds/models/categories';
import { LocationDashboardService } from '../../../../../Dashboard/pages/locations/service/location-dashboard.service';
import { LocationModel } from '../../../../../Dashboard/pages/locations/models/location.model';

@Component({
    selector: 'app-events-list',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './events-list.html',
    styleUrls: ['./events-list.scss']
})
export class EventsListComponent implements OnInit {
    private eventsService = inject(EventsListService);
    private locationService = inject(LocationDashboardService);
    private router = inject(Router);

    events: EventListItem[] = [];
    isLoading = true;

    // Filters
    searchTerm = '';
    selectedCategory: number | null = null;
    selectedLocation: number | null = null;
    selectedStatus: number | null = null;
    fromDate: string = '';
    toDate: string = '';

    // Pagination
    pageNumber = 1;
    pageSize = 12;
    totalCount = 0;
    totalPages = 1;

    // Lookups
    locations: LocationModel[] = [];
    categoriesList = Object.entries(CATEGORY_THEMES).map(([id, theme]: [any, any]) => ({
        id: parseInt(id),
        name: theme.label,
        icon: theme.icon ? 'bi-tag' : 'bi-tag' // Fallback to icon name if needed or use theme icon URL
    }));

    // For icons, CATEGORY_THEMES uses image URLs, but we might prefer bootstrap icons for pills
    uiCategories = [
        { id: null, name: 'All', icon: 'bi-grid' },
        { id: 2, name: 'Education', icon: 'bi-mortarboard' },
        { id: 1, name: 'Culture', icon: 'bi-palette' },
        { id: 5, name: 'Lifestyle', icon: 'bi-cup-hot' },
        { id: 12, name: 'Events', icon: 'bi-calendar-event' },
        { id: 0, name: 'Community', icon: 'bi-people' }
    ];

    ngOnInit() {
        this.fetchLocations();
        this.fetchEvents();
    }

    fetchLocations() {
        this.locationService.getLocations(1, 100).subscribe({
            next: (res: any) => {
                if (res.isSuccess) {
                    this.locations = res.data;
                }
            }
        });
    }

    fetchEvents() {
        this.isLoading = true;
        const params = {
            PageSize: this.pageSize,
            PageNumber: this.pageNumber,
            SearchTerm: this.searchTerm,
            Category: this.selectedCategory,
            LocationId: this.selectedLocation,
            Status: this.selectedStatus,
            FromDate: this.fromDate,
            ToDate: this.toDate
        };

        this.eventsService.getEvents(params).subscribe({
            next: (res: any) => {
                this.events = res.data || [];
                this.totalCount = res.totalCount;
                this.totalPages = res.totalPages;
                this.isLoading = false;
            },
            error: (err: any) => {
                console.error('Error fetching events:', err);
                this.isLoading = false;
            }
        });
    }

    onSearch() {
        this.pageNumber = 1;
        this.fetchEvents();
    }

    onFilterChange() {
        this.pageNumber = 1;
        this.fetchEvents();
    }

    selectCategory(catId: number | null) {
        this.selectedCategory = catId;
        this.pageNumber = 1;
        this.fetchEvents();
    }

    changePage(newPage: number) {
        if (newPage >= 1 && newPage <= this.totalPages) {
            this.pageNumber = newPage;
            this.fetchEvents();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    getCategoryIcon(catId: number): string {
        const theme = CATEGORY_THEMES[catId];
        return theme ? 'bi-calendar-check' : 'bi-calendar-event';
    }

    getCategoryName(catId: number): string {
        const theme = CATEGORY_THEMES[catId];
        return theme ? theme.label : 'Event';
    }

    getMinPrice(event: EventListItem): number {
        if (!event.tiers || event.tiers.length === 0) return 0;
        const prices = event.tiers.map(t => t.price || 0);
        return Math.min(...prices);
    }
}
