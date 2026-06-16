import { useEffect } from 'react'

/**
 * Sets document.title and Open Graph / Twitter meta tags for the current page,
 * restoring the previous title on unmount. Tags it creates are removed on cleanup.
 *
 * NOTE: GitHub Pages serves a static SPA with no SSR, so crawlers that don't run
 * JS (LinkedIn, Twitter) won't see these client-set tags — rich link previews
 * require the Phase 2 edge function. This still gives correct titles for humans
 * and JS-aware crawlers. See plan SEO note.
 */
export default function useDocumentMeta({ title, description, url, image } = {}) {
  useEffect(() => {
    const prevTitle = document.title
    if (title) document.title = title

    const created = []
    const upsert = (selector, attrs) => {
      let el = document.head.querySelector(selector)
      if (!el) {
        el = document.createElement('meta')
        Object.entries(attrs).forEach(([k, v]) => {
          if (k !== 'content') el.setAttribute(k, v)
        })
        document.head.appendChild(el)
        created.push(el)
      }
      if (attrs.content != null) el.setAttribute('content', attrs.content)
    }

    if (description) upsert('meta[name="description"]', { name: 'description', content: description })
    if (title) upsert('meta[property="og:title"]', { property: 'og:title', content: title })
    if (description) upsert('meta[property="og:description"]', { property: 'og:description', content: description })
    if (url) upsert('meta[property="og:url"]', { property: 'og:url', content: url })
    upsert('meta[property="og:type"]', { property: 'og:type', content: 'website' })
    if (image) upsert('meta[property="og:image"]', { property: 'og:image', content: image })
    upsert('meta[name="twitter:card"]', { name: 'twitter:card', content: image ? 'summary_large_image' : 'summary' })
    if (title) upsert('meta[name="twitter:title"]', { name: 'twitter:title', content: title })

    return () => {
      document.title = prevTitle
      created.forEach((el) => el.remove())
    }
  }, [title, description, url, image])
}
