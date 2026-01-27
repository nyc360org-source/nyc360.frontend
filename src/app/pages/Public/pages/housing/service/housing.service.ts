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
        const formData = new FormData();

        // --- 1. Basic Strings ---
        formData.append('Title', data.Title || '');
        formData.append('Description', data.Description || '');

        // --- 2. Dates (ISO 8601) ---
        if (data.MoveInDate) formData.append('MoveInDate', new Date(data.MoveInDate).toISOString());
        if (data.MoveOutDate) formData.append('MoveOutDate', new Date(data.MoveOutDate).toISOString());

        // --- 3. Booleans (Strict 'true'/'false' strings) ---
        formData.append('IsRenting', (data.IsRenting === true || data.IsRenting === 'true') ? 'true' : 'false');

        const boolFields = [
            'IsShortTermStayAllowed',
            'IsShortStayEligible',
            'IsFurnished',
            'IsAcceptsHousingVouchers',
            'IsFamilyAndKidsFriendly',
            'IsPetsFriendly',
            'IsAccessibilityFriendly',
            'IsSmokingAllowed',
            'RentingIsShared',
            'RentingIsSharedBathroom',
            'RentingIsSharedKitchen'
        ];

        boolFields.forEach(field => {
            const val = data[field];
            formData.append(field, (val === true || val === 'true') ? 'true' : 'false');
        });

        // --- 4. Integers / Enums (Nullable) ---
        const appendInt = (key: string, val: any) => {
            if (val !== null && val !== undefined && val !== '') {
                formData.append(key, String(parseInt(val, 10)));
            }
        };

        appendInt('HouseholdType', data.HouseholdType);
        appendInt('BuildingType', data.BuildingType);
        if (data.Type !== undefined && data.Type !== null) appendInt('Type', data.Type);

        appendInt('HeatingSystem', data.HeatingSystem);
        appendInt('CoolingSystem', data.CoolingSystem);
        appendInt('TemperatureControl', data.TemperatureControl);
        appendInt('LaundryType', data.LaundryType);
        appendInt('RentingLeaseType', data.RentingLeaseType);

        // --- 5. Numeric Stats ---
        appendInt('MaxOccupants', data.MaxOccupants);
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

        // --- 6. Address Object (Critical: Only append if has value to avoid type crashes) ---
        formData.append('Address.AddressId', '0');
        formData.append('Address.LocationId', String(data.LocationsId || 0));

        if (data.Address?.Street) formData.append('Address.Street', data.Address.Street);
        if (data.Address?.BuildingNumber) formData.append('Address.BuildingNumber', data.Address.BuildingNumber);
        if (data.Address?.ZipCode) formData.append('Address.ZipCode', data.Address.ZipCode);

        // --- 7. Root Level Strings (Optional) ---
        if (data.UnitNumber) formData.append('UnitNumber', data.UnitNumber);
        if (data.GoogleMapLink) formData.append('GoogleMapLink', data.GoogleMapLink);

        // Renting Strings
        if (data.RentingAboutCurrentResident) formData.append('RentingAboutCurrentResident', data.RentingAboutCurrentResident);
        if (data.RentingRulesAndPolicies) formData.append('RentingRulesAndPolicies', data.RentingRulesAndPolicies);
        if (data.RentingRoommateGroupChat) formData.append('RentingRoommateGroupChat', data.RentingRoommateGroupChat);

        // --- 8. Arrays ---
        const appendArray = (key: string, arr: any[]) => {
            if (arr && Array.isArray(arr)) {
                arr.forEach(item => formData.append(key, String(item)));
            }
        };

        appendArray('AcceptedHousingPrograms', data.AcceptedHousingPrograms);
        appendArray('AcceptedBuyerPrograms', data.AcceptedBuyerPrograms);

        // Ensure strict string array for Subway lines
        if (data.NearbySubwayLines && Array.isArray(data.NearbySubwayLines)) {
            data.NearbySubwayLines.forEach((s: string) => {
                if (s) formData.append('NearbySubwayLines', String(s));
            });
        }

        appendArray('UtilitiesIncluded', data.UtilitiesIncluded);
        appendArray('Tags', data.Tags);

        // --- 9. Attachments ---
        if (data.Attachments && Array.isArray(data.Attachments)) {
            data.Attachments.forEach((file: File) => {
                formData.append('Attachments', file);
            });
        }

        return this.http.post(this.apiUrl, formData);
    }

    getHousingHome(): Observable<any> {
        return this.http.get(`${environment.apiBaseUrl}/housing/home`);
    }
}
