import type { ReactNode } from 'react';
import {
  Avatar,
  Card,
  CardContent,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';

interface KpiCardProps {
  title: string;
  value: ReactNode;
  icon: ReactNode;
  color?: string;
  loading?: boolean;
}

export const KpiCard = ({
  title,
  value,
  icon,
  color = 'primary.main',
  loading = false,
}: KpiCardProps) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>{icon}</Avatar>
        <Stack sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary" noWrap>
            {title}
          </Typography>
          {loading ? (
            <Skeleton width={80} height={28} />
          ) : (
            <Typography variant="h6" noWrap>
              {value}
            </Typography>
          )}
        </Stack>
      </Stack>
    </CardContent>
  </Card>
);
