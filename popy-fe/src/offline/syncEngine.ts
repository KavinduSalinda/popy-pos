import { axiosClient } from '@/api/axiosClient';
import type { ID } from '@/types';
import { cacheBootstrap, fetchBootstrap } from './catalogCache';
import { classifySyncResults, formatConflictMessage } from './conflictResolver';
import { offlineDb } from './db';
import { getPendingSales, getQueueSummary, refreshQueueCounts } from './queue';
import type { SalesSyncResult } from './types';

export interface SyncRunResult {
  syncedSales: number;
  rejectedSales: number;
  message?: string;
}

export const bootstrapOfflineData = async (shopId: ID) => {
  const bundle = await fetchBootstrap();
  await cacheBootstrap(shopId, bundle);
  return bundle;
};

export const syncPendingSales = async (shopId: ID): Promise<SyncRunResult> => {
  const pending = await getPendingSales(shopId);
  if (!pending.length) {
    await refreshQueueCounts(shopId);
    return { syncedSales: 0, rejectedSales: 0 };
  }

  const payload = {
    sales: pending.map((sale) => ({
      clientId: sale.clientId,
      payload: sale.payload,
    })),
  };

  const { data } = await axiosClient.post<{ results: SalesSyncResult[] }>(
    '/sync/sales',
    payload,
  );
  const results = data.results ?? [];
  const { synced, rejected } = classifySyncResults(results);

  await offlineDb.transaction('rw', offlineDb.pendingSales, offlineDb.syncMeta, async () => {
    for (const result of results) {
      if (!result.clientId) continue;
      if (result.status === 'rejected') {
        await offlineDb.pendingSales.update(result.clientId, {
          status: 'failed',
          errorMessage: result.message,
        });
      } else {
        await offlineDb.pendingSales.update(result.clientId, {
          status: 'synced',
          syncedAt: new Date().toISOString(),
          localSale: result.sale ?? undefined,
        });
      }
    }
    const summary = await getQueueSummary(shopId);
    const meta = await offlineDb.syncMeta.get(shopId);
    await offlineDb.syncMeta.put({
      shopId,
      lastBootstrapAt: meta?.lastBootstrapAt,
      lastCatalogSyncAt: meta?.lastCatalogSyncAt,
      lastSyncAt: new Date().toISOString(),
      pendingCount: summary.total,
      failedCount: summary.failedSales,
    });
  });

  return {
    syncedSales: synced.length,
    rejectedSales: rejected.length,
    message: formatConflictMessage(results) ?? undefined,
  };
};

export const runFullSync = async (shopId: ID): Promise<SyncRunResult> => {
  await bootstrapOfflineData(shopId);
  return syncPendingSales(shopId);
};
