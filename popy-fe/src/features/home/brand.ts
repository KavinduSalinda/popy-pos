import { createTheme } from '@mui/material/styles';

/** Exact colors sampled from the Popy logo. */
export const POPY = {
  navy: '#0E192B',
  navyMid: '#152338',
  navyLift: '#1C2C42',
  orange: '#FE7E23',
  red: '#EF1C23',
  teal: '#30B9A7',
  green: '#4CBA59',
  steel: '#A2A6B2',
  white: '#FFFFFF',
} as const;

export const POPY_ACCENTS = [POPY.orange, POPY.red, POPY.teal, POPY.green] as const;

export const LOGO_SRC = '/logo.jpeg';

export const popyPublicTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: POPY.orange },
    secondary: { main: POPY.teal },
    success: { main: POPY.green },
    error: { main: POPY.red },
    warning: { main: POPY.orange },
    background: { default: POPY.navy, paper: POPY.navyLift },
    text: { primary: POPY.white, secondary: POPY.steel },
    divider: 'rgba(162, 166, 178, 0.22)',
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "'Roboto', 'Segoe UI', system-ui, sans-serif",
    button: { textTransform: 'none', fontWeight: 700, letterSpacing: 0.2 },
    h1: { fontWeight: 800, letterSpacing: '-0.03em' },
    h2: { fontWeight: 800, letterSpacing: '-0.02em' },
    h6: { fontWeight: 700 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10, px: 2.5 },
        outlined: {
          borderColor: 'rgba(162, 166, 178, 0.45)',
          color: POPY.white,
          '&:hover': {
            borderColor: POPY.white,
            backgroundColor: 'rgba(255,255,255,0.04)',
          },
        },
      },
    },
    MuiPaper: { defaultProps: { elevation: 0 } },
  },
});
