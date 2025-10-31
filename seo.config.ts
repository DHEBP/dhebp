import type { Metadata } from 'next'

const defineMetadata = <T extends Metadata>(metadata: T) => metadata

const seoConfig = defineMetadata({
  metadataBase: new URL('https://dero.is'),
  title: {
    template: '%s - DERO',
    default:
      'DERO is a privacy-focused decentralized application platform.'
  },
  description: 'DERO is a privacy-focused decentralized application platform.',
  themeColor: '#061636',
  openGraph: {
    images: '/assets/og-image.png',
    url: 'https://dero.is'
  },
  manifest: '/assets/site.webmanifest',
  icons: [
    { rel: 'icon', url: '/assets/favicon.ico' },
    { rel: 'apple-touch-icon', url: '/assets/apple-touch-icon.png' },
    { rel: 'mask-icon', url: '/assets/favicon.ico' },
    { rel: 'image/x-icon', url: '/assets/favicon.ico' }
  ],
  twitter: {
    site: '@DERO_Foundation',
    creator: '@DeroProject'
  }
})

export default seoConfig