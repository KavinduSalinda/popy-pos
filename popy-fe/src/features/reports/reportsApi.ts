import { baseApi } from '@/api/baseApi';
import type { ReportFilters, ReportResult } from './types';

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSalesReport: builder.query<ReportResult, ReportFilters>({
      query: (params) => ({ url: '/reports/sales', params }),
      providesTags: [{ type: 'Report', id: 'SALES' }],
    }),
    getInventoryReport: builder.query<ReportResult, ReportFilters>({
      query: (params) => ({ url: '/reports/inventory', params }),
      providesTags: [{ type: 'Report', id: 'INVENTORY' }],
    }),
    getPurchaseReport: builder.query<ReportResult, ReportFilters>({
      query: (params) => ({ url: '/reports/purchases', params }),
      providesTags: [{ type: 'Report', id: 'PURCHASE' }],
    }),
    getCustomerReport: builder.query<ReportResult, ReportFilters>({
      query: (params) => ({ url: '/reports/customers', params }),
      providesTags: [{ type: 'Report', id: 'CUSTOMER' }],
    }),
    getProfitReport: builder.query<ReportResult, ReportFilters>({
      query: (params) => ({ url: '/reports/profit', params }),
      providesTags: [{ type: 'Report', id: 'PROFIT' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSalesReportQuery,
  useGetInventoryReportQuery,
  useGetPurchaseReportQuery,
  useGetCustomerReportQuery,
  useGetProfitReportQuery,
} = reportsApi;
