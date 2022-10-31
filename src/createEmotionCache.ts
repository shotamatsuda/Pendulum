import createCache, { EmotionCache } from '@emotion/cache'

export function createEmotionCache(): EmotionCache {
  return createCache({ key: 'css', prepend: true })
}
