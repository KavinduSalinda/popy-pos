import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { ROUTES } from '@/constants';
import type { Permission } from '@/constants/permissions';

interface ProtectedRouteProps {
  children: ReactNode;
  permission?: Permission;
  /** Allow access if the user has any of these permissions. */
  anyOf?: Permission[];
}

/**
 * Guards a route by requiring authentication and, optionally, a permission.
 * Unauthenticated users are redirected to login (preserving the target path);
 * authenticated-but-unauthorised users are sent to the 403 page.
 */
export const ProtectedRoute = ({
  children,
  permission,
  anyOf,
}: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth();
  const { hasPermission } = usePermissions();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate to={ROUTES.LOGIN} replace state={{ from: location.pathname }} />
    );
  }

  const allowed = anyOf?.length
    ? anyOf.some((p) => hasPermission(p))
    : permission
      ? hasPermission(permission)
      : true;

  if (!allowed) {
    return <Navigate to={ROUTES.FORBIDDEN} replace />;
  }

  return <>{children}</>;
};
