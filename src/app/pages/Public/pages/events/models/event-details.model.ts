export interface EventAddress {
    Street: string;
    BuildingNumber?: string;
    ZipCode: string;
    AddressId?: number;
    LocationId?: number;
}

export interface EventTierDetail {
    Id?: number;
    Name: string;
    Price: number;
    Description?: string;
}

export interface EventDetail {
    Id: number | string;
    Title: string;
    Description: string;
    Category: number;
    StartDateTime: string;
    EndDateTime: string;
    VenueName: string;
    BannerUrl: string;
    Address?: EventAddress;
    Tiers?: EventTierDetail[];
    OrganizerName?: string;
    Tags?: string[];
}
