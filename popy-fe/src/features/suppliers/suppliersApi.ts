import { baseApi } from '@/api/baseApi';
import type { ID, ListQueryParams, PaginatedResponse } from '@/types';
import type { Supplier, SupplierPayload } from './types';

export const suppliersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSuppliers: builder.query<PaginatedResponse<Supplier>, ListQueryParams>({
      query: (params) => ({ url: '/suppliers', params }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((s) => ({
                type: 'Supplier' as const,
                id: s.id,
              })),
              { type: 'Supplier' as const, id: 'LIST' },
            ]
          : [{ type: 'Supplier' as const, id: 'LIST' }],
    }),

    getSupplier: builder.query<Supplier, ID>({
      query: (id) => ({ url: `/suppliers/${id}` }),
      providesTags: (_r, _e, id) => [{ type: 'Supplier', id }],
    }),

    createSupplier: builder.mutation<Supplier, SupplierPayload>({
      query: (body) => ({ url: '/suppliers', method: 'POST', data: body }),
      invalidatesTags: [{ type: 'Supplier', id: 'LIST' }],
    }),

    updateSupplier: builder.mutation<
      Supplier,
      { id: ID; data: SupplierPayload }
    >({
      query: ({ id, data }) => ({
        url: `/suppliers/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Supplier', id },
        { type: 'Supplier', id: 'LIST' },
      ],
    }),

    deleteSupplier: builder.mutation<void, ID>({
      query: (id) => ({ url: `/suppliers/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Supplier', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSuppliersQuery,
  useGetSupplierQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} = suppliersApi;
