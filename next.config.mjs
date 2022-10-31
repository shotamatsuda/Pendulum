import withBundleAnalyzer from '@next/bundle-analyzer'

/** @type {import('next').NextConfig} */
const config = {
  // For static export of my use case.
  ...(process.env.NODE_ENV === 'production' && {
    assetPrefix: './'
  })
}

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
})(config)
