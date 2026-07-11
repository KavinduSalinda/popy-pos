import { STORAGE_KEYS } from '@/constants';
import type { User } from '@/features/auth/types';
import { storage } from './storage';

/**
 * Central place for reading/writing auth tokens and the current user. Keeping
 * this isolated means the axios client, RTK Query and the auth slice all share
 * a single source of truth.
 */
export const tokenService = {
  getAccessToken: (): string | null =>
    storage.get<string>(STORAGE_KEYS.accessToken),

  getRefreshToken: (): string | null =>
    storage.get<string>(STORAGE_KEYS.refreshToken),

  getUser: (): User | null => storage.get<User>(STORAGE_KEYS.user),

  getCurrentShopId: (): string | null =>
    storage.get<string>(STORAGE_KEYS.currentShopId),

  setTokens: (accessToken: string, refreshToken: string): void => {
    storage.set(STORAGE_KEYS.accessToken, accessToken);
    storage.set(STORAGE_KEYS.refreshToken, refreshToken);
  },

  setUser: (user: User): void => {
    storage.set(STORAGE_KEYS.user, user);
  },

  setCurrentShopId: (shopId: string | number): void => {
    storage.set(STORAGE_KEYS.currentShopId, String(shopId));
  },

  clear: (): void => {
    storage.remove(STORAGE_KEYS.accessToken);
    storage.remove(STORAGE_KEYS.refreshToken);
    storage.remove(STORAGE_KEYS.user);
    storage.remove(STORAGE_KEYS.currentShopId);
  },
};
