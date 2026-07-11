export const APP_CONFIG = {
  name: 'Popy POS',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],
  currency: import.meta.env.VITE_CURRENCY ?? 'USD',
  locale: import.meta.env.VITE_LOCALE ?? 'en-US',
  taxRate: Number(import.meta.env.VITE_TAX_RATE ?? '0.1'),
} as const;

export const STORAGE_KEYS = {
  accessToken: 'pos.accessToken',
  refreshToken: 'pos.refreshToken',
  user: 'pos.user',
  currentShopId: 'pos.currentShopId',
} as const;
