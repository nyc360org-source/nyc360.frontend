import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HousingService } from '../../service/housing.service';
import { environment } from '../../../../../../environments/environment';
import { ImageService } from '../../../../../../shared/services/image.service';
import { AuthService } from '../../../../../Authentication/Service/auth';
import { VerificationService } from '../../../settings/services/verification.service';
import { ToastService } from '../../../../../../shared/services/toast.service';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-housing-home',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule],
    templateUrl: './housing-home.html',
    styleUrls: ['./housing-home.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HousingHomeComponent implements OnInit {
    private housingService = inject(HousingService);
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
    selectedDocFile: File | null = null;

    occupations = [
        { id: 1854, name: 'Housing Advisor' },
        { id: 1855, name: 'Housing Organization' },
        { id: 1856, name: 'Licensed Agent' }
    ];

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
    }

    private initVerificationForm() {
        this.verificationForm = this.fb.group({
            occupationId: [1856, Validators.required], // Default to Licensed Agent
            reason: ['', [Validators.required, Validators.minLength(10)]],
            documentType: [1, Validators.required],
            file: [null, Validators.required]
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
            TagId: this.verificationForm.value.occupationId,
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
                    this.verificationForm.reset({
                        occupationId: 1856,
                        documentType: 1
                    });
                    this.selectedDocFile = null;
                } else {
                    const errorMessage = res.error?.message || res.Error?.Message || 'Submission failed';
                    this.toastService.error(errorMessage);
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

                        // Process Hero Post
                        this.heroPost = data.hero ? this.processPost(data.hero) : null;

                        // Process Lists
                        const rawSale = data.forSale || [];
                        const rawRent = data.forRenting || [];
                        const rawAll = data.all || [];

                        // Helper: Strict Media Check
                        const hasMedia = (item: any) => {
                            if (!item) return false;
                            // Use pre-calcuated mediaUrl if available
                            if (item.mediaUrl) return true;

                            // Check ImageUrl
                            if (item.imageUrl) {
                                const resolved = this.imageService.resolveImageUrl(item.imageUrl, 'housing');
                                if (resolved && resolved !== this.imageService.DEFAULT_HOUSING) return true;
                            }

                            // Check Attachments
                            if (item.attachments?.length > 0) {
                                for (const att of item.attachments) {
                                    const url = att.url || att;
                                    const resolved = this.imageService.resolveImageUrl(url, 'housing');
                                    if (resolved && resolved !== this.imageService.DEFAULT_HOUSING) return true;
                                }
                            }
                            return false;
                        };

                        // 1. Process Hero
                        let hero = data.hero ? this.processPost(data.hero) : null;

                        // Check if hero has valid mediaUrl (calculated in processPost)
                        if (hero && !hero.mediaUrl) {
                            // If no media, demote to text-only list
                            this.textOnlyListings.push(hero);
                            this.heroPost = null;
                        } else {
                            this.heroPost = hero;
                        }

                        // Helper: Ensure Title
                        const processItem = (item: any) => {
                            if (!item) return item;
                            return {
                                ...item,
                                title: item.title || `${item.numberOfRooms || 0} Bed ${item.numberOfBathrooms || 0} Bath Property`
                            };
                        };

                        this.homesForSale = rawSale.map(processItem).filter(hasMedia);
                        this.homesForRent = rawRent.map(processItem).filter(hasMedia);

                        // Text-Only Strategy: Anything without media goes here
                        const saleNoImg = rawSale.map(processItem).filter((item: any) => !hasMedia(item));
                        const rentNoImg = rawRent.map(processItem).filter((item: any) => !hasMedia(item));
                        // Note: We don't add rawAll no-media here to avoid duplicates if 'all' overlaps with sale/rent

                        this.textOnlyListings = [...saleNoImg, ...rentNoImg];
                        this.rssPosts = (data.rss || []).map((p: any) => this.processPost(p));
                        this.discussionPosts = (data.discussions || []).map((p: any) => this.processPost(p));

                        // Filter 'All Posts' to only show media-rich content in the main grid
                        this.allPosts = rawAll.map((p: any) => this.processPost(p));
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

        // Resolve Best Media URL
        let mediaUrl: string | null = null;

        // 1. Check imageUrl
        if (post.imageUrl) {
            const resolved = this.imageService.resolveImageUrl(post.imageUrl, 'housing');
            if (resolved && resolved !== this.imageService.DEFAULT_HOUSING) {
                mediaUrl = resolved;
            }
        }

        // 2. If no valid imageUrl, check attachments
        if (!mediaUrl && post.attachments && post.attachments.length > 0) {
            for (const att of post.attachments) {
                const url = att.url || att; // Handle object or string
                const resolved = this.imageService.resolveImageUrl(url, 'housing');
                if (resolved && resolved !== this.imageService.DEFAULT_HOUSING) {
                    mediaUrl = resolved;
                    break; // Found a valid one, stop
                }
            }
        }

        return {
            ...post,
            metadata: metadata,
            displayDescription: post.content.split('\n\n\n')[0],
            mediaUrl: mediaUrl
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
