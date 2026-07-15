import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#4338ca",
      light: "#6366f1",
      dark: "#3730a3",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#0d9488",
    },
    background: {
      default: "#f6f6f9",
      paper: "#ffffff",
    },
    text: {
      primary: "#1e1b2e",
      secondary: "#5b5770",
    },
    divider: "rgba(30, 27, 46, 0.12)",
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif",
    h3: { fontWeight: 700, letterSpacing: -0.5 },
    h4: { fontWeight: 700, letterSpacing: -0.5 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: "none", borderRadius: 10, paddingInline: 20 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          transition: "box-shadow 0.2s ease, transform 0.2s ease",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundColor: "#ffffff" },
      },
    },
  },
});

export default theme;
