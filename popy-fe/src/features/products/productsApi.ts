import { baseApi } from '@/api/baseApi';
import type { ID, ListQueryParams, PaginatedResponse } from '@/types';
import type { Product, ProductPayload } from './types';

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<PaginatedResponse<Product>, ListQueryParams>({
      query: (params) => ({ url: '/products', params }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((p) => ({
                type: 'Product' as const,
                id: p.id,
              })),
              { type: 'Product' as const, id: 'LIST' },
            ]
          : [{ type: 'Product' as const, id: 'LIST' }],
    }),

    getProduct: builder.query<Product, ID>({
      query: (id) => ({ url: `/products/${id}` }),
      providesTags: (_r, _e, id) => [{ type: 'Product', id }],
    }),

    createProduct: builder.mutation<Product, ProductPayload>({
      query: (body) => ({ url: '/products', method: 'POST', data: body }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    updateProduct: builder.mutation<Product, { id: ID; data: ProductPayload }>({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    deleteProduct: builder.mutation<void, ID>({
      query: (id) => ({ url: `/products/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;
