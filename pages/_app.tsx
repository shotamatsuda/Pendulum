import { EmotionCache } from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { ThemeProvider } from '@mui/material'
import { AppProps as NextAppProps } from 'next/app'
import Head from 'next/head'
import React from 'react'

import { CssBaseline } from '../src/CssBaseline'
import { createEmotionCache } from '../src/createEmotionCache'
import { theme } from '../src/theme'

import 'normalize.css'

const clientSideEmotionCache = createEmotionCache()

interface AppProps extends NextAppProps {
  emotionCache?: EmotionCache
}

const App: React.FC<AppProps> = ({
  emotionCache = clientSideEmotionCache,
  Component,
  pageProps
}) => {
  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>Pendulum</title>
        <meta
          name='description'
          content='An interactive visualization of the motion of a damped pendulum and the phase portrait.'
        />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </CacheProvider>
  )
}

export default App
