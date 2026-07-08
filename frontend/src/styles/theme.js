import { createTheme } from '@mui/material/styles';

const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#2d6a4f',
        light: '#52b788',
        dark: '#1b4332',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#d4a373',
        light: '#faedcd',
        dark: '#b5835a',
      },
      success: {
        main: '#40916c',
        light: '#95d5b2',
        dark: '#1b4332',
      },
      warning: {
        main: '#e9c46a',
        light: '#f4a261',
        dark: '#e76f51',
      },
      error: {
        main: '#d62828',
        light: '#ff4d4d',
        dark: '#a4161a',
      },
      info: {
        main: '#457b9d',
        light: '#a8dadc',
        dark: '#1d3557',
      },
      background: {
        default: mode === 'light' ? '#f0f5f0' : '#0d1b13',
        paper: mode === 'light' ? '#ffffff' : '#132a1d',
      },
      text: {
        primary: mode === 'light' ? '#1b4332' : '#e0f0e3',
        secondary: mode === 'light' ? '#555555' : '#a0b8a8',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 800, fontFamily: '"Outfit", "Inter", sans-serif' },
      h2: { fontWeight: 700, fontFamily: '"Outfit", "Inter", sans-serif' },
      h3: { fontWeight: 700, fontFamily: '"Outfit", "Inter", sans-serif' },
      h4: { fontWeight: 700, fontFamily: '"Outfit", "Inter", sans-serif' },
      h5: { fontWeight: 600, fontFamily: '"Outfit", "Inter", sans-serif' },
      h6: { fontWeight: 600, fontFamily: '"Outfit", "Inter", sans-serif' },
      button: { fontWeight: 600, textTransform: 'none' },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: '10px 24px',
            fontSize: '0.95rem',
          },
          containedPrimary: {
            boxShadow: '0 4px 14px rgba(45, 106, 79, 0.35)',
            '&:hover': { boxShadow: '0 6px 20px rgba(45, 106, 79, 0.5)' },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            boxShadow:
              mode === 'light'
                ? '0 2px 12px rgba(0,0,0,0.08)'
                : '0 2px 12px rgba(0,0,0,0.4)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': { borderRadius: 10 },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 8, fontWeight: 600 },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { borderRadius: 14 },
        },
      },
    },
  });

export const theme = getTheme('light');
export const darkTheme = getTheme('dark');
export default getTheme;
