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
import { formatNumber, getErrorMessage } from '@/utils';
import {
  useDeleteCustomerMutation,
  useGetCustomersQuery,
} from '../customersApi';
import { CustomerFormDialog } from '../components/CustomerFormDialog';
import type { Customer } from '../types';

export const CustomersPage = () => {
  const {
    search,
    setSearch,
    paginationModel,
    setPaginationModel,
    queryParams,
  } = useListParams();
  const { data, isFetching } = useGetCustomersQuery(queryParams);
  const [deleteCustomer, { isLoading: deleting }] = useDeleteCustomerMutation();

  const [editing, setEditing] = useState<Customer | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Customer | null>(null);

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteCustomer(toDelete.id).unwrap();
      toast.success('Customer deleted');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setToDelete(null);
    }
  };

  const columns: GridColDef<Customer>[] = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 160 },
    { field: 'phone', headerName: 'Phone', width: 150 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 180 },
    {
      field: 'loyaltyPoints',
      headerName: 'Loyalty',
      width: 120,
      valueFormatter: (value: number) => formatNumber(value),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <PermissionGuard permission={PERMISSIONS.CUSTOMER_MANAGE}>
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
        title="Customers"
        subtitle="Manage your customers and loyalty"
        actions={
          <PermissionGuard permission={PERMISSIONS.CUSTOMER_MANAGE}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              New customer
            </Button>
          </PermissionGuard>
        }
      />

      <Stack sx={{ mb: 2 }}>
        <SearchInput
          value={search}
          onSearch={setSearch}
          placeholder="Search customers"
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

      <CustomerFormDialog
        open={formOpen}
        customer={editing}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete customer"
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

export default CustomersPage;
