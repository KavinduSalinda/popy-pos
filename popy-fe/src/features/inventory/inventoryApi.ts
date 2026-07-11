import { baseApi } from '@/api/baseApi';
import type { ListQueryParams, PaginatedResponse } from '@/types';
import type {
  AdjustmentPayload,
  InventoryItem,
  StockTransaction,
} from './types';

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInventory: builder.query<
      PaginatedResponse<InventoryItem>,
      ListQueryParams
    >({
      query: (params) => ({ url: '/inventory', params }),
      providesTags: [{ type: 'Inventory', id: 'LIST' }],
    }),

    getStockTransactions: builder.query<
      PaginatedResponse<StockTransaction>,
      ListQueryParams
    >({
      query: (params) => ({ url: '/inventory/transactions', params }),
      providesTags: [{ type: 'StockTransaction', id: 'LIST' }],
    }),

    createAdjustment: builder.mutation<StockTransaction, AdjustmentPayload>({
      query: (body) => ({
        url: '/inventory/adjustments',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: [
        { type: 'Inventory', id: 'LIST' },
        { type: 'StockTransaction', id: 'LIST' },
        { type: 'Product', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetInventoryQuery,
  useGetStockTransactionsQuery,
  useCreateAdjustmentMutation,
} = inventoryApi;
