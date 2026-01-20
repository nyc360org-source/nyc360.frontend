import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MyOffersService } from '../../service/my-offers';
import { ToastService } from '../../../../../../shared/services/toast.service';

@Component({
  selector: 'app-edit-offer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-offer.html',
  styleUrls: ['./edit-offer.scss']
})
export class EditOfferComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private locationService = inject(Location);
  private offersService = inject(MyOffersService);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef); // Inject CDR

  offerId!: number;
  editForm!: FormGroup;
  isLoading = true;
  isSubmitting = false;

  // القوائم (Dropdowns)
  workArrangements = [
    { id: 0, name: 'On-Site' },
    { id: 1, name: 'Remote' },
    { id: 2, name: 'Hybrid' }
  ];

  employmentTypes = [
    { id: 0, name: 'Full Time' },
    { id: 1, name: 'Part Time' },
    { id: 2, name: 'Contract' },
    { id: 3, name: 'Internship' }
  ];

  employmentLevels = [
    { id: 0, name: 'Entry Level' },
    { id: 1, name: 'Mid Level' },
    { id: 2, name: 'Senior' },
    { id: 3, name: 'Manager' },
    { id: 4, name: 'Director' }
  ];

  selectedLocationName: string = '';

  ngOnInit() {
    this.offerId = Number(this.route.snapshot.paramMap.get('id'));
    this.initForm();
    this.loadOfferDetails();
  }

  initForm() {
    this.editForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      requirements: [''],
      benefits: [''],
      responsibilities: [''],
      salaryMin: [0, [Validators.required, Validators.min(0)]],
      salaryMax: [0, [Validators.required, Validators.min(0)]],
      workArrangement: [0, Validators.required],
      employmentType: [0, Validators.required],
      employmentLevel: [1, Validators.required],
      locationId: [0, Validators.required]
    });
  }

  loadOfferDetails() {
    this.offersService.getOfferById(this.offerId).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data?.offer) {
          const offer = res.data.offer;

          if (offer.location) {
            this.selectedLocationName = offer.location.neighborhood || offer.location.borough;
          }

          this.editForm.patchValue({
            title: offer.title,
            description: offer.description,
            requirements: offer.requirements,
            benefits: offer.benefits,
            responsibilities: offer.responsibilities,
            salaryMin: offer.salaryMin,
            salaryMax: offer.salaryMax,
            workArrangement: offer.workArrangement,
            employmentType: offer.employmentType,
            employmentLevel: offer.employmentLevel,
            locationId: offer.location?.id
          });
        }
        this.isLoading = false;
        this.cdr.detectChanges(); // Force update
      },
      error: () => {
        this.toastService.error('Failed to load offer details');
        this.locationService.back();
        this.cdr.detectChanges(); // Force update
      }
    });
  }

  onSubmit() {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formValue = this.editForm.value;

    const payload = {
      Title: formValue.title,
      Description: formValue.description,
      Requirements: formValue.requirements,
      Benefits: formValue.benefits,
      Responsibilities: formValue.responsibilities,
      SalaryMin: Number(formValue.salaryMin),
      SalaryMax: Number(formValue.salaryMax),
      WorkArrangement: Number(formValue.workArrangement),
      EmploymentType: Number(formValue.employmentType),
      EmploymentLevel: Number(formValue.employmentLevel),
      LocationId: Number(formValue.locationId)
    };

    this.offersService.updateOffer(this.offerId, payload).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toastService.success('Job offer updated successfully!');
          this.router.navigate(['/public/profession/my-offers']);
        } else {
          this.toastService.error(res.error?.message || 'Update failed');
        }
        this.isSubmitting = false;
        this.cdr.detectChanges(); // Force update
      },
      error: () => {
        this.toastService.error('Something went wrong');
        this.isSubmitting = false;
        this.cdr.detectChanges(); // Force update
      }
    });
  }

  // ... (goBack)
  goBack() {
    this.locationService.back();
  }
}