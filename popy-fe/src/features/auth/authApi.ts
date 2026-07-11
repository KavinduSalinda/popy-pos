import { baseApi } from '@/api/baseApi';
import { logout, setCredentials } from './authSlice';
import type {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  ResetPasswordRequest,
} from './types';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', data: body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch {
          /* handled by the component via the mutation error */
        }
      },
    }),

    logout: builder.mutation<void, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(logout());
          dispatch(baseApi.util.resetApiState());
        }
      },
    }),

    forgotPassword: builder.mutation<
      { message: string },
      ForgotPasswordRequest
    >({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        data: body,
      }),
    }),

    resetPassword: builder.mutation<{ message: string }, ResetPasswordRequest>({
      query: ({ token, password }) => ({
        url: '/auth/reset-password',
        method: 'POST',
        data: { token, password },
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
