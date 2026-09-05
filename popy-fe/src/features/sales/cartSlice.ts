import {
  createSelector,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import type { RootState } from '@/app/store';
import { APP_CONFIG } from '@/constants';
import { toNumber } from '@/utils';
import type { ID } from '@/types';
import {
  clampQuantity,
  normalizeProductUnit,
  quantityStepForUnit,
} from '@/features/products/schema';
import type { CartItem, PaymentMethod, PosProduct } from './types';

interface CartState {
  items: CartItem[];
  customerId: ID | null;
  discount: number;
  paymentMethod: PaymentMethod;
}

const initialState: CartState = {
  items: [],
  customerId: null,
  discount: 0,
  paymentMethod: 'CASH',
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<PosProduct>) => {
      const product = action.payload;
      const unit = product.unit ? normalizeProductUnit(product.unit) : undefined;
      const step = quantityStepForUnit(unit);
      const existing = state.items.find((i) => i.productId === product.id);
      if (existing) {
        existing.quantity = clampQuantity(
          existing.quantity + step,
          existing.stockQuantity,
          existing.unit,
        );
      } else {
        state.items.push({
          productId: product.id,
          name: product.name,
          sku: product.sku,
          unit,
          unitPrice: toNumber(product.sellingPrice),
          quantity: 1,
          stockQuantity: toNumber(product.stockQuantity),
        });
      }
    },
    setItemQuantity: (
      state,
      action: PayloadAction<{ productId: ID; quantity: number }>,
    ) => {
      const item = state.items.find(
        (i) => i.productId === action.payload.productId,
      );
      if (!item) return;
      item.quantity = clampQuantity(
        action.payload.quantity,
        item.stockQuantity,
        item.unit,
      );
    },
    removeItem: (state, action: PayloadAction<ID>) => {
      state.items = state.items.filter((i) => i.productId !== action.payload);
    },
    setCustomer: (state, action: PayloadAction<ID | null>) => {
      state.customerId = action.payload;
    },
    setDiscount: (state, action: PayloadAction<number>) => {
      state.discount = Math.max(0, action.payload);
    },
    setPaymentMethod: (state, action: PayloadAction<PaymentMethod>) => {
      state.paymentMethod = action.payload;
    },
    clearCart: () => initialState,
  },
});

export const {
  addItem,
  setItemQuantity,
  removeItem,
  setCustomer,
  setDiscount,
  setPaymentMethod,
  clearCart,
} = cartSlice.actions;
export const cartReducer = cartSlice.reducer;

const selectCart = (state: RootState) => state.cart;

export const selectCartTotals = createSelector([selectCart], (cart) => {
  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const discount = Math.min(cart.discount, subtotal);
  const taxable = subtotal - discount;
  const tax = Number((taxable * APP_CONFIG.taxRate).toFixed(2));
  const total = Number((taxable + tax).toFixed(2));
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  return { subtotal, discount, tax, total, itemCount };
});
