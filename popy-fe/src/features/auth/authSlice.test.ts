import { describe, expect, it, beforeEach } from 'vitest';
import { authReducer, logout, setCredentials } from './authSlice';
import { ROLES } from '@/constants/roles';
import { tokenService } from '@/services/tokenService';

describe('authSlice', () => {
  beforeEach(() => {
    tokenService.clear();
  });

  it('sets credentials and persists tokens', () => {
    const state = authReducer(
      undefined,
      setCredentials({
        accessToken: 'access-1',
        refreshToken: 'refresh-1',
        user: {
          id: 1,
          name: 'Admin',
          email: 'admin@test.com',
          role: ROLES.SUPER_ADMIN,
        },
      }),
    );

    expect(state.accessToken).toBe('access-1');
    expect(state.user?.email).toBe('admin@test.com');
    expect(tokenService.getAccessToken()).toBe('access-1');
  });

  it('clears auth state on logout', () => {
    const loggedIn = authReducer(
      undefined,
      setCredentials({
        accessToken: 'a',
        refreshToken: 'r',
        user: {
          id: 1,
          name: 'Admin',
          email: 'admin@test.com',
          role: ROLES.MANAGER,
        },
      }),
    );

    const state = authReducer(loggedIn, logout());
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(tokenService.getAccessToken()).toBeNull();
  });
});
