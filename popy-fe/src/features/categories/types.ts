import type { ID, Timestamps } from '@/types';

export interface Category extends Timestamps {
  id: ID;
  name: string;
  description?: string;
  productCount?: number;
}

export interface CategoryPayload {
  name: string;
  description?: string;
}
