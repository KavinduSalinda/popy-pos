import { axiosClient } from '@/api/axiosClient';
import type { PosProduct } from '@/features/sales/types';
import type { ID } from '@/types';
import { offlineDb } from './db';
import type { BootstrapResponse, CachedCustomer, CachedProduct } from './types';
import { getQueueSummary } from './queue';

const normalizeProduct = (product: PosProduct, shopId: ID): CachedProduct => ({
  ...product,
  shopId,
  sellingPrice: Number(product.sellingPrice),
  stockQuantity: Number(product.stockQuantity),
});

export const fetchBootstrap = async () => {
  const { data } = await axiosClient.get<BootstrapResponse>('/sync/bootstrap');
  return data;
};

export const cacheBootstrap = async (shopId: ID, bundle: BootstrapResponse) => {
  const products = bundle.products.map((product) => normalizeProduct(product, shopId));
  const customers: CachedCustomer[] = bundle.customers.map((customer) => ({
    ...customer,
    shopId,
  }));

  await offlineDb.transaction(
    'rw',
    offlineDb.products,
    offlineDb.customers,
    offlineDb.checkoutSettings,
    offlineDb.syncMeta,
    async () => {
      await offlineDb.products.where('shopId').equals(shopId).delete();
      await offlineDb.customers.where('shopId').equals(shopId).delete();
      if (products.length) await offlineDb.products.bulkPut(products);
      if (customers.length) await offlineDb.customers.bulkPut(customers);
      await offlineDb.checkoutSettings.put({
        shopId,
        canSendEmail:
          bundle.checkoutSettings.emailEnabled &&
          bundle.checkoutSettings.cashierEmailEnabled,
        canSendSms:
          bundle.checkoutSettings.smsEnabled &&
          bundle.checkoutSettings.cashierSmsEnabled,
      });
      await offlineDb.syncMeta.put({
        shopId,
        lastBootstrapAt: bundle.serverTime,
        lastCatalogSyncAt: bundle.serverTime,
        lastSyncAt: bundle.serverTime,
        pendingCount: (await getQueueSummary(shopId)).total,
        failedCount: (await getQueueSummary(shopId)).failedSales,
      });
    },
  );
};

export const searchCachedProducts = async (shopId: ID, search = '') => {
  const products = await offlineDb.products.where('shopId').equals(shopId).toArray();
  const term = search.trim().toLowerCase();
  if (!term) return products;
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(term) ||
      product.sku.toLowerCase().includes(term) ||
      product.barcode?.toLowerCase().includes(term),
  );
};

export const lookupCachedProduct = async (shopId: ID, code: string) => {
  const normalized = code.trim().toLowerCase();
  const products = await offlineDb.products.where('shopId').equals(shopId).toArray();
  return (
    products.find(
      (product) =>
        product.sku.toLowerCase() === normalized ||
        product.barcode?.toLowerCase() === normalized,
    ) ?? null
  );
};

export const decrementLocalStock = async (shopId: ID, productId: ID, quantity: number) => {
  const product = await offlineDb.products.get(productId);
  if (!product || product.shopId !== shopId) return;
  await offlineDb.products.update(product.id, {
    stockQuantity: Math.max(0, product.stockQuantity - quantity),
  });
};

export const getCachedCustomers = async (shopId: ID) =>
  offlineDb.customers.where('shopId').equals(shopId).toArray();

export const getCheckoutSettings = async (shopId: ID) =>
  offlineDb.checkoutSettings.get(shopId);

export const hasCachedCatalog = async (shopId: ID) => {
  const count = await offlineDb.products.where('shopId').equals(shopId).count();
  return count > 0;
};
