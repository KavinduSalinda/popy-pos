import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Stack } from '@mui/material';
import { toast } from 'react-toastify';
import { Modal } from '@/components/dialogs';
import { FormSelect, FormTextField } from '@/components/forms';
import { getErrorMessage } from '@/utils';
import { useGetProductsQuery } from '@/features/products/productsApi';
import { useCreateAdjustmentMutation } from '../inventoryApi';
import {
  ADJUSTMENT_TYPES,
  adjustmentSchema,
  type AdjustmentFormValues,
} from '../schema';
import type { AdjustmentPayload, AdjustmentType } from '../types';

interface AdjustmentDialogProps {
  open: boolean;
  onClose: () => void;
}

export const AdjustmentDialog = ({ open, onClose }: AdjustmentDialogProps) => {
  const { data } = useGetProductsQuery({ page: 1, pageSize: 100 });
  const [createAdjustment, { isLoading }] = useCreateAdjustmentMutation();

  const productOptions = useMemo(
    () =>
      (data?.data ?? []).map((p) => ({
        value: p.id,
        label: `${p.name} (${p.sku})`,
      })),
    [data],
  );

  const { control, handleSubmit, reset } = useForm<AdjustmentFormValues>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      productId: '',
      adjustmentType: 'DAMAGE',
      quantity: 0,
      note: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        productId: '',
        adjustmentType: 'DAMAGE',
        quantity: 0,
        note: '',
      });
    }
  }, [open, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const payload: AdjustmentPayload = {
      productId: values.productId,
      adjustmentType: values.adjustmentType as AdjustmentType,
      quantity: values.quantity,
      note: values.note || undefined,
    };
    try {
      await createAdjustment(payload).unwrap();
      toast.success('Stock adjustment recorded');
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New stock adjustment"
      actions={
        <>
          <Button color="inherit" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" onClick={onSubmit} disabled={isLoading}>
            Save adjustment
          </Button>
        </>
      }
    >
      <Stack component="form" spacing={2} onSubmit={onSubmit} mt={1}>
        <FormSelect
          name="productId"
          control={control}
          label="Product"
          options={productOptions}
        />
        <FormSelect
          name="adjustmentType"
          control={control}
          label="Adjustment type"
          options={ADJUSTMENT_TYPES}
        />
        <FormTextField
          name="quantity"
          control={control}
          label="Quantity (use negative to reduce)"
          type="number"
        />
        <FormTextField
          name="note"
          control={control}
          label="Note"
          multiline
          minRows={2}
        />
      </Stack>
    </Modal>
  );
};
