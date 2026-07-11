import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(80),
  description: z.string().max(255).optional(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
