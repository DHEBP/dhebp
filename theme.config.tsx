import { useRouter } from 'next/router'
import type { DocsThemeConfig } from 'nextra-theme-docs'
import { useConfig } from 'nextra-theme-docs'

const logo = (
  <svg
    height="50"
    viewBox="0 0 330.99 382.2"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="m330.99,95.55v191.1l-165.5,95.55L0,286.65V95.55L165.49,0l165.5,95.55Zm-61.74,155.46v-119.82l-103.76-59.9-103.76,59.9v119.82l103.76,59.9,103.76-59.9Z"
      fill="#ffffff"
    />
    <path
      d="m254.78,139.55v103.1l-51.6,29.79c-.29-1.78-6.2-39.56-6.96-44.89l16.21-9.35v-54.2l-46.94-27.1-46.93,27.1v54.2l15.93,9.2c-.76,5.38-6.67,43.16-6.96,44.89l-51.33-29.64v-103.1l89.29-51.55,89.29,51.55Z"
      fill="#ffffff"
    />
    <path
      d="m197.56,172.58v37.04l-17.5,10.1c.74,5.28,8.97,58.11,9.39,60.65l-23.96,13.83-23.61-13.63c.51-2.99,8.67-55.36,9.41-60.64l-17.87-10.31v-37.04l32.07-18.51,32.07,18.51Z"
      fill="#ffffff"
    />
    <style jsx>{`
      svg {
        mask-image: linear-gradient(
          60deg,
          black 25%,
          rgba(0, 0, 0, 0.2) 50%,
          black 75%
        );
        mask-size: 400%;
        mask-position: 0%;
      }
      svg:hover {
        mask-position: 100%;
        transition:
          mask-position 1s ease,
          -webkit-mask-position 1s ease;
      }
    `}</style>
  </svg>
)


const config: DocsThemeConfig = {
  project: {
    link: 'https://dero.io'
  },
  docsRepositoryBase: 'https://dero.io',
  useNextSeoProps() {
    const { asPath } = useRouter()
    if (asPath !== '/') {
      return {
        titleTemplate: 'Monero – %s'
      }
    }
  },
  logo,
  head: function useHead() {
    const { title } = useConfig()
    const { route } = useRouter()
    const socialCard =
      route === '/' || !title
        ? 'https://nextra.site/og.jpeg'
        : `https://nextra.site/api/og?title=${title}`

    return (
      <>
        <meta name="msapplication-TileColor" content="#fff" />
        <meta name="theme-color" content="#fff" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Language" content="en" />
        <meta
          name="description"
          content="Dero Homomorphic Encryption Blockchain Protocol"
        />
        <meta
          name="og:description"
          content="What is Dero?"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={socialCard} />
        <meta name="twitter:site:domain" content="nextra.site" />
        <meta name="twitter:url" content="https://nextra.site" />
        <meta
          name="og:title"
          content={title ? title + ' – Nextra' : 'Nextra'}
        />
        <meta name="og:image" content={socialCard} />
        <meta name="apple-mobile-web-app-title" content="Nextra" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link
          rel="icon"
          href="/favicon-dark.svg"
          type="image/svg+xml"
          media="(prefers-color-scheme: dark)"
        />
        <link
          rel="icon"
          href="/favicon-dark.png"
          type="image/png"
          media="(prefers-color-scheme: dark)"
        />
      </>
    )
  },
  banner: {
     key: 'New Mangement',
     text: (
       <a href="https://bitmonero.org" target="_blank" rel="noreferrer">
         🎉 Bitmonero.org is under new management. Read more →
       </a>
     )
   },
   editLink: {
    text: 'Edit this page on GitHub →'
  },
  feedback: {
    content: 'Question? Give us feedback →',
    labels: 'feedback'
  },
    sidebar: {
    titleComponent({ title, type }) {
      if (type === 'separator') {
        return <span className="cursor-default">{title}</span>
      }
      return <>{title}</>
    },
    defaultMenuCollapseLevel: 1,
    toggleButton: true
  },
  footer: {
    text: (
      <div className="flex w-full flex-col items-center sm:items-start">
          <span>Powered by</span>
            
        <p className="mt-6 text-xs">
          © {new Date().getFullYear()} DHEBP
        </p>
      </div>
    )
  }
}

export default config