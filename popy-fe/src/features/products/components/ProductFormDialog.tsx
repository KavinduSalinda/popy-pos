import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Grid } from '@mui/material';
import { toast } from 'react-toastify';
import { Modal } from '@/components/dialogs';
import { FormSelect, FormSwitch, FormTextField } from '@/components/forms';
import { useBarcodeScanner } from '@/hooks';
import { getErrorMessage } from '@/utils';
import { useGetCategoriesQuery } from '@/features/categories/categoriesApi';
import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from '../productsApi';
import {
  PRODUCT_UNITS,
  productSchema,
  type ProductFormValues,
} from '../schema';
import type { Product, ProductPayload } from '../types';
import { ProductBarcodeField } from './ProductBarcodeField';

interface ProductFormDialogProps {
  open: boolean;
  product: Product | null;
  onClose: () => void;
}

const EMPTY: ProductFormValues = {
  name: '',
  sku: '',
  barcode: '',
  categoryId: '',
  brand: '',
  unit: 'pcs',
  costPrice: 0,
  sellingPrice: 0,
  reorderLevel: 0,
  status: true,
};

export const ProductFormDialog = ({
  open,
  product,
  onClose,
}: ProductFormDialogProps) => {
  const { data: categories } = useGetCategoriesQuery();
  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const isEdit = Boolean(product);

  const categoryOptions = useMemo(
    () => (categories ?? []).map((c) => ({ value: c.id, label: c.name })),
    [categories],
  );

  const { control, handleSubmit, reset, setValue } = useForm<ProductFormValues>(
    {
      resolver: zodResolver(productSchema),
      defaultValues: EMPTY,
    },
  );

  const barcode = useWatch({ control, name: 'barcode' });
  const productName = useWatch({ control, name: 'name' });
  const sku = useWatch({ control, name: 'sku' });

  useBarcodeScanner({
    enabled: open,
    onScan: (code) => {
      const trimmed = code.trim();
      if (!trimmed) return;
      setValue('barcode', trimmed, { shouldDirty: true, shouldValidate: true });
      toast.success('Barcode captured');
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        product
          ? {
              name: product.name,
              sku: product.sku,
              barcode: product.barcode ?? '',
              categoryId: product.categoryId,
              brand: product.brand ?? '',
              unit: product.unit,
              costPrice: product.costPrice,
              sellingPrice: product.sellingPrice,
              reorderLevel: product.reorderLevel,
              status: product.status,
            }
          : EMPTY,
      );
    }
  }, [open, product, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const payload: ProductPayload = {
      ...values,
      barcode: values.barcode || undefined,
      brand: values.brand || undefined,
    };
    try {
      if (product) {
        await updateProduct({ id: product.id, data: payload }).unwrap();
        toast.success('Product updated');
      } else {
        await createProduct(payload).unwrap();
        toast.success('Product created');
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
      maxWidth="md"
      title={isEdit ? 'Edit product' : 'New product'}
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
          <FormTextField name="sku" control={control} label="SKU" />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <ProductBarcodeField
            control={control}
            setValue={setValue}
            barcode={barcode ?? ''}
            productName={productName ?? ''}
            sku={sku ?? ''}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSelect
            name="categoryId"
            control={control}
            label="Category"
            options={categoryOptions}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField name="brand" control={control} label="Brand" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSelect
            name="unit"
            control={control}
            label="Unit"
            options={PRODUCT_UNITS}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormTextField
            name="costPrice"
            control={control}
            label="Cost price"
            type="number"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormTextField
            name="sellingPrice"
            control={control}
            label="Selling price"
            type="number"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormTextField
            name="reorderLevel"
            control={control}
            label="Reorder level"
            type="number"
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormSwitch name="status" control={control} label="Active" />
        </Grid>
      </Grid>
    </Modal>
  );
};
