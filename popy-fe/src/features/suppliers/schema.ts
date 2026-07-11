import { z } from 'zod';

export const supplierSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  companyName: z.string().max(120).optional().or(z.literal('')),
  phone: z.string().min(5, 'Enter a valid phone number').max(20),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  address: z.string().max(255).optional().or(z.literal('')),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;
