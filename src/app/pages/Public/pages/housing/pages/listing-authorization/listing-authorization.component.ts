import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HousingAuthService } from '../../service/housing-auth.service';
import { ToastService } from '../../../../../../shared/services/toast.service';
import { AuthService } from '../../../../../Authentication/Service/auth';

@Component({
    selector: 'app-listing-authorization',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './listing-authorization.html',
    styleUrls: ['./listing-authorization.scss']
})
export class ListingAuthorizationComponent implements OnInit {
    private fb = inject(FormBuilder);
    private housingService = inject(HousingAuthService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private toastService = inject(ToastService);

    form: FormGroup;
    selectedFiles: File[] = [];
    listingId: number | null = null;
    isSubmitting = false;
    triedToSubmit = false;

    // Options for dropdowns
    authorizationTypes = [
        { id: 0, name: 'Individual Authorization' },
        { id: 1, name: 'Business Authorization' },
        { id: 2, name: 'Organization Authorization' }
    ];

    documentTypes = [
        { id: 0, name: 'Property Deed or Title' },
        { id: 1, name: 'Signed Lease Agreement' },
        { id: 2, name: 'Owner Authorization Letter' },
        { id: 3, name: 'Listing Agreement (Agent or Agency)' },
        { id: 4, name: 'Broker Authorization Form' },
        { id: 5, name: 'Leasing Agreement' },
        { id: 6, name: 'Property Management Agreement' },
        { id: 7, name: 'Government-Issued ID Driver\'s License' },
        { id: 8, name: 'Government-Issued State ID' },
        { id: 9, name: 'Government-Issued Passport' },
        { id: 10, name: 'Real Estate Agent or Brokerage License' },
        { id: 11, name: 'Business Registration Certificate' },
        { id: 12, name: 'Organization Registration Certificate' }
    ];

    constructor() {
        this.form = this.fb.group({
            FullName: ['', Validators.required],
            OrganizationName: [''],
            Email: ['', [Validators.required, Validators.email]],
            PhoneNumber: ['', Validators.required],

            PreferredContactDate: [null, Validators.required],
            PreferredContactTime: [null, Validators.required],
            PreferredVirtualTourDate: [null],
            PreferredVirtualTourTime: [null],
            PreferredInPersonTourDate: [null],
            PreferredInPersonTourTime: [null],

            AuthorizationType: [null, Validators.required],
            ListingAuthorizationDocument: [null, Validators.required],
            AuthorizationValidationDate: [null],
            SaveThisAuthorizationForFutureListings: [true]
        });
    }

    private authService = inject(AuthService);

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            if (params['id']) {
                this.listingId = Number(params['id']);
            } else {
                console.warn('Missing listing ID');
            }
        });

        // Pre-fill user data
        const userInfo = this.authService.getFullUserInfo();
        if (userInfo) {
            this.form.patchValue({
                FullName: `${userInfo.firstName} ${userInfo.lastName}`.trim(),
                Email: userInfo.email,
                PhoneNumber: userInfo.phoneNumber || ''
            });
        }
    }

    onFileSelect(event: any) {
        if (event.target.files) {
            const files = Array.from(event.target.files) as File[];
            this.selectedFiles = [...this.selectedFiles, ...files];
        }
    }

    removeFile(index: number) {
        this.selectedFiles.splice(index, 1);
    }

    onSubmit() {
        this.triedToSubmit = true;
        console.log('ListingAuthorization: onSubmit called');

        if (!this.listingId) {
            this.toastService.error('Missing listing ID. Please go back to detail page and try again.');
            return;
        }

        if (this.form.invalid) {
            console.log('ListingAuthorization: Form is invalid', this.form.errors);
            this.form.markAllAsTouched();
            this.toastService.error('Please fill all required fields correctly.');

            // Scroll to the first invalid element
            const firstInvalid = document.querySelector('.is-invalid, .ng-invalid');
            if (firstInvalid) {
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // Enforce document upload
        if (this.selectedFiles.length === 0) {
            this.toastService.error('Please upload at least one authorization document.');
            const uploadZone = document.querySelector('.upload-wrapper');
            if (uploadZone) {
                uploadZone.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        console.log('ListingAuthorization: Form valid, submitting...');
        this.isSubmitting = true;
        const formVal = this.form.value;

        const payload = {
            HouseListingId: this.listingId,
            ...formVal,
            Attachments: this.selectedFiles
        };

        this.housingService.createHousingAuthorization(payload).subscribe({
            next: (res: any) => {
                this.isSubmitting = false;
                if (res?.isSuccess || res?.IsSuccess) { // handling different casing from backend if unsure
                    this.toastService.success('Authorization submitted successfully!');
                    this.router.navigate(['/public/housing/details', this.listingId]);
                } else {
                    this.toastService.error(res?.Error?.Message || res?.error?.message || 'Submission failed');
                }
            },
            error: (err) => {
                this.isSubmitting = false;
                console.error(err);
                this.toastService.error('An error occurred while submitting authorization.');
            }
        });
    }
}
