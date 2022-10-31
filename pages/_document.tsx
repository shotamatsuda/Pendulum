import createEmotionServer from '@emotion/server/create-instance'
import NextDocument, {
  DocumentContext,
  DocumentInitialProps,
  Head,
  Html,
  Main,
  NextScript
} from 'next/document'
import React, { StrictMode } from 'react'

import { createEmotionCache } from '../src/createEmotionCache'

export default class Document extends NextDocument {
  render(): JSX.Element {
    return (
      <StrictMode>
        <Html lang='en'>
          <Head>
            <link rel='preconnect' href='https://fonts.googleapis.com' />
            <link
              rel='preconnect'
              href='https://fonts.gstatic.com'
              crossOrigin='anonymous'
            />
            <link
              href='https://fonts.googleapis.com/css2?family=DM+Sans:wght@500&display=swap'
              rel='stylesheet'
            />
          </Head>
          <body>
            <Main />
            <NextScript />
          </body>
        </Html>
      </StrictMode>
    )
  }

  static async getInitialProps(
    context: DocumentContext
  ): Promise<DocumentInitialProps> {
    const originalRenderPage = context.renderPage
    const cache = createEmotionCache()
    const { extractCriticalToChunks } = createEmotionServer(cache)
    context.renderPage = () =>
      originalRenderPage({
        enhanceApp: (App: any) => props =>
          <App emotionCache={cache} {...props} />
      })
    const initialProps = await super.getInitialProps(context)
    const emotionStyles = extractCriticalToChunks(initialProps.html)
    const emotionStyleTags = emotionStyles.styles.map(style => (
      <style
        data-emotion={`${style.key} ${style.ids.join(' ')}`}
        key={style.key}
        dangerouslySetInnerHTML={{ __html: style.css }}
      />
    ))
    return {
      ...initialProps,
      styles: [
        ...React.Children.toArray(initialProps.styles),
        ...emotionStyleTags
      ]
    }
  }
}
