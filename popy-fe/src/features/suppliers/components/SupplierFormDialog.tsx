import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Grid } from '@mui/material';
import { toast } from 'react-toastify';
import { Modal } from '@/components/dialogs';
import { FormTextField } from '@/components/forms';
import { getErrorMessage } from '@/utils';
import {
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
} from '../suppliersApi';
import { supplierSchema, type SupplierFormValues } from '../schema';
import type { Supplier, SupplierPayload } from '../types';

interface SupplierFormDialogProps {
  open: boolean;
  supplier: Supplier | null;
  onClose: () => void;
}

const EMPTY: SupplierFormValues = {
  name: '',
  companyName: '',
  phone: '',
  email: '',
  address: '',
};

export const SupplierFormDialog = ({
  open,
  supplier,
  onClose,
}: SupplierFormDialogProps) => {
  const [createSupplier, { isLoading: creating }] = useCreateSupplierMutation();
  const [updateSupplier, { isLoading: updating }] = useUpdateSupplierMutation();
  const isEdit = Boolean(supplier);

  const { control, handleSubmit, reset } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (open) {
      reset(
        supplier
          ? {
              name: supplier.name,
              companyName: supplier.companyName ?? '',
              phone: supplier.phone,
              email: supplier.email ?? '',
              address: supplier.address ?? '',
            }
          : EMPTY,
      );
    }
  }, [open, supplier, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const payload: SupplierPayload = {
      ...values,
      companyName: values.companyName || undefined,
      email: values.email || undefined,
      address: values.address || undefined,
    };
    try {
      if (supplier) {
        await updateSupplier({ id: supplier.id, data: payload }).unwrap();
        toast.success('Supplier updated');
      } else {
        await createSupplier(payload).unwrap();
        toast.success('Supplier created');
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
      title={isEdit ? 'Edit supplier' : 'New supplier'}
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
      <Grid container spacing={2} component="form" onSubmit={onSubmit} mt={0}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField name="name" control={control} label="Name" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField
            name="companyName"
            control={control}
            label="Company name"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField name="phone" control={control} label="Phone" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField
            name="email"
            control={control}
            label="Email"
            type="email"
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormTextField
            name="address"
            control={control}
            label="Address"
            multiline
            minRows={2}
          />
        </Grid>
      </Grid>
    </Modal>
  );
};
