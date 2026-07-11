import type { ID } from '@/types';

export type StockStatus = 'in' | 'low' | 'out';

export interface InventoryItem {
  id: ID;
  productId: ID;
  productName: string;
  sku: string;
  stockQuantity: number;
  reorderLevel: number;
  status: StockStatus;
}

export type StockTransactionType =
  | 'PURCHASE'
  | 'SALE'
  | 'ADJUSTMENT'
  | 'RETURN'
  | 'TRANSFER';

export interface StockTransaction {
  id: ID;
  productId: ID;
  productName: string;
  type: StockTransactionType;
  quantity: number;
  balance: number;
  note?: string;
  createdAt: string;
}

export type AdjustmentType = 'DAMAGE' | 'LOSS' | 'CORRECTION' | 'FOUND';

export interface AdjustmentPayload {
  productId: ID;
  adjustmentType: AdjustmentType;
  quantity: number;
  note?: string;
}
