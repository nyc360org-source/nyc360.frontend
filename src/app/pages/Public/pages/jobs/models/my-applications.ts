export enum ApplicationStatus {
  Pending = 0,
  Accepted = 1,
  Rejected = 2,
  Withdrawn = 3
}

export interface MyApplication {
  applicationId: number;
  offer: {
    id: number;
    title: string;
    salaryMin: number;
    salaryMax: number;
    workArrangement: number;
    employmentType: number;
    employmentLevel: number;
    companyName: string;
  };
  status: ApplicationStatus;
  appliedAt: string;
}

export interface MyApplicationsResponse {
  isSuccess: boolean;
  data: MyApplication[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  error: any;
}