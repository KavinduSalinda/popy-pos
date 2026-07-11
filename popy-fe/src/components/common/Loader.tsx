import { Box, CircularProgress, Typography } from '@mui/material';

interface LoaderProps {
  message?: string;
  fullHeight?: boolean;
  size?: number;
}

export const Loader = ({
  message,
  fullHeight = false,
  size = 40,
}: LoaderProps) => (
  <Box
    role="status"
    aria-live="polite"
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      width: '100%',
      minHeight: fullHeight ? '60vh' : 160,
    }}
  >
    <CircularProgress size={size} />
    {message && (
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    )}
  </Box>
);
