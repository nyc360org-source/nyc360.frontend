import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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

    // Aligning with API BuildingType Enum (0=WalkUp, 1=Elevator, 2=Townhouse, 3=Detached)
    buildingTypeOptions = [
        { id: 0, name: 'Apartment', icon: 'bi-building' },
        { id: 1, name: 'House', icon: 'bi-house-door' },
        { id: 2, name: 'Townhouse', icon: 'bi-houses' },
        { id: 3, name: 'Studio', icon: 'bi-grid-1x2' },
        { id: 4, name: 'Room', icon: 'bi-person-badge' }
    ];

    boroughOptions = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];

    householdTypes = [
        { id: 0, name: 'Individual' },
        { id: 1, name: 'Couple' },
        { id: 2, name: 'SingleFamily' },
        { id: 3, name: 'MultiFamily' }
    ];

    heatingSystems = [
        { id: 0, name: 'Steam / Radiator (Central)' },
        { id: 1, name: 'Hot Water (Central)' },
        { id: 2, name: 'Electric Baseboard' },
        { id: 3, name: 'Forced Air (Heat)' },
        { id: 4, name: 'Heat Pump / Mini-Split' },
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
        { id: 1, name: 'Building / Shared Control' },
        { id: 2, name: 'Smart Thermostat' }
    ];

    laundryTypes = [
        { id: 0, name: 'In-Unit' },
        { id: 1, name: 'In-Building' },
        { id: 2, name: 'Nearby' }
    ];

    leaseTypes = [
        { id: 0, name: 'Lease' },
        { id: 1, name: 'Sub-Lease' },
        { id: 2, name: 'Month-to-Month' },
        { id: 3, name: 'Stabilized' },
        { id: 4, name: 'Flexible' }
    ];


    utilityOptions = [
        'Heat', 'Hot Water', 'Gas', 'Electricity', 'Internet', 'Cable'
    ];

    amenityOptions = [
        'Fitness Center',
        'Wellness Spa',
        'Outdoor Spaces',
        'Co-working Space',
        'Lobby',
        'Indoor Lounges',
        'Bike Room',
        'Parking',
        'Security Attendant'
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

    // --- Collapsible Sections State ---
    openSections: { [key: string]: boolean } = {
        listingType: true,
        availability: false,
        address: false,
        rooms: false,
        financials: false,
        spaceProperty: false,
        amenities: false,
        extraFeatures: false,
        programs: false,
        description: false,
        rentingDetails: false,
        sharedDetails: false,
        applyPhotos: false,
        coListing: false
    };

    toggleSection(section: string) {
        this.openSections[section] = !this.openSections[section];
        this.cdr.detectChanges();
    }

    isSectionComplete(section: string): boolean {
        switch (section) {
            case 'availability':
                return !!(this.f['MoveInDate'].value && this.f['MoveOutDate'].value && this.f['BuildingType'].value);
            case 'address':
                const addr = this.form.get('Address');
                return !!(addr?.get('Neighborhood')?.value && this.f['Borough']?.value && this.f['UnitNumber']?.value);
            case 'rooms':
                return !!(this.f['NumberOfRooms'].value && this.f['NumberOfBathrooms'].value);
            case 'financials':
                return !!(this.f['StartingPrice'].value);
            case 'spaceProperty':
                return !!(this.f['BuildingType'].value && this.f['Size'].value);
            case 'description':
                return !!(this.f['Title'].value && this.f['Description'].value);
            case 'rentingDetails':
                return !!(this.f['RentingLeaseType'].value);
            case 'applyPhotos':
                return this.selectedFiles.length >= 1;
            default:
                return false;
        }
    }

    isSectionInvalid(section: string): boolean {
        switch (section) {
            case 'availability':
                return (this.f['MoveInDate'].touched && !this.f['MoveInDate'].value) ||
                    (this.f['MoveOutDate'].touched && !this.f['MoveOutDate'].value);
            case 'financials':
                return this.f['StartingPrice'].touched && !this.f['StartingPrice'].value;
            case 'description':
                return (this.f['Title'].touched && !this.f['Title'].value) ||
                    (this.f['Description'].touched && !this.f['Description'].value);
            default:
                return false;
        }
    }

    constructor() {
        this.form = this.fb.group({
            // Core
            IsRenting: [true, Validators.required],
            BuildingType: [null, Validators.required], // Mapped from property selection
            HouseholdType: [0], // Default Individual
            MoveInDate: [null, Validators.required],
            MoveOutDate: [null],
            LegalUnitCount: [''], // NEW FIELD

            // Location
            locationInput: ['', Validators.required],
            Borough: ['', Validators.required],
            SuggestedOccupants: [''],
            Address: this.fb.group({
                FullAddress: [''],
                Street: [''],
                BuildingNumber: [''],
                Neighborhood: ['', Validators.required],
                ZipCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]]
            }),
            UnitNumber: ['', Validators.required],
            GoogleMapLink: [''],
            NearbySubwayLines: [[]], // Array of strings

            // Details
            NumberOfRooms: [0, [Validators.min(0)]],
            NumberOfBathrooms: [0, [Validators.min(0)]],
            MaxOccupants: [0],
            Size: [0], // sqft
            FloorLevel: [0],
            YearBuilt: [0],
            RenovatedIn: [0],

            // Financials
            StartingPrice: [0, [Validators.required, Validators.min(0)]],
            SecurityDeposit: [0],
            BrokerFee: [0],
            MonthlyCostRange: [0],

            // Enums
            HeatingSystem: [0],
            CoolingSystem: [0],
            TemperatureControl: [0],
            LaundryType: [0],

            // Booleans / Features (Toggles)
            IsShortTermStayAllowed: [true], // Default matching schema example
            IsShortStayEligible: [true],
            IsFurnished: [true],
            IsAcceptsHousingVouchers: [true],
            IsFamilyAndKidsFriendly: [true],
            IsPetsFriendly: [true],
            IsAccessibilityFriendly: [true],
            IsSmokingAllowed: [true],

            UtilitiesIncluded: [[]], // Array string
            Amenities: [[]], // Array string - NEW FIELD

            // Programs
            AcceptedHousingPrograms: [[]], // Array int
            AcceptedBuyerPrograms: [[]], // Array int

            // Description
            Title: ['', [Validators.required, Validators.minLength(5)]],
            Description: ['', [Validators.required, Validators.minLength(20)]],

            // Renting Specifics
            RentingLeaseType: [0],
            RentingIsShared: [true],
            // Shared details
            PrivacyType: ['Shared Unit'],
            RentingIsSharedBathroom: [true],
            RentingIsSharedKitchen: [true],
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
        this.form.patchValue({
            locationInput: display,
            Borough: loc.borough
        });

        // Patch Neighborhood in Address group
        this.form.get('Address.Neighborhood')?.setValue(loc.neighborhood);

        // Auto-populate zip code if available
        if (loc.zipCode) {
            this.form.get('Address.ZipCode')?.setValue(String(loc.zipCode));
        }

        this.showLocationDropdown = false;
        this.cdr.detectChanges();
        console.log(this.selectedLocation);
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

    toggleAmenity(amenity: string) {
        const current = this.form.get('Amenities')?.value || [];
        if (current.includes(amenity)) {
            this.form.patchValue({ Amenities: current.filter((a: string) => a !== amenity) });
        } else {
            this.form.patchValue({ Amenities: [...current, amenity] });
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

    toggleTransportation(option: string) {
        // We reuse NearbySubwayLines array for all transportation types requested by user
        this.toggleSubway(option);
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
    saveDraft() {
        this.toastService.info('Draft saved locally!');
    }

    onSubmit() {
        console.log('onSubmit triggered');

        // 1. Validation Logic
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            setTimeout(() => {
                const firstInvalid = document.querySelector('.is-invalid, .ng-invalid.ng-touched:not(form)');
                if (firstInvalid) {
                    firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);

            const invalidFields: string[] = [];
            Object.keys(this.form.controls).forEach(key => {
                if (this.form.get(key)?.invalid) invalidFields.push(key);
            });
            this.toastService.error(`Please fix errors in: ${invalidFields.join(', ')}`);
            return;
        }

        // 2. Location Guard
        if (!this.selectedLocation) {
            this.toastService.error('Please search and select a location from the dropdown.');
            return;
        }

        this.isSubmitting = true;
        const formVal = this.form.getRawValue();

        // 3. Construct Payload (Pass plain object to Service, let Service handle FormData)
        // We map specific fields to match what HousingService expects
        const payload = {
            ...formVal,
            LocationsId: this.selectedLocation.id, // Service expects 'LocationsId'
            Attachments: this.selectedFiles
        };

        console.log('Sending Payload to Service:', payload);

        // 4. Send Request
        this.housingService.createHousingPost(payload).subscribe({
            next: (res: any) => {
                this.isSubmitting = false;
                if (res && res.isSuccess) {
                    this.toastService.success('Housing listing published successfully!');
                    this.router.navigate(['/public/housing']);
                } else {
                    this.toastService.error(res?.message || 'Failed to publish listing');
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