import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HousingService } from '../../service/housing.service';
import { environment } from '../../../../../../environments/environment';
import { ImageService } from '../../../../../../shared/services/image.service';
import { ImgFallbackDirective } from '../../../../../../shared/directives/img-fallback.directive';

@Component({
    selector: 'app-housing-home',
    standalone: true,
    imports: [CommonModule, RouterModule, ImgFallbackDirective],
    templateUrl: './housing-home.html',
    styleUrls: ['./housing-home.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HousingHomeComponent implements OnInit {
    private housingService = inject(HousingService);
    private cdr = inject(ChangeDetectorRef);
    protected readonly environment = environment;
    protected imageService = inject(ImageService);

    // --- Data ---
    heroPost: any = null;
    homesForSale: any[] = [];
    homesForRent: any[] = [];
    rssPosts: any[] = [];
    discussionPosts: any[] = [];
    allPosts: any[] = [];
    isLoading = true;
    selectedTab: string = 'explore';

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.isLoading = true;
        this.housingService.getHousingHome().subscribe({
            next: (res: any) => {
                try {
                    if (res.isSuccess && res.data) {
                        const data = res.data;

                        // Process Hero Post
                        this.heroPost = data.hero ? this.processPost(data.hero) : null;

                        // Process Lists
                        this.homesForSale = data.forSale || [];
                        this.homesForRent = data.forRenting || [];
                        this.rssPosts = (data.rss || []).map((p: any) => this.processPost(p));
                        this.discussionPosts = (data.discussions || []).map((p: any) => this.processPost(p));
                        this.allPosts = (data.all || []).map((p: any) => this.processPost(p));
                    }
                } catch (error) {
                    console.error('Error processing housing data:', error);
                } finally {
                    this.isLoading = false;
                    this.cdr.markForCheck();
                }
            },
            error: (err) => {
                console.error('Error fetching housing home:', err);
                this.isLoading = false;
                this.cdr.markForCheck();
            }
        });
    }

    private processPost(post: any): any {
        if (!post || !post.content) return post;

        const metadata = this.getPostMetadata(post.content);
        return {
            ...post,
            metadata: metadata,
            displayDescription: post.content.split('\n\n\n')[0]
        };
    }

    // --- Helpers ---
    getPostMetadata(content: string): any {
        try {
            const parts = content.split('\n\n\n');
            if (parts.length > 1) {
                return JSON.parse(parts[parts.length - 1]);
            }
        } catch (e) { }
        return null;
    }

    formatPrice(price: number): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(price || 0);
    }

    isVideo(url: string): boolean {
        if (!url) return false;
        const lower = url.toLowerCase();
        return lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.ogg') || lower.endsWith('.mov');
    }
}
