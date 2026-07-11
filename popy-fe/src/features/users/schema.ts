import { z } from 'zod';
import { ROLES } from '@/constants/roles';

const roleValues = Object.values(ROLES) as [string, ...string[]];

export const userSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  role: z.enum(roleValues),
  isActive: z.boolean(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .optional()
    .or(z.literal('')),
});

export type UserFormValues = z.infer<typeof userSchema>;
