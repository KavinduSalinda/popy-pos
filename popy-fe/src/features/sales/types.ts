import type { ID, Timestamps } from '@/types';

export type PaymentMethod = 'CASH' | 'CARD' | 'MOBILE' | 'CREDIT';

export interface PosProduct {
  id: ID;
  name: string;
  sku: string;
  barcode?: string;
  unit?: string;
  sellingPrice: number;
  stockQuantity: number;
  categoryName?: string;
}

export interface CartItem {
  productId: ID;
  name: string;
  sku: string;
  unit?: string;
  unitPrice: number;
  quantity: number;
  stockQuantity: number;
}

export interface SaleItemPayload {
  productId: ID;
  quantity: number;
  unitPrice: number;
}

export interface CreateSalePayload {
  clientId?: string;
  customerId?: ID | null;
  items: SaleItemPayload[];
  discount: number;
  tax: number;
  paymentMethod: PaymentMethod;
  amountPaid?: number;
  sendEmail?: boolean;
  sendSms?: boolean;
}

export interface SaleItem {
  id: ID;
  productId: ID;
  productName: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Sale extends Timestamps {
  id: ID;
  reference: string;
  customerId?: ID | null;
  customerName?: string;
  shopName?: string;
  shopPhone?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid?: number | null;
  cashierName?: string;
}
