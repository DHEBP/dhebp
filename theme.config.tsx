import React from 'react'
import { useRouter } from 'next/router'
import type { DocsThemeConfig } from 'nextra-theme-docs'
import { useConfig } from 'nextra-theme-docs'
import seoConfig from './seo.config'
import { useState, useEffect } from 'react'
import NodeConnectionIndicator from './components/NodeConnectionIndicator'
import DeroStatsIndicator from './components/DeroStatsIndicator'

// Global state for connection status
let globalConnectionStatus: boolean | null = null;

// Function to update global connection status
export const updateConnectionStatus = (status: boolean) => {
  globalConnectionStatus = status;
  // Dispatch an event to notify components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dero-connection-update', { detail: status }));
  }
};

// Custom navbar component
function Navbar() {
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(globalConnectionStatus);
  
  useEffect(() => {
    // Listen for connection status updates
    const handleConnectionUpdate = (event: CustomEvent<boolean>) => {
      setConnectionStatus(event.detail);
    };
    
    window.addEventListener('dero-connection-update', handleConnectionUpdate as EventListener);
    
    return () => {
      window.removeEventListener('dero-connection-update', handleConnectionUpdate as EventListener);
    };
  }, []);
  
  return (
    <div className="nx-flex nx-items-center nx-gap-2">
      <NodeConnectionIndicator isConnected={connectionStatus} />
      <DeroStatsIndicator />
    </div>
  );
}

const logo = (
  <div className="flex items-center">
    <svg
      height="37"
      viewBox="0 0 686.4 326.2"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polygon points="452.8 51.2 452.8 229.2 362.8 229.2 362.8 50.2 318.8 50.2 318.8 229.2 183.8 229.2 183.8 274.2 497.8 274.2 497.8 159.2 614.3 274.2 676.8 274.2 452.8 51.2" fill="currentColor"/>
      <polygon points="273.8 94.2 273.8 50.2 4.8 50.2 4.8 94.2 94.8 94.2 94.8 274.2 138.8 274.2 138.8 94.2 273.8 94.2" fill="currentColor"/>
      <rect x="183.8" y="140.2" width="90" height="44" fill="currentColor"/>
      <rect x="139.8" y="275.2" width="44" height="43" fill="#46b868"/>
      <rect x="274.3" y="7" width="44" height="43" fill="#ec2426"/>
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
  </div>
)


const config: DocsThemeConfig = {
  primaryHue: { dark: 193, light: 193 }, // Adjust the hue value to get the desired shade of purple
  primarySaturation: { dark: 63, light: 63 }, // Adjust the saturation value for the desired intensity
  project: {
    link: 'https://github.com/TELA/tela-main'
  },
  navbar: {
    extraContent: <Navbar />
  },

  docsRepositoryBase: 'https://tela.derod.org',
  useNextSeoProps() {
    const { route } = useRouter()
    const { url, images } = seoConfig.openGraph

    if (route === '/') {
      return { titleTemplate: '%s – TELA' }
    }

    return {
      titleTemplate: seoConfig.title.template,
      openGraph: { url, images: [{ url: `${url}${images}` }] }
    }
  },
  logo,

  head: () => {
    const { frontMatter: meta } = useConfig()
    const { title } = meta
    const router = useRouter()
    const pagePath = router.asPath

    // Get image from frontmatter or fallback to default
    const imageUrl = meta.image 
      ? (meta.image.startsWith('http') ? meta.image : `${seoConfig.openGraph.url}${meta.image}`)
      : `${seoConfig.openGraph.url}${seoConfig.openGraph.images}`

    return (
      <>
        {seoConfig.icons.map((icon, index) => (
          <link key={index} rel={icon.rel} href={icon.url} />
        ))}
        <meta httpEquiv="Content-Language" content="en" />
        <meta
          name="description"
          content={meta.description || seoConfig.description}
        />
        
        {/* OpenGraph tags */}
        <meta
          property="og:title"
          content={title ? title + ' – TELA' : seoConfig.title.default}
        />
        <meta
          property="og:description"
          content={meta.description || seoConfig.description}
        />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:url" content={`${seoConfig.openGraph.url}${pagePath}`} />
        <meta property="og:type" content="article" />
        
        {/* Twitter tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content={seoConfig.twitter.site} />
        <meta name="twitter:creator" content={seoConfig.twitter.creator} />
        <meta name="twitter:title" content={title ? title + ' – TELA' : seoConfig.title.default} />
        <meta name="twitter:description" content={meta.description || seoConfig.description} />
        <meta name="twitter:image" content={imageUrl} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={`${seoConfig.openGraph.url}${pagePath}`} />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'TechArticle',
              headline: title || seoConfig.title.default,
              description: meta.description || seoConfig.description,
              image: imageUrl,
              author: meta.authors || 'TELA Team',
              datePublished: meta.date || undefined,
              dateModified: meta.lastUpdated || undefined,
              mainEntityOfPage: `${seoConfig.openGraph.url}${pagePath}`,
            }),
          }}
        />
        
        <meta name="apple-mobile-web-app-title" content="TELA" />
      </>
    )
  },
    sidebar: {
    titleComponent({ title, type }) {
      if (type === 'separator') {
        return <span className="cursor-default">{title}</span>
      }
      return <>{title}</>
    },
    defaultMenuCollapseLevel: 1,
    toggleButton: false
  },
     toc:{
      float:true,
     },
     feedback: {
      content: null, // Set to null or an empty value to disable the feedback link
     },
     editLink: {
        text: null,
       },
       navigation: {
          prev: false,
          next: false
        },
        gitTimestamp: null,
        darkMode:true,
        themeSwitch: {
          useOptions() {
            return {
              light: 'Light',
              dark: 'Dark',
              system: 'System'
            }
          }
      },
        footer: {
    text: (
      <div className="flex w-full flex-col items-center sm:items-start">
          <span>Private Web3 Platform</span>
            
        <p className="mt-6 text-xs">
          © {new Date().getFullYear()} TELA Team
        </p>
      </div>
    )
  }
}

export default config