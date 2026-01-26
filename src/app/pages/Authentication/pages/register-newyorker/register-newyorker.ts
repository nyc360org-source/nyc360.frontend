import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegistrationService } from '../../Service/registration-service';
import { ToastService } from '../../../../shared/services/toast.service';
import { CATEGORY_LIST } from '../../../models/category-list';
import { AuthSuccessModalComponent } from '../../../../shared/components/auth-success-modal/auth-success-modal.component';
import { JobSearchService } from '../../../Public/pages/jobs/service/job-search';

@Component({
    selector: 'app-register-newyorker',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink, AuthSuccessModalComponent],
    templateUrl: './register-newyorker.html',
    styleUrls: ['./register-newyorker.scss']
})
export class RegisterNewYorkerComponent implements OnInit {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private registrationService = inject(RegistrationService);
    private toastService = inject(ToastService);
    private jobSearchService = inject(JobSearchService);

    form!: FormGroup;
    isLoading = false;

    // Data Lists
    interestsList = CATEGORY_LIST;
    selectedInterestIds: number[] = [];

    // Location Search
    locations: any[] = [];
    isSearchingLocations = false;

    // Modal State
    showModal = false;
    modalTitle = 'Welcome Home!';
    modalMessage = '';

    ngOnInit() {
        this.initForm();
    }

    initForm() {
        this.form = this.fb.group({
            FirstName: ['', [Validators.required, Validators.minLength(2)]],
            LastName: ['', [Validators.required, Validators.minLength(2)]],
            Username: ['', [Validators.required, Validators.minLength(4)]],
            Email: ['', [Validators.required, Validators.email]],
            Password: ['', [Validators.required, Validators.minLength(6), Validators.pattern(/^(?=.*[a-z])(?=.*\d).{6,}$/)]],
            Address: this.fb.group({
                Street: ['', Validators.required],
                BuildingNumber: ['', Validators.required],
                ZipCode: ['', Validators.required],
                LocationId: [null, Validators.required]
            }),
            IsInterestedInVolunteering: [false],
            IsOpenToAttendingLocalEvents: [true],
            FollowNeighborhoodUpdates: [true],
            MakeProfilePublic: [true],
            DisplayNeighborhood: [true],
            AllowMessagesFromVerifiedOrganizations: [true]
        });
    }

    searchLocations(query: string) {
        if (query.length < 2) {
            this.locations = [];
            return;
        }
        this.isSearchingLocations = true;
        this.jobSearchService.searchLocations(query).subscribe({
            next: (res) => {
                this.locations = res.data;
                this.isSearchingLocations = false;
            },
            error: () => this.isSearchingLocations = false
        });
    }

    selectLocation(loc: any, inputElement?: HTMLInputElement) {
        const addressGroup = this.form.get('Address');
        addressGroup?.patchValue({
            LocationId: loc.id,
            ZipCode: loc.zipCode || ''
        });

        // Update the input field to show the selected location
        if (inputElement) {
            inputElement.value = `${loc.neighborhood} (${loc.borough})`;
        }

        this.locations = [];
        this.toastService.success(`Neighborhood set to: ${loc.neighborhood}`);
    }

    toggleInterest(id: number) {
        const index = this.selectedInterestIds.indexOf(id);
        const category = this.interestsList.find(c => c.id === id);
        if (index >= 0) {
            this.selectedInterestIds.splice(index, 1);
            this.toastService.info(`Removed interest: ${category?.name}`);
        } else {
            this.selectedInterestIds.push(id);
            this.toastService.success(`Added interest: ${category?.name}`);
        }
    }

    isSelected(id: number): boolean {
        return this.selectedInterestIds.includes(id);
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.form.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    isAddressFieldInvalid(fieldName: string): boolean {
        const field = this.form.get(`Address.${fieldName}`);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    onSubmit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.scrollToFirstInvalidControl();
            this.toastService.warning('Please complete all required fields.');
            return;
        }

        if (this.selectedInterestIds.length === 0) {
            this.toastService.warning('Please select at least one interest to personalize your neighborhood feed.');
            return;
        }

        this.isLoading = true;
        const formValue = this.form.value;

        const payload = {
            ...formValue,
            Interests: this.selectedInterestIds
        };

        this.registrationService.registerNewYorker(payload).subscribe({
            next: (res) => {
                this.isLoading = false;
                if (res.isSuccess) {
                    this.modalTitle = 'Welcome, New Yorker!';
                    this.modalMessage = 'Your profile has been created. You can now connect with your local community and follow neighborhood updates.';
                    this.showModal = true;
                } else {
                    this.toastService.error(res.error?.message || 'Registration failed.');
                }
            },
            error: (err) => {
                this.isLoading = false;
                this.toastService.error('An error occurred. Please try again.');
            }
        });
    }

    onModalClose() {
        this.showModal = false;
        this.router.navigate(['/auth/login']);
    }

    private scrollToFirstInvalidControl() {
        const firstInvalidControl: HTMLElement = document.querySelector('.ng-invalid[formControlName], .ng-invalid[formArrayName], .ng-invalid textarea, .ng-invalid select') as HTMLElement;
        if (firstInvalidControl) {
            firstInvalidControl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstInvalidControl.focus();
        }
    }
}
