import type { CreateSalePayload } from '@/features/sales/types';
import type { ID } from '@/types';
import { logger } from '@/utils/logger';
import { decrementLocalStock } from './catalogCache';
import { offlineDb } from './db';
import type { PendingJobRecord, PendingSaleRecord } from './types';
import { buildOfflineSale } from './types';

export const queueOfflineSale = async ({
  shopId,
  payload,
  cashierName,
}: {
  shopId: ID;
  payload: CreateSalePayload;
  cashierName: string;
}) => {
  try {
    const clientId = crypto.randomUUID();
    const record: PendingSaleRecord = {
      clientId,
      shopId,
      payload: { ...payload, clientId },
      localSale: buildOfflineSale({ clientId, payload, cashierName }),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await offlineDb.pendingSales.put(record);

    for (const item of payload.items) {
      await decrementLocalStock(shopId, item.productId, item.quantity);
    }

    await refreshQueueCounts(shopId);
    logger.info('Queued offline sale', { shopId, clientId, itemCount: payload.items.length });
    return record;
  } catch (error) {
    logger.error('Failed to queue offline sale', {
      shopId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
};

export const queueOfflineJob = async ({
  shopId,
  type,
  payload,
}: {
  shopId: ID;
  type: PendingJobRecord['type'];
  payload: Record<string, unknown>;
}) => {
  const record: PendingJobRecord = {
    id: crypto.randomUUID(),
    shopId,
    type,
    payload,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  await offlineDb.pendingJobs.put(record);
  await refreshQueueCounts(shopId);
  return record;
};

export const getPendingSales = async (shopId: ID) =>
  offlineDb.pendingSales
    .where('shopId')
    .equals(shopId)
    .filter((sale) => sale.status === 'pending' || sale.status === 'failed')
    .toArray();

export const getQueueSummary = async (shopId: ID) => {
  const sales = await offlineDb.pendingSales.where('shopId').equals(shopId).toArray();
  const jobs = await offlineDb.pendingJobs.where('shopId').equals(shopId).toArray();
  const pendingSales = sales.filter((sale) => sale.status === 'pending').length;
  const failedSales = sales.filter((sale) => sale.status === 'failed').length;
  const pendingJobs = jobs.filter((job) => job.status === 'pending').length;
  return {
    pendingSales,
    failedSales,
    pendingJobs,
    total: pendingSales + failedSales + pendingJobs,
  };
};

export const refreshQueueCounts = async (shopId: ID) => {
  const summary = await getQueueSummary(shopId);
  const meta = await offlineDb.syncMeta.get(shopId);
  await offlineDb.syncMeta.put({
    shopId,
    lastBootstrapAt: meta?.lastBootstrapAt,
    lastCatalogSyncAt: meta?.lastCatalogSyncAt,
    lastSyncAt: meta?.lastSyncAt,
    pendingCount: summary.total,
    failedCount: summary.failedSales,
  });
};
