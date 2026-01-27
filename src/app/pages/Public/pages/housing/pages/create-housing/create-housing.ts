import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { PostsService } from '../../../../pages/posts/services/posts'; // Corrected path to point to Public/pages/posts/services/posts
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

    // --- Enums & Options ---
    listingTypeOptions = [
        { value: true, label: 'For Rent', icon: 'bi-key' },
        { value: false, label: 'For Sale', icon: 'bi-house-door' }
    ];

    propertyTypes = [
        { id: 0, name: 'Apartment', icon: 'bi-building' },
        { id: 1, name: 'House', icon: 'bi-house' },
        { id: 2, name: 'Townhouse', icon: 'bi-house-heart' },
        { id: 3, name: 'Studio', icon: 'bi-door-open' },
        { id: 4, name: 'Room', icon: 'bi-person-badge' }
    ];

    householdTypes = [
        { id: 0, name: 'Individual' },
        { id: 1, name: 'Couple' },
        { id: 2, name: 'Single Family' },
        { id: 3, name: 'Multi Family' }
    ];

    buildingTypes = [
        { id: 0, name: 'Walk-up' },
        { id: 1, name: 'Elevator' },
        { id: 2, name: 'Townhouse' },
        { id: 3, name: 'Detached' }
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
        { id: 0, name: 'In Unit' },
        { id: 1, name: 'In Building' },
        { id: 2, name: 'Nearby' }
    ];

    leaseTypes = [
        { id: 0, name: 'Lease' },
        { id: 1, name: 'Sub-lease' },
        { id: 2, name: 'Short-term' },
        { id: 3, name: 'Month-to-month' }, // Assumed
        { id: 4, name: 'Flexible' }
    ];

    utilityOptions = [
        'Heat', 'Hot Water', 'Gas', 'Electricity', 'Internet', 'Cable'
    ];

    nearbySubwayOptions = [
        '1', '2', '3', '4', '5', '6', '7', 'A', 'C', 'E', 'B', 'D', 'F', 'M', 'G', 'J', 'Z', 'L', 'N', 'Q', 'R', 'W', 'S'
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

    // Detailed Transportation Options grouped by category
    transportationGroups = [
        {
            category: 'Subway Lines',
            icon: 'bi-train-front',
            options: ['(1)/(2)/(3)', '(4)/(5)/(6)', '7', '(A)/(C)/(E)', 'B D F M', 'G', 'J Z', 'L', 'N Q R W', 'S']
        },
        {
            category: 'Bus Access',
            icon: 'bi-bus-front',
            options: ['Local Bus', 'Limited Bus', 'Select Bus Service (SBS)', '24-Hour Bus Route']
        },
        {
            category: 'Regional Rail',
            icon: 'bi-train-lightrail-front',
            options: ['LIRR', 'Metro-North', 'PATH']
        },
        {
            category: 'Ferry',
            icon: 'bi-water',
            options: ['NYC Ferry', 'Staten Island Ferry']
        },
        {
            category: 'Bike & Micromobility',
            icon: 'bi-bicycle',
            options: ['Citi Bike Nearby', 'Protected Bike Lanes', 'Scooter Friendly Area']
        },
        {
            category: 'Car Access',
            icon: 'bi-car-front',
            options: ['Easy Highway Access', 'Street Parking Available', 'Garage Parking Nearby']
        }
    ];

    // --- Files ---
    selectedFiles: File[] = [];
    imagePreviews: string[] = [];

    // --- Search ---
    locationSearch$ = new Subject<string>();
    locationResults: any[] = [];
    selectedLocation: any = null;
    showLocationDropdown = false;

    tagSearch$ = new Subject<string>();
    tagResults: any[] = [];
    selectedTags: any[] = [];
    showTagDropdown = false;

    constructor() {
        this.form = this.fb.group({
            // Core
            IsRenting: [true, Validators.required],
            Type: [0, Validators.required],
            HouseholdType: [0], // Default Individual
            MoveInDate: [null, Validators.required],
            MoveOutDate: [null],

            // Location
            locationInput: ['', Validators.required], // Neighborhood search
            Address: this.fb.group({
                Street: [''], // Optional to match UI
                BuildingNumber: [''],
                ZipCode: ['', [Validators.pattern(/^\d{5}$/)]]
            }),
            UnitNumber: [''],
            GoogleMapLink: [''],
            NearbySubwayLines: [[]], // Array of strings

            // Details
            NumberOfRooms: [1, [Validators.min(0)]],
            NumberOfBathrooms: [1, [Validators.min(0)]],
            MaxOccupants: [null],
            Size: [null], // sqft
            FloorLevel: [null],
            YearBuilt: [null],
            RenovatedIn: [null],
            BuildingType: [0],

            // Financials
            StartingPrice: [null, [Validators.required, Validators.min(0)]],
            SecurityDeposit: [null],
            BrokerFee: [null],
            MonthlyCostRange: [null],

            // Enums
            HeatingSystem: [null],
            CoolingSystem: [null],
            TemperatureControl: [null],
            LaundryType: [null],

            // Booleans / Features (Toggles)
            IsShortTermStayAllowed: [false],
            IsShortStayEligible: [false],
            IsFurnished: [false],
            IsAcceptsHousingVouchers: [false],
            IsFamilyAndKidsFriendly: [false],
            IsPetsFriendly: [false],
            IsAccessibilityFriendly: [false],
            IsSmokingAllowed: [false],

            UtilitiesIncluded: [[]], // Array string

            // Programs
            AcceptedHousingPrograms: [[]], // Array int
            AcceptedBuyerPrograms: [[]], // Array int

            // Description
            Title: ['', [Validators.required, Validators.minLength(5)]],
            Description: ['', [Validators.required, Validators.minLength(20)]],

            // Renting Specifics
            RentingLeaseType: [0],
            RentingIsShared: [false],
            // Shared details
            PrivacyType: ['Private Unit'], // "Private Unit" or "Shared Unit"
            RentingIsSharedBathroom: [false], // true/false
            RentingIsSharedKitchen: [false], // true/false (or 'No Kitchen' if managed via string, but stick to bool)
            RentingAboutCurrentResident: [''],
            RentingRulesAndPolicies: [''],
            RentingRoommateGroupChat: [''],

            // Extra Logic
            DirectApplyLink: [''],
            InviteCoListerEmail: [''],
            AllowCoListerEditing: [false],
            CoListerDetails: [''],

            // Tags (Hidden inputs or managed separately)
            tagInput: ['']
        });
    }

    // New Properties for UI options
    privacyTypes = [
        { value: 'Private Unit', label: 'Private Unit' },
        { value: 'Shared Unit', label: 'Shared Unit' }
    ];

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

    // --- Form Controls Helpers ---
    get f() { return this.form.controls; }
    get isRenting() { return this.form.get('IsRenting')?.value; }
    get isShared() { return this.form.get('RentingIsShared')?.value; }

    onListingTypeChange(isRent: boolean) {
        this.form.patchValue({ IsRenting: isRent });
        if (!isRent) {
            // Clear Rent specific fields
            this.form.patchValue({
                SecurityDeposit: null,
                BrokerFee: null,
                RentingLeaseType: null,
                RentingIsShared: false,
                AcceptedHousingPrograms: []
            });
        }
        if (isRent) {
            // Clear Sale specific fields
            this.form.patchValue({
                MonthlyCostRange: null, // If strictly HOA
                AcceptedBuyerPrograms: []
            });
        }
    }

    // --- Search Handlers ---
    onLocationInput(event: any) { this.locationSearch$.next(event.target.value); }
    // Wrapper for HTML compatibility if needed
    onLocationType(event: any) { this.onLocationInput(event); }

    selectLocation(loc: any) {
        this.selectedLocation = loc;
        const display = `${loc.neighborhood}, ${loc.borough} - ${loc.zipCode}`;
        this.form.patchValue({ locationInput: display });
        // Optional: auto-fill Zip if available in loc object
        if (loc.zipCode) this.form.get('Address.ZipCode')?.setValue(loc.zipCode);
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

    // --- Chips/Array Handlers ---
    toggleUtility(util: string) {
        const current = this.form.get('UtilitiesIncluded')?.value || [];
        if (current.includes(util)) {
            this.form.patchValue({ UtilitiesIncluded: current.filter((u: string) => u !== util) });
        } else {
            this.form.patchValue({ UtilitiesIncluded: [...current, util] });
        }
    }

    toggleSubway(line: string) {
        const current = this.form.get('NearbySubwayLines')?.value || [];
        if (current.includes(line)) {
            this.form.patchValue({ NearbySubwayLines: current.filter((l: string) => l !== line) });
        } else {
            this.form.patchValue({ NearbySubwayLines: [...current, line] });
        }
    }

    toggleProgram(id: number) {
        const current = this.form.get('AcceptedHousingPrograms')?.value || [];
        if (current.includes(id)) {
            this.form.patchValue({ AcceptedHousingPrograms: current.filter((x: number) => x !== id) });
        } else {
            this.form.patchValue({ AcceptedHousingPrograms: [...current, id] });
        }
    }

    toggleBuyerProgram(id: number) {
        const current = this.form.get('AcceptedBuyerPrograms')?.value || [];
        if (current.includes(id)) {
            this.form.patchValue({ AcceptedBuyerPrograms: current.filter((x: number) => x !== id) });
        } else {
            this.form.patchValue({ AcceptedBuyerPrograms: [...current, id] });
        }
    }

    // --- Files ---
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

    // --- Submit ---
    // --- Submit ---
    onSubmit() {
        console.log('onSubmit triggered'); // Debug logic entry

        // 1. Validation Logic
        if (this.form.invalid) {
            this.form.markAllAsTouched();

            // Find first invalid control to scroll to
            setTimeout(() => {
                const firstInvalid = document.querySelector('.is-invalid, .ng-invalid.ng-touched:not(form)');
                if (firstInvalid) {
                    firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstInvalid.classList.add('animate-shake'); // Optional visual cue
                } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }, 100);

            // Log visible errors for debugging
            const invalidFields: string[] = [];
            Object.keys(this.form.controls).forEach(key => {
                if (this.form.get(key)?.invalid) invalidFields.push(key);
            });
            this.toastService.error(`Please fix errors in: ${invalidFields.join(', ')}`);
            return;
        }

        // 2. Location Logic
        // If user typed something but didn't select from dropdown
        if (!this.selectedLocation) {
            const inputVal = this.form.get('locationInput')?.value;
            if (inputVal && inputVal.length > 0) {
                this.toastService.warning('Please click a location option from the dropdown list to confirm it.');
            } else {
                this.toastService.error('Please search and select a location.');
            }
            // Highlight location input
            const locInput = document.querySelector('input[formControlName="locationInput"]');
            if (locInput) {
                (locInput as HTMLElement).focus();
                locInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // 3. Prepare Payload
        this.isSubmitting = true;
        const formVal = this.form.value;

        const payload = {
            ...formVal,
            LocationsId: this.selectedLocation.id,
            Tags: this.selectedTags.map(t => t.id),
            Attachments: this.selectedFiles
        };

        console.log('Submitting Payload:', payload);

        // 4. Send Request
        this.housingService.createHousingPost(payload).subscribe({
            next: (res: any) => {
                console.log('Response:', res);
                this.isSubmitting = false;
                // Handle various success shapes depending on backend wrapper
                if (res && (res.isSuccess || res.statusCode === 200 || res.id)) {
                    this.toastService.success('Housing listing published successfully!');
                    this.router.navigate(['/public/housing']);
                } else {
                    const msg = res?.message || res?.error?.message || 'Failed to publish listing';
                    this.toastService.error(msg);
                }
            },
            error: (err: any) => {
                this.isSubmitting = false;
                console.error('Submission Error:', err);
                const msg = err.error?.message || err.message || 'Server error occurred.';
                this.toastService.error(msg);
            }
        });
    }


}
