import type { ID, Timestamps } from '@/types';

export interface Product extends Timestamps {
  id: ID;
  name: string;
  sku: string;
  barcode?: string;
  categoryId: ID;
  categoryName?: string;
  brand?: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  reorderLevel: number;
  stockQuantity?: number;
  status: boolean;
}

export interface ProductPayload {
  name: string;
  sku: string;
  barcode?: string;
  categoryId: ID;
  brand?: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  reorderLevel: number;
  status: boolean;
}
