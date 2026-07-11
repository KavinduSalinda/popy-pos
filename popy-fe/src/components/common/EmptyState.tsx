import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import Inbox from '@mui/icons-material/Inbox';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export const EmptyState = ({
  title = 'Nothing here yet',
  description,
  icon,
  action,
}: EmptyStateProps) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      gap: 1.5,
      py: 6,
      px: 2,
      color: 'text.secondary',
    }}
  >
    {icon ?? <Inbox sx={{ fontSize: 56, opacity: 0.4 }} />}
    <Typography variant="h6" color="text.primary">
      {title}
    </Typography>
    {description && (
      <Typography variant="body2" sx={{ maxWidth: 420 }}>
        {description}
      </Typography>
    )}
    {action && <Box sx={{ mt: 1 }}>{action}</Box>}
  </Box>
);
