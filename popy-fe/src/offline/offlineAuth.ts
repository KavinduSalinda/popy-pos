import { tokenService } from '@/services/tokenService';
import { hasCachedCatalog } from './catalogCache';
import type { OfflineAuthState } from './types';

export const getOfflineAuthState = async (): Promise<OfflineAuthState> => {
  const user = tokenService.getUser();
  const shopId = tokenService.getCurrentShopId();
  const accessToken = tokenService.getAccessToken();

  if (!user || !shopId || !accessToken) {
    return {
      isOfflineReady: false,
      hasCachedCatalog: false,
      reason: 'Login required before offline use.',
    };
  }

  const cached = await hasCachedCatalog(shopId);
  if (!cached) {
    return {
      isOfflineReady: false,
      hasCachedCatalog: false,
      reason: 'Download catalog while online before going offline.',
    };
  }

  return {
    isOfflineReady: true,
    hasCachedCatalog: true,
  };
};

export const canWorkOffline = async () => {
  const state = await getOfflineAuthState();
  return state.isOfflineReady;
};
