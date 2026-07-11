import { z } from 'zod';

export const adjustmentSchema = z.object({
  productId: z.union([z.string(), z.number()]).refine((v) => v !== '', {
    message: 'Product is required',
  }),
  adjustmentType: z.enum(['DAMAGE', 'LOSS', 'CORRECTION', 'FOUND']),
  quantity: z
    .number()
    .int()
    .refine((v) => v !== 0, { message: 'Quantity cannot be zero' }),
  note: z.string().max(255).optional().or(z.literal('')),
});

export type AdjustmentFormValues = z.infer<typeof adjustmentSchema>;

export const ADJUSTMENT_TYPES = [
  { value: 'DAMAGE', label: 'Damage' },
  { value: 'LOSS', label: 'Loss' },
  { value: 'CORRECTION', label: 'Correction' },
  { value: 'FOUND', label: 'Found' },
];
