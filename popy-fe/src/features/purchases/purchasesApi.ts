import { baseApi } from '@/api/baseApi';
import type { ID, ListQueryParams, PaginatedResponse } from '@/types';
import type { Purchase, PurchasePayload, UpdatePurchasePayload } from './types';

export const purchasesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPurchases: builder.query<PaginatedResponse<Purchase>, ListQueryParams>({
      query: (params) => ({ url: '/purchases', params }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((p) => ({
                type: 'Purchase' as const,
                id: p.id,
              })),
              { type: 'Purchase' as const, id: 'LIST' },
            ]
          : [{ type: 'Purchase' as const, id: 'LIST' }],
    }),

    getPurchase: builder.query<Purchase, ID>({
      query: (id) => ({ url: `/purchases/${id}` }),
      providesTags: (_r, _e, id) => [{ type: 'Purchase', id }],
    }),

    createPurchase: builder.mutation<Purchase, PurchasePayload>({
      query: (body) => ({ url: '/purchases', method: 'POST', data: body }),
      invalidatesTags: [
        { type: 'Purchase', id: 'LIST' },
        { type: 'Inventory', id: 'LIST' },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    updatePurchase: builder.mutation<
      Purchase,
      { id: ID; data: UpdatePurchasePayload }
    >({
      query: ({ id, data }) => ({
        url: `/purchases/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Purchase', id },
        { type: 'Purchase', id: 'LIST' },
      ],
    }),

    deletePurchase: builder.mutation<void, ID>({
      query: (id) => ({ url: `/purchases/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Purchase', id },
        { type: 'Purchase', id: 'LIST' },
      ],
    }),

    /** Mark purchase as received and increase stock. */
    receivePurchase: builder.mutation<Purchase, ID>({
      query: (id) => ({
        url: `/purchases/${id}/receive`,
        method: 'POST',
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Purchase', id },
        { type: 'Purchase', id: 'LIST' },
        { type: 'Inventory', id: 'LIST' },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    /** Cancel a pending purchase order. */
    cancelPurchase: builder.mutation<Purchase, ID>({
      query: (id) => ({
        url: `/purchases/${id}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Purchase', id },
        { type: 'Purchase', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPurchasesQuery,
  useGetPurchaseQuery,
  useCreatePurchaseMutation,
  useUpdatePurchaseMutation,
  useDeletePurchaseMutation,
  useReceivePurchaseMutation,
  useCancelPurchaseMutation,
} = purchasesApi;
