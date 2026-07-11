import { baseApi } from '@/api/baseApi';
import type { ID, ListQueryParams, PaginatedResponse } from '@/types';
import type { Customer, CustomerPayload } from './types';

export const customersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query<PaginatedResponse<Customer>, ListQueryParams>({
      query: (params) => ({ url: '/customers', params }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((c) => ({
                type: 'Customer' as const,
                id: c.id,
              })),
              { type: 'Customer' as const, id: 'LIST' },
            ]
          : [{ type: 'Customer' as const, id: 'LIST' }],
    }),

    getCustomer: builder.query<Customer, ID>({
      query: (id) => ({ url: `/customers/${id}` }),
      providesTags: (_r, _e, id) => [{ type: 'Customer', id }],
    }),

    createCustomer: builder.mutation<Customer, CustomerPayload>({
      query: (body) => ({ url: '/customers', method: 'POST', data: body }),
      invalidatesTags: [{ type: 'Customer', id: 'LIST' }],
    }),

    updateCustomer: builder.mutation<
      Customer,
      { id: ID; data: CustomerPayload }
    >({
      query: ({ id, data }) => ({
        url: `/customers/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Customer', id },
        { type: 'Customer', id: 'LIST' },
      ],
    }),

    deleteCustomer: builder.mutation<void, ID>({
      query: (id) => ({ url: `/customers/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Customer', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCustomersQuery,
  useGetCustomerQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = customersApi;
