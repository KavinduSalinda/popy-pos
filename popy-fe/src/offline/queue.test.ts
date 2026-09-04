import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { offlineDb } from './db';
import { queueOfflineSale } from './queue';

describe('queueOfflineSale', () => {
  beforeEach(async () => {
    await offlineDb.delete();
    await offlineDb.open();
    await offlineDb.products.put({
      id: 10,
      shopId: '1',
      name: 'Cola',
      sku: 'COLA-1',
      barcode: '123',
      sellingPrice: 100,
      stockQuantity: 5,
      categoryName: 'Drinks',
    });
  });

  it('stores a pending sale and decrements local stock', async () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);

    const record = await queueOfflineSale({
      shopId: '1',
      cashierName: 'Cashier',
      payload: {
        items: [{ productId: 10, quantity: 2, unitPrice: 100 }],
        discount: 0,
        tax: 0,
        paymentMethod: 'CASH',
        amountPaid: 200,
      },
    });

    expect(record.status).toBe('pending');
    expect(record.payload.clientId).toBe(record.clientId);

    const pending = await offlineDb.pendingSales.get(record.clientId);
    expect(pending?.status).toBe('pending');

    const product = await offlineDb.products.get(10);
    expect(product?.stockQuantity).toBe(3);

    expect(infoSpy).toHaveBeenCalled();
    const logged = JSON.parse(String(infoSpy.mock.calls[0]?.[0]));
    expect(logged).toMatchObject({
      level: 'info',
      message: 'Queued offline sale',
    });
  });

  it('logs and rethrows when persistence fails', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(offlineDb.pendingSales, 'put').mockRejectedValueOnce(new Error('disk full'));

    await expect(
      queueOfflineSale({
        shopId: '1',
        cashierName: 'Cashier',
        payload: {
          items: [{ productId: 10, quantity: 1, unitPrice: 50 }],
          discount: 0,
          tax: 0,
          paymentMethod: 'CASH',
          amountPaid: 50,
        },
      }),
    ).rejects.toThrow('disk full');

    expect(errorSpy).toHaveBeenCalled();
    const logged = JSON.parse(String(errorSpy.mock.calls[0]?.[0]));
    expect(logged).toMatchObject({
      level: 'error',
      message: 'Failed to queue offline sale',
    });
  });
});
