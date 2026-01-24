import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EventDetailsService } from '../../service/event-details.service';
import { EventDetail } from '../../models/event-details.model';

@Component({
    selector: 'app-event-details',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './event-details.html',
    styleUrls: ['./event-details.scss']
})
export class EventDetailsComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private eventService = inject(EventDetailsService);

    event: EventDetail | null = null;
    isLoading = true;

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.fetchEventDetails(id);
        }
    }

    fetchEventDetails(id: string) {
        this.isLoading = true;
        this.eventService.getEventDetails(id).subscribe({
            next: (data) => {
                this.event = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error fetching event details:', err);
                this.isLoading = false;
            }
        });
    }

    getMinPrice(): number {
        if (!this.event?.Tiers || this.event.Tiers.length === 0) return 0;
        const prices = this.event.Tiers.map(t => t.Price || 0);
        return Math.min(...prices);
    }
}
