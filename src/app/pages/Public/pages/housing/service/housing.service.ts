import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class HousingService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiBaseUrl}/housing/create`;

    createHousingPost(data: any): Observable<any> {
        // ... legacy/generic method if needed, or we can redirect to specific ones
        // For now, keeping it but we will primarily use createRentingPost for the new page
        return this.createRentingPost(data);
    }

    createRentingPost(data: any): Observable<any> {
        const formData = new FormData();
        const apiUrl = `${environment.apiBaseUrl}/housing/create/renting`;

        // Helper to append safely
        const append = (key: string, val: any) => {
            if (val !== null && val !== undefined && val !== '') {
                formData.append(key, String(val));
            }
        };

        // 1. Enums & Integers (Aligned with API expectations)
        append('HouseholdType', data.HouseType);
        append('BuildingType', data.BuildingType);
        append('NumberOfRooms', data.Bedrooms);
        append('NumberOfBathrooms', data.Bathrooms);
        append('StartingPrice', data.MonthlyRent);
        append('SecurityDeposit', data.SecurityDeposit);
        append('BrokerFee', data.BrokerFee);
        append('MonthlyCostRange', data.MonthlyCostRange);
        append('YearBuilt', data.BuiltIn);
        append('RenovatedIn', data.RenovatedIn);
        append('Size', data.Sqft);
        append('FloorLevel', data.FloorLevel);
        append('HeatingSystem', data.Heating);
        append('CoolingSystem', data.Cooling);
        append('TemperatureControl', data.TemperatureControl);
        append('LaundryType', data.LaundryType !== undefined ? data.LaundryType : (data.Laundry && data.Laundry[0])); // Fallback if data is array
        append('RentingLeaseType', data.LeaseType);
        append('MaxOccupants', data.MaxOccupants);

        // 2. Strings
        append('Borough', data.Borough);
        append('ZipCode', data.ZipCode);
        append('Neighborhood', data.Neighborhood);
        append('FullAddress', data.FullAddress);
        append('UnitNumber', data.UnitNumber);
        append('GoogleMapLink', data.GoogleMap); // Aligned name
        append('Description', data.Description);
        append('RentingAboutCurrentResident', data.AboutCurrentResident);
        append('RentingRulesAndPolicies', data.UnitRulesAndPolicies);
        append('RentingRoommateGroupChat', data.RoommatesGroupChat);

        // 3. Dates (ISO Formatting)
        try {
            if (data.MoveInDate) formData.append('MoveInDate', new Date(data.MoveInDate).toISOString());
            if (data.MoveOutDate) formData.append('MoveOutDate', new Date(data.MoveOutDate).toISOString());
        } catch (e) { console.error('Date formatting error', e); }

        // 4. Booleans (Special Handling for Renting specifics)
        const isShared = data.PrivacyType === 1;
        formData.append('RentingIsShared', isShared ? 'true' : 'false');
        formData.append('RentingIsSharedBathroom', (isShared && data.SharedBathroomType === 1) ? 'true' : 'false');
        formData.append('RentingIsSharedKitchen', (isShared && data.SharedKitchenType === 1) ? 'true' : 'false');

        // Other Booleans
        const boolFields = [
            { api: 'IsShortTermStayAllowed', form: 'ShortTermStayAllowed' },
            { api: 'IsShortStayEligible', form: 'ShortStayEligiblity' },
            { api: 'IsFurnished', form: 'Furnished' },
            { api: 'IsAcceptsHousingVouchers', form: 'AcceptsHousingVouchers' },
            { api: 'IsFamilyAndKidsFriendly', form: 'FamilyAndKidsFriendly' },
            { api: 'IsPetsFriendly', form: 'PetsFriendly' },
            { api: 'IsAccessibilityFriendly', form: 'AccessibilityFriendly' },
            { api: 'IsSmokingAllowed', form: 'SmokingAllowed' },
            { api: 'IsPublished', form: 'IsPublished' }
        ];

        boolFields.forEach(field => {
            const val = data[field.form];
            if (val !== undefined) {
                formData.append(field.api, val ? 'true' : 'false');
            }
        });

        // 5. Arrays
        const appendArray = (key: string, arr: any[]) => {
            if (arr && Array.isArray(arr)) {
                arr.forEach(item => formData.append(key, String(item)));
            }
        };

        appendArray('NearbySubwayLines', data.NearbyTransportation); // Aligned name
        appendArray('LaundryTypes', data.Laundry); // Aligned name plural if needed? No, usually same as create
        appendArray('Amenities', data.Amenities);
        appendArray('AcceptedHousingPrograms', data.AcceptedHousingPrograms);

        // 6. Photos
        if (data.Photos && Array.isArray(data.Photos)) {
            data.Photos.forEach((file: File) => {
                formData.append('Photos', file);
            });
        }

        return this.http.post(apiUrl, formData);
    }

    createSalePost(data: any): Observable<any> {
        const formData = new FormData();
        const apiUrl = `${environment.apiBaseUrl}/housing/create/sale`;
        // Generic append for now
        Object.keys(data).forEach(key => {
            if (Array.isArray(data[key])) {
                data[key].forEach((item: any) => formData.append(key, String(item)));
            } else {
                formData.append(key, String(data[key]));
            }
        });
        return this.http.post(apiUrl, formData);
    }

    getHousingHome(): Observable<any> {
        return this.http.get(`${environment.apiBaseUrl}/housing/home`);
    }

    getHousingFeed(params: any): Observable<any> {
        let httpParams = new HttpParams();
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
                httpParams = httpParams.append(key, params[key]);
            }
        });
        return this.http.get(`${environment.apiBaseUrl}/housing/feed`, { params: httpParams });
    }

    getHousingDetails(id: number | string): Observable<any> {
        return this.http.get(`${environment.apiBaseUrl}/housing/${id}`);
    }

    updateHousingPost(id: number, data: any): Observable<any> {
        const formData = new FormData();
        const apiUrl = `${environment.apiBaseUrl}/housing/${id}/edit`;

        // 1. Core Strings
        formData.append('Title', data.Title || '');
        formData.append('Description', data.Description || '');
        if (data.UnitNumber) formData.append('UnitNumber', data.UnitNumber);
        if (data.GoogleMapLink) formData.append('GoogleMapLink', data.GoogleMapLink);
        if (data.LegalUnitCount) formData.append('LegalUnitCount', data.LegalUnitCount);

        // 2. Dates
        if (data.MoveInDate) formData.append('MoveInDate', new Date(data.MoveInDate).toISOString());
        if (data.MoveOutDate) formData.append('MoveOutDate', new Date(data.MoveOutDate).toISOString());

        // 3. Address
        const addressObj = {
            AddressId: data.Address?.AddressId || 0,
            LocationId: Number(data.Address?.LocationId || data.LocationsId || 0),
            Street: data.Address?.Street || '',
            BuildingNumber: data.Address?.BuildingNumber || '',
            ZipCode: String(data.Address?.ZipCode || '')
        };
        formData.append('Address', JSON.stringify(addressObj));

        // 4. Integers & Enums (similar to create)
        const appendInt = (key: string, val: any) => {
            if (val !== null && val !== undefined && val !== '') {
                formData.append(key, String(parseInt(val, 10)));
            } else {
                formData.append(key, '0');
            }
        };

        appendInt('HouseholdType', data.HouseholdType);
        appendInt('BuildingType', data.BuildingType);
        appendInt('HeatingSystem', data.HeatingSystem);
        appendInt('CoolingSystem', data.CoolingSystem);
        appendInt('TemperatureControl', data.TemperatureControl);
        appendInt('LaundryType', data.LaundryType);
        appendInt('RentingLeaseType', data.RentingLeaseType);

        const maxOccUpdate = data.SuggestedOccupants || data.MaxOccupants;
        appendInt('MaxOccupants', maxOccUpdate);
        appendInt('NumberOfRooms', data.NumberOfRooms);
        appendInt('NumberOfBathrooms', data.NumberOfBathrooms);
        appendInt('StartingPrice', data.StartingPrice);
        appendInt('SecurityDeposit', data.SecurityDeposit);
        appendInt('BrokerFee', data.BrokerFee);
        appendInt('MonthlyCostRange', data.MonthlyCostRange);
        appendInt('YearBuilt', data.YearBuilt);
        appendInt('RenovatedIn', data.RenovatedIn);
        appendInt('Size', data.Size);
        appendInt('FloorLevel', data.FloorLevel);

        // 5. Booleans
        const boolFields = [
            'IsRenting', 'IsShortTermStayAllowed', 'IsShortStayEligible',
            'IsFurnished', 'IsAcceptsHousingVouchers', 'IsFamilyAndKidsFriendly',
            'IsPetsFriendly', 'IsAccessibilityFriendly', 'IsSmokingAllowed',
            'RentingIsShared', 'RentingIsSharedBathroom', 'RentingIsSharedKitchen'
        ];
        boolFields.forEach(field => {
            const val = data[field];
            formData.append(field, (val === true || val === 'true') ? 'true' : 'false');
        });

        // 6. Renting Strings
        if (data.RentingAboutCurrentResident) formData.append('RentingAboutCurrentResident', data.RentingAboutCurrentResident);
        if (data.RentingRulesAndPolicies) formData.append('RentingRulesAndPolicies', data.RentingRulesAndPolicies);
        if (data.RentingRoommateGroupChat) formData.append('RentingRoommateGroupChat', data.RentingRoommateGroupChat);

        // 7. Arrays (Programs, Utilities, Subway)
        const appendArray = (key: string, arr: any[]) => {
            if (arr && Array.isArray(arr) && arr.length > 0) {
                arr.forEach(item => formData.append(key, String(item)));
            }
        };
        appendArray('AcceptedHousingPrograms', data.AcceptedHousingPrograms);
        appendArray('AcceptedBuyerPrograms', data.AcceptedBuyerPrograms);
        appendArray('NearbySubwayLines', data.NearbySubwayLines);
        appendArray('UtilitiesIncluded', data.UtilitiesIncluded);

        // 8. New Attachments
        if (data.NewAttachments && Array.isArray(data.NewAttachments)) {
            data.NewAttachments.forEach((file: File) => {
                formData.append('NewAttachments', file);
            });
        }

        // 9. Deleted Attachment Ids
        if (data.DeletedAttachmentIds && Array.isArray(data.DeletedAttachmentIds)) {
            data.DeletedAttachmentIds.forEach((id: number) => {
                formData.append('DeletedAttachmentIds', String(id));
            });
        }

        return this.http.put(apiUrl, formData);
    }
}
