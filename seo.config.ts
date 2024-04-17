import type { Metadata } from 'next'

const defineMetadata = <T extends Metadata>(metadata: T) => metadata

const seoConfig = defineMetadata({
  metadataBase: new URL('https://dero.is'),
  title: {
    template: '%s - DERO',
    default:
      'DERO is a privacy-focused decentralized application platform.'
  },
  description: 'DERO a platform for developers to deploy secure, open, scalable, and privacy-preserving decentralized applications',
  themeColor: '#061636',
  openGraph: {
    images: '/og-image.png',
    url: 'https://dero.is'
  },
  manifest: '/site.webmanifest',
  icons: [
    { rel: 'icon', url: '/favicon.ico' },
    { rel: 'apple-touch-icon', url: '/apple-touch-icon.png' },
    { rel: 'mask-icon', url: '/favicon.ico' },
    { rel: 'image/x-icon', url: '/favicon.ico' }
  ],
  twitter: {
    site: '@DERO_Foundation',
    creator: '@DeroProject'
  }
})

export default seoConfig