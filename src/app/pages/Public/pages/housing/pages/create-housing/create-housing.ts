import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { PostsService } from '../../../../pages/posts/services/posts';
import { HousingService } from '../../service/housing.service';
import { ToastService } from '../../../../../../shared/services/toast.service';

@Component({
    selector: 'app-create-housing',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './create-housing.html',
    styleUrls: ['./create-housing.scss']
})
export class CreateHousingComponent implements OnInit {
    private fb = inject(FormBuilder);
    private postsService = inject(PostsService);
    private housingService = inject(HousingService);
    private router = inject(Router);
    private toastService = inject(ToastService);
    private cdr = inject(ChangeDetectorRef);

    form: FormGroup;
    isSubmitting = false;

    // Enums for Housing Type
    housingTypes = [
        { id: 0, name: 'Apartment', icon: 'bi-building' },
        { id: 1, name: 'House', icon: 'bi-house' },
        { id: 2, name: 'Townhouse', icon: 'bi-house-heart' },
        { id: 3, name: 'Studio', icon: 'bi-door-open' },
        { id: 4, name: 'Room', icon: 'bi-person-badge' }
    ];

    selectedFiles: File[] = [];
    imagePreviews: string[] = [];

    // Search Logic: Location
    locationSearch$ = new Subject<string>();
    locationResults: any[] = [];
    selectedLocation: any = null;
    showLocationDropdown = false;

    // Search Logic: Tags
    tagSearch$ = new Subject<string>();
    tagResults: any[] = [];
    selectedTags: any[] = [];
    showTagDropdown = false;

    constructor() {
        this.form = this.fb.group({
            Title: ['', [Validators.required, Validators.minLength(5)]],
            Content: ['', [Validators.required, Validators.minLength(20)]],
            IsRenting: [true, Validators.required],
            NumberOfRooms: [1, [Validators.required, Validators.min(0)]],
            NumberOfBathrooms: [1, [Validators.required, Validators.min(0)]],
            Size: [0, [Validators.required, Validators.min(1)]],
            StartingPrice: [0, [Validators.required, Validators.min(1)]],
            Type: [0, Validators.required],
            locationInput: ['', Validators.required],
            tagInput: ['']
        });
    }

    ngOnInit() {
        this.setupSearch();
    }

    setupSearch() {
        this.locationSearch$.pipe(
            debounceTime(400),
            distinctUntilChanged(),
            switchMap(term => {
                if (!term || term.length < 2) return of([]);
                return this.postsService.searchLocations(term).pipe(catchError(() => of([])));
            })
        ).subscribe((res: any) => {
            const data = (res as any).data || [];
            this.locationResults = data;
            this.showLocationDropdown = this.locationResults.length > 0;
            this.cdr.detectChanges();
        });

        this.tagSearch$.pipe(
            debounceTime(400),
            distinctUntilChanged(),
            switchMap(term => {
                if (!term || term.length < 2) return of([]);
                return this.postsService.searchTags(term).pipe(catchError(() => of([])));
            })
        ).subscribe((res: any) => {
            const data = (res as any).data || [];
            this.tagResults = data;
            this.showTagDropdown = this.tagResults.length > 0;
            this.cdr.detectChanges();
        });
    }

    // Files
    onFileSelect(event: any) {
        if (event.target.files) {
            const files = Array.from(event.target.files) as File[];
            this.selectedFiles = [...this.selectedFiles, ...files];
            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = (e: any) => {
                    this.imagePreviews.push(e.target.result);
                    this.cdr.detectChanges();
                };
                reader.readAsDataURL(file);
            });
        }
    }

    removeFile(index: number) {
        this.selectedFiles.splice(index, 1);
        this.imagePreviews.splice(index, 1);
    }

    // Search handlers
    onLocationType(event: any) { this.locationSearch$.next(event.target.value); }
    selectLocation(loc: any) {
        this.selectedLocation = loc;
        this.form.patchValue({ locationInput: loc.neighborhoodNet || loc.borough });
        this.showLocationDropdown = false;
    }

    onTagType(event: any) { this.tagSearch$.next(event.target.value); }
    selectTag(tag: any) {
        if (!this.selectedTags.find(t => t.id === tag.id)) {
            this.selectedTags.push(tag);
        }
        this.form.patchValue({ tagInput: '' });
        this.showTagDropdown = false;
    }
    removeTag(index: number) { this.selectedTags.splice(index, 1); }

    onSubmit() {
        if (this.form.invalid || !this.selectedLocation) {
            if (!this.selectedLocation) {
                this.form.get('locationInput')?.setErrors({ required: true });
            }
            this.form.markAllAsTouched();
            this.toastService.error('Please fix the errors in the form');
            return;
        }

        this.isSubmitting = true;
        const payload = {
            ...this.form.value,
            LocationsId: this.selectedLocation.id,
            Tags: this.selectedTags.map(t => t.id),
            Attachments: this.selectedFiles
        };

        this.housingService.createHousingPost(payload).subscribe({
            next: (res: any) => {
                this.isSubmitting = false;
                if (res.isSuccess) {
                    this.toastService.success('Housing ad created successfully!');
                    this.router.navigate(['/public/category/housing']);
                } else {
                    this.toastService.error(res.error?.message || 'Submission failed');
                }
            },
            error: () => {
                this.isSubmitting = false;
                this.toastService.error('Server error, please try again later');
            }
        });
    }
}
