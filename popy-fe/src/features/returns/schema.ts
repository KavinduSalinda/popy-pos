import { z } from 'zod';

export const salesReturnSchema = z.object({
  saleId: z
    .union([z.string(), z.number()])
    .transform((v) => String(v).trim())
    .refine((v) => v.length > 0, {
      message: 'Sale reference is required',
    }),
  reason: z.string().min(1, 'Reason is required').max(255),
  refundAmount: z.number().min(0, 'Must be 0 or more'),
});
export type SalesReturnFormValues = z.infer<typeof salesReturnSchema>;

export const purchaseReturnSchema = z.object({
  purchaseId: z
    .union([z.string(), z.number()])
    .transform((v) => String(v).trim())
    .refine((v) => v.length > 0, {
      message: 'Purchase reference is required',
    }),
  reason: z.string().min(1, 'Reason is required').max(255),
  amount: z.number().min(0, 'Must be 0 or more'),
});
export type PurchaseReturnFormValues = z.infer<typeof purchaseReturnSchema>;
