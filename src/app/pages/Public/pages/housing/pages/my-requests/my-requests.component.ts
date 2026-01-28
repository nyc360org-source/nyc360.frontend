import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PostsService } from '../../../posts/services/posts';

@Component({
    selector: 'app-my-requests',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './my-requests.component.html',
    styleUrls: ['./my-requests.component.scss']
})
export class MyRequestsComponent implements OnInit {

    private postsService = inject(PostsService);
    private router = inject(Router);

    requests: any[] = [];
    isLoading = false;

    // Pagination
    currentPage = 1;
    pageSize = 20;

    ngOnInit() {
        this.loadRequests();
    }

    loadRequests() {
        this.isLoading = true;
        this.postsService.getMyHousingRequests(this.currentPage, this.pageSize).subscribe({
            next: (res: any) => {
                this.isLoading = false;
                if (res.isSuccess && res.data) {
                    const data = (Array.isArray(res.data) ? res.data : (res.data as any).items) || res.data;
                    this.requests = Array.isArray(data) ? data : [];
                }
            },
            error: () => {
                this.isLoading = false;
            }
        });
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
}
