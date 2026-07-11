import { useState } from 'react';
import { Button, IconButton, Stack, Tooltip } from '@mui/material';
import Add from '@mui/icons-material/Add';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import type { GridColDef } from '@mui/x-data-grid';
import { toast } from 'react-toastify';
import { PageHeader, PermissionGuard } from '@/components/common';
import { DataTable } from '@/components/tables';
import { ConfirmDialog } from '@/components/dialogs';
import { PERMISSIONS } from '@/constants';
import { getErrorMessage } from '@/utils';
import {
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
} from '../categoriesApi';
import { CategoryFormDialog } from '../components/CategoryFormDialog';
import type { Category } from '../types';

export const CategoriesPage = () => {
  const { data = [], isFetching } = useGetCategoriesQuery();
  const [deleteCategory, { isLoading: deleting }] = useDeleteCategoryMutation();
  const [editing, setEditing] = useState<Category | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Category | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteCategory(toDelete.id).unwrap();
      toast.success('Category deleted');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setToDelete(null);
    }
  };

  const columns: GridColDef<Category>[] = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 180 },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
      minWidth: 240,
      sortable: false,
    },
    {
      field: 'productCount',
      headerName: 'Products',
      width: 120,
      type: 'number',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row">
          <PermissionGuard permission={PERMISSIONS.CATEGORY_MANAGE}>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => openEdit(params.row)}>
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
          </PermissionGuard>
        </Stack>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Categories"
        subtitle="Organise products into categories"
        actions={
          <PermissionGuard permission={PERMISSIONS.CATEGORY_MANAGE}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={openCreate}
            >
              New category
            </Button>
          </PermissionGuard>
        }
      />

      <DataTable
        rows={data}
        columns={columns}
        loading={isFetching}
        paginationMode="client"
      />

      <CategoryFormDialog
        open={formOpen}
        category={editing}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete category"
        message={`Are you sure you want to delete "${toDelete?.name}"? This action cannot be undone.`}
        destructive
        confirmText="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
};

export default CategoriesPage;
