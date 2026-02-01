import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostsService } from '../../../../../posts/services/posts';
import { Router } from '@angular/router';
import { ToastService } from '../../../../../../shared/services/toast.service';

@Component({
    selector: 'app-agent-requests',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './agent-requests.component.html',
    styleUrls: ['./agent-requests.component.scss']
})
export class AgentRequestsComponent implements OnInit {

    private postsService = inject(PostsService);
    private router = inject(Router);
    private toastService = inject(ToastService);

    requests: any[] = [];
    filteredRequests: any[] = [];
    isLoading = false;
    searchQuery = '';

    // Pagination
    currentPage = 1;
    pageSize = 20;

    ngOnInit() {
        this.loadRequests();
    }

    loadRequests() {
        this.isLoading = true;
        this.postsService.getHousingAgentRequests(this.currentPage, this.pageSize).subscribe({
            next: (res: any) => {
                this.isLoading = false;
                if (res.isSuccess && res.data) {
                    // Flatten standard array response if inside "data" or directly
                    const data = (Array.isArray(res.data) ? res.data : (res.data as any).items) || res.data;
                    this.requests = Array.isArray(data) ? data : [];
                    this.applyFilter();
                }
            },
            error: () => {
                this.isLoading = false;
            }
        });
    }

    onSearchChange() {
        this.applyFilter();
    }

    applyFilter() {
        if (!this.searchQuery.trim()) {
            this.filteredRequests = [...this.requests];
            return;
        }
        const query = this.searchQuery.toLowerCase();
        this.filteredRequests = this.requests.filter(req =>
            (req.name && req.name.toLowerCase().includes(query)) ||
            (req.email && req.email.toLowerCase().includes(query)) ||
            (req.housingInfo?.title && req.housingInfo.title.toLowerCase().includes(query))
        );
    }

    getHouseholdType(type: number): string {
        const types = ['Individual', 'Couple', 'Single Family', 'Multi Family'];
        return types[type] || 'Unknown';
    }

    getContactType(type: number): string {
        const types = ['Email', 'Phone', 'Text'];
        return types[type] || 'Email';
    }

    viewPost(postId: number) {
        if (postId) {
            this.router.navigate(['/public/housing/details', postId]);
        }
    }

    copyToClipboard(text: string, label: string) {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            this.toastService.success(`${label} copied to clipboard!`);
        }, () => {
            this.toastService.error(`Failed to copy ${label}`);
        });
    }
}
