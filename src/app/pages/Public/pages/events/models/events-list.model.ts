export interface EventTier {
    id: number;
    name: string;
    description: string;
    price: number;
    quantityAvailable: number;
    minPerOrder: number;
    maxPerOrder: number;
    saleStart: string;
    saleEnd: string;
}

export interface EventAddress {
    addressId: number;
    locationId: number;
    street: string;
    buildingNumber: string;
    zipCode: string;
}

export interface EventListItem {
    id: number;
    title: string;
    description: string;
    category: number;
    startDateTime: string;
    endDateTime: string;
    status: number;
    visibility: number;
    address: EventAddress | null;
    tiers: EventTier[];
    isPaid: boolean;
    bannerUrl?: string;
}

export interface PaginatedEventResponse {
    isSuccess: boolean;
    data: EventListItem[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    error: any;
}

export interface ApiResponse<T> {
    isSuccess: boolean;
    data: T;
    error: any;
}
