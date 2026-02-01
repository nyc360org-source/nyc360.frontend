
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HousingService } from '../../service/housing.service';
import { ImageService } from '../../../../../../shared/services/image.service';
import { AuthService } from '../../../../../Authentication/Service/auth';

@Component({
    selector: 'app-agent-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './agent-dashboard.html',
    styleUrls: ['./agent-dashboard.scss']
})
export class AgentDashboardComponent implements OnInit {
    private housingService = inject(HousingService);
    public imageService = inject(ImageService);
    public authService = inject(AuthService);

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
                if (res.isSuccess) {
                    this.stats = res.data.stats;
                    this.trends = res.data.trends || [];
                    this.topNeighborhoods = res.data.topNeighborhoods || [];
                    this.recentInquiries = res.data.recentInquiries?.data || [];
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
