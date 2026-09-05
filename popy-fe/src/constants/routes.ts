export const ROUTES = {
  HOME: '/',

  // Auth
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/:token',

  // App
  DASHBOARD: '/dashboard',
  PRODUCTS: '/products',
  PRODUCT_CREATE: '/products/new',
  PRODUCT_EDIT: '/products/:id/edit',
  PRODUCT_VIEW: '/products/:id',
  CATEGORIES: '/categories',
  INVENTORY: '/inventory',
  SUPPLIERS: '/suppliers',
  CUSTOMERS: '/customers',
  PURCHASES: '/purchases',
  PURCHASE_VIEW: '/purchases/:id',
  POS: '/pos',
  SALES: '/sales',
  SALE_VIEW: '/sales/:id',
  RETURNS: '/returns',
  USERS: '/users',
  REPORTS: '/reports',
  SETTINGS: '/settings',
  ATTENDANCE: '/attendance',

  // Errors
  FORBIDDEN: '/403',
  SERVER_ERROR: '/500',
  NOT_FOUND: '*',
} as const;

export const buildPath = (
  template: string,
  params: Record<string, string | number>,
): string =>
  Object.entries(params).reduce<string>(
    (path, [key, value]) => path.replace(`:${key}`, String(value)),
    template,
  );
