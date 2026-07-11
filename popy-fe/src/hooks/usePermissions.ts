import { useMemo } from 'react';
import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser } from '@/features/auth/authSelectors';
import { ROLES } from '@/constants/roles';
import {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  type Permission,
} from '@/constants/permissions';

const ALL_PERMISSIONS = Object.values(PERMISSIONS);

const isKnownPermission = (value: string): value is Permission =>
  ALL_PERMISSIONS.includes(value as Permission);

export interface UsePermissionsResult {
  permissions: Permission[];
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
}

/**
 * Resolves the current user's effective permissions. API permissions are merged
 * with the role map so partial backend lists never hide role defaults.
 */
export const usePermissions = (): UsePermissionsResult => {
  const user = useAppSelector(selectCurrentUser);

  const permissions = useMemo<Permission[]>(() => {
    if (!user) return [];

    if (user.role === ROLES.SUPER_ADMIN) {
      return ROLE_PERMISSIONS[ROLES.SUPER_ADMIN];
    }

    const rolePerms = ROLE_PERMISSIONS[user.role] ?? [];
    const apiPerms = (user.permissions ?? []).filter(isKnownPermission);
    return [...new Set([...rolePerms, ...apiPerms])];
  }, [user]);

  return useMemo(() => {
    const permissionSet = new Set<Permission>(permissions);
    return {
      permissions,
      hasPermission: (permission) => permissionSet.has(permission),
      hasAnyPermission: (required) =>
        required.length === 0 || required.some((p) => permissionSet.has(p)),
      hasAllPermissions: (required) =>
        required.every((p) => permissionSet.has(p)),
    };
  }, [permissions]);
};
