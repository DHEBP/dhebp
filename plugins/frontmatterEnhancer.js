import { visit } from 'unist-util-visit'
import readingTime from 'reading-time'

/**
 * Remark plugin to ensure robust front-matter for SEO.
 * Injects: slug, canonicalUrl, readingTime, tags (if none given).
 */
export default function frontmatterEnhancer() {
  return (tree, file) => {
    // MDX frontmatter is stored in file.data.frontMatter by nextra
    const fm = file.data.frontMatter || (file.data.frontMatter = {})

    // slug based on file path (without extension)
    if (!fm.slug) {
      // file.basename includes extension
      const p = file.history[0] || file.path || ''
      const slug = p
        .replace(/^.*pages\//, '')
        .replace(/\\/g, '/')
        .replace(/\.[^/.]+$/, '')
        .replace(/index$/, '')
        .replace(/\/+$/,'')
        .split('/')
        .filter(Boolean)
        .join('-')
        .toLowerCase()
      fm.slug = slug || 'page'
    }

    // canonical URL
    if (!fm.canonicalUrl && process.env.SITE_URL) {
      fm.canonicalUrl = `${process.env.SITE_URL}/${fm.slug}`
    }

    // reading time
    const text = String(file)
    const stats = readingTime(text)
    fm.readingTime = Math.ceil(stats.minutes)

    // default tags
    if (!fm.tags) {
      fm.tags = ['dero', 'blockchain']
    }
  }
} 