import { Suspense } from 'react';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import PointOfSale from '@mui/icons-material/PointOfSale';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader } from '@/components/common/Loader';
import { APP_CONFIG, ROUTES } from '@/constants';

export const AuthLayout = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack alignItems="center" spacing={1} mb={3}>
            <PointOfSale color="primary" sx={{ fontSize: 40 }} />
            <Typography variant="h5" fontWeight={800}>
              {APP_CONFIG.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Point of Sale Management System
            </Typography>
          </Stack>
          <Suspense fallback={<Loader />}>
            <Outlet />
          </Suspense>
        </CardContent>
      </Card>
    </Box>
  );
};
