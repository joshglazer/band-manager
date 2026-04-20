'use client';

import '@mui/lab/themeAugmentation';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ReactNode, useMemo } from 'react';

// Deep crimson — raw energy, rock and roll, vintage venue marquees
// Dark: near-black with a deep red undertone
// Light: soft warm white with rich crimson accents
function buildTheme(dark: boolean) {
  return createTheme({
    palette: {
      mode: dark ? 'dark' : 'light',
      primary: {
        main: dark ? '#f87171' : '#b91c1c',
        light: dark ? '#fca5a5' : '#dc2626',
        dark: dark ? '#ef4444' : '#991b1b',
        contrastText: dark ? '#0d0305' : '#ffffff',
      },
      secondary: {
        main: dark ? '#94a3b8' : '#475569',
        light: dark ? '#cbd5e1' : '#64748b',
        dark: dark ? '#64748b' : '#334155',
        contrastText: '#ffffff',
      },
      background: {
        default: dark ? '#0d0507' : '#fdf8f8',
        paper: dark ? '#1a0b0d' : '#ffffff',
      },
      text: {
        primary: dark ? '#fef2f2' : '#1a0505',
        secondary: dark ? '#fca5a5' : '#7f1d1d',
      },
      divider: dark ? 'rgba(248,113,113,0.12)' : 'rgba(185,28,28,0.12)',
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
            scrollbarColor: dark ? '#3d1015 #0d0507' : '#f5c6c6 #fdf8f8',
          },
        },
      },
      MuiAppBar: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundColor: dark ? '#0d0507' : '#991b1b',
            borderBottom: dark ? '1px solid rgba(248,113,113,0.15)' : 'none',
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
                ? '0 4px 32px rgba(248,113,113,0.1)'
                : '0 4px 24px rgba(185,28,28,0.1)',
              borderColor: dark ? 'rgba(248,113,113,0.35)' : 'rgba(185,28,28,0.3)',
            },
          }),
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundImage: 'none',
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
              backgroundColor: dark ? 'rgba(13,5,7,0.7)' : 'rgba(253,248,248,0.8)',
              color: dark ? '#fca5a5' : '#7f1d1d',
            },
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:last-child td': { border: 0 },
            '&:hover': {
              backgroundColor: dark ? 'rgba(248,113,113,0.05)' : 'rgba(185,28,28,0.03)',
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
            backgroundColor: dark ? '#ef4444' : '#b91c1c',
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
