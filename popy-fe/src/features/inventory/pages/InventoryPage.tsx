import { useMemo, useState } from 'react';
import { Box, Button, Stack, Tab, Tabs } from '@mui/material';
import Tune from '@mui/icons-material/Tune';
import type { GridColDef } from '@mui/x-data-grid';
import {
  PageHeader,
  PermissionGuard,
  SearchInput,
  StatusChip,
} from '@/components/common';
import { DataTable } from '@/components/tables';
import { useListParams } from '@/hooks';
import { PERMISSIONS } from '@/constants';
import { formatDateTime } from '@/utils';
import {
  useGetInventoryQuery,
  useGetStockTransactionsQuery,
} from '../inventoryApi';
import { InventoryTable } from '../components/InventoryTable';
import { AdjustmentDialog } from '../components/AdjustmentDialog';
import type { StockTransaction } from '../types';

type TabKey = 'overview' | 'transactions' | 'low' | 'out';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'transactions', label: 'Transactions' },
  { key: 'low', label: 'Low stock' },
  { key: 'out', label: 'Out of stock' },
];

const InventoryListTab = ({ statusFilter }: { statusFilter?: string }) => {
  const {
    search,
    setSearch,
    paginationModel,
    setPaginationModel,
    queryParams,
  } = useListParams();
  const params = useMemo(
    () => ({
      ...queryParams,
      ...(statusFilter ? { status: statusFilter } : {}),
    }),
    [queryParams, statusFilter],
  );
  const { data, isFetching } = useGetInventoryQuery(params);

  return (
    <Stack spacing={2}>
      <SearchInput
        value={search}
        onSearch={setSearch}
        placeholder="Search products"
      />
      <InventoryTable
        rows={data?.data ?? []}
        loading={isFetching}
        rowCount={data?.total ?? 0}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
      />
    </Stack>
  );
};

const TransactionsTab = () => {
  const { paginationModel, setPaginationModel, queryParams } = useListParams();
  const { data, isFetching } = useGetStockTransactionsQuery(queryParams);

  const columns: GridColDef<StockTransaction>[] = [
    {
      field: 'createdAt',
      headerName: 'Date',
      width: 180,
      valueFormatter: (value: string) => formatDateTime(value),
    },
    { field: 'productName', headerName: 'Product', flex: 1, minWidth: 180 },
    {
      field: 'type',
      headerName: 'Type',
      width: 140,
      renderCell: (params) => <StatusChip label={params.row.type} />,
    },
    { field: 'quantity', headerName: 'Qty', width: 100, type: 'number' },
    { field: 'balance', headerName: 'Balance', width: 110, type: 'number' },
    {
      field: 'note',
      headerName: 'Note',
      flex: 1,
      minWidth: 160,
      sortable: false,
    },
  ];

  return (
    <DataTable
      rows={data?.data ?? []}
      columns={columns}
      loading={isFetching}
      rowCount={data?.total ?? 0}
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
    />
  );
};

export const InventoryPage = () => {
  const [tab, setTab] = useState<TabKey>('overview');
  const [adjustOpen, setAdjustOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Inventory"
        subtitle="Track stock levels and movements"
        actions={
          <PermissionGuard permission={PERMISSIONS.INVENTORY_ADJUST}>
            <Button
              variant="contained"
              startIcon={<Tune />}
              onClick={() => setAdjustOpen(true)}
            >
              New adjustment
            </Button>
          </PermissionGuard>
        }
      />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={tab}
          onChange={(_e, value: TabKey) => setTab(value)}
          variant="scrollable"
          allowScrollButtonsMobile
        >
          {TABS.map((t) => (
            <Tab key={t.key} value={t.key} label={t.label} />
          ))}
        </Tabs>
      </Box>

      {tab === 'overview' && <InventoryListTab />}
      {tab === 'transactions' && <TransactionsTab />}
      {tab === 'low' && <InventoryListTab statusFilter="low" />}
      {tab === 'out' && <InventoryListTab statusFilter="out" />}

      <AdjustmentDialog
        open={adjustOpen}
        onClose={() => setAdjustOpen(false)}
      />
    </>
  );
};

export default InventoryPage;
