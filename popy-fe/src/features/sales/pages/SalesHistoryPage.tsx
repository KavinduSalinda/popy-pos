import { useNavigate } from 'react-router-dom';
import type { GridColDef } from '@mui/x-data-grid';
import { Stack } from '@mui/material';
import { PageHeader, SearchInput, StatusChip } from '@/components/common';
import { DataTable } from '@/components/tables';
import { useListParams } from '@/hooks';
import { buildPath, ROUTES } from '@/constants';
import { formatCurrency, formatDateTime } from '@/utils';
import { useGetSalesQuery } from '../salesApi';
import type { Sale } from '../types';

export const SalesHistoryPage = () => {
  const navigate = useNavigate();
  const {
    search,
    setSearch,
    paginationModel,
    setPaginationModel,
    queryParams,
  } = useListParams();
  const { data, isFetching } = useGetSalesQuery(queryParams);

  const columns: GridColDef<Sale>[] = [
    { field: 'reference', headerName: 'Reference', width: 160 },
    {
      field: 'createdAt',
      headerName: 'Date',
      width: 180,
      valueFormatter: (value: string) => formatDateTime(value),
    },
    {
      field: 'customerName',
      headerName: 'Customer',
      flex: 1,
      minWidth: 160,
      valueGetter: (_v, row) => row.customerName ?? 'Walk-in',
    },
    {
      field: 'paymentMethod',
      headerName: 'Payment',
      width: 130,
      renderCell: (params) => <StatusChip label={params.row.paymentMethod} />,
    },
    {
      field: 'total',
      headerName: 'Total',
      width: 130,
      valueFormatter: (value: number) => formatCurrency(value),
    },
  ];

  return (
    <>
      <PageHeader title="Sales" subtitle="View past sales transactions" />

      <Stack sx={{ mb: 2 }}>
        <SearchInput
          value={search}
          onSearch={setSearch}
          placeholder="Search by reference or customer"
        />
      </Stack>

      <DataTable
        rows={data?.data ?? []}
        columns={columns}
        loading={isFetching}
        rowCount={data?.total ?? 0}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        onRowClick={(params) =>
          navigate(buildPath(ROUTES.SALE_VIEW, { id: params.row.id }))
        }
      />
    </>
  );
};

export default SalesHistoryPage;
