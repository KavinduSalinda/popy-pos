import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import type { ChipProps } from '@mui/material';
import { DataTable } from '@/components/tables';
import { StatusChip } from '@/components/common';
import type { InventoryItem, StockStatus } from '../types';

const STATUS_LABEL: Record<StockStatus, string> = {
  in: 'In stock',
  low: 'Low stock',
  out: 'Out of stock',
};

const STATUS_COLOR: Record<StockStatus, ChipProps['color']> = {
  in: 'success',
  low: 'warning',
  out: 'error',
};

interface InventoryTableProps {
  rows: InventoryItem[];
  loading: boolean;
  rowCount: number;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
}

export const InventoryTable = ({
  rows,
  loading,
  rowCount,
  paginationModel,
  onPaginationModelChange,
}: InventoryTableProps) => {
  const columns: GridColDef<InventoryItem>[] = [
    { field: 'productName', headerName: 'Product', flex: 1, minWidth: 200 },
    { field: 'sku', headerName: 'SKU', width: 140 },
    {
      field: 'stockQuantity',
      headerName: 'On hand',
      width: 120,
      type: 'number',
    },
    {
      field: 'reorderLevel',
      headerName: 'Reorder level',
      width: 140,
      type: 'number',
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params) => (
        <StatusChip
          label={STATUS_LABEL[params.row.status]}
          color={STATUS_COLOR[params.row.status]}
        />
      ),
    },
  ];

  return (
    <DataTable
      rows={rows}
      columns={columns}
      loading={loading}
      rowCount={rowCount}
      paginationModel={paginationModel}
      onPaginationModelChange={onPaginationModelChange}
    />
  );
};
