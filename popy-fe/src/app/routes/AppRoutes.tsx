import { lazy, Suspense } from 'react';
import { Box } from '@mui/material';
import { Route, Routes } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { ROUTES } from '@/constants';
import { PERMISSIONS } from '@/constants/permissions';
import { Loader } from '@/components/common/Loader';
import {
  ForbiddenPage,
  NotFoundPage,
  ServerErrorPage,
} from '@/components/common';

const HomePage = lazy(() => import('@/features/home/pages/HomePage'));

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const ForgotPasswordPage = lazy(
  () => import('@/features/auth/pages/ForgotPasswordPage'),
);
const ResetPasswordPage = lazy(
  () => import('@/features/auth/pages/ResetPasswordPage'),
);

const DashboardPage = lazy(
  () => import('@/features/dashboard/pages/DashboardPage'),
);
const ProductsPage = lazy(
  () => import('@/features/products/pages/ProductsPage'),
);
const CategoriesPage = lazy(
  () => import('@/features/categories/pages/CategoriesPage'),
);
const InventoryPage = lazy(
  () => import('@/features/inventory/pages/InventoryPage'),
);
const SuppliersPage = lazy(
  () => import('@/features/suppliers/pages/SuppliersPage'),
);
const CustomersPage = lazy(
  () => import('@/features/customers/pages/CustomersPage'),
);
const PurchasesPage = lazy(
  () => import('@/features/purchases/pages/PurchasesPage'),
);
const PurchaseDetailsPage = lazy(
  () => import('@/features/purchases/pages/PurchaseDetailsPage'),
);
const PosPage = lazy(() => import('@/features/sales/pages/PosPage'));
const SalesHistoryPage = lazy(
  () => import('@/features/sales/pages/SalesHistoryPage'),
);
const SaleDetailsPage = lazy(
  () => import('@/features/sales/pages/SaleDetailsPage'),
);
const ReturnsPage = lazy(() => import('@/features/returns/pages/ReturnsPage'));
const UsersPage = lazy(() => import('@/features/users/pages/UsersPage'));
const ReportsPage = lazy(() => import('@/features/reports/pages/ReportsPage'));
const AttendancePage = lazy(
  () => import('@/features/attendance/pages/AttendancePage'),
);
const SettingsPage = lazy(
  () => import('@/features/settings/pages/SettingsPage'),
);

export const AppRoutes = () => (
  <Routes>
    <Route
      path={ROUTES.HOME}
      element={
        <Box sx={{ minHeight: '100vh', bgcolor: '#E6F1FB' }}>
          <Suspense fallback={<Loader fullHeight />}>
            <HomePage />
          </Suspense>
        </Box>
      }
    />

    <Route element={<AuthLayout />}>
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
      <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
    </Route>

    <Route
      element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute permission={PERMISSIONS.DASHBOARD_VIEW}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.POS}
        element={
          <ProtectedRoute permission={PERMISSIONS.POS_ACCESS}>
            <PosPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PRODUCTS}
        element={
          <ProtectedRoute permission={PERMISSIONS.PRODUCT_VIEW}>
            <ProductsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.CATEGORIES}
        element={
          <ProtectedRoute permission={PERMISSIONS.CATEGORY_VIEW}>
            <CategoriesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.INVENTORY}
        element={
          <ProtectedRoute permission={PERMISSIONS.INVENTORY_VIEW}>
            <InventoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SUPPLIERS}
        element={
          <ProtectedRoute permission={PERMISSIONS.SUPPLIER_VIEW}>
            <SuppliersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.CUSTOMERS}
        element={
          <ProtectedRoute permission={PERMISSIONS.CUSTOMER_VIEW}>
            <CustomersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PURCHASES}
        element={
          <ProtectedRoute permission={PERMISSIONS.PURCHASE_VIEW}>
            <PurchasesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PURCHASE_VIEW}
        element={
          <ProtectedRoute permission={PERMISSIONS.PURCHASE_VIEW}>
            <PurchaseDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SALES}
        element={
          <ProtectedRoute permission={PERMISSIONS.SALE_VIEW}>
            <SalesHistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SALE_VIEW}
        element={
          <ProtectedRoute permission={PERMISSIONS.SALE_VIEW}>
            <SaleDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.RETURNS}
        element={
          <ProtectedRoute permission={PERMISSIONS.RETURN_VIEW}>
            <ReturnsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.REPORTS}
        element={
          <ProtectedRoute permission={PERMISSIONS.REPORT_VIEW}>
            <ReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.USERS}
        element={
          <ProtectedRoute permission={PERMISSIONS.USER_VIEW}>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ATTENDANCE}
        element={
          <ProtectedRoute
            anyOf={[PERMISSIONS.ATTENDANCE_MARK, PERMISSIONS.ATTENDANCE_VIEW]}
          >
            <AttendancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SETTINGS}
        element={
          <ProtectedRoute permission={PERMISSIONS.SETTINGS_MANAGE}>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
    </Route>

    <Route path={ROUTES.FORBIDDEN} element={<ForbiddenPage />} />
    <Route path={ROUTES.SERVER_ERROR} element={<ServerErrorPage />} />
    <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
  </Routes>
);
