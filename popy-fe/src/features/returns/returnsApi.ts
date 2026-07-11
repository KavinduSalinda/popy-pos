import { baseApi } from '@/api/baseApi';
import type { ListQueryParams } from '@/types';
import type {
  PurchaseReturnPayload,
  ReturnRecord,
  SalesReturnPayload,
} from './types';

export const returnsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReturns: builder.query<ReturnRecord[], ListQueryParams | void>({
      query: (params) => ({ url: '/returns', params: params ?? {} }),
      transformResponse: (
        response: ReturnRecord[] | { data: ReturnRecord[] },
      ) => (Array.isArray(response) ? response : (response.data ?? [])),
      providesTags: [{ type: 'Return', id: 'LIST' }],
    }),

    createSalesReturn: builder.mutation<ReturnRecord, SalesReturnPayload>({
      query: (body) => ({ url: '/returns/sales', method: 'POST', data: body }),
      invalidatesTags: [
        { type: 'Return', id: 'LIST' },
        { type: 'Inventory', id: 'LIST' },
      ],
    }),

    createPurchaseReturn: builder.mutation<ReturnRecord, PurchaseReturnPayload>(
      {
        query: (body) => ({
          url: '/returns/purchase',
          method: 'POST',
          data: body,
        }),
        invalidatesTags: [
          { type: 'Return', id: 'LIST' },
          { type: 'Inventory', id: 'LIST' },
          { type: 'Purchase', id: 'LIST' },
        ],
      },
    ),
  }),
  overrideExisting: false,
});

export const {
  useGetReturnsQuery,
  useCreateSalesReturnMutation,
  useCreatePurchaseReturnMutation,
} = returnsApi;
