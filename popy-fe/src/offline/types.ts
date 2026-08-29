import type { CreateSalePayload, PaymentMethod, PosProduct, Sale } from '@/features/sales/types';
import type { ID } from '@/types';

export type QueueJobType = 'sale' | 'inventory_adjustment' | 'purchase_draft';
export type QueueJobStatus = 'pending' | 'syncing' | 'synced' | 'rejected' | 'failed';

export interface CachedProduct extends PosProduct {
  shopId: ID;
  updatedAt?: string;
}

export interface CachedCustomer {
  id: ID;
  shopId: ID;
  name: string;
  phone: string;
  email?: string;
}

export interface CheckoutSettingsCache {
  shopId: ID;
  canSendEmail: boolean;
  canSendSms: boolean;
}

export interface SyncMetaRecord {
  shopId: ID;
  lastBootstrapAt?: string;
  lastCatalogSyncAt?: string;
  lastSyncAt?: string;
  pendingCount: number;
  failedCount: number;
}

export interface PendingSaleRecord {
  clientId: string;
  shopId: ID;
  payload: CreateSalePayload & { clientId: string };
  localSale: Sale;
  status: QueueJobStatus;
  createdAt: string;
  syncedAt?: string;
  errorMessage?: string;
}

export interface PendingJobRecord {
  id: string;
  shopId: ID;
  type: QueueJobType;
  payload: Record<string, unknown>;
  status: QueueJobStatus;
  createdAt: string;
  syncedAt?: string;
  errorMessage?: string;
}

export interface BootstrapResponse {
  serverTime: string;
  products: PosProduct[];
  customers: Array<{
    id: ID;
    name: string;
    phone: string;
    email?: string;
  }>;
  checkoutSettings: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    cashierEmailEnabled: boolean;
    cashierSmsEnabled: boolean;
  };
}

export interface SalesSyncResult {
  clientId?: string;
  status: 'synced' | 'duplicate' | 'rejected';
  message?: string;
  sale?: Sale;
}

export interface OfflineAuthState {
  isOfflineReady: boolean;
  hasCachedCatalog: boolean;
  reason?: string;
}

export const createOfflineReference = (clientId: string) =>
  `OFF-${clientId.slice(0, 8).toUpperCase()}`;

export const buildOfflineSale = ({
  clientId,
  payload,
  cashierName,
}: {
  clientId: string;
  payload: CreateSalePayload;
  cashierName: string;
}): Sale => {
  const subtotal = payload.items.reduce(
    (sum, item) => sum + item.quantity * Number(item.unitPrice),
    0,
  );
  const total = subtotal - Number(payload.discount) + Number(payload.tax);

  return {
    id: clientId,
    reference: createOfflineReference(clientId),
    customerId: payload.customerId ?? null,
    items: payload.items.map((item, index) => ({
      id: `${clientId}-${index}`,
      productId: item.productId,
      productName: `Product #${item.productId}`,
      sku: undefined,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      total: item.quantity * Number(item.unitPrice),
    })),
    subtotal,
    discount: Number(payload.discount),
    tax: Number(payload.tax),
    total,
    paymentMethod: payload.paymentMethod as PaymentMethod,
    amountPaid: payload.amountPaid ?? total,
    cashierName,
    createdAt: new Date().toISOString(),
  };
};
