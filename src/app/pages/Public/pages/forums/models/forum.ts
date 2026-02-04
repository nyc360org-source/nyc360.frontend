export interface Forum {
    id: number;
    title: string;
    description: string;
    slug: string;
    iconUrl: string;
    questionsCount: number;
    isActive: boolean;
}

export interface ApiResponse<T> {
    isSuccess: boolean;
    data: T;
    error: {
        code: string;
        message: string;
    } | null;
}
