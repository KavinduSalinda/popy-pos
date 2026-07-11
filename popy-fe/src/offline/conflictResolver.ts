import type { SalesSyncResult } from './types';

export const classifySyncResults = (results: SalesSyncResult[]) => {
  const synced = results.filter((result) =>
    ['synced', 'duplicate'].includes(result.status),
  );
  const rejected = results.filter((result) => result.status === 'rejected');
  return { synced, rejected };
};

export const formatConflictMessage = (results: SalesSyncResult[]) => {
  const rejected = results.filter((result) => result.status === 'rejected');
  if (!rejected.length) return null;
  return rejected
    .map((result) => result.message ?? `Sale ${result.clientId} rejected`)
    .join('; ');
};
