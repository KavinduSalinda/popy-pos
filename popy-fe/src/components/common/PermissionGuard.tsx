import type { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import type { Permission } from '@/constants/permissions';

interface PermissionGuardProps {
  /** Single permission required to render the children. */
  permission?: Permission;
  /** Any-of list: renders if the user has at least one. */
  anyOf?: Permission[];
  /** All-of list: renders only if the user has every permission. */
  allOf?: Permission[];
  children: ReactNode;
  /** Optional fallback rendered when access is denied. */
  fallback?: ReactNode;
}

/**
 * Conditionally renders children based on the current user's permissions.
 *
 * @example
 * <PermissionGuard permission="PRODUCT_CREATE">
 *   <AddProductButton />
 * </PermissionGuard>
 */
export const PermissionGuard = ({
  permission,
  anyOf,
  allOf,
  children,
  fallback = null,
}: PermissionGuardProps) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } =
    usePermissions();

  const allowed =
    (permission ? hasPermission(permission) : true) &&
    (anyOf ? hasAnyPermission(anyOf) : true) &&
    (allOf ? hasAllPermissions(allOf) : true);

  return <>{allowed ? children : fallback}</>;
};
