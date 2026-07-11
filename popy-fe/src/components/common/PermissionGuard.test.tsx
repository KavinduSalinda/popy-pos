import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { PermissionGuard } from './PermissionGuard';
import { authReducer } from '@/features/auth/authSlice';
import { PERMISSIONS } from '@/constants/permissions';
import { ROLES } from '@/constants/roles';

const renderWithRole = (
  role: (typeof ROLES)[keyof typeof ROLES],
  ui: ReactNode,
) => {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        user: {
          id: 1,
          name: 'Test',
          email: 't@test.com',
          role,
        },
        accessToken: 'token',
        refreshToken: 'refresh',
        isInitialized: true,
      },
    },
  });
  return render(<Provider store={store}>{ui}</Provider>);
};

describe('PermissionGuard', () => {
  it('renders children when permission is granted', () => {
    renderWithRole(
      ROLES.SUPER_ADMIN,
      <PermissionGuard permission={PERMISSIONS.PRODUCT_CREATE}>
        <button type="button">Add product</button>
      </PermissionGuard>,
    );
    expect(
      screen.getByRole('button', { name: /add product/i }),
    ).toBeInTheDocument();
  });

  it('hides children when permission is denied', () => {
    renderWithRole(
      ROLES.CASHIER,
      <PermissionGuard permission={PERMISSIONS.USER_MANAGE}>
        <button type="button">Manage users</button>
      </PermissionGuard>,
    );
    expect(
      screen.queryByRole('button', { name: /manage users/i }),
    ).not.toBeInTheDocument();
  });
});
