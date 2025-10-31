import type { Metadata } from 'next'

const defineMetadata = <T extends Metadata>(metadata: T) => metadata

const seoConfig = defineMetadata({
  metadataBase: new URL('https://tela.derod.org'),
  title: {
    template: '%s | TELA',
    default: 'TELA - Private Web3 Platform Documentation'
  },
  description: 'TELA is a private web3 platform built on DERO blockchain, enabling secure, private and untraceable decentralized web applications.',
  themeColor: '#061636',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    images: '/assets/og-tela.png',
    url: 'https://tela.derod.org',
    siteName: 'TELA Documentation',
    description: 'TELA is a private web3 platform built on DERO blockchain, enabling secure, private and untraceable decentralized web applications.'
  },
  manifest: '/assets/site.webmanifest',
  icons: [
    { rel: 'icon', url: '/assets/favicon.ico' },
    { rel: 'apple-touch-icon', url: '/assets/apple-touch-icon.png' },
    { rel: 'mask-icon', url: '/assets/favicon.ico' },
    { rel: 'image/x-icon', url: '/assets/favicon.ico' }
  ],
  twitter: {
    card: 'summary_large_image',
    title: 'TELA Platform Documentation',
    description: 'TELA is a private web3 platform built on DERO blockchain, enabling secure, private and untraceable decentralized web applications.',
    images: '/assets/og-tela.png'
  },
  keywords: 'TELA, private web3, DERO, blockchain, privacy, decentralized applications, web3, smart contracts, private internet'
})

export default seoConfig