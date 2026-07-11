import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  sku: z.string().min(1, 'SKU is required').max(60),
  barcode: z.string().max(60).optional().or(z.literal('')),
  categoryId: z.union([z.string(), z.number()]).refine((v) => v !== '', {
    message: 'Category is required',
  }),
  brand: z.string().max(80).optional().or(z.literal('')),
  unit: z.string().min(1, 'Unit is required').max(20),
  costPrice: z.number().min(0, 'Must be 0 or more'),
  sellingPrice: z.number().min(0, 'Must be 0 or more'),
  reorderLevel: z.number().int().min(0, 'Must be 0 or more'),
  status: z.boolean(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export const PRODUCT_UNITS = [
  'pcs',
  'kg',
  'g',
  'litre',
  'ml',
  'box',
  'pack',
  'dozen',
].map((u) => ({ value: u, label: u }));
