import { Suspense } from 'react';
import { Box, Card, CardContent, Stack, ThemeProvider, Typography } from '@mui/material';
import { Link as RouterLink, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader } from '@/components/common/Loader';
import { ROUTES } from '@/constants';
import { LOGO_SRC, POPY, popyPublicTheme } from '@/features/home/brand';

export const AuthLayout = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return (
    <ThemeProvider theme={popyPublicTheme}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          bgcolor: POPY.navy,
          background: `radial-gradient(ellipse at 20% 0%, rgba(254,126,35,0.14), transparent 42%),
            radial-gradient(ellipse at 90% 100%, rgba(48,185,167,0.12), transparent 40%),
            ${POPY.navy}`,
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 420,
            bgcolor: POPY.navyLift,
            color: POPY.white,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Stack alignItems="center" spacing={1} mb={3}>
              <Box
                component="img"
                src={LOGO_SRC}
                alt="Popy"
                sx={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 2 }}
              />
              <Typography
                sx={{
                  fontWeight: 800,
                  letterSpacing: '0.32em',
                  color: POPY.white,
                }}
              >
                POPY
              </Typography>
              <Typography
                variant="caption"
                sx={{ letterSpacing: '0.22em', color: POPY.steel }}
              >
                BUILT TO BE TRUSTED
              </Typography>
            </Stack>
            <Suspense fallback={<Loader />}>
              <Outlet />
            </Suspense>
          </CardContent>
        </Card>
        <Typography
          component={RouterLink}
          to={ROUTES.HOME}
          variant="body2"
          sx={{
            mt: 2,
            color: POPY.steel,
            textDecoration: 'none',
            '&:hover': { color: POPY.white },
          }}
        >
          Back to home
        </Typography>
      </Box>
    </ThemeProvider>
  );
};
