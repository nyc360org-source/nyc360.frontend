import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { PostsService } from '../../../../pages/posts/services/posts';
import { HousingService } from '../../service/housing.service';
import { ToastService } from '../../../../../../shared/services/toast.service';
import { ImageService } from '../../../../../../shared/services/image.service';
import { ImgFallbackDirective } from '../../../../../../shared/directives/img-fallback.directive';

@Component({
    selector: 'app-edit-housing',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, ImgFallbackDirective],
    templateUrl: './edit-housing.html',
    styleUrls: ['./edit-housing.scss']
})
export class EditHousingComponent implements OnInit {
    private postsService = inject(PostsService);
    private housingService = inject(HousingService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private toastService = inject(ToastService);
    private cdr = inject(ChangeDetectorRef);
    private fb = inject(FormBuilder);
    public imageService = inject(ImageService); // Add public for template access

    form: FormGroup;
    isSubmitting = false;
    isLoading = true;
    postId: number | null = null;

    // Existing Data
    existingAttachments: any[] = [];
    deletedAttachmentIds: number[] = [];
    currentAddressId: number = 0;

    // --- Enums & Options ---
    listingTypeOptions = [
        { value: true, label: 'For Rent', icon: 'bi-key' },
        { value: false, label: 'For Sale', icon: 'bi-house-door' }
    ];

    buildingTypeOptions = [
        { id: 0, name: 'Walk-up', icon: 'bi-building' },
        { id: 1, name: 'Elevator', icon: 'bi-building-up' },
        { id: 2, name: 'Townhouse', icon: 'bi-house-heart' },
        { id: 3, name: 'Detached', icon: 'bi-house' }
    ];

    householdTypes = [
        { id: 0, name: 'Individual' },
        { id: 1, name: 'Couple' },
        { id: 2, name: 'SingleFamily' },
        { id: 3, name: 'MultiFamily' }
    ];

    heatingSystems = [
        { id: 0, name: 'SteamRadiator' },
        { id: 1, name: 'HotWaterCentral' },
        { id: 2, name: 'ElectricBaseboard' },
        { id: 3, name: 'ForcedAir' },
        { id: 4, name: 'HeatPump' },
        { id: 5, name: 'Other' }
    ];

    coolingSystems = [
        { id: 0, name: 'CentralAc' },
        { id: 1, name: 'DuctlessMiniSplit' },
        { id: 2, name: 'WindowUnitsAllowed' },
        { id: 3, name: 'ThroughWallUnits' },
        { id: 4, name: 'NoAc' }
    ];

    tempControls = [
        { id: 0, name: 'IndividualThermostat' },
        { id: 1, name: 'BuildingSharedControl' },
        { id: 2, name: 'SmartThermostat' }
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

    transportationGroups = [
        { category: 'Subway Lines', icon: 'bi-train-front', options: ['(1)/(2)/(3)', '(4)/(5)/(6)', '7', '(A)/(C)/(E)', 'B D F M', 'G', 'J Z', 'L', 'N Q R W', 'S'] },
        { category: 'Bus Access', icon: 'bi-bus-front', options: ['Local Bus', 'Limited Bus', 'Select Bus Service (SBS)', '24-Hour Bus Route'] },
        { category: 'Regional Rail', icon: 'bi-train-lightrail-front', options: ['LIRR', 'Metro-North', 'PATH'] },
        { category: 'Ferry', icon: 'bi-water', options: ['NYC Ferry', 'Staten Island Ferry'] },
        { category: 'Bike & Micromobility', icon: 'bi-bicycle', options: ['Citi Bike Nearby', 'Protected Bike Lanes', 'Scooter Friendly Area'] },
        { category: 'Car Access', icon: 'bi-car-front', options: ['Easy Highway Access', 'Street Parking Available', 'Garage Parking Nearby'] }
    ];

    // --- Files for New Uploads ---
    selectedFiles: File[] = [];
    imagePreviews: string[] = [];

    // --- Search ---
    locationSearch$ = new Subject<string>();
    locationResults: any[] = [];
    selectedLocation: any = null;
    showLocationDropdown = false;

    constructor() {
        this.form = this.fb.group({
            // Core
            IsRenting: [true, Validators.required],
            BuildingType: [0, Validators.required],
            HouseholdType: [0],
            MoveInDate: [null, Validators.required],
            MoveOutDate: [null],

            // Location
            locationInput: ['', Validators.required],
            Address: this.fb.group({
                Street: [''],
                BuildingNumber: [''],
                ZipCode: ['', [Validators.pattern(/^\d{5}$/)]]
            }),
            UnitNumber: [''],
            GoogleMapLink: [''],
            NearbySubwayLines: [[]],

            // Details
            NumberOfRooms: [0, [Validators.min(0)]],
            NumberOfBathrooms: [0, [Validators.min(0)]],
            MaxOccupants: [0],
            Size: [0],
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

            // Booleans
            IsShortTermStayAllowed: [true],
            IsShortStayEligible: [true],
            IsFurnished: [true],
            IsAcceptsHousingVouchers: [true],
            IsFamilyAndKidsFriendly: [true],
            IsPetsFriendly: [true],
            IsAccessibilityFriendly: [true],
            IsSmokingAllowed: [true],


            UtilitiesIncluded: [[]],
            Amenities: [[]], // NEW FIELD
            AcceptedHousingPrograms: [[]],
            AcceptedBuyerPrograms: [[]],

            Title: ['', [Validators.required, Validators.minLength(5)]],
            Description: ['', [Validators.required, Validators.minLength(20)]],

            // Renting Specifics
            RentingLeaseType: [0],
            RentingIsShared: [true],
            PrivacyType: ['Shared Unit'],
            RentingIsSharedBathroom: [true],
            RentingIsSharedKitchen: [true],
            RentingAboutCurrentResident: [''],
            RentingRulesAndPolicies: [''],
            RentingRoommateGroupChat: [''],

            DirectApplyLink: [''],
            InviteCoListerEmail: [''],
        });
    }

    // New Properties for UI options
    privacyTypes = [
        { value: 'Private Unit', label: 'Private Unit' },
        { value: 'Shared Unit', label: 'Shared Unit' }
    ];

    ngOnInit() {
        this.setupSearch();
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.postId = +id;
                this.loadListingData(this.postId);
            } else {
                this.toastService.error('Invalid Listing ID');
                this.router.navigate(['/public/housing/home']);
            }
        });
    }

    loadListingData(id: number) {
        this.isLoading = true;
        this.housingService.getHousingDetails(id).subscribe({
            next: (res: any) => {
                if (res.isSuccess) {
                    // Check if data is wrapped in 'info' (common in this API) or direct
                    const listingData = res.data.info || res.data;
                    this.populateForm(listingData);
                } else {
                    this.toastService.error('Failed to load listing details');
                    this.router.navigate(['/public/housing/home']);
                }
                this.isLoading = false;
            },
            error: (err) => {
                console.error(err);
                this.isLoading = false;
                this.toastService.error('Error loading listing');
            }
        });
    }

    populateForm(data: any) {
        console.log('Populating Form with:', data);

        // 1. Core Fields
        this.form.patchValue({
            Title: data.title,
            Description: data.description,
            IsRenting: data.isRenting,
            MoveInDate: data.moveInDate ? data.moveInDate.split('T')[0] : null,
            MoveOutDate: data.moveOutDate ? data.moveOutDate.split('T')[0] : null,
            StartingPrice: data.startingPrice,
            SecurityDeposit: data.securityDeposit,
            BrokerFee: data.brokerFee,
            MonthlyCostRange: data.monthlyCostRange,
            BuildingType: data.buildingType,
            HouseholdType: data.householdType,
            NumberOfRooms: data.numberOfRooms,
            NumberOfBathrooms: data.numberOfBathrooms,
            MaxOccupants: data.maxOccupants,
            Size: data.size,
            FloorLevel: data.floorLevel,
            YearBuilt: data.yearBuilt,
            RenovatedIn: data.renovatedIn,
            HeatingSystem: data.heatingSystem,
            CoolingSystem: data.coolingSystem,
            TemperatureControl: data.temperatureControl,
            LaundryType: data.laundryType,
            RentingLeaseType: data.rentingLeaseType,

            // Booleans
            IsShortTermStayAllowed: data.isShortTermStayAllowed,
            IsShortStayEligible: data.isShortStayEligible,
            IsFurnished: data.isFurnished,
            IsAcceptsHousingVouchers: data.isAcceptsHousingVouchers,
            IsFamilyAndKidsFriendly: data.isFamilyAndKidsFriendly,
            IsPetsFriendly: data.isPetsFriendly,
            IsAccessibilityFriendly: data.isAccessibilityFriendly,
            IsSmokingAllowed: data.isSmokingAllowed,
            RentingIsShared: data.rentingIsShared,
            RentingIsSharedBathroom: data.rentingIsSharedBathroom,
            RentingIsSharedKitchen: data.rentingIsSharedKitchen,

            // Renting Texts
            RentingAboutCurrentResident: data.rentingAboutCurrentResident,
            RentingRulesAndPolicies: data.rentingRulesAndPolicies,
            RentingRoommateGroupChat: data.rentingRoommateGroupChat,

            // Optional / Extra
            UnitNumber: data.unitNumber,
            GoogleMapLink: data.googleMapLink
        });

        // 2. Arrays
        this.form.patchValue({
            NearbySubwayLines: data.nearbySubwayLines || [],
            UtilitiesIncluded: data.utilitiesIncluded || [],
            Amenities: data.amenities || [], // NEW FIELD
            AcceptedHousingPrograms: data.acceptedHousingPrograms || [],
            AcceptedBuyerPrograms: data.acceptedBuyerPrograms || []
        });

        // 3. Address & Location
        // 3. Address & Location
        if (data.address) {
            this.currentAddressId = data.address.id; // Corrected to match API response 'id'
            this.form.get('Address')?.patchValue({
                Street: data.address.street || '',
                BuildingNumber: data.address.buildingNumber || '',
                ZipCode: data.address.zipCode || ''
            });

            // Handle Location Display
            if (data.address.location) {
                const loc = data.address.location;
                this.selectedLocation = { id: loc.id, neighborhood: loc.neighborhood, borough: loc.borough, zipCode: loc.zipCode };
                const display = `${loc.neighborhood}, ${loc.borough} - ${loc.zipCode}`;
                this.form.patchValue({ locationInput: display });

                // Ensure zip code is synced if missing in address but present in location
                if (!data.address.zipCode && loc.zipCode) {
                    this.form.get('Address.ZipCode')?.setValue(String(loc.zipCode));
                }
            } else if (data.address.locationId) {
                // Fallback if only ID is present (rare based on response schema)
                this.selectedLocation = { id: data.address.locationId };
            }
        }

        // 4. Attachments
        if (data.attachments) {
            console.log('[EditHousing] Attachments from API:', data.attachments);
            // Map attachments to ensure we have the correct structure
            this.existingAttachments = data.attachments.map((att: any) => ({
                id: att.id || att.attachmentId || null, // Try different property names
                url: att.url || att.imageUrl || att,
                originalData: att // Keep original for debugging
            }));
            console.log('[EditHousing] Mapped attachments:', this.existingAttachments);
        }

        // 5. Derived UI State & Handling Nulls
        this.form.patchValue({
            PrivacyType: data.rentingIsShared ? 'Shared Unit' : 'Private Unit',
            // Default select values to 0 if null, to match "Not Specified" or first option
            BuildingType: data.buildingType ?? 0,
            HouseholdType: data.householdType ?? 0
        });

        // Ensure proper change detection for arrays/UI
        this.cdr.detectChanges();
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
    }

    // --- Form Controls Helpers ---
    get f() { return this.form.controls; }
    get isRenting() { return this.form.get('IsRenting')?.value; }
    get isShared() { return this.form.get('RentingIsShared')?.value; }

    onListingTypeChange(isRent: boolean) {
        this.form.patchValue({ IsRenting: isRent });
        if (!isRent) {
            this.form.patchValue({
                SecurityDeposit: null,
                BrokerFee: null,
                RentingLeaseType: null,
                RentingIsShared: false,
                AcceptedHousingPrograms: []
            });
        }
        if (isRent) {
            this.form.patchValue({
                MonthlyCostRange: null,
                AcceptedBuyerPrograms: []
            });
        }
    }

    // --- Search Handlers ---
    onLocationInput(event: any) { this.locationSearch$.next(event.target.value); }

    selectLocation(loc: any) {
        this.selectedLocation = loc;
        const display = `${loc.neighborhood}, ${loc.borough} - ${loc.zipCode}`;
        this.form.patchValue({ locationInput: display });
        if (loc.zipCode) {
            this.form.get('Address.ZipCode')?.setValue(String(loc.zipCode));
        }
        this.showLocationDropdown = false;
        this.cdr.detectChanges();
    }

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

    removeExistingFile(index: number, id: number) {
        console.log('[EditHousing] Removing attachment with ID:', id);
        // Only add to deleted list if ID is valid
        if (id !== null && id !== undefined && !isNaN(id)) {
            this.deletedAttachmentIds.push(id);
        } else {
            console.warn('[EditHousing] Skipping invalid attachment ID:', id);
        }
        this.existingAttachments.splice(index, 1);
    }

    // --- Submit ---
    onSubmit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.toastService.error('Please fix form errors.');
            return;
        }

        this.isSubmitting = true;
        const formVal = this.form.getRawValue();

        // Construct Update Payload
        // Filter out any undefined/null/NaN values from deletedAttachmentIds
        const validDeletedIds = this.deletedAttachmentIds.filter(
            id => id !== null && id !== undefined && !isNaN(id)
        );

        console.log('[EditHousing] Valid deleted IDs:', validDeletedIds);

        const payload = {
            ...formVal,
            Address: {
                ...formVal.Address,
                AddressId: this.currentAddressId,
                LocationId: this.selectedLocation?.id || 0 // Use existing or new
            },
            NewAttachments: this.selectedFiles,
            DeletedAttachmentIds: validDeletedIds
        };

        if (this.postId) {
            this.housingService.updateHousingPost(this.postId, payload).subscribe({
                next: (res: any) => {
                    this.isSubmitting = false;
                    if (res && res.isSuccess) {
                        this.toastService.success('Housing listing updated successfully!');
                        this.router.navigate(['/public/housing/details', this.postId]);
                    } else {
                        this.toastService.error(res?.message || 'Failed to update listing');
                    }
                },
                error: (err: any) => {
                    this.isSubmitting = false;
                    const msg = err.error?.message || 'Server error occurred.';
                    this.toastService.error(msg);
                }
            });
        }
    }
}
