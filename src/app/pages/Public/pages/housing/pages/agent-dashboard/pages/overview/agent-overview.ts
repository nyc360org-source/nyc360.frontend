import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HousingService } from '../../../../service/housing.service';
import { ImageService } from '../../../../../../../../shared/services/image.service';

@Component({
    selector: 'app-agent-overview',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './agent-overview.html',
    styleUrls: ['../../agent-dashboard.scss'] // Use the same styles for now
})
export class AgentOverviewComponent implements OnInit {
    private housingService = inject(HousingService);
    public imageService = inject(ImageService);

    stats: any = null;
    trends: any[] = [];
    topNeighborhoods: any[] = [];
    recentInquiries: any[] = [];
    isLoading = true;

    ngOnInit() {
        this.loadDashboardData();
    }

    loadDashboardData() {
        this.isLoading = true;
        this.housingService.getAgentDashboard().subscribe({
            next: (res: any) => {
                const responseData = res.data;
                if (res.isSuccess && responseData) {
                    this.stats = responseData.stats;
                    this.trends = responseData.trends || [];
                    this.topNeighborhoods = responseData.topNeighborhoods || [];
                    this.recentInquiries = responseData.recentInquiries?.data || [];
                }
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
            }
        });
    }

    getTypeLabel(type: number): string {
        return type === 0 ? 'Rent' : 'Sale';
    }

    getStatusClass(status: string): string {
        switch (status?.toLowerCase()) {
            case 'reviewed': return 'status-reviewed';
            case 'pending': return 'status-pending';
            case 'rejected': return 'status-rejected';
            default: return 'status-default';
        }
    }
}
