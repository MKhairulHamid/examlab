/**
 * Blog index — lists every article newest-first. Public page (no auth).
 * Content comes from src/data/articles.js; SEO meta for this page is set with
 * useDocumentMeta and the per-page prerender in vite.config.js.
 */

import React from 'react'
import { Link } from 'react-router-dom'
import { Cloud, ArrowRight } from 'lucide-react'
import { ARTICLES_SORTED } from '../data/articles'
import SocialLinks from '../components/layout/SocialLinks'
import useDocumentMeta from '../hooks/useDocumentMeta'

const SITE = 'https://cloudexamlab.com'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function Blog() {
  useDocumentMeta({
    title: 'Articles & Guides — Cloud Exam Lab',
    description: 'Guides on passing your AWS certification: the Teach to Learn method, structured study sessions, exam-realistic practice, and choosing your certification path.',
    url: `${SITE}/blog`,
    image: `${SITE}/og/credential.png`,
  })

  return (
    <div className="min-h-screen bg-[#0A2540] text-white">
      <BlogHeader />

      <main className="max-w-[60rem] mx-auto px-5 sm:px-6 py-12 sm:py-16">
        <header className="mb-10 sm:mb-14">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Articles &amp; Guides</h1>
          <p className="text-white/65 text-base sm:text-lg max-w-2xl leading-relaxed">
            How to actually pass your AWS certification — the study method, the practice, and the path. Start here.
          </p>
        </header>

        <div className="grid gap-5">
          {ARTICLES_SORTED.map((a) => (
            <Link
              key={a.slug}
              to={`/blog/${a.slug}`}
              className="block rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/15 transition-colors p-5 sm:p-6 no-underline"
            >
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                {a.tags.map((t) => (
                  <span key={t} className="text-[0.7rem] font-semibold uppercase tracking-wide text-[#00D4AA] bg-[#00D4AA]/10 px-2 py-0.5 rounded">
                    {t}
                  </span>
                ))}
                <span className="text-white/40 text-xs">{formatDate(a.date)} · {a.readingTime}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-snug">{a.title}</h2>
              <p className="text-white/60 text-sm sm:text-base leading-relaxed mb-3">{a.description}</p>
              <span className="inline-flex items-center gap-1.5 text-[#00D4AA] text-sm font-semibold">
                Read article <ArrowRight size={15} />
              </span>
            </Link>
          ))}
        </div>
      </main>

      <BlogFooter />
    </div>
  )
}

export function BlogHeader() {
  return (
    <header className="sticky top-0 z-50 bg-[#0A2540]/95 backdrop-blur border-b border-white/[0.07]">
      <div className="max-w-[75rem] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-white font-bold no-underline hover:opacity-90 transition-opacity">
          <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00D4AA] to-[#00A884] flex items-center justify-center">
            <Cloud size={16} className="text-white" strokeWidth={2.4} />
          </span>
          <span>Cloud Exam Lab</span>
        </Link>
        <Link to="/" className="text-white/70 hover:text-white text-sm font-medium no-underline transition-colors">
          Explore programs
        </Link>
      </div>
    </header>
  )
}

export function BlogFooter() {
  return (
    <footer className="border-t border-white/[0.08] mt-8">
      <div className="max-w-[60rem] mx-auto px-5 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-white/40 text-xs text-center sm:text-left">
          © {new Date().getFullYear()} Cloud Exam Lab. Not affiliated with or endorsed by Amazon Web Services (AWS).
        </p>
        <SocialLinks />
      </div>
    </footer>
  )
}
