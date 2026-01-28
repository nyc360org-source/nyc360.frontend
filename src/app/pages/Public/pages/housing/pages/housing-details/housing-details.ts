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

    // --- Enums & Options (Mapped from Create/Edit) ---
    buildingTypeOptions = [
        { id: 0, name: 'Walk-up', icon: 'bi-building' },
        { id: 1, name: 'Elevator', icon: 'bi-building-up' },
        { id: 2, name: 'Townhouse', icon: 'bi-house-heart' },
        { id: 3, name: 'Detached', icon: 'bi-house' }
    ];

    householdTypes = [
        { id: 0, name: 'Individual' },
        { id: 1, name: 'Couple' },
        { id: 2, name: 'Single Family' },
        { id: 3, name: 'Multi Family' }
    ];

    heatingSystems = [
        { id: 0, name: 'Steam Radiator' },
        { id: 1, name: 'Hot Water Central' },
        { id: 2, name: 'Electric Baseboard' },
        { id: 3, name: 'Forced Air' },
        { id: 4, name: 'Heat Pump' },
        { id: 5, name: 'Other' }
    ];

    coolingSystems = [
        { id: 0, name: 'Central AC' },
        { id: 1, name: 'Ductless Mini-Split' },
        { id: 2, name: 'Window Units Allowed' },
        { id: 3, name: 'Through-Wall Units' },
        { id: 4, name: 'No AC' }
    ];

    tempControls = [
        { id: 0, name: 'Individual Thermostat' },
        { id: 1, name: 'Building Shared Control' },
        { id: 2, name: 'Smart Thermostat' }
    ];

    laundryTypes = [
        { id: 0, name: 'In-Unit' },
        { id: 1, name: 'In-Building' },
        { id: 2, name: 'Nearby' }
    ];

    leaseTypes = [
        { id: 0, name: 'Lease' },
        { id: 1, name: 'Sub-lease' },
        { id: 2, name: 'Short-term' },
        { id: 3, name: 'Month-to-month' },
        { id: 4, name: 'Flexible' }
    ];

    housingPrograms = [
        { id: 0, name: 'Section 8 (Housing Choice Voucher)' },
        { id: 1, name: 'CityFHEPS' },
        { id: 2, name: 'FHEPS' },
        { id: 3, name: 'HASA' },
        { id: 4, name: 'SOTA (One-Time Assistance)' },
        { id: 5, name: 'Housing Connect / Lottery' },
        { id: 6, name: 'Other Housing Assistance Programs' },
        { id: 7, name: 'Not Accepted' }
    ];

    buyerPrograms = [
        { id: 0, name: 'Mortgage Financing Accepted' },
        { id: 1, name: 'Conventional Loan' },
        { id: 2, name: 'FHA Loan' },
        { id: 3, name: 'VA Loan' },
        { id: 4, name: 'SONYMA Loan' },
        { id: 5, name: 'Co-op Board Approval' },
        { id: 6, name: 'First-Time Buyer' },
        { id: 7, name: 'Buyer Assistance' },
        { id: 8, name: 'Other Assistance Programs' },
        { id: 9, name: 'Cash-Only' }
    ];

    getLabel(value: number, options: any[]): string {
        const item = options.find(o => o.id === value);
        return item ? item.name : 'Not Specified';
    }

    getProgramLabels(values: number[], programs: any[]): string[] {
        if (!values || values.length === 0) return [];
        return values.map(v => this.getLabel(v, programs)).filter(l => l !== 'Not Specified');
    }

    formatPrice(price: number): string {
        if (price === undefined || price === null) return 'Not Listed';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(price);
    }

    hasFeatures(): boolean {
        // Updated to be always true or just check if property loaded because we will show "Not specified" if false
        return !!this.property;
    }
}
