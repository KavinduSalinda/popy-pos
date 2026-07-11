import { Suspense } from 'react';
import { Box, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Loader } from '@/components/common/Loader';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export const DashboardLayout = () => (
  <Box sx={{ display: 'flex', minHeight: '100vh' }}>
    <Topbar />
    <Sidebar />
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        width: 0,
        bgcolor: 'background.default',
        minHeight: '100vh',
      }}
    >
      <Toolbar />
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <ErrorBoundary>
          <Suspense fallback={<Loader fullHeight message="Loading…" />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </Box>
    </Box>
  </Box>
);
