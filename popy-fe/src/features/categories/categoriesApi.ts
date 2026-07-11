import { baseApi } from '@/api/baseApi';
import type { ID } from '@/types';
import type { Category, CategoryPayload } from './types';

export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], void>({
      query: () => ({ url: '/categories' }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((c) => ({ type: 'Category' as const, id: c.id })),
              { type: 'Category' as const, id: 'LIST' },
            ]
          : [{ type: 'Category' as const, id: 'LIST' }],
    }),

    createCategory: builder.mutation<Category, CategoryPayload>({
      query: (body) => ({ url: '/categories', method: 'POST', data: body }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
    }),

    updateCategory: builder.mutation<
      Category,
      { id: ID; data: CategoryPayload }
    >({
      query: ({ id, data }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' },
      ],
    }),

    deleteCategory: builder.mutation<void, ID>({
      query: (id) => ({ url: `/categories/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi;
