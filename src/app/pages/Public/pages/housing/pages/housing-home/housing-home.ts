import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HousingViewService } from '../../service/housing-view.service';
import { environment } from '../../../../../../environments/environment';
import { ImageService } from '../../../../../../shared/services/image.service';
import { ImgFallbackDirective } from '../../../../../../shared/directives/img-fallback.directive';
import { AuthService } from '../../../../../Authentication/Service/auth';
import { VerificationService } from '../../../settings/services/verification.service';
import { ToastService } from '../../../../../../shared/services/toast.service';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-housing-home',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule, ImgFallbackDirective],
    templateUrl: './housing-home.html',
    styleUrls: ['./housing-home.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HousingHomeComponent implements OnInit {
    private housingService = inject(HousingViewService);
    private cdr = inject(ChangeDetectorRef);
    protected readonly environment = environment;
    protected imageService = inject(ImageService);
    protected authService = inject(AuthService);
    private verificationService = inject(VerificationService);
    private toastService = inject(ToastService);
    private fb = inject(FormBuilder);

    // --- Data ---
    heroPost: any = null;
    homesForSale: any[] = [];
    homesForRent: any[] = [];
    textOnlyListings: any[] = [];
    rssPosts: any[] = [];
    discussionPosts: any[] = [];
    allPosts: any[] = [];
    isLoading = true;
    selectedTab: string = 'explore';

    // --- Permissions & Verification ---
    showVerificationModal = false;
    isSubmittingVerification = false;
    verificationForm!: FormGroup;
    housingTagId: number = 4; // Found from category list, but will verify via search
    selectedDocFile: File | null = null;

    documentTypes = [
        { id: 1, name: 'Government ID' },
        { id: 2, name: 'Utility Bill' },
        { id: 5, name: 'Professional License' },
        { id: 6, name: 'Employee ID Card' },
        { id: 11, name: 'Contract Agreement' },
        { id: 12, name: 'Letter of Recommendation' },
        { id: 99, name: 'Other' }
    ];

    ngOnInit(): void {
        this.initVerificationForm();
        this.loadData();
        this.resolveHousingTagId();
    }

    private initVerificationForm() {
        this.verificationForm = this.fb.group({
            reason: ['', [Validators.required, Validators.minLength(10)]],
            documentType: [1, Validators.required],
            file: [null, Validators.required]
        });
    }

    private resolveHousingTagId() {
        this.verificationService.searchTags('housing').subscribe({
            next: (res: any) => {
                const tag = (res.data || []).find((t: any) => t.name.toLowerCase() === 'housing');
                if (tag) this.housingTagId = tag.id;
            }
        });
    }

    handleContributorAction(event: Event) {
        if (!this.authService.hasHousingPermission()) {
            event.preventDefault();
            event.stopPropagation();
            this.showVerificationModal = true;
            this.cdr.markForCheck();
        }
    }

    onFileSelected(event: any) {
        if (event.target.files.length > 0) {
            this.selectedDocFile = event.target.files[0];
            this.verificationForm.patchValue({ file: this.selectedDocFile });
        }
    }

    submitVerification() {
        if (this.verificationForm.invalid || !this.selectedDocFile) {
            this.verificationForm.markAllAsTouched();
            return;
        }

        this.isSubmittingVerification = true;
        const data = {
            TagId: this.housingTagId,
            Reason: this.verificationForm.value.reason,
            DocumentType: this.verificationForm.value.documentType,
            File: this.selectedDocFile
        };

        this.verificationService.submitVerification(data).subscribe({
            next: (res: any) => {
                this.isSubmittingVerification = false;
                if (res.isSuccess || res.IsSuccess) {
                    this.toastService.success('Verification request submitted successfully!');
                    this.showVerificationModal = false;
                    this.verificationForm.reset({ documentType: 1 });
                    this.selectedDocFile = null;
                } else {
                    this.toastService.error(res.error?.message || 'Submission failed');
                }
                this.cdr.markForCheck();
            },
            error: () => {
                this.isSubmittingVerification = false;
                this.toastService.error('Network error. Please try again.');
                this.cdr.markForCheck();
            }
        });
    }

    closeModal() {
        this.showVerificationModal = false;
        this.cdr.markForCheck();
    }

    loadData(): void {
        this.isLoading = true;
        this.housingService.getHousingHome().subscribe({
            next: (res: any) => {
                try {
                    if (res.isSuccess && res.data) {
                        const data = res.data;

                        // Helper: Strict Media Check
                        const hasMedia = (item: any) => !!(item && item.mediaUrl);

                        // 1. Process Everything
                        const processedSale = (data.forSale || []).map((p: any) => this.processHousingItem(p, 'sale'));
                        const processedRent = (data.forRenting || []).map((p: any) => this.processHousingItem(p, 'rent'));
                        const processedAll = (data.all || []).map((p: any) => this.processHousingItem(p, 'post'));
                        const processedRss = (data.rss || []).map((p: any) => this.processHousingItem(p, 'rss'));
                        this.discussionPosts = (data.discussions || []).map((p: any) => this.processHousingItem(p, 'discussion'));

                        // 2. Distribute to Buckets (Only items WITH media)
                        this.homesForSale = processedSale.filter(hasMedia);
                        this.homesForRent = processedRent.filter(hasMedia);
                        this.allPosts = processedAll.filter(hasMedia);
                        this.rssPosts = processedRss.filter(hasMedia);

                        // 3. Text-Only Collective: Items that failed media check from ALL sources
                        const combinedTextOnly = [
                            ...processedSale.filter((item: any) => !hasMedia(item)),
                            ...processedRent.filter((item: any) => !hasMedia(item)),
                            ...processedAll.filter((item: any) => !hasMedia(item)),
                            ...processedRss.filter((item: any) => !hasMedia(item))
                        ];

                        // Deduplicate by ID just in case
                        const uniqueMap = new Map();
                        combinedTextOnly.forEach(item => uniqueMap.set(item.id, item));
                        this.textOnlyListings = Array.from(uniqueMap.values());

                        // 4. Hero Logic
                        if (data.hero) {
                            this.heroPost = this.processHousingItem(data.hero, 'hero');
                            if (!hasMedia(this.heroPost)) {
                                this.textOnlyListings.unshift(this.heroPost);
                                this.heroPost = null;
                            }
                        } else if (this.homesForSale.length > 0) {
                            this.heroPost = this.homesForSale[0];
                        } else if (this.homesForRent.length > 0) {
                            this.heroPost = this.homesForRent[0];
                        }
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

    private processHousingItem(item: any, type: string): any {
        if (!item) return null;

        // 1. Resolve Title
        const title = item.title || item.Title ||
            (item.numberOfRooms !== undefined ? `${item.numberOfRooms} Bed ${item.numberOfBathrooms} Bath Property` : 'NYC Property');

        // 2. Resolve Description
        let description = item.content || item.description || item.Description || '';
        let displayDescription = description;
        let metadata = null;

        if (description.includes('\n\n\n')) {
            const parts = description.split('\n\n\n');
            displayDescription = parts[0];
            try {
                metadata = JSON.parse(parts[parts.length - 1]);
            } catch (e) { }
        }

        // 3. Resolve Media
        let mediaUrl = null;
        const rawUrl = item.imageUrl || item.ImageUrl || (item.attachments && item.attachments.length > 0 ? (item.attachments[0].url || item.attachments[0]) : null);

        if (rawUrl) {
            mediaUrl = this.imageService.resolveImageUrl(rawUrl, 'housing');
        }

        // 4. Merge Data
        return {
            ...item,
            title,
            displayDescription,
            metadata: metadata || item.metadata,
            mediaUrl: mediaUrl,
            startingPrice: item.startingPrice || item.StartingPrice || item.Price || (metadata ? metadata.Price : 0),
            numberOfRooms: item.numberOfRooms || item.NumberOfRooms || (metadata ? metadata.Rooms : 0),
            numberOfBathrooms: item.numberOfBathrooms || item.NumberOfBathrooms || (metadata ? metadata.Bathrooms : 0),
            size: item.size || item.Size || (metadata ? metadata.SizeSqFt : 0),
            routingPath: (item.startingPrice || item.numberOfRooms || item.location) ? '/public/housing/details' : '/public/posts/details'
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
