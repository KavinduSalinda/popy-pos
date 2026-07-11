import { z } from 'zod';

export const purchaseItemSchema = z.object({
  productId: z.union([z.string(), z.number()]).refine((v) => v !== '', {
    message: 'Required',
  }),
  quantity: z.number().int().min(1, 'Min 1'),
  costPrice: z.number().min(0, 'Min 0'),
});

export const purchaseSchema = z.object({
  supplierId: z.union([z.string(), z.number()]).refine((v) => v !== '', {
    message: 'Supplier is required',
  }),
  status: z.enum(['DRAFT', 'ORDERED', 'RECEIVED']).optional(),
  note: z.string().max(255).optional().or(z.literal('')),
  items: z.array(purchaseItemSchema).min(1, 'Add at least one item'),
});

export type PurchaseFormValues = z.infer<typeof purchaseSchema>;
