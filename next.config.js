import path from 'path'
import nextra from 'nextra'
import withPWA from 'next-pwa'
import withBundleAnalyzer from '@next/bundle-analyzer'

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
  staticImage: true,
  latex: true,
  flexsearch: {
    codeblocks: false
  },
  defaultShowCopyCode: true,
  remarkPlugins: [path.resolve('./plugins/frontmatterEnhancer.js')]
})

// Enable bundle analyzer when ANALYZE env var is set
const withAnalyze = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
})

// Enable PWA in production only
const withPwaPlugin = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development'
})

export default withAnalyze(withPwaPlugin(withNextra({
  reactStrictMode: true,
  eslint: {
    // Eslint behaves weirdly in this monorepo.
    ignoreDuringBuilds: true
  },
  redirects: () => [
    {
      source: '/docs/docs-theme/built-ins/callout',
      destination: '/docs/guide/built-ins/callout',
      permanent: true
    }
  ]
})))