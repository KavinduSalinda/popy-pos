import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Tooltip,
} from '@mui/material';
import Add from '@mui/icons-material/Add';
import Cancel from '@mui/icons-material/Cancel';
import LocalShipping from '@mui/icons-material/LocalShipping';
import Visibility from '@mui/icons-material/Visibility';
import type { GridColDef } from '@mui/x-data-grid';
import { toast } from 'react-toastify';
import { PageHeader, SearchInput, StatusChip } from '@/components/common';
import { DataTable } from '@/components/tables';
import { useListParams, usePermissions } from '@/hooks';
import { PERMISSIONS, ROUTES, buildPath } from '@/constants';
import { formatCurrency, formatDate, getErrorMessage } from '@/utils';
import { useGetReturnsQuery } from '@/features/returns/returnsApi';
import type { ReturnRecord } from '@/features/returns/types';
import {
  useCancelPurchaseMutation,
  useGetPurchasesQuery,
  useReceivePurchaseMutation,
} from '../purchasesApi';
import { PurchaseFormDialog } from '../components/PurchaseFormDialog';
import type { Purchase } from '../types';
import { RECEIVABLE_PURCHASE_STATUSES } from '../types';

type TabKey = 'all' | 'orders' | 'grn' | 'returns';

const TABS: { key: TabKey; label: string; status?: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'orders', label: 'Purchase Orders', status: 'ORDERED' },
  { key: 'grn', label: 'Goods Received', status: 'RECEIVED' },
  { key: 'returns', label: 'Purchase Returns' },
];

interface PurchaseTableProps {
  statusFilter?: string;
  canManage: boolean;
  onRowClick: (purchase: Purchase) => void;
}

const PurchaseTable = ({
  statusFilter,
  canManage,
  onRowClick,
}: PurchaseTableProps) => {
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
  const { data, isFetching } = useGetPurchasesQuery(params);
  const [receivePurchase, { isLoading: receiving }] =
    useReceivePurchaseMutation();
  const [cancelPurchase, { isLoading: cancelling }] =
    useCancelPurchaseMutation();

  const handleReceive = async (event: React.MouseEvent, purchase: Purchase) => {
    event.stopPropagation();
    try {
      await receivePurchase(purchase.id).unwrap();
      toast.success(`${purchase.reference} marked as received`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleCancel = async (event: React.MouseEvent, purchase: Purchase) => {
    event.stopPropagation();
    try {
      await cancelPurchase(purchase.id).unwrap();
      toast.success(`${purchase.reference} cancelled`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const columns: GridColDef<Purchase>[] = [
    { field: 'reference', headerName: 'Reference', width: 160 },
    {
      field: 'createdAt',
      headerName: 'Date',
      width: 140,
      valueFormatter: (value: string) => formatDate(value),
    },
    { field: 'supplierName', headerName: 'Supplier', flex: 1, minWidth: 160 },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      renderCell: (params) => <StatusChip label={params.row.status} />,
    },
    {
      field: 'total',
      headerName: 'Total',
      width: 130,
      valueFormatter: (value: number) => formatCurrency(value),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 140,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const purchase = params.row;
        const canReceive = RECEIVABLE_PURCHASE_STATUSES.includes(
          purchase.status,
        );
        const canCancel = purchase.status === 'ORDERED';

        return (
          <Stack direction="row" alignItems="center">
            <Tooltip title="View details">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onRowClick(purchase);
                }}
              >
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
            {canManage && canReceive && (
              <Tooltip title="Receive goods">
                <IconButton
                  size="small"
                  color="primary"
                  disabled={receiving}
                  onClick={(e) => handleReceive(e, purchase)}
                >
                  <LocalShipping fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {canManage && canCancel && (
              <Tooltip title="Cancel order">
                <IconButton
                  size="small"
                  color="warning"
                  disabled={cancelling}
                  onClick={(e) => handleCancel(e, purchase)}
                >
                  <Cancel fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        );
      },
    },
  ];

  return (
    <Stack spacing={2}>
      <SearchInput
        value={search}
        onSearch={setSearch}
        placeholder="Search by reference or supplier"
      />
      <DataTable
        rows={data?.data ?? []}
        columns={columns}
        loading={isFetching}
        rowCount={data?.total ?? 0}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        onRowClick={(params) => onRowClick(params.row)}
      />
    </Stack>
  );
};

const PurchaseReturnsTable = () => {
  const { search, setSearch } = useListParams();
  const { data: returns = [], isFetching } = useGetReturnsQuery({});

  const rows = useMemo(() => {
    const purchaseReturns = returns.filter((r) => r.type === 'PURCHASE');
    if (!search.trim()) return purchaseReturns;
    const q = search.toLowerCase();
    return purchaseReturns.filter(
      (r) =>
        r.reference.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q),
    );
  }, [returns, search]);

  const columns: GridColDef<ReturnRecord>[] = [
    { field: 'reference', headerName: 'Reference', width: 160 },
    {
      field: 'createdAt',
      headerName: 'Date',
      width: 140,
      valueFormatter: (value: string) => formatDate(value),
    },
    { field: 'reason', headerName: 'Reason', flex: 1, minWidth: 200 },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 130,
      valueFormatter: (value: number) => formatCurrency(value),
    },
  ];

  return (
    <Stack spacing={2}>
      <SearchInput
        value={search}
        onSearch={setSearch}
        placeholder="Search returns"
      />
      <DataTable
        rows={rows}
        columns={columns}
        loading={isFetching}
        paginationMode="client"
      />
    </Stack>
  );
};

export const PurchasesPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission(PERMISSIONS.PURCHASE_MANAGE);

  const [tab, setTab] = useState<TabKey>('all');
  const [formOpen, setFormOpen] = useState(false);
  const activeTab = TABS.find((t) => t.key === tab);

  const goToDetail = (purchase: Purchase) => {
    navigate(buildPath(ROUTES.PURCHASE_VIEW, { id: purchase.id }));
  };

  return (
    <>
      <PageHeader
        title="Purchases"
        subtitle="Manage purchase orders, goods received, and returns"
        actions={
          canManage ? (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setFormOpen(true)}
            >
              New purchase
            </Button>
          ) : undefined
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

      {tab === 'returns' ? (
        <PurchaseReturnsTable />
      ) : (
        <PurchaseTable
          statusFilter={activeTab?.status}
          canManage={canManage}
          onRowClick={goToDetail}
        />
      )}

      <PurchaseFormDialog open={formOpen} onClose={() => setFormOpen(false)} />
    </>
  );
};

export default PurchasesPage;
