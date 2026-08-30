import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DnsIcon from '@mui/icons-material/Dns';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import {
  DEFAULT_CLOUD_API_URL,
  DEFAULT_LOCAL_API_URL,
  getServerConfig,
  isElectron,
  setServerConfig,
  testServerConnection,
  type ServerConfig,
  type ServerMode,
} from '@/services/serverConfig';

interface ServerSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved?: (config: ServerConfig) => void;
}

export const ServerSettingsDialog = ({
  open,
  onClose,
  onSaved,
}: ServerSettingsDialogProps) => {
  const [config, setConfig] = useState<ServerConfig>(getServerConfig);
  const [customUrl, setCustomUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    message: string;
    latencyMs?: number;
  } | null>(null);

  useEffect(() => {
    if (open) {
      const current = getServerConfig();
      setConfig(current);
      if (current.mode === 'custom') {
        setCustomUrl(current.url);
      } else {
        setCustomUrl(current.url || DEFAULT_LOCAL_API_URL);
      }
      setTestResult(null);
    }
  }, [open]);

  const getActiveUrl = (mode: ServerMode): string => {
    switch (mode) {
      case 'localhost':
        return DEFAULT_LOCAL_API_URL;
      case 'cloud':
        return DEFAULT_CLOUD_API_URL;
      case 'custom':
        return customUrl.trim();
    }
  };

  const handleModeChange = (mode: ServerMode) => {
    const nextUrl = getActiveUrl(mode);
    setConfig({ mode, url: nextUrl });
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    const urlToTest = getActiveUrl(config.mode);
    if (!urlToTest) return;
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testServerConnection(urlToTest);
      setTestResult(result);
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    const targetUrl = getActiveUrl(config.mode);
    const newConfig: ServerConfig = {
      mode: config.mode,
      url: targetUrl,
    };
    setServerConfig(newConfig);
    onSaved?.(newConfig);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <DnsIcon color="primary" />
        Backend Server Connection
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5}>
          {isElectron() && (
            <Alert severity="info" variant="outlined">
              Running in Desktop Mode. By default, local desktop uses{' '}
              <strong>Localhost (127.0.0.1:8000)</strong> backend. You can also switch to Cloud server.
            </Alert>
          )}

          <Typography variant="subtitle2" color="text.secondary">
            Select which API server this POS app connects to:
          </Typography>

          <FormControl component="fieldset">
            <RadioGroup
              value={config.mode}
              onChange={(e) => handleModeChange(e.target.value as ServerMode)}
            >
              <FormControlLabel
                value="localhost"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      Localhost Backend (Offline / Local Shop Server)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {DEFAULT_LOCAL_API_URL} (Django running locally on this machine)
                    </Typography>
                  </Box>
                }
                sx={{ mb: 1 }}
              />

              <FormControlLabel
                value="cloud"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      Cloud Production Backend
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {DEFAULT_CLOUD_API_URL} (Hosted PythonAnywhere backend)
                    </Typography>
                  </Box>
                }
                sx={{ mb: 1 }}
              />

              <FormControlLabel
                value="custom"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      Custom Server URL
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Connect to a local network IP, VPN, or custom backend domain
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>

          {config.mode === 'custom' && (
            <TextField
              label="Custom API Base URL"
              placeholder="http://192.168.1.50:8000/api"
              value={customUrl}
              onChange={(e) => {
                setCustomUrl(e.target.value);
                setTestResult(null);
              }}
              helperText="Must include http:// or https:// and /api suffix"
              fullWidth
              size="small"
            />
          )}

          <Box
            sx={{
              p: 1.5,
              borderRadius: 1,
              bgcolor: 'action.hover',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Active Endpoint Target:
              </Typography>
              <Typography variant="body2" fontFamily="monospace" fontWeight={600}>
                {getActiveUrl(config.mode)}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              onClick={handleTestConnection}
              disabled={testing}
              startIcon={testing ? <CircularProgress size={14} /> : undefined}
            >
              {testing ? 'Testing...' : 'Test Connection'}
            </Button>
          </Box>

          {testResult && (
            <Alert
              severity={testResult.ok ? 'success' : 'error'}
              icon={
                testResult.ok ? <CheckCircleOutlineIcon /> : <ErrorOutlineIcon />
              }
            >
              {testResult.message}
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave}>
          Apply Settings
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const ServerConnectionBadge = ({
  onClick,
  sx,
}: {
  onClick?: () => void;
  sx?: object;
}) => {
  const [config, setConfig] = useState<ServerConfig>(getServerConfig);

  useEffect(() => {
    const handleUpdate = () => setConfig(getServerConfig());
    window.addEventListener('popy:server-config-changed', handleUpdate);
    return () =>
      window.removeEventListener('popy:server-config-changed', handleUpdate);
  }, []);

  const label =
    config.mode === 'localhost'
      ? 'Localhost: 127.0.0.1:8000'
      : config.mode === 'cloud'
        ? 'Cloud Server'
        : 'Custom Server';

  return (
    <Chip
      icon={<DnsIcon fontSize="small" />}
      label={label}
      size="small"
      variant="outlined"
      onClick={onClick}
      clickable={Boolean(onClick)}
      sx={{
        fontSize: '0.75rem',
        cursor: onClick ? 'pointer' : 'default',
        ...sx,
      }}
    />
  );
};
