import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';

@Component({
    selector: 'app-event-details',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './event-details.html',
    styleUrls: ['./event-details.scss']
})
export class EventDetailsComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private http = inject(HttpClient);

    event: any = null;
    isLoading = true;

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.fetchEventDetails(id);
        }
    }

    fetchEventDetails(id: string) {
        this.isLoading = true;
        const url = `${environment.apiBaseUrl}/events/details/${id}`;
        this.http.get<any>(url).subscribe({
            next: (res) => {
                this.event = res.data || res.Data || res;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error fetching event details:', err);
                this.isLoading = false;
                // Mock data for development
                this.event = this.getMockEvent(id);
            }
        });
    }

    getMinPrice(): number {
        if (!this.event?.Tiers || this.event.Tiers.length === 0) return 0;
        const prices = this.event.Tiers.map((t: any) => t.Price || 0);
        return Math.min(...prices);
    }

    getMockEvent(id: any) {
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
