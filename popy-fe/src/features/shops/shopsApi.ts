import { baseApi } from '@/api/baseApi';
import type { Shop } from '@/features/auth/types';
import type { ID } from '@/types';

interface AccessibleShopsResponse {
  shops: Shop[];
  defaultShopId?: ID | null;
}

export const shopsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAccessibleShops: builder.query<AccessibleShopsResponse, void>({
      query: () => ({ url: '/shops/accessible' }),
      providesTags: [{ type: 'Shop', id: 'ACCESSIBLE' }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAccessibleShopsQuery } = shopsApi;
