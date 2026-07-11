import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import type { ReactNode } from 'react';
import { usePermissions } from './usePermissions';
import { authReducer } from '@/features/auth/authSlice';
import { PERMISSIONS } from '@/constants/permissions';
import { ROLES } from '@/constants/roles';

const wrapper =
  (role: (typeof ROLES)[keyof typeof ROLES]) =>
  ({ children }: { children: ReactNode }) => {
    const store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: {
        auth: {
          user: {
            id: 1,
            name: 'Cashier',
            email: 'c@test.com',
            role,
          },
          accessToken: 't',
          refreshToken: 'r',
          isInitialized: true,
        },
      },
    });
    return <Provider store={store}>{children}</Provider>;
  };

describe('usePermissions', () => {
  it('grants POS access to cashier', () => {
    const { result } = renderHook(() => usePermissions(), {
      wrapper: wrapper(ROLES.CASHIER),
    });
    expect(result.current.hasPermission(PERMISSIONS.POS_ACCESS)).toBe(true);
    expect(result.current.hasPermission(PERMISSIONS.USER_MANAGE)).toBe(false);
  });

  it('grants all permissions to super admin', () => {
    const { result } = renderHook(() => usePermissions(), {
      wrapper: wrapper(ROLES.SUPER_ADMIN),
    });
    expect(result.current.hasPermission(PERMISSIONS.USER_MANAGE)).toBe(true);
  });
});
