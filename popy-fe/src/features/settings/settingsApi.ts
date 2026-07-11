import { baseApi } from '@/api/baseApi';
import type {
  NotificationSettings,
  PosCheckoutNotificationOptions,
} from './types';

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotificationSettings: builder.query<NotificationSettings, void>({
      query: () => ({ url: '/settings/notifications' }),
      providesTags: [{ type: 'Settings', id: 'NOTIFICATIONS' }],
    }),

    getPosCheckoutNotificationOptions: builder.query<
      PosCheckoutNotificationOptions,
      void
    >({
      query: () => ({ url: '/settings/pos-checkout-notifications' }),
      providesTags: [{ type: 'Settings', id: 'POS_CHECKOUT' }],
    }),

    updateNotificationSettings: builder.mutation<
      NotificationSettings,
      Partial<NotificationSettings>
    >({
      query: (body) => ({
        url: '/settings/notifications',
        method: 'PATCH',
        data: body,
      }),
      invalidatesTags: [
        { type: 'Settings', id: 'NOTIFICATIONS' },
        { type: 'Settings', id: 'POS_CHECKOUT' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetNotificationSettingsQuery,
  useGetPosCheckoutNotificationOptionsQuery,
  useUpdateNotificationSettingsMutation,
} = settingsApi;
