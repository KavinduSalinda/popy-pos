import type { ID } from '@/types';

export interface ReturnItemPayload {
  productId: ID;
  quantity: number;
}

export interface SalesReturnPayload {
  saleId: ID;
  reason: string;
  items: ReturnItemPayload[];
  refundAmount: number;
}

export interface PurchaseReturnPayload {
  purchaseId: ID;
  reason: string;
  items: ReturnItemPayload[];
  amount: number;
}

export interface ReturnRecord {
  id: ID;
  reference: string;
  type: 'SALES' | 'PURCHASE';
  reason: string;
  amount: number;
  createdAt: string;
}
