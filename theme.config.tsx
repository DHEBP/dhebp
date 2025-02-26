import { useRouter } from 'next/router'
import type { DocsThemeConfig } from 'nextra-theme-docs'
import { useConfig } from 'nextra-theme-docs'
import seoConfig from './seo.config'


const logo = (
  <svg
    height="37"
    viewBox="0 0 1685.95 487.8"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    transform="translate(-10)"
  >
<defs>
        <linearGradient
          id="linear-gradient"
          x1="1040.85"
          y1="45.15"
          x2="1040.85"
          y2="414.71"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#b2b3b3" />
          <stop offset="1" stopColor="#686868" />
        </linearGradient>
        <linearGradient
          id="linear-gradient-2"
          x1="642.69"
          y1="45.15"
          x2="642.69"
          y2="414.71"
          xlinkHref="#linear-gradient"
        />
        <linearGradient
          id="linear-gradient-3"
          x1="244.5"
          y1="45.15"
          x2="244.5"
          y2="414.71"
          xlinkHref="#linear-gradient"
        />
        <linearGradient
          id="linear-gradient-4"
          x1="1439.2"
          y1="45.15"
          x2="1439.2"
          y2="414.71"
          xlinkHref="#linear-gradient"
        />
      </defs>
      <path
        className="cls-1"
        fill="url(#linear-gradient)"
        d="m1161.9,81.21l41.73,42.17v101.32l-41.84,42.1h-92.62v4.82c1.35.18,134.42,134.93,134.42,134.93h-64.29l-135.63-139.28h-78.62v139.28h-46.97V81.21h283.83Zm-236.76,139.03h218.1l13.96-13.78v-64.88l-13.87-13.63h-218.19v92.29Z"
      />
      <path
        className="cls-4"
        fill="url(#linear-gradient)"
        d="m538.48,127.19l-9.63,10.09v73.45l9.94,9.84h268.75v46.27h-269.02l-9.63,9.93v73.8l9.97,9.36h268.78v46.43h-283.3l-46.59-46.5v-92.64l22.74-18.93v-8.64l-22.74-19.27v-92.55l46.55-46.6h283.12v45.96h-268.93Z"
      />
      <path
        className="cls-2"
        fill="url(#linear-gradient)"
        d="m365.32,81.32l41.91,42.28v240.78l-41.94,41.96H81.76V81.32h283.56Zm-236.84,46.42v231.86h218.29l14.07-13.77v-204.06l-13.92-14.04h-218.44Z"
      />
      <path
        className="cls-3"
        fill="url(#linear-gradient)"
        d="m1604.19,127.82v231.98l-46.42,46.8h-237.05l-46.51-46.97v-231.61l46.31-46.75h237.33l46.33,46.55Zm-268.52,231.71h207.59l10.06-9.01v-213.26l-9.76-9.44h-208.57l-9.41,9.62v213l10.08,9.08Z"
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
  primaryHue: { dark: 193, light: 193 }, // Adjust the hue value to get the desired shade of purple
  primarySaturation: { dark: 63, light: 63 }, // Adjust the saturation value for the desired intensity
  project: {
    link: 'https://github.com/deroproject/derohe'
  },

  docsRepositoryBase: 'https://dero.io',
  useNextSeoProps() {
    const { route } = useRouter()
    const { url, images } = seoConfig.openGraph

    if (route === '/') {
      return { titleTemplate: '%s – DERO' }
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

    return (
      <>
        {seoConfig.icons.map((icon, index) => (
          <link key={index} rel={icon.rel} href={icon.url} />
        ))}
        <meta httpEquiv="Content-Language" content="en" />
        <meta
          name="description"
          content={meta['description'] || seoConfig.description}
        />
        <meta
          name="og:title"
          content={title ? title + ' – DERO' : seoConfig.title.default}
        />
        <meta
          name="og:description"
          content={meta['description'] || seoConfig.description}
        />
        <meta name="og:image" content={seoConfig.openGraph.images} />
        <meta name="og:url" content={seoConfig.openGraph.url} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content={seoConfig.twitter.site} />
        <meta name="twitter:creator" content={seoConfig.twitter.creator} />
        <meta name="apple-mobile-web-app-title" content="DERO" />
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
    //defaultMenuCollapseLevel: 1,
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
          component:null,
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
          <span>Privacy Together</span>
            
        <p className="mt-6 text-xs">
          © {new Date().getFullYear()} DHEBP
        </p>
      </div>
    )
  }
}

export default config