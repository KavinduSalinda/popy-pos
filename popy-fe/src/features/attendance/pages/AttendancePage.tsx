import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import EventAvailable from '@mui/icons-material/EventAvailable';
import type { GridColDef } from '@mui/x-data-grid';
import { toast } from 'react-toastify';
import { useAppSelector } from '@/app/hooks';
import { PageHeader, PermissionGuard } from '@/components/common';
import { DataTable } from '@/components/tables';
import { PERMISSIONS } from '@/constants';
import { ROLE_LABELS } from '@/constants/roles';
import { useListParams, usePermissions } from '@/hooks';
import { getErrorMessage } from '@/utils';
import {
  useGetAttendanceListQuery,
  useGetMyAttendanceTodayQuery,
  useMarkAttendanceMutation,
} from '../attendanceApi';
import type { AttendanceRecord, ClockType } from '../types';

const formatDateTime = (iso: string | null | undefined) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

export const AttendancePage = () => {
  const { hasPermission } = usePermissions();
  const canMark = hasPermission(PERMISSIONS.ATTENDANCE_MARK);
  const canView = hasPermission(PERMISSIONS.ATTENDANCE_VIEW);
  const { user, currentShopId } = useAppSelector((s) => s.auth);

  const currentShop =
    user?.shops?.find((shop) => String(shop.id) === String(currentShopId)) ??
    user?.shops?.find((shop) => String(shop.id) === String(user.shopId)) ??
    user?.shops?.[0];
  const isProShop = currentShop?.plan === 'PRO';
  const isSuperAdminWithoutShopContext = !currentShop && canView && !canMark;

  const { data: today, isFetching: todayLoading, error: todayError } =
    useGetMyAttendanceTodayQuery(undefined, {
      skip: !canMark || !isProShop,
    });
  const [markAttendance, { isLoading: marking }] = useMarkAttendanceMutation();

  const { paginationModel, setPaginationModel, queryParams } = useListParams();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const listParams = useMemo(
    () => ({
      ...queryParams,
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
    }),
    [queryParams, from, to],
  );

  const { data: list, isFetching: listLoading, error: listError } =
    useGetAttendanceListQuery(listParams, {
      skip: !canView || (!isProShop && !isSuperAdminWithoutShopContext),
    });

  const planBlocked =
    getErrorMessage(todayError).includes('Pro plan') ||
    getErrorMessage(listError).includes('Pro plan') ||
    (Boolean(currentShop) && !isProShop);

  const handleClock = async (type: ClockType) => {
    try {
      const result = await markAttendance({ type }).unwrap();
      if (type === 'in') {
        toast.success(
          result.alreadyMarked
            ? 'Already clocked in for today'
            : 'Clocked in successfully',
        );
      } else {
        toast.success(
          result.alreadyMarked
            ? 'Already clocked out for today'
            : 'Clocked out successfully',
        );
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const columns = useMemo<GridColDef<AttendanceRecord>[]>(
    () => [
      { field: 'attendanceDate', headerName: 'Date', width: 120 },
      { field: 'userName', headerName: 'Employee', flex: 1, minWidth: 140 },
      { field: 'userEmail', headerName: 'Email', flex: 1, minWidth: 160 },
      {
        field: 'userRole',
        headerName: 'Role',
        width: 140,
        valueGetter: (_v, row) =>
          ROLE_LABELS[row.userRole as keyof typeof ROLE_LABELS] ?? row.userRole,
      },
      { field: 'shopName', headerName: 'Shop', flex: 1, minWidth: 120 },
      {
        field: 'clockInAt',
        headerName: 'In',
        width: 170,
        valueGetter: (_v, row) => formatDateTime(row.clockInAt),
      },
      {
        field: 'clockOutAt',
        headerName: 'Out',
        width: 170,
        valueGetter: (_v, row) => formatDateTime(row.clockOutAt),
      },
    ],
    [],
  );

  return (
    <Stack spacing={2}>
      <PageHeader
        title="Attendance"
        subtitle="Clock in / out for the day and review the shop attendance sheet."
      />

      {planBlocked && currentShop && !isProShop ? (
        <Alert severity="warning">
          Attendance is a Pro feature. Ask a super admin to upgrade{' '}
          <strong>{currentShop.name}</strong> to the Pro plan.
        </Alert>
      ) : null}

      <PermissionGuard permission={PERMISSIONS.ATTENDANCE_MARK}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <EventAvailable color="primary" />
              <Typography variant="h6">Today’s attendance</Typography>
            </Stack>
            {!isProShop ? (
              <Alert severity="info">
                Clock in / out is available when this shop is on Pro.
              </Alert>
            ) : todayLoading ? (
              <Typography variant="body2" color="text.secondary">
                Checking status…
              </Typography>
            ) : (
              <>
                <Alert
                  severity={
                    today?.clockedOut
                      ? 'success'
                      : today?.clockedIn
                        ? 'info'
                        : 'warning'
                  }
                >
                  {today?.clockedOut
                    ? `Complete for ${today.attendanceDate}: in ${formatDateTime(today.record?.clockInAt)} · out ${formatDateTime(today.record?.clockOutAt)}`
                    : today?.clockedIn
                      ? `Clocked in at ${formatDateTime(today.record?.clockInAt)} — remember to clock out.`
                      : `Not clocked in yet for ${today?.attendanceDate ?? 'today'}.`}
                </Alert>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    disabled={Boolean(today?.clockedIn) || marking || todayLoading}
                    onClick={() => void handleClock('in')}
                  >
                    {today?.clockedIn ? 'Clocked in' : 'Clock in'}
                  </Button>
                  <Button
                    variant="outlined"
                    disabled={
                      !today?.clockedIn ||
                      Boolean(today?.clockedOut) ||
                      marking ||
                      todayLoading
                    }
                    onClick={() => void handleClock('out')}
                  >
                    {today?.clockedOut ? 'Clocked out' : 'Clock out'}
                  </Button>
                </Box>
              </>
            )}
          </Stack>
        </Paper>
      </PermissionGuard>

      <PermissionGuard permission={PERMISSIONS.ATTENDANCE_VIEW}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Typography variant="h6">Attendance sheet</Typography>
            {!isProShop && !isSuperAdminWithoutShopContext ? (
              <Alert severity="info">
                The attendance sheet is available on Pro shops only.
              </Alert>
            ) : (
              <>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <TextField
                    size="small"
                    type="date"
                    label="From"
                    InputLabelProps={{ shrink: true }}
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                  />
                  <TextField
                    size="small"
                    type="date"
                    label="To"
                    InputLabelProps={{ shrink: true }}
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                  />
                </Stack>
                <DataTable
                  rows={list?.data ?? []}
                  columns={columns}
                  loading={listLoading}
                  rowCount={list?.total ?? 0}
                  paginationModel={paginationModel}
                  onPaginationModelChange={setPaginationModel}
                  paginationMode="server"
                />
              </>
            )}
          </Stack>
        </Paper>
      </PermissionGuard>
    </Stack>
  );
};

export default AttendancePage;
