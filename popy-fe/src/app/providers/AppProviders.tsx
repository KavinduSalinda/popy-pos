import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { store } from '@/app/store';
import { useAppSelector } from '@/app/hooks';
import { darkTheme, lightTheme } from '@/theme';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { OfflineSyncProvider } from '@/offline/OfflineSyncProvider';

const ThemedShell = ({ children }: { children: ReactNode }) => {
  const mode = useAppSelector((state) => state.ui.themeMode);
  const theme = mode === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <ErrorBoundary>{children}</ErrorBoundary>
        <ToastContainer
          position="top-right"
          autoClose={4000}
          newestOnTop
          theme={mode}
        />
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export const AppProviders = ({ children }: { children: ReactNode }) => (
  <Provider store={store}>
    <OfflineSyncProvider>
      <ThemedShell>{children}</ThemedShell>
    </OfflineSyncProvider>
  </Provider>
);
