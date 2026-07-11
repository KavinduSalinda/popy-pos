import { baseApi } from '@/api/baseApi';
import type { ID, ListQueryParams, PaginatedResponse } from '@/types';
import { toNumber } from '@/utils';
import type { CreateSalePayload, PosProduct, Sale } from './types';

const normalizePosProduct = (product: PosProduct): PosProduct => ({
  ...product,
  sellingPrice: toNumber(product.sellingPrice),
  stockQuantity: toNumber(product.stockQuantity),
});

export const salesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    searchPosProducts: builder.query<PosProduct[], { search?: string }>({
      query: (params) => ({ url: '/pos/products', params }),
      transformResponse: (response: PosProduct[]) =>
        response.map(normalizePosProduct),
      providesTags: [{ type: 'Product', id: 'POS' }],
    }),

    lookupPosProduct: builder.query<PosProduct, { code: string }>({
      query: ({ code }) => ({
        url: '/pos/products/lookup',
        params: { code },
      }),
      transformResponse: (response: PosProduct) =>
        normalizePosProduct(response),
    }),

    createSale: builder.mutation<Sale, CreateSalePayload>({
      query: (body) => ({ url: '/sales', method: 'POST', data: body }),
      invalidatesTags: [
        { type: 'Sale', id: 'LIST' },
        { type: 'Inventory', id: 'LIST' },
        { type: 'Product', id: 'LIST' },
        { type: 'Product', id: 'POS' },
        { type: 'Dashboard', id: 'SUMMARY' },
      ],
    }),

    getSales: builder.query<PaginatedResponse<Sale>, ListQueryParams>({
      query: (params) => ({ url: '/sales', params }),
      providesTags: [{ type: 'Sale', id: 'LIST' }],
    }),

    getSale: builder.query<Sale, ID>({
      query: (id) => ({ url: `/sales/${id}` }),
      providesTags: (_r, _e, id) => [{ type: 'Sale', id }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useSearchPosProductsQuery,
  useLazyLookupPosProductQuery,
  useCreateSaleMutation,
  useGetSalesQuery,
  useGetSaleQuery,
} = salesApi;
