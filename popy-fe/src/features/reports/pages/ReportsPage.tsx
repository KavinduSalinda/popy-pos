import { useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Tab,
  Tabs,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { type Dayjs } from 'dayjs';
import type { GridColDef } from '@mui/x-data-grid';
import { EmptyState, Loader, PageHeader } from '@/components/common';
import { DataTable } from '@/components/tables';
import { formatCurrency, formatDate, formatNumber } from '@/utils';
import {
  useGetCustomerReportQuery,
  useGetInventoryReportQuery,
  useGetProfitReportQuery,
  useGetPurchaseReportQuery,
  useGetSalesReportQuery,
} from '../reportsApi';
import type { ReportColumn, ReportFilters, ReportResult } from '../types';

type ReportKey = 'sales' | 'inventory' | 'purchase' | 'customer' | 'profit';

const TABS: { key: ReportKey; label: string }[] = [
  { key: 'sales', label: 'Sales' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'purchase', label: 'Purchase' },
  { key: 'customer', label: 'Customer' },
  { key: 'profit', label: 'Profit' },
];

const formatValue = (value: string | number, type?: ReportColumn['type']) => {
  if (type === 'currency') return formatCurrency(Number(value));
  if (type === 'number') return formatNumber(Number(value));
  if (type === 'date') return formatDate(value);
  return String(value);
};

const ReportTable = ({ result }: { result: ReportResult }) => {
  const columns: GridColDef[] = result.columns.map((col) => ({
    field: col.field,
    headerName: col.header,
    flex: 1,
    minWidth: 140,
    valueFormatter: (value: string | number) => formatValue(value, col.type),
  }));

  const rows = result.rows.map((row, index) => ({ id: index, ...row }));

  return (
    <Stack spacing={2}>
      {result.summary && (
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {Object.entries(result.summary).map(([key, value]) => (
            <Chip key={key} label={`${key}: ${formatNumber(value)}`} />
          ))}
        </Stack>
      )}
      <DataTable rows={rows} columns={columns} paginationMode="client" />
    </Stack>
  );
};

export const ReportsPage = () => {
  const [tab, setTab] = useState<ReportKey>('sales');
  const [fromDate, setFromDate] = useState<Dayjs | null>(
    dayjs().startOf('month'),
  );
  const [toDate, setToDate] = useState<Dayjs | null>(dayjs());

  const filters: ReportFilters = useMemo(
    () => ({
      fromDate: fromDate?.toISOString(),
      toDate: toDate?.toISOString(),
    }),
    [fromDate, toDate],
  );

  const sales = useGetSalesReportQuery(filters, { skip: tab !== 'sales' });
  const inventory = useGetInventoryReportQuery(filters, {
    skip: tab !== 'inventory',
  });
  const purchase = useGetPurchaseReportQuery(filters, {
    skip: tab !== 'purchase',
  });
  const customer = useGetCustomerReportQuery(filters, {
    skip: tab !== 'customer',
  });
  const profit = useGetProfitReportQuery(filters, { skip: tab !== 'profit' });

  const active = { sales, inventory, purchase, customer, profit }[tab];

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Analyse your business performance"
      />

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 4, md: 3 }}>
              <DatePicker
                label="From"
                value={fromDate}
                onChange={setFromDate}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4, md: 3 }}>
              <DatePicker
                label="To"
                value={toDate}
                onChange={setToDate}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={tab}
          onChange={(_e, value: ReportKey) => setTab(value)}
          variant="scrollable"
          allowScrollButtonsMobile
        >
          {TABS.map((t) => (
            <Tab key={t.key} value={t.key} label={t.label} />
          ))}
        </Tabs>
      </Box>

      {active.isFetching ? (
        <Loader message="Generating report…" />
      ) : active.data && active.data.rows.length > 0 ? (
        <ReportTable result={active.data} />
      ) : (
        <EmptyState
          title="No report data"
          description="Adjust the date range to generate a report."
        />
      )}
    </>
  );
};

export default ReportsPage;
