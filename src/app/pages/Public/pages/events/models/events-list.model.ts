export interface EventTier {
    Price: number;
}

export interface EventListItem {
    Id: number | string;
    Title: string;
    Category: number;
    StartDateTime: string;
    VenueName: string;
    BannerUrl: string;
    Tiers?: EventTier[];
}

export interface EventListResponse {
    data: EventListItem[];
}
