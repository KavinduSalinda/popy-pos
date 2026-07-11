import { createTheme, type ThemeOptions } from '@mui/material/styles';

const sharedOptions: ThemeOptions = {
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: "'Roboto', 'Segoe UI', system-ui, sans-serif",
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 8 } },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)' },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
    },
  },
};

export const lightTheme = createTheme({
  ...sharedOptions,
  palette: {
    mode: 'light',
    primary: { main: '#2563eb' },
    secondary: { main: '#7c3aed' },
    success: { main: '#16a34a' },
    warning: { main: '#d97706' },
    error: { main: '#dc2626' },
    background: { default: '#f4f6fa', paper: '#ffffff' },
  },
});

export const darkTheme = createTheme({
  ...sharedOptions,
  palette: {
    mode: 'dark',
    primary: { main: '#60a5fa' },
    secondary: { main: '#a78bfa' },
    success: { main: '#4ade80' },
    warning: { main: '#fbbf24' },
    error: { main: '#f87171' },
    background: { default: '#0f172a', paper: '#1e293b' },
  },
});

export type AppThemeMode = 'light' | 'dark';
