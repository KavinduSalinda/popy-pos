import { baseApi } from '@/api/baseApi';
import type { ListQueryParams, PaginatedResponse } from '@/types';
import type {
  AttendanceRecord,
  AttendanceTodayResponse,
  ClockType,
} from './types';

export const attendanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyAttendanceToday: builder.query<AttendanceTodayResponse, void>({
      query: () => ({ url: '/attendance/today' }),
      providesTags: [{ type: 'Attendance', id: 'TODAY' }],
    }),

    markAttendance: builder.mutation<
      AttendanceRecord & { alreadyMarked?: boolean; action?: ClockType },
      { type: ClockType }
    >({
      query: (body) => ({ url: '/attendance', method: 'POST', data: body }),
      invalidatesTags: [
        { type: 'Attendance', id: 'TODAY' },
        { type: 'Attendance', id: 'LIST' },
      ],
    }),

    getAttendanceList: builder.query<
      PaginatedResponse<AttendanceRecord>,
      ListQueryParams & { from?: string; to?: string; shopId?: string | number }
    >({
      query: (params) => ({ url: '/attendance/list', params }),
      providesTags: [{ type: 'Attendance', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMyAttendanceTodayQuery,
  useMarkAttendanceMutation,
  useGetAttendanceListQuery,
} = attendanceApi;
