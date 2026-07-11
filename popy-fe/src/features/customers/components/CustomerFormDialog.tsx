import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Grid } from '@mui/material';
import { toast } from 'react-toastify';
import { Modal } from '@/components/dialogs';
import { FormTextField } from '@/components/forms';
import { getErrorMessage } from '@/utils';
import {
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
} from '../customersApi';
import { customerSchema, type CustomerFormValues } from '../schema';
import type { Customer, CustomerPayload } from '../types';

interface CustomerFormDialogProps {
  open: boolean;
  customer: Customer | null;
  onClose: () => void;
}

const EMPTY: CustomerFormValues = {
  name: '',
  phone: '',
  email: '',
  address: '',
  loyaltyPoints: 0,
};

export const CustomerFormDialog = ({
  open,
  customer,
  onClose,
}: CustomerFormDialogProps) => {
  const [createCustomer, { isLoading: creating }] = useCreateCustomerMutation();
  const [updateCustomer, { isLoading: updating }] = useUpdateCustomerMutation();
  const isEdit = Boolean(customer);

  const { control, handleSubmit, reset } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (open) {
      reset(
        customer
          ? {
              name: customer.name,
              phone: customer.phone,
              email: customer.email ?? '',
              address: customer.address ?? '',
              loyaltyPoints: customer.loyaltyPoints,
            }
          : EMPTY,
      );
    }
  }, [open, customer, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const payload: CustomerPayload = {
      ...values,
      email: values.email || undefined,
      address: values.address || undefined,
    };
    try {
      if (customer) {
        await updateCustomer({ id: customer.id, data: payload }).unwrap();
        toast.success('Customer updated');
      } else {
        await createCustomer(payload).unwrap();
        toast.success('Customer created');
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
      title={isEdit ? 'Edit customer' : 'New customer'}
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
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField
            name="loyaltyPoints"
            control={control}
            label="Loyalty points"
            type="number"
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
