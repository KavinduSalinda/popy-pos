import type { ID, Timestamps } from '@/types';

export interface Supplier extends Timestamps {
  id: ID;
  name: string;
  companyName?: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface SupplierPayload {
  name: string;
  companyName?: string;
  phone: string;
  email?: string;
  address?: string;
}
