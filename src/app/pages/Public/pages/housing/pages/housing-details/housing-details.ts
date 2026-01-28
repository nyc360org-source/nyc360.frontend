import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { HousingService } from '../../service/housing.service';
import { ImageService } from '../../../../../../shared/services/image.service';
import { ImgFallbackDirective } from '../../../../../../shared/directives/img-fallback.directive';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import { AuthService } from '../../../../../Authentication/Service/auth';

@Component({
    selector: 'app-housing-details',
    standalone: true,
    imports: [CommonModule, RouterModule, ImgFallbackDirective],
    templateUrl: './housing-details.html',
    styleUrls: ['./housing-details.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HousingDetailsComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private housingService = inject(HousingService);
    private cdr = inject(ChangeDetectorRef);
    protected imageService = inject(ImageService);
    private router = inject(Router);
    private authService = inject(AuthService);

    property: any = null;
    similarProperties: any[] = [];
    isLoading = true;
    activeImage: string | null = null;
    currentUserId: number | null = null;

    ngOnInit(): void {
        this.currentUserId = this.authService.getUserId();
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.loadDetails(id);
            }
        });
    }

    get canEdit(): boolean {
        return !!this.property && !!this.currentUserId && this.property.author?.id === this.currentUserId;
    }

    loadDetails(id: string) {
        this.isLoading = true;
        this.cdr.markForCheck();
        window.scrollTo(0, 0);

        this.housingService.getHousingDetails(id).subscribe({
            next: (res: any) => {
                if (res.isSuccess) {
                    this.property = res.data.info;
                    this.similarProperties = res.data.similar || [];

                    if (this.property.attachments?.length > 0) {
                        this.activeImage = this.imageService.resolveImageUrl(this.property.attachments[0], 'housing');
                    } else if (this.property.imageUrl) {
                        this.activeImage = this.imageService.resolveImageUrl(this.property.imageUrl, 'housing');
                    }
                }
                this.isLoading = false;
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('Error loading details:', err);
                this.isLoading = false;
                this.cdr.markForCheck();
            }
        });
    }

    setActiveImage(url: string) {
        this.activeImage = this.imageService.resolveImageUrl(url, 'housing');
    }

    formatPrice(price: number): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(price || 0);
    }

    hasFeatures(): boolean {
        if (!this.property) return false;
        return this.property.isShortTermStayAllowed ||
            this.property.isFamilyAndKidsFriendly ||
            this.property.isAccessibilityFriendly ||
            this.property.isSmokingAllowed;
    }
}
