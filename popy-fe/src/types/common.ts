export type ID = number | string;

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ListQueryParams extends Partial<PaginationParams> {
  search?: string;
  status?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface SelectOption<T extends string | number = string> {
  value: T;
  label: string;
}

export interface ApiErrorPayload {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

export type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface Timestamps {
  createdAt?: string;
  updatedAt?: string;
}
