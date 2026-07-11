import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './axiosBaseQuery';

export const TAG_TYPES = [
  'Product',
  'Category',
  'Inventory',
  'StockTransaction',
  'Supplier',
  'Customer',
  'Purchase',
  'Sale',
  'Return',
  'User',
  'Dashboard',
  'Report',
  'Settings',
  'Shop',
] as const;

/**
 * Root RTK Query API. Each feature injects its own endpoints via
 * `baseApi.injectEndpoints` to keep the API layer modular and code-split.
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  tagTypes: TAG_TYPES,
  endpoints: () => ({}),
});
