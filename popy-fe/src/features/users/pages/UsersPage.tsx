import { useState } from 'react';
import { Button, IconButton, Stack, Tooltip } from '@mui/material';
import Add from '@mui/icons-material/Add';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import type { GridColDef } from '@mui/x-data-grid';
import { toast } from 'react-toastify';
import {
  PageHeader,
  PermissionGuard,
  SearchInput,
  StatusChip,
} from '@/components/common';
import { DataTable } from '@/components/tables';
import { ConfirmDialog } from '@/components/dialogs';
import { useListParams } from '@/hooks';
import { PERMISSIONS } from '@/constants';
import { ROLE_LABELS } from '@/constants/roles';
import { getErrorMessage } from '@/utils';
import { useDeleteUserMutation, useGetUsersQuery } from '../usersApi';
import { UserFormDialog } from '../components/UserFormDialog';
import type { ManagedUser } from '../types';

export const UsersPage = () => {
  const {
    search,
    setSearch,
    paginationModel,
    setPaginationModel,
    queryParams,
  } = useListParams();
  const { data, isFetching } = useGetUsersQuery(queryParams);
  const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation();

  const [editing, setEditing] = useState<ManagedUser | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState<ManagedUser | null>(null);

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteUser(toDelete.id).unwrap();
      toast.success('User deleted');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setToDelete(null);
    }
  };

  const columns: GridColDef<ManagedUser>[] = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 160 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
    {
      field: 'role',
      headerName: 'Role',
      width: 160,
      valueGetter: (_v, row) => ROLE_LABELS[row.role],
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <StatusChip
          label={params.row.isActive ? 'Active' : 'Inactive'}
          active={params.row.isActive}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <PermissionGuard permission={PERMISSIONS.USER_MANAGE}>
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
        title="Users"
        subtitle="Manage system users and roles"
        actions={
          <PermissionGuard permission={PERMISSIONS.USER_MANAGE}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              New user
            </Button>
          </PermissionGuard>
        }
      />

      <Stack sx={{ mb: 2 }}>
        <SearchInput
          value={search}
          onSearch={setSearch}
          placeholder="Search users"
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

      <UserFormDialog
        open={formOpen}
        user={editing}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete user"
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

export default UsersPage;
