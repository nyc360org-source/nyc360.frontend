import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../../../environments/environment';
import { ToastService } from '../../../../../../shared/services/toast.service';

@Component({
    selector: 'app-create-event',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './create-event.html',
    styleUrls: ['./create-event.scss']
})
export class CreateEventComponent implements OnInit {
    private fb = inject(FormBuilder);
    private http = inject(HttpClient);
    private router = inject(Router);
    private toastService = inject(ToastService);
    private cdr = inject(ChangeDetectorRef);

    eventForm: FormGroup;
    isSubmitting = false;
    selectedFiles: File[] = [];
    bannerPreviewUrl: string | null = null;

    categories = [
        { id: 1, name: 'Music', icon: 'bi-music-note-beamed' },
        { id: 2, name: 'Theater', icon: 'bi-theater-masks' },
        { id: 3, name: 'Sports', icon: 'bi-trophy' },
        { id: 4, name: 'Food & Drink', icon: 'bi-cup-hot' },
        { id: 5, name: 'Networking', icon: 'bi-people' },
        { id: 6, name: 'Community', icon: 'bi-globe' },
        { id: 7, name: 'Outdoor', icon: 'bi-tree' },
        { id: 8, name: 'Dance', icon: 'bi-activity' }
    ];

    visibilityOptions = [
        { id: 1, name: 'Public', description: 'Available to everyone' },
        { id: 2, name: 'Private (No Security)', description: 'Only with link' },
        { id: 3, name: 'Private (Special URL)', description: 'Secure access link' },
        { id: 4, name: 'Private (Password)', description: 'Requires password' },
        { id: 5, name: 'Private (Approval)', description: 'Owner must approve' }
    ];

    constructor() {
        this.eventForm = this.fb.group({
            Title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
            Description: ['', [Validators.required, Validators.minLength(20)]],
            Category: [null, Validators.required],
            StartDateTime: [null, Validators.required],
            EndDateTime: [null, Validators.required],
            VenueName: ['', Validators.required],
            Address: this.fb.group({
                AddressId: [0],
                LocationId: [0],
                Street: ['', Validators.required],
                BuildingNumber: [''],
                ZipCode: ['', [Validators.required, Validators.pattern(/^[0-9]{5}(?:-[0-9]{4})?$/)]]
            }),
            Visibility: [1, Validators.required],
            AccessPassword: [''],
            Tiers: this.fb.array([])
        }, { validators: this.dateRangeValidator });

        this.eventForm.get('Visibility')?.valueChanges.subscribe(val => {
            const passwordCtrl = this.eventForm.get('AccessPassword');
            if (val == 4) {
                passwordCtrl?.setValidators([Validators.required, Validators.minLength(4)]);
            } else {
                passwordCtrl?.clearValidators();
            }
            passwordCtrl?.updateValueAndValidity();
        });
    }

    ngOnInit() {
        this.addTier();
    }

    dateRangeValidator(control: AbstractControl): ValidationErrors | null {
        const start = control.get('StartDateTime')?.value;
        const end = control.get('EndDateTime')?.value;
        if (start && end && new Date(start) >= new Date(end)) {
            return { dateRangeInvalid: true };
        }
        return null;
    }

    get tiers() {
        return this.eventForm.get('Tiers') as FormArray;
    }

    addTier() {
        const tierGroup = this.fb.group({
            Id: [0],
            Name: ['', Validators.required],
            Description: [''],
            Price: [0, [Validators.required, Validators.min(0)]],
            QuantityAvailable: [10, [Validators.required, Validators.min(1)]],
            MinPerOrder: [1, [Validators.required, Validators.min(1)]],
            MaxPerOrder: [10, [Validators.required, Validators.min(1)]],
            SaleStart: [null],
            SaleEnd: [null]
        });
        this.tiers.push(tierGroup);
    }

    removeTier(index: number) {
        if (this.tiers.length > 1) {
            this.tiers.removeAt(index);
        }
    }

    onFileSelect(event: any) {
        if (event.target.files.length > 0) {
            this.handleFiles(Array.from(event.target.files) as File[]);
        }
    }

    onFileDrop(event: DragEvent) {
        event.preventDefault();
        if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
            this.handleFiles(Array.from(event.dataTransfer.files) as File[]);
        }
    }

    private handleFiles(files: File[]) {
        this.selectedFiles = [...this.selectedFiles, ...files];

        // Update preview for the live card
        if (this.selectedFiles.length > 0) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.bannerPreviewUrl = e.target.result;
                this.cdr.detectChanges();
            };
            reader.readAsDataURL(this.selectedFiles[0]);
        }
    }

    removeFile(index: number) {
        this.selectedFiles.splice(index, 1);
        if (this.selectedFiles.length === 0) {
            this.bannerPreviewUrl = null;
        } else if (index === 0) {
            // If we removed the first file, update the preview to the new first file
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.bannerPreviewUrl = e.target.result;
                this.cdr.detectChanges();
            };
            reader.readAsDataURL(this.selectedFiles[0]);
        }
    }

    getCategoryIcon(id: any): string {
        const cat = this.categories.find(c => c.id == id);
        return cat ? cat.icon : 'bi-calendar-event';
    }

    getCategoryName(id: any): string {
        const cat = this.categories.find(c => c.id == id);
        return cat ? cat.name : 'Uncategorized';
    }

    getMinPrice(): number {
        const prices = this.tiers.value.map((t: any) => t.Price || 0);
        return prices.length > 0 ? Math.min(...prices) : 0;
    }

    getMaxPrice(): number {
        const prices = this.tiers.value.map((t: any) => t.Price || 0);
        return prices.length > 0 ? Math.max(...prices) : 0;
    }

    onSubmit() {
        if (this.eventForm.invalid) {
            this.eventForm.markAllAsTouched();
            if (this.eventForm.errors?.['dateRangeInvalid']) {
                this.toastService.error('Error: Event end date must be after start date.');
            } else {
                this.toastService.error('Required fields are missing or invalid.');
            }
            return;
        }

        this.isSubmitting = true;
        const formData = new FormData();
        const value = this.eventForm.value;

        formData.append('Title', value.Title);
        formData.append('Description', value.Description);
        formData.append('Category', value.Category.toString());
        formData.append('StartDateTime', value.StartDateTime);
        formData.append('EndDateTime', value.EndDateTime);
        formData.append('VenueName', value.VenueName);
        formData.append('Visibility', value.Visibility.toString());

        if (value.AccessPassword) {
            formData.append('AccessPassword', value.AccessPassword);
        }

        Object.keys(value.Address).forEach(key => {
            formData.append(`Address.${key}`, (value.Address as any)[key]);
        });

        value.Tiers.forEach((tier: any, index: number) => {
            Object.keys(tier).forEach(key => {
                if (tier[key] !== null && tier[key] !== undefined) {
                    formData.append(`Tiers[${index}].${key}`, tier[key]);
                }
            });
        });

        this.selectedFiles.forEach(file => {
            formData.append('Attachments', file);
        });

        const url = `${environment.apiBaseUrl}/events/create`;
        this.http.post<any>(url, formData).subscribe({
            next: (res) => {
                this.isSubmitting = false;
                const success = res.isSuccess || res.IsSuccess;
                const errorMsg = (res.Error?.Message || res.error?.message || 'Unexpected server error');

                if (success) {
                    this.toastService.success('🎊 Success! Your event has been created and published.');
                    this.router.navigate(['/public/home']);
                } else {
                    this.toastService.error(`Failed: ${errorMsg}`);
                }
            },
            error: (err) => {
                this.isSubmitting = false;
                const serverError = err.error?.Error?.Message || err.error?.error?.message || 'Server connection failed.';
                this.toastService.error(`Network Error: ${serverError}`);
            }
        });
    }
}
