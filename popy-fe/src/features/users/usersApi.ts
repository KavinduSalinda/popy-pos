import { baseApi } from '@/api/baseApi';
import type { ID, ListQueryParams, PaginatedResponse } from '@/types';
import type { ManagedUser, UserPayload } from './types';

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<PaginatedResponse<ManagedUser>, ListQueryParams>({
      query: (params) => ({ url: '/users', params }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((u) => ({ type: 'User' as const, id: u.id })),
              { type: 'User' as const, id: 'LIST' },
            ]
          : [{ type: 'User' as const, id: 'LIST' }],
    }),

    getUser: builder.query<ManagedUser, ID>({
      query: (id) => ({ url: `/users/${id}` }),
      providesTags: (_r, _e, id) => [{ type: 'User', id }],
    }),

    createUser: builder.mutation<ManagedUser, UserPayload>({
      query: (body) => ({ url: '/users', method: 'POST', data: body }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),

    updateUser: builder.mutation<ManagedUser, { id: ID; data: UserPayload }>({
      query: ({ id, data }) => ({ url: `/users/${id}`, method: 'PUT', data }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),

    deleteUser: builder.mutation<void, ID>({
      query: (id) => ({ url: `/users/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi;
