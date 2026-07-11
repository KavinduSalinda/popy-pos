import { useMemo } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import Add from '@mui/icons-material/Add';
import DeleteOutline from '@mui/icons-material/DeleteOutlined';
import { toast } from 'react-toastify';
import { Modal } from '@/components/dialogs';
import { FormSelect, FormTextField } from '@/components/forms';
import { formatCurrency, getErrorMessage } from '@/utils';
import { useGetSuppliersQuery } from '@/features/suppliers/suppliersApi';
import { useGetProductsQuery } from '@/features/products/productsApi';
import {
  useCreatePurchaseMutation,
  useUpdatePurchaseMutation,
} from '../purchasesApi';
import { purchaseSchema, type PurchaseFormValues } from '../schema';
import type { Purchase, PurchasePayload } from '../types';

interface PurchaseFormDialogProps {
  open: boolean;
  purchase?: Purchase | null;
  onClose: () => void;
}

const EMPTY: PurchaseFormValues = {
  supplierId: '',
  status: 'ORDERED',
  note: '',
  items: [{ productId: '', quantity: 1, costPrice: 0 }],
};

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft — save without ordering' },
  { value: 'ORDERED', label: 'Ordered — awaiting delivery' },
  { value: 'RECEIVED', label: 'Received — update stock immediately' },
];

const toFormValues = (purchase: Purchase): PurchaseFormValues => ({
  supplierId: purchase.supplierId,
  status:
    purchase.status === 'DRAFT' || purchase.status === 'ORDERED'
      ? purchase.status
      : 'ORDERED',
  note: purchase.note ?? '',
  items: purchase.items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    costPrice: item.costPrice,
  })),
});

interface PurchaseFormBodyProps {
  purchase: Purchase | null;
  onClose: () => void;
}

const PurchaseFormBody = ({ purchase, onClose }: PurchaseFormBodyProps) => {
  const isEdit = Boolean(purchase);

  const { data: suppliers } = useGetSuppliersQuery({ page: 1, pageSize: 100 });
  const { data: products } = useGetProductsQuery({ page: 1, pageSize: 100 });
  const [createPurchase, { isLoading: creating }] = useCreatePurchaseMutation();
  const [updatePurchase, { isLoading: updating }] = useUpdatePurchaseMutation();

  const supplierOptions = useMemo(
    () => (suppliers?.data ?? []).map((s) => ({ value: s.id, label: s.name })),
    [suppliers],
  );
  const productOptions = useMemo(
    () =>
      (products?.data ?? []).map((p) => ({
        value: p.id,
        label: `${p.name} (${p.sku})`,
      })),
    [products],
  );

  const { control, handleSubmit } = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: purchase ? toFormValues(purchase) : EMPTY,
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchedItems = useWatch({ control, name: 'items' });

  const total = useMemo(
    () =>
      (watchedItems ?? []).reduce(
        (sum, item) =>
          sum + (Number(item?.quantity) || 0) * (Number(item?.costPrice) || 0),
        0,
      ),
    [watchedItems],
  );

  const onSubmit = handleSubmit(async (values) => {
    const items = values.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      costPrice: item.costPrice,
    }));

    try {
      if (purchase) {
        await updatePurchase({
          id: purchase.id,
          data: {
            supplierId: values.supplierId,
            note: values.note || undefined,
            items,
          },
        }).unwrap();
        toast.success('Purchase updated');
      } else {
        const payload: PurchasePayload = {
          supplierId: values.supplierId,
          note: values.note || undefined,
          items,
          status: values.status ?? 'ORDERED',
        };
        await createPurchase(payload).unwrap();
        toast.success('Purchase order created');
      }
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  });

  return (
    <>
      <Stack component="form" spacing={2} onSubmit={onSubmit} mt={1}>
        <FormSelect
          name="supplierId"
          control={control}
          label="Supplier"
          options={supplierOptions}
        />

        {!isEdit && (
          <FormSelect
            name="status"
            control={control}
            label="Status"
            options={STATUS_OPTIONS}
          />
        )}

        <Divider textAlign="left">
          <Typography variant="caption">Items</Typography>
        </Divider>

        {fields.map((field, index) => (
          <Grid container spacing={1} key={field.id} alignItems="center">
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormSelect
                name={`items.${index}.productId`}
                control={control}
                label="Product"
                options={productOptions}
              />
            </Grid>
            <Grid size={{ xs: 5, sm: 2 }}>
              <FormTextField
                name={`items.${index}.quantity`}
                control={control}
                label="Qty"
                type="number"
              />
            </Grid>
            <Grid size={{ xs: 5, sm: 3 }}>
              <FormTextField
                name={`items.${index}.costPrice`}
                control={control}
                label="Cost"
                type="number"
              />
            </Grid>
            <Grid size={{ xs: 2, sm: 1 }}>
              <IconButton
                color="error"
                aria-label="remove item"
                disabled={fields.length === 1}
                onClick={() => remove(index)}
              >
                <DeleteOutline />
              </IconButton>
            </Grid>
          </Grid>
        ))}

        <Button
          startIcon={<Add />}
          onClick={() => append({ productId: '', quantity: 1, costPrice: 0 })}
          sx={{ alignSelf: 'flex-start' }}
        >
          Add item
        </Button>

        <FormTextField name="note" control={control} label="Note" />

        <Stack direction="row" justifyContent="space-between">
          <Typography variant="subtitle1">Total</Typography>
          <Typography variant="h6">{formatCurrency(total)}</Typography>
        </Stack>
      </Stack>
      <Stack direction="row" justifyContent="flex-end" gap={1} mt={2}>
        <Button color="inherit" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={creating || updating}
        >
          {isEdit ? 'Save changes' : 'Create order'}
        </Button>
      </Stack>
    </>
  );
};

export const PurchaseFormDialog = ({
  open,
  purchase = null,
  onClose,
}: PurchaseFormDialogProps) => {
  const formKey = purchase ? `edit-${purchase.id}` : 'create';

  return (
    <Modal
      open={open}
      onClose={onClose}
      maxWidth="md"
      title={purchase ? 'Edit purchase order' : 'New purchase order'}
    >
      {open && (
        <PurchaseFormBody key={formKey} purchase={purchase} onClose={onClose} />
      )}
    </Modal>
  );
};
