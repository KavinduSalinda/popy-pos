import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import CloudOff from '@mui/icons-material/CloudOff';
import CloudSync from '@mui/icons-material/CloudSync';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineBanner = () => {
  const { isOffline } = useOnlineStatus();
  const { isSyncing, pendingCount, lastMessage, downloadCatalog, syncNow } =
    useOfflineSync();

  if (!isOffline && pendingCount === 0 && !lastMessage) {
    return null;
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Alert
        severity={isOffline ? 'warning' : pendingCount > 0 ? 'info' : 'success'}
        icon={isOffline ? <CloudOff /> : <CloudSync />}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          alignItems={{ sm: 'center' }}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="subtitle2">
              {isOffline
                ? 'Offline mode — POS will queue sales locally.'
                : 'Back online — syncing queued changes.'}
            </Typography>
            {lastMessage && (
              <Typography variant="body2" color="text.secondary">
                {lastMessage}
              </Typography>
            )}
            {pendingCount > 0 && (
              <Typography variant="body2">
                Pending queue: {pendingCount}
              </Typography>
            )}
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => void downloadCatalog()}
              disabled={isOffline || isSyncing}
            >
              Download catalog
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={() => void syncNow()}
              disabled={isOffline || isSyncing}
            >
              {isSyncing ? 'Syncing…' : 'Sync now'}
            </Button>
          </Stack>
        </Stack>
      </Alert>
    </Box>
  );
};
