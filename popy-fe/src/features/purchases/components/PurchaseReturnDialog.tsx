import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Stack } from '@mui/material';
import { toast } from 'react-toastify';
import { Modal } from '@/components/dialogs';
import { FormTextField } from '@/components/forms';
import { getErrorMessage } from '@/utils';
import { useCreatePurchaseReturnMutation } from '@/features/returns/returnsApi';
import { z } from 'zod';
import type { Purchase } from '../types';

const schema = z.object({
  reason: z.string().min(1, 'Reason is required').max(255),
  amount: z.number().min(0, 'Must be 0 or more'),
});

type FormValues = z.infer<typeof schema>;

interface PurchaseReturnDialogProps {
  open: boolean;
  purchase: Purchase | null;
  onClose: () => void;
}

const PurchaseReturnForm = ({
  purchase,
  onClose,
}: {
  purchase: Purchase;
  onClose: () => void;
}) => {
  const [createReturn, { isLoading }] = useCreatePurchaseReturnMutation();
  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { reason: '', amount: purchase.total },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createReturn({
        purchaseId: purchase.id,
        reason: values.reason,
        amount: values.amount,
        items: [],
      }).unwrap();
      toast.success('Purchase return recorded');
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  });

  return (
    <>
      <Stack component="form" spacing={2} onSubmit={onSubmit} mt={1}>
        <FormTextField
          name="reason"
          control={control}
          label="Reason"
          multiline
          minRows={2}
        />
        <FormTextField
          name="amount"
          control={control}
          label="Return amount"
          type="number"
        />
      </Stack>
      <Stack direction="row" justifyContent="flex-end" gap={1} mt={2}>
        <Button color="inherit" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={onSubmit} disabled={isLoading}>
          Submit return
        </Button>
      </Stack>
    </>
  );
};

export const PurchaseReturnDialog = ({
  open,
  purchase,
  onClose,
}: PurchaseReturnDialogProps) => (
  <Modal
    open={open}
    onClose={onClose}
    title={`Return · ${purchase?.reference ?? ''}`}
  >
    {open && purchase && (
      <PurchaseReturnForm
        key={purchase.id}
        purchase={purchase}
        onClose={onClose}
      />
    )}
  </Modal>
);
