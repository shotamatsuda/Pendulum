import {
  GlobalStyles,
  CssBaseline as MuiCssBaseline,
  css,
  useTheme
} from '@mui/material'
import React from 'react'

export const CssBaseline: React.FC = () => {
  const theme = useTheme()
  return (
    <>
      <MuiCssBaseline />
      <GlobalStyles
        styles={css`
          body {
            font-family: ${theme.typography.fontFamily};
            letter-spacing: 0.03em;
          }

          * {
            letter-spacing: inherit;
          }

          .MuiTouchRipple-root {
            .MuiTouchRipple-ripple,
            .MuiTouchRipple-child {
              top: 0 !important;
              left: 0 !important;
              width: 100% !important;
              height: 100% !important;
              transform: scale(2) !important;
            }

            .MuiTouchRipple-ripple {
              animation: none !important;
            }

            .MuiTouchRipple-child {
              border-radius: 0 !important;
            }
          }
        `}
      />
    </>
  )
}
