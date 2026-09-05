import type { ElementType } from 'react';
import Dashboard from '@mui/icons-material/Dashboard';
import Inventory2 from '@mui/icons-material/Inventory2';
import Category from '@mui/icons-material/Category';
import Warehouse from '@mui/icons-material/Warehouse';
import LocalShipping from '@mui/icons-material/LocalShipping';
import People from '@mui/icons-material/People';
import ShoppingCart from '@mui/icons-material/ShoppingCart';
import PointOfSale from '@mui/icons-material/PointOfSale';
import ReceiptLong from '@mui/icons-material/ReceiptLong';
import AssignmentReturn from '@mui/icons-material/AssignmentReturn';
import ManageAccounts from '@mui/icons-material/ManageAccounts';
import Assessment from '@mui/icons-material/Assessment';
import Settings from '@mui/icons-material/Settings';
import EventAvailable from '@mui/icons-material/EventAvailable';
import { PERMISSIONS, type Permission } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';

export interface NavItem {
  label: string;
  path: string;
  icon: ElementType;
  permission?: Permission;
  /** Show in nav if the user has any of these permissions. */
  anyOf?: Permission[];
  /** Feature requires the current shop to be on the Pro plan. */
  requiresPro?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    path: ROUTES.DASHBOARD,
    icon: Dashboard,
    permission: PERMISSIONS.DASHBOARD_VIEW,
  },
  {
    label: 'Point of Sale',
    path: ROUTES.POS,
    icon: PointOfSale,
    permission: PERMISSIONS.POS_ACCESS,
  },
  {
    label: 'Attendance',
    path: ROUTES.ATTENDANCE,
    icon: EventAvailable,
    anyOf: [PERMISSIONS.ATTENDANCE_MARK, PERMISSIONS.ATTENDANCE_VIEW],
    requiresPro: true,
  },
  {
    label: 'Products',
    path: ROUTES.PRODUCTS,
    icon: Inventory2,
    permission: PERMISSIONS.PRODUCT_VIEW,
  },
  {
    label: 'Categories',
    path: ROUTES.CATEGORIES,
    icon: Category,
    permission: PERMISSIONS.CATEGORY_VIEW,
  },
  {
    label: 'Inventory',
    path: ROUTES.INVENTORY,
    icon: Warehouse,
    permission: PERMISSIONS.INVENTORY_VIEW,
  },
  {
    label: 'Suppliers',
    path: ROUTES.SUPPLIERS,
    icon: LocalShipping,
    permission: PERMISSIONS.SUPPLIER_VIEW,
  },
  {
    label: 'Customers',
    path: ROUTES.CUSTOMERS,
    icon: People,
    permission: PERMISSIONS.CUSTOMER_VIEW,
  },
  {
    label: 'Purchases',
    path: ROUTES.PURCHASES,
    icon: ShoppingCart,
    permission: PERMISSIONS.PURCHASE_VIEW,
  },
  {
    label: 'Sales',
    path: ROUTES.SALES,
    icon: ReceiptLong,
    permission: PERMISSIONS.SALE_VIEW,
  },
  {
    label: 'Returns',
    path: ROUTES.RETURNS,
    icon: AssignmentReturn,
    permission: PERMISSIONS.RETURN_VIEW,
  },
  {
    label: 'Reports',
    path: ROUTES.REPORTS,
    icon: Assessment,
    permission: PERMISSIONS.REPORT_VIEW,
  },
  {
    label: 'Users',
    path: ROUTES.USERS,
    icon: ManageAccounts,
    permission: PERMISSIONS.USER_VIEW,
  },
  {
    label: 'Settings',
    path: ROUTES.SETTINGS,
    icon: Settings,
    permission: PERMISSIONS.SETTINGS_MANAGE,
    requiresPro: true,
  },
];
