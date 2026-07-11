import { baseApi } from '@/api/baseApi';
import type {
  CategorySales,
  DashboardSummary,
  SalesTrend,
  TopProduct,
} from './types';

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query<DashboardSummary, void>({
      query: () => ({ url: '/dashboard/summary' }),
      providesTags: [{ type: 'Dashboard', id: 'SUMMARY' }],
    }),

    getSalesTrend: builder.query<SalesTrend, void>({
      query: () => ({ url: '/dashboard/sales-trend' }),
      providesTags: [{ type: 'Dashboard', id: 'TREND' }],
    }),

    getTopProducts: builder.query<TopProduct[], void>({
      query: () => ({ url: '/dashboard/top-products' }),
      providesTags: [{ type: 'Dashboard', id: 'TOP' }],
    }),

    getSalesByCategory: builder.query<CategorySales[], void>({
      query: () => ({ url: '/dashboard/sales-by-category' }),
      providesTags: [{ type: 'Dashboard', id: 'CATEGORY' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDashboardSummaryQuery,
  useGetSalesTrendQuery,
  useGetTopProductsQuery,
  useGetSalesByCategoryQuery,
} = dashboardApi;
