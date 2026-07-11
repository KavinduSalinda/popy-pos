import type { ID, Timestamps } from '@/types';

export type PurchaseStatus =
  | 'DRAFT'
  | 'ORDERED'
  | 'RECEIVED'
  | 'PARTIAL'
  | 'CANCELLED';

export interface PurchaseItem {
  id?: ID;
  productId: ID;
  productName?: string;
  quantity: number;
  costPrice: number;
  total?: number;
  lineTotal?: number;
}

export interface Purchase extends Timestamps {
  id: ID;
  reference: string;
  supplierId: ID;
  supplierName?: string;
  status: PurchaseStatus;
  items: PurchaseItem[];
  total: number;
  note?: string;
}

export interface PurchaseItemPayload {
  productId: ID;
  quantity: number;
  costPrice: number;
}

export interface PurchasePayload {
  supplierId: ID;
  items: PurchaseItemPayload[];
  note?: string;
  /** Defaults to ORDERED on create when omitted. */
  status?: PurchaseStatus;
}

export interface UpdatePurchasePayload {
  supplierId?: ID;
  items?: PurchaseItemPayload[];
  note?: string;
  status?: PurchaseStatus;
}

export interface PurchaseReturnFormPayload {
  purchaseId: ID;
  reason: string;
  amount: number;
}

/** Purchases that can be edited or deleted. */
export const EDITABLE_PURCHASE_STATUSES: PurchaseStatus[] = [
  'DRAFT',
  'ORDERED',
];

export const RECEIVABLE_PURCHASE_STATUSES: PurchaseStatus[] = [
  'ORDERED',
  'PARTIAL',
];

export const RETURNABLE_PURCHASE_STATUSES: PurchaseStatus[] = ['RECEIVED'];
