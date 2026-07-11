import type { ID, Timestamps } from '@/types';
import type { Role } from '@/constants/roles';

export interface ManagedUser extends Timestamps {
  id: ID;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
}

export interface UserPayload {
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  password?: string;
}
