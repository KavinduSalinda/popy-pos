import { useState } from 'react';
import {
  Button,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import Add from '@mui/icons-material/Add';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import Print from '@mui/icons-material/Print';
import type { GridColDef } from '@mui/x-data-grid';
import { toast } from 'react-toastify';
import {
  EmptyState,
  PageHeader,
  PermissionGuard,
  SearchInput,
  StatusChip,
} from '@/components/common';
import { DataTable } from '@/components/tables';
import { ConfirmDialog } from '@/components/dialogs';
import { BarcodePrintDialog } from '@/components/barcode';
import { useListParams } from '@/hooks';
import { PERMISSIONS } from '@/constants';
import { formatCurrency, getErrorMessage } from '@/utils';
import { useGetCategoriesQuery } from '@/features/categories/categoriesApi';
import { useDeleteProductMutation, useGetProductsQuery } from '../productsApi';
import { ProductFormDialog } from '../components/ProductFormDialog';
import type { Product } from '../types';

export const ProductsPage = () => {
  const {
    search,
    setSearch,
    paginationModel,
    setPaginationModel,
    queryParams,
    extraFilters,
    setFilter,
  } = useListParams();

  const { data, isFetching } = useGetProductsQuery(queryParams);
  const { data: categories = [] } = useGetCategoriesQuery();
  const [deleteProduct, { isLoading: deleting }] = useDeleteProductMutation();

  const [editing, setEditing] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [printLabel, setPrintLabel] = useState<{
    barcode: string;
    title: string;
    subtitle?: string;
  } | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteProduct(toDelete.id).unwrap();
      toast.success('Product deleted');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setToDelete(null);
    }
  };

  const columns: GridColDef<Product>[] = [
    { field: 'name', headerName: 'Name', flex: 1.5, minWidth: 180 },
    { field: 'sku', headerName: 'SKU', width: 130 },
    {
      field: 'categoryName',
      headerName: 'Category',
      width: 150,
      valueGetter: (_v, row) => row.categoryName ?? '-',
    },
    {
      field: 'sellingPrice',
      headerName: 'Price',
      width: 120,
      valueFormatter: (value: number) => formatCurrency(value),
    },
    {
      field: 'stockQuantity',
      headerName: 'Stock',
      width: 100,
      type: 'number',
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 110,
      renderCell: (params) => (
        <StatusChip
          label={params.row.status ? 'Active' : 'Inactive'}
          active={params.row.status}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 160,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const row = params.row;
        const hasBarcode = Boolean(row.barcode?.trim());

        const handlePrint = () => {
          const code = row.barcode?.trim();
          if (!code) return;
          setPrintLabel({
            barcode: code,
            title: row.name,
            subtitle: `SKU: ${row.sku}`,
          });
        };

        return (
          <Stack direction="row">
            {hasBarcode && (
              <Tooltip title="Print barcode label">
                <IconButton
                  size="small"
                  aria-label="Print barcode"
                  onClick={handlePrint}
                >
                  <Print fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <PermissionGuard permission={PERMISSIONS.PRODUCT_UPDATE}>
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  onClick={() => {
                    setEditing(row);
                    setFormOpen(true);
                  }}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
            </PermissionGuard>
            <PermissionGuard permission={PERMISSIONS.PRODUCT_DELETE}>
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => setToDelete(row)}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </PermissionGuard>
          </Stack>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Products"
        subtitle="Manage your product catalog"
        actions={
          <PermissionGuard permission={PERMISSIONS.PRODUCT_CREATE}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={openCreate}
            >
              New product
            </Button>
          </PermissionGuard>
        }
      />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mb: 2 }}
        alignItems={{ sm: 'center' }}
      >
        <SearchInput
          value={search}
          onSearch={setSearch}
          placeholder="Search by name, SKU or barcode"
        />
        <TextField
          select
          size="small"
          label="Category"
          value={extraFilters.category ?? ''}
          onChange={(e) => setFilter('category', e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">All categories</MenuItem>
          {categories.map((c) => (
            <MenuItem key={c.id} value={String(c.id)}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Status"
          value={extraFilters.status ?? ''}
          onChange={(e) => setFilter('status', e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="true">Active</MenuItem>
          <MenuItem value="false">Inactive</MenuItem>
        </TextField>
      </Stack>

      {!isFetching && data && data.data.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Try adjusting your filters or add your first product."
        />
      ) : (
        <DataTable
          rows={data?.data ?? []}
          columns={columns}
          loading={isFetching}
          rowCount={data?.total ?? 0}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
        />
      )}

      <ProductFormDialog
        open={formOpen}
        product={editing}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete product"
        message={`Delete "${toDelete?.name}"? This action cannot be undone.`}
        destructive
        confirmText="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />

      {printLabel && (
        <BarcodePrintDialog
          open
          onClose={() => setPrintLabel(null)}
          barcode={printLabel.barcode}
          title={printLabel.title}
          subtitle={printLabel.subtitle}
        />
      )}
    </>
  );
};

export default ProductsPage;
