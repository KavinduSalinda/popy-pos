import { describe, expect, it } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { APP_CONFIG } from '@/constants';
import {
  addItem,
  cartReducer,
  clearCart,
  selectCartTotals,
  setDiscount,
  setItemQuantity,
} from './cartSlice';
import type { PosProduct } from './types';

const product: PosProduct = {
  id: 1,
  name: 'Coffee',
  sku: 'COF-01',
  sellingPrice: 10,
  stockQuantity: 5,
};

describe('cartSlice', () => {
  it('adds and increments items', () => {
    let state = cartReducer(undefined, addItem(product));
    state = cartReducer(state, addItem(product));
    expect(state.items[0]?.quantity).toBe(2);
  });

  it('respects stock limits when setting quantity', () => {
    const state = cartReducer(
      cartReducer(undefined, addItem(product)),
      setItemQuantity({ productId: 1, quantity: 99 }),
    );
    expect(state.items[0]?.quantity).toBe(5);
  });

  it('computes totals with discount and tax', () => {
    const store = configureStore({ reducer: { cart: cartReducer } });
    store.dispatch(addItem(product));
    store.dispatch(setItemQuantity({ productId: 1, quantity: 2 }));
    store.dispatch(setDiscount(5));

    const totals = selectCartTotals(
      store.getState() as Parameters<typeof selectCartTotals>[0],
    );
    expect(totals.subtotal).toBe(20);
    expect(totals.discount).toBe(5);
    const expectedTax = Number(((totals.subtotal - totals.discount) * APP_CONFIG.taxRate).toFixed(2));
    expect(totals.tax).toBe(expectedTax);
    expect(totals.total).toBe(Number((totals.subtotal - totals.discount + expectedTax).toFixed(2)));
  });

  it('clears the cart', () => {
    const state = cartReducer(
      cartReducer(undefined, addItem(product)),
      clearCart(),
    );
    expect(state.items).toHaveLength(0);
  });
});
