// src/app/pages/Authentication/pages/register-selection/register-selection.component.ts

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { trigger, style, animate, transition, query, stagger } from '@angular/animations';
import { RegistrationService } from '../../Service/registration-service';
import { CATEGORY_LIST } from '../../../models/category-list';
import { ToastService } from '../../../../shared/services/toast.service';

export enum ProfitModel {
  ForProfit = 0,
  NonProfit = 1,
  PublicSector = 2,
  PrivateSector = 3
}

export enum OrganizationType {
  None = 0,
  Individual = 1,
  Company = 2,
  Education = 3,
  Government = 4,
  Healthcare = 5,
  Religious = 6,
  CommunityOrganization = 7,
  Startup = 8,
  Other = 99
}

export const IndustryList = [
  { id: 1, name: 'Technology' },
  { id: 2, name: 'Finance' },
  { id: 3, name: 'Healthcare' },
  { id: 4, name: 'Education' },
  { id: 5, name: 'Retail' },
  { id: 6, name: 'Hospitality' },
  { id: 7, name: 'Manufacturing' },
  { id: 8, name: 'Construction' },
  { id: 9, name: 'Transportation' },
  { id: 10, name: 'Media & Entertainment' },
  { id: 11, name: 'Marketing & Advertising' },
  { id: 12, name: 'Real Estate' },
  { id: 13, name: 'Legal' },
  { id: 14, name: 'Government' },
  { id: 15, name: 'Non-Profit' },
  { id: 16, name: 'Energy & Utilities' },
  { id: 17, name: 'Agriculture' },
  { id: 18, name: 'Telecommunications' },
  { id: 19, name: 'Human Resources' },
  { id: 20, name: 'Customer Service' },
  { id: 21, name: 'Sports & Fitness' },
  { id: 22, name: 'Fashion & Apparel' },
  { id: 23, name: 'Food & Beverage' },
  { id: 24, name: 'Automotive' },
  { id: 25, name: 'Aerospace & Defense' },
  { id: 99, name: 'Other' }
];

import { AuthSuccessModalComponent } from '../../../../shared/components/auth-success-modal/auth-success-modal.component';

@Component({
  selector: 'app-register-selection',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AuthSuccessModalComponent],
  templateUrl: './register-selection.html',
  styleUrls: ['./register-selection.scss'],
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.5s cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('0.3s ease', style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ]),
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('0.5s cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class RegisterSelectionComponent {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private registrationService = inject(RegistrationService);
  private toastService = inject(ToastService);

  currentStep: 'selection' | 'form' = 'selection';
  selectedType: string = '';
  isOrganization = false;

  form!: FormGroup;
  isLoading = false;

  // Modal State
  showModal = false;
  modalTitle = 'Account Created!';
  modalMessage = '';


  selectionOptions = [
    { id: 'new-yorker', title: 'New Yorker', icon: 'bi-houses', desc: 'Residents and daily city users' },
    { id: 'business', title: 'Business', icon: 'bi-shop', desc: 'Local businesses and entrepreneurs' },
    { id: 'organization', title: 'Organization', icon: 'bi-building', desc: 'Non-profits, institutions, and civic partners' },
    { id: 'visitor', title: 'Visitor', icon: 'bi-airplane-engines', desc: 'Tourists and short-term city guests' }
  ];

  // ✅ 2. Use the imported list instead of hardcoding
  interestsList = CATEGORY_LIST;

  // Dropdown Options
  profitModels = [
    { value: 0, label: 'For Profit' },
    { value: 1, label: 'Non Profit' },
    { value: 2, label: 'Public Sector' },
    { value: 3, label: 'Private Sector' }
  ];

  organizationTypes = [
    { value: 1, label: 'Individual' },
    { value: 2, label: 'Company' },
    { value: 3, label: 'Education' },
    { value: 4, label: 'Government' },
    { value: 5, label: 'Healthcare' },
    { value: 6, label: 'Religious' },
    { value: 7, label: 'Community Organization' },
    { value: 8, label: 'Startup' },
    { value: 99, label: 'Other' }
  ];

  industries = IndustryList;

  selectedInterestIds: number[] = [];

  onSelect(typeId: string) {
    if (typeId === 'visitor') {
      this.router.navigate(['/auth/register/visitor']);
      return;
    }
    if (typeId === 'business') {
      this.router.navigate(['/auth/register/business']);
      return;
    }
    this.selectedType = typeId;
    this.isOrganization = typeId === 'organization' || typeId === 'business';
    this.currentStep = 'form';
    this.initForm();
  }

  goBack() {
    this.currentStep = 'selection';
    this.form.reset();
    this.selectedInterestIds = [];
  }

  initForm() {
    this.selectedInterestIds = [];

    const passwordValidators = [
      Validators.required,
      Validators.minLength(6),
      Validators.pattern(/^(?=.*[a-z])(?=.*\d).{6,}$/)
    ];

    if (this.selectedType === 'organization') {
      this.form = this.fb.group({
        Name: ['', [Validators.required, Validators.minLength(2)]],
        username: ['', [Validators.required, Validators.minLength(4)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', passwordValidators],
        profitModel: [null, Validators.required],
        organizationType: [null, Validators.required],
        industry: [null, Validators.required]
      });
    } else if (this.selectedType === 'business') {
      this.form = this.fb.group({
        Name: ['', [Validators.required, Validators.minLength(2)]],
        username: ['', [Validators.required, Validators.minLength(4)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', passwordValidators],
        industry: [null, Validators.required]
      });
    } else {
      this.form = this.fb.group({
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
        username: ['', [Validators.required, Validators.minLength(4)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', passwordValidators]
      });
    }
  }

  toggleInterest(id: number | null) {
    if (id === null) return; // Safety check
    const index = this.selectedInterestIds.indexOf(id);
    if (index >= 0) {
      this.selectedInterestIds.splice(index, 1);
    } else {
      this.selectedInterestIds.push(id);
    }
  }

  isSelected(id: number | null): boolean {
    if (id === null) return false;
    return this.selectedInterestIds.includes(id);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastService.warning('Please complete all required fields.');
      return;
    }

    if (this.selectedInterestIds.length === 0) {
      this.toastService.warning('Please select at least one interest.');
      return;
    }

    this.isLoading = true;

    const formValue = this.form.value;

    const finalData = {
      ...formValue,
      interests: this.selectedInterestIds
    };

    if (this.isOrganization) {
      // For Business, defaults to 0
      if (this.selectedType === 'business') {
        finalData.organizationType = 0;
        finalData.profitModel = 0;
      }

      this.registrationService.registerOrganization(finalData).subscribe({
        next: (res) => this.handleSuccess(res),
        error: (err) => this.handleError(err)
      });
    } else {
      const payload = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        username: formValue.username,
        email: formValue.email,
        password: formValue.password,
        interests: this.selectedInterestIds,
        userType: (this.selectedType === 'new-yorker' ? 'NewYorker' : 'Visitor') as 'NewYorker' | 'Visitor'
      };

      this.registrationService.registerNormalUser(payload).subscribe({
        next: (res) => this.handleSuccess(res),
        error: (err) => this.handleError(err)
      });
    }
  }

  private handleSuccess(res: any) {
    this.isLoading = false;
    if (res.isSuccess) {
      this.modalTitle = 'Account Created!';
      this.modalMessage = 'Your registration was successful. Please check your email inbox to confirm your account before logging in.';
      this.showModal = true;
    } else {
      this.toastService.error(res.error?.message || 'Registration failed.');
    }
  }

  onModalClose() {
    this.showModal = false;
    this.router.navigate(['/auth/login']);
  }

  private handleError(err: any) {
    this.isLoading = false;
    console.error(err);
    this.toastService.error(err.error?.message || 'Network error occurred. Please try again.');
  }

  getFormTitle(): string {
    if (this.selectedType === 'organization') return 'Partner Registration';
    if (this.selectedType === 'business') return 'Business Details';
    if (this.selectedType === 'new-yorker') return 'Join the Neighborhood';
    return 'Start Your Journey';
  }
}