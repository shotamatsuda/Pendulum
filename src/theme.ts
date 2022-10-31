import { createTheme } from '@mui/material'

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ffffff'
    },
    secondary: {
      main: '#999999'
    }
  },
  typography: {
    fontFamily: 'DM Sans, sans-serif',
    fontSize: 13
  }
})
