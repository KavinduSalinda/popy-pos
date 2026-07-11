export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  MANAGER: 'MANAGER',
  CASHIER: 'CASHIER',
  INVENTORY_OFFICER: 'INVENTORY_OFFICER',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: 'Super Admin',
  MANAGER: 'Manager',
  CASHIER: 'Cashier',
  INVENTORY_OFFICER: 'Inventory Officer',
};

export const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(
  ([value, label]) => ({ value: value as Role, label }),
);
