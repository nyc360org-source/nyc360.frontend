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
    officialPosts: any[] = [];
    isLoading = true;

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.isLoading = true;
        this.housingService.getHousingHome().subscribe({
            next: (res: any) => {
                if (res.isSuccess) {
                    this.heroPost = res.data.hero;
                    this.homesForSale = res.data.forSale || [];
                    this.homesForRent = res.data.forRenting || [];
                    // If we had official posts in API, we'd map them here. 
                    // For now, let's use some logic or placeholders if needed, 
                    // or assume they might come in a later API update.
                    // Let's assume some are in Sale/Rent that are official.
                }
                this.isLoading = false;
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('Error fetching housing home:', err);
                this.isLoading = false;
                this.cdr.markForCheck();
            }
        });
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
        }).format(price);
    }
}
