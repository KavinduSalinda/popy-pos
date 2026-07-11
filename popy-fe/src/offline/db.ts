import Dexie, { type Table } from 'dexie';
import type { ID } from '@/types';
import type {
  CachedCustomer,
  CachedProduct,
  CheckoutSettingsCache,
  PendingJobRecord,
  PendingSaleRecord,
  SyncMetaRecord,
} from './types';

export class PopyOfflineDB extends Dexie {
  products!: Table<CachedProduct, ID>;
  customers!: Table<CachedCustomer, ID>;
  checkoutSettings!: Table<CheckoutSettingsCache, ID>;
  pendingSales!: Table<PendingSaleRecord, string>;
  pendingJobs!: Table<PendingJobRecord, string>;
  syncMeta!: Table<SyncMetaRecord, ID>;

  constructor() {
    super('PopyOfflineDB');
    this.version(1).stores({
      products: 'id, shopId, sku, barcode, name',
      customers: 'id, shopId, phone, name',
      checkoutSettings: 'shopId',
      pendingSales: 'clientId, shopId, status, createdAt',
      pendingJobs: 'id, shopId, type, status, createdAt',
      syncMeta: 'shopId',
    });
  }
}

export const offlineDb = new PopyOfflineDB();
