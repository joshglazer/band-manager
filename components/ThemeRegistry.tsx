'use client';

import '@mui/lab/themeAugmentation';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ReactNode, useMemo } from 'react';

// Deep ocean blue meets electric violet — cool energy + stage lights
// Dark: near-black with blue undertone, accented by deep indigo
// Light: cool white with rich cobalt + violet accents
function buildTheme(dark: boolean) {
  return createTheme({
    palette: {
      mode: dark ? 'dark' : 'light',
      primary: {
        main: dark ? '#60a5fa' : '#1d4ed8',
        light: dark ? '#93c5fd' : '#2563eb',
        dark: dark ? '#3b82f6' : '#1e40af',
        contrastText: dark ? '#030d1a' : '#ffffff',
      },
      secondary: {
        main: dark ? '#a78bfa' : '#7c3aed',
        light: dark ? '#c4b5fd' : '#8b5cf6',
        dark: dark ? '#8b5cf6' : '#6d28d9',
        contrastText: '#ffffff',
      },
      background: {
        default: dark ? '#05080d' : '#f8faff',
        paper: dark ? '#0b0d1a' : '#ffffff',
      },
      text: {
        primary: dark ? '#eff6ff' : '#05101a',
        secondary: dark ? '#93c5fd' : '#1e3a5f',
      },
      divider: dark ? 'rgba(96,165,250,0.12)' : 'rgba(29,78,216,0.12)',
      error: { main: dark ? '#fb923c' : '#ea580c' },
      success: { main: dark ? '#86efac' : '#15803d' },
      warning: { main: dark ? '#fde68a' : '#d97706' },
    },
    typography: {
      fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 600 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
    },
    shape: {
      borderRadius: 10,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: dark ? '#0d1540 #05080d' : '#d8e8ff #f8faff',
            backgroundImage: dark
              ? 'linear-gradient(160deg, #05080d 0%, #05100e 50%, #05080d 100%)'
              : 'linear-gradient(160deg, #f8faff 0%, #f5f8fd 50%, #f8faff 100%)',
            backgroundAttachment: 'fixed',
            minHeight: '100vh',
          },
        },
      },
      MuiAppBar: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            background: dark
              ? 'linear-gradient(90deg, #0e1a2e 0%, #0d1e28 100%)'
              : 'linear-gradient(90deg, #1d4ed8 0%, #0369a1 100%)',
            borderBottom: dark ? '1px solid rgba(167,139,250,0.12)' : 'none',
          },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: ({ theme }) => ({
            border: `1px solid ${theme.palette.divider}`,
            transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
            '&:hover': {
              boxShadow: dark
                ? '0 4px 32px rgba(167,139,250,0.12)'
                : '0 4px 24px rgba(109,40,217,0.1)',
              borderColor: dark ? 'rgba(167,139,250,0.3)' : 'rgba(109,40,217,0.2)',
            },
          }),
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundImage: 'none',
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
          }),
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              fontWeight: 600,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              backgroundColor: dark ? 'rgba(5,8,13,0.7)' : 'rgba(248,250,255,0.8)',
              color: dark ? '#93c5fd' : '#1e3a5f',
            },
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:last-child td': { border: 0 },
            '&:hover': {
              backgroundColor: dark ? 'rgba(167,139,250,0.05)' : 'rgba(109,40,217,0.03)',
            },
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 8,
          },
          containedPrimary: {
            background: dark
              ? 'linear-gradient(135deg, #3b82f6 0%, #0ea5e9 100%)'
              : 'linear-gradient(135deg, #1d4ed8 0%, #0284c7 100%)',
            '&:hover': {
              background: dark
                ? 'linear-gradient(135deg, #60a5fa 0%, #38bdf8 100%)'
                : 'linear-gradient(135deg, #2563eb 0%, #0369a1 100%)',
            },
          },
        },
      },
      MuiLoadingButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 8,
          },
        },
      },
      MuiTextField: {
        defaultProps: { variant: 'outlined', size: 'small' },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 6,
            fontSize: '0.75rem',
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            backgroundColor: dark ? '#3b82f6' : '#1d4ed8',
            color: '#ffffff',
            fontWeight: 700,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
    },
  });
}

interface ThemeRegistryProps {
  children: ReactNode;
}

export default function ThemeRegistry({ children }: Readonly<ThemeRegistryProps>) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)', { noSsr: true });
  const theme = useMemo(() => buildTheme(prefersDarkMode), [prefersDarkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
