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

        // 1. Strings
        formData.append('Title', data.Title || '');
        formData.append('Description', data.Description || '');
        if (data.UnitNumber) formData.append('UnitNumber', data.UnitNumber);
        if (data.GoogleMapLink) formData.append('GoogleMapLink', data.GoogleMapLink);

        // 2. Dates
        if (data.MoveInDate) formData.append('MoveInDate', new Date(data.MoveInDate).toISOString());
        if (data.MoveOutDate) formData.append('MoveOutDate', new Date(data.MoveOutDate).toISOString());

        // 3. Address Object - Reverting to JSON String as per Swagger Specs & User Request
        const addressObj = {
            AddressId: null, // Always null for new listings per user request
            LocationId: Number(data.LocationsId || 0),
            Street: data.Address?.Street || '',
            BuildingNumber: data.Address?.BuildingNumber || '',
            ZipCode: String(data.Address?.ZipCode || '')
        };
        formData.append('Address', JSON.stringify(addressObj));

        // 4. Integers / Enums (Must be strings for FormData)
        const appendInt = (key: string, val: any) => {
            if (val !== null && val !== undefined && val !== '') {
                formData.append(key, String(parseInt(val, 10)));
            } else {
                formData.append(key, '0'); // Send default 0 for optional numeric fields to avoid null crashes
            }
        };

        appendInt('HouseholdType', data.HouseholdType);
        appendInt('BuildingType', data.BuildingType);
        appendInt('HeatingSystem', data.HeatingSystem);
        appendInt('CoolingSystem', data.CoolingSystem);
        appendInt('TemperatureControl', data.TemperatureControl);
        appendInt('LaundryType', data.LaundryType);
        appendInt('RentingLeaseType', data.RentingLeaseType);

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

        // 7. Arrays
        const appendArray = (key: string, arr: any[]) => {
            if (arr && Array.isArray(arr) && arr.length > 0) {
                arr.forEach(item => formData.append(key, String(item)));
            }
        };

        appendArray('AcceptedHousingPrograms', data.AcceptedHousingPrograms);
        appendArray('AcceptedBuyerPrograms', data.AcceptedBuyerPrograms);
        appendArray('NearbySubwayLines', data.NearbySubwayLines);
        appendArray('UtilitiesIncluded', data.UtilitiesIncluded);

        // 8. Attachments (Multiple files under same key)
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
