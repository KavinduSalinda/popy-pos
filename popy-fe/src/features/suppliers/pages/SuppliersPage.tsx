import { useState } from 'react';
import { Button, IconButton, Stack, Tooltip } from '@mui/material';
import Add from '@mui/icons-material/Add';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import type { GridColDef } from '@mui/x-data-grid';
import { toast } from 'react-toastify';
import { PageHeader, PermissionGuard, SearchInput } from '@/components/common';
import { DataTable } from '@/components/tables';
import { ConfirmDialog } from '@/components/dialogs';
import { useListParams } from '@/hooks';
import { PERMISSIONS } from '@/constants';
import { getErrorMessage } from '@/utils';
import {
  useDeleteSupplierMutation,
  useGetSuppliersQuery,
} from '../suppliersApi';
import { SupplierFormDialog } from '../components/SupplierFormDialog';
import type { Supplier } from '../types';

export const SuppliersPage = () => {
  const {
    search,
    setSearch,
    paginationModel,
    setPaginationModel,
    queryParams,
  } = useListParams();
  const { data, isFetching } = useGetSuppliersQuery(queryParams);
  const [deleteSupplier, { isLoading: deleting }] = useDeleteSupplierMutation();

  const [editing, setEditing] = useState<Supplier | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Supplier | null>(null);

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteSupplier(toDelete.id).unwrap();
      toast.success('Supplier deleted');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setToDelete(null);
    }
  };

  const columns: GridColDef<Supplier>[] = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 160 },
    { field: 'companyName', headerName: 'Company', flex: 1, minWidth: 160 },
    { field: 'phone', headerName: 'Phone', width: 150 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 180 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <PermissionGuard permission={PERMISSIONS.SUPPLIER_MANAGE}>
          <Stack direction="row">
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => {
                  setEditing(params.row);
                  setFormOpen(true);
                }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                onClick={() => setToDelete(params.row)}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </PermissionGuard>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Suppliers"
        subtitle="Manage your suppliers"
        actions={
          <PermissionGuard permission={PERMISSIONS.SUPPLIER_MANAGE}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              New supplier
            </Button>
          </PermissionGuard>
        }
      />

      <Stack sx={{ mb: 2 }}>
        <SearchInput
          value={search}
          onSearch={setSearch}
          placeholder="Search suppliers"
        />
      </Stack>

      <DataTable
        rows={data?.data ?? []}
        columns={columns}
        loading={isFetching}
        rowCount={data?.total ?? 0}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
      />

      <SupplierFormDialog
        open={formOpen}
        supplier={editing}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete supplier"
        message={`Delete "${toDelete?.name}"?`}
        destructive
        confirmText="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
};

export default SuppliersPage;
