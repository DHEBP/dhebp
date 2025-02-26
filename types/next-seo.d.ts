// types/next-seo.d.ts
import 'next-seo'

declare module 'next-seo' {
  interface OpenGraphMedia {
    url: string
    width?: number
    height?: number
    alt?: string
    type?: string
  }
}