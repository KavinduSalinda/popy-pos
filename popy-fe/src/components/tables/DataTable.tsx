import {
  DataGrid,
  type DataGridProps,
  type GridColDef,
  type GridPaginationModel,
  type GridRowIdGetter,
} from '@mui/x-data-grid';
import { Paper, type SxProps, type Theme } from '@mui/material';
import { APP_CONFIG } from '@/constants';

export interface DataTableProps<T extends object> {
  rows: T[];
  columns: GridColDef<T>[];
  loading?: boolean;
  rowCount?: number;
  paginationModel?: GridPaginationModel;
  onPaginationModelChange?: (model: GridPaginationModel) => void;
  getRowId?: GridRowIdGetter<T>;
  paginationMode?: DataGridProps['paginationMode'];
  autoHeight?: boolean;
  pageSizeOptions?: number[];
  onRowClick?: DataGridProps['onRowClick'];
  /** Fixed grid height when autoHeight is false (e.g. "100%" or 420). */
  height?: number | string;
  sx?: SxProps<Theme>;
}

export function DataTable<T extends object>({
  rows,
  columns,
  loading = false,
  rowCount,
  paginationModel,
  onPaginationModelChange,
  getRowId,
  paginationMode = 'server',
  autoHeight = true,
  pageSizeOptions = [...APP_CONFIG.pageSizeOptions],
  onRowClick,
  height,
  sx,
}: DataTableProps<T>) {
  return (
    <Paper variant="outlined" sx={{ width: '100%', ...sx }}>
      <DataGrid<T>
        rows={rows}
        columns={columns}
        loading={loading}
        autoHeight={autoHeight}
        getRowId={getRowId}
        rowCount={paginationMode === 'server' ? (rowCount ?? 0) : undefined}
        paginationMode={paginationMode}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        pageSizeOptions={pageSizeOptions}
        onRowClick={onRowClick}
        disableRowSelectionOnClick
        disableColumnMenu
        sx={{
          border: 0,
          ...(!autoHeight && height ? { height, minHeight: height } : {}),
          '& .MuiDataGrid-columnHeaders': { fontWeight: 700 },
          '& .MuiDataGrid-row:hover': {
            cursor: onRowClick ? 'pointer' : 'default',
          },
        }}
      />
    </Paper>
  );
}
