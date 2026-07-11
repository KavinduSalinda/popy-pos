import { useEffect, useState } from 'react';
import { getOfflineAuthState } from '../offlineAuth';
import type { OfflineAuthState } from '../types';

export const useOfflineAuth = () => {
  const [state, setState] = useState<OfflineAuthState>({
    isOfflineReady: false,
    hasCachedCatalog: false,
  });

  useEffect(() => {
    void getOfflineAuthState().then(setState);
  }, []);

  return state;
};
