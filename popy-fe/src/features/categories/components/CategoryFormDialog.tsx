import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Stack } from '@mui/material';
import { toast } from 'react-toastify';
import { Modal } from '@/components/dialogs';
import { FormTextField } from '@/components/forms';
import { getErrorMessage } from '@/utils';
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from '../categoriesApi';
import { categorySchema, type CategoryFormValues } from '../schema';
import type { Category } from '../types';

interface CategoryFormDialogProps {
  open: boolean;
  category: Category | null;
  onClose: () => void;
}

export const CategoryFormDialog = ({
  open,
  category,
  onClose,
}: CategoryFormDialogProps) => {
  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: updating }] = useUpdateCategoryMutation();
  const isEdit = Boolean(category);

  const { control, handleSubmit, reset } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', description: '' },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: category?.name ?? '',
        description: category?.description ?? '',
      });
    }
  }, [open, category, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (category) {
        await updateCategory({ id: category.id, data: values }).unwrap();
        toast.success('Category updated');
      } else {
        await createCategory(values).unwrap();
        toast.success('Category created');
      }
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit category' : 'New category'}
      actions={
        <>
          <Button color="inherit" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={onSubmit}
            disabled={creating || updating}
          >
            {isEdit ? 'Save changes' : 'Create'}
          </Button>
        </>
      }
    >
      <Stack component="form" spacing={2} onSubmit={onSubmit} mt={1}>
        <FormTextField name="name" control={control} label="Name" />
        <FormTextField
          name="description"
          control={control}
          label="Description"
          multiline
          minRows={3}
        />
      </Stack>
    </Modal>
  );
};
