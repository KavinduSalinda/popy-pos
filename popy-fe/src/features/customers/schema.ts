import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  phone: z.string().min(5, 'Enter a valid phone number').max(20),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  address: z.string().max(255).optional().or(z.literal('')),
  loyaltyPoints: z.number().int().min(0),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
