import { useOfflineSyncContext } from '../OfflineSyncProvider';
import { useOnlineStatus } from './useOnlineStatus';

export const useOfflineSync = () => {
  const { isOnline } = useOnlineStatus();
  return { isOnline, ...useOfflineSyncContext() };
};
