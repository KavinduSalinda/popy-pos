import type { ID, Timestamps } from '@/types';

export interface Customer extends Timestamps {
  id: ID;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  loyaltyPoints: number;
}

export interface CustomerPayload {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  loyaltyPoints?: number;
}
