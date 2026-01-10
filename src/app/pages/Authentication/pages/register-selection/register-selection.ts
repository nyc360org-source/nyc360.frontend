// src/app/pages/Authentication/pages/register-selection/register-selection.component.ts

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { trigger, style, animate, transition, query, stagger } from '@angular/animations';
import { RegistrationService } from '../../Service/registration-service';
import { CATEGORY_LIST } from '../../../models/category-list';

// ✅ Import the centralized category list

@Component({
  selector: 'app-register-selection',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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

  currentStep: 'selection' | 'form' = 'selection';
  selectedType: string = ''; 
  isOrganization = false;
  
  form!: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;

  selectionOptions = [
    { id: 'visitor', title: 'Visitor', icon: 'bi-airplane-engines', desc: 'Exploring NYC for a visit.' },
    { id: 'new-yorker', title: 'New Yorker', icon: 'bi-houses', desc: 'Living in the five boroughs.' },
    { id: 'organization', title: 'Organization', icon: 'bi-building', desc: 'Business or Non-Profit entity.' }
  ];

  // ✅ 2. Use the imported list instead of hardcoding
  interestsList = CATEGORY_LIST;

  selectedInterestIds: number[] = [];

  onSelect(typeId: string) {
    this.selectedType = typeId;
    this.isOrganization = typeId === 'organization';
    this.currentStep = 'form';
    this.initForm();
  }

  goBack() {
    this.currentStep = 'selection';
    this.errorMessage = null;
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

    if (this.isOrganization) {
      this.form = this.fb.group({
        Name: ['', [Validators.required, Validators.minLength(2)]],
        username: ['', [Validators.required, Validators.minLength(4)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', passwordValidators],
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
      return;
    }

    if (this.selectedInterestIds.length === 0) {
      this.errorMessage = "Please select at least one area of interest.";
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    
    const formValue = this.form.value;

    const finalData = { 
      ...formValue, 
      interests: this.selectedInterestIds 
    };

    if (this.isOrganization) {
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
      this.router.navigate(['/auth/login']); 
    } else {
      this.errorMessage = res.error?.message || 'Registration failed.';
    }
  }

  private handleError(err: any) {
    this.isLoading = false;
    console.error(err);
    this.errorMessage = err.error?.message || 'Network error occurred. Please try again.';
  }

  getFormTitle(): string {
    if (this.selectedType === 'organization') return 'Partner Registration';
    if (this.selectedType === 'new-yorker') return 'Join the Neighborhood';
    return 'Start Your Journey';
  }
}