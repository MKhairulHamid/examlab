/**
 * Single article page. Public (no auth). Renders typed content blocks from
 * src/data/articles.js and sets SEO meta with useDocumentMeta. The crawler-facing
 * meta + JSON-LD for this URL is also emitted statically in vite.config.js.
 */

import React from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { getArticle, ARTICLES_SORTED } from '../data/articles'
import useDocumentMeta from '../hooks/useDocumentMeta'
import { BlogHeader, BlogFooter } from './Blog'

const SITE = 'https://cloudexamlab.com'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
}

// Render **bold** spans inside a paragraph without a markdown dependency.
function renderInline(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>
      : <React.Fragment key={i}>{part}</React.Fragment>
  )
}

function Block({ block }) {
  switch (block.type) {
    case 'h2':
      return <h2 className="text-2xl font-bold text-white mt-10 mb-3">{block.text}</h2>
    case 'p':
      return <p className="text-white/75 text-[1.0625rem] leading-relaxed mb-4">{renderInline(block.text)}</p>
    case 'ul':
      return (
        <ul className="list-disc pl-5 mb-5 space-y-2">
          {block.items.map((it, i) => <li key={i} className="text-white/75 leading-relaxed">{renderInline(it)}</li>)}
        </ul>
      )
    case 'ol':
      return (
        <ol className="list-decimal pl-5 mb-5 space-y-2">
          {block.items.map((it, i) => <li key={i} className="text-white/75 leading-relaxed">{renderInline(it)}</li>)}
        </ol>
      )
    case 'callout':
      return (
        <div className="my-6 border-l-4 border-[#00D4AA] bg-[#00D4AA]/[0.07] rounded-r-lg px-5 py-4">
          <p className="text-white/85 text-[1.0625rem] leading-relaxed m-0">{renderInline(block.text)}</p>
        </div>
      )
    case 'quote':
      return (
        <blockquote className="my-6 pl-5 border-l-2 border-white/20 italic text-white/70 text-lg">
          {renderInline(block.text)}
        </blockquote>
      )
    default:
      return null
  }
}

export default function BlogPost() {
  const { slug } = useParams()
  const article = getArticle(slug)

  // Set meta before any early return so hooks order stays stable.
  useDocumentMeta({
    title: article ? `${article.title} — Cloud Exam Lab` : 'Article — Cloud Exam Lab',
    description: article?.description,
    url: article ? `${SITE}/blog/${article.slug}` : `${SITE}/blog`,
    image: `${SITE}/og/credential.png`,
  })

  if (!article) return <Navigate to="/blog" replace />

  const more = ARTICLES_SORTED.filter((a) => a.slug !== article.slug).slice(0, 3)

  return (
    <div className="min-h-screen bg-[#0A2540] text-white">
      <BlogHeader />

      <main className="max-w-[44rem] mx-auto px-5 sm:px-6 py-10 sm:py-14">
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm no-underline mb-7 transition-colors">
          <ArrowLeft size={15} /> All articles
        </Link>

        <article>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {article.tags.map((t) => (
              <span key={t} className="text-[0.7rem] font-semibold uppercase tracking-wide text-[#00D4AA] bg-[#00D4AA]/10 px-2 py-0.5 rounded">{t}</span>
            ))}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">{article.title}</h1>
          <p className="text-white/70 text-lg leading-relaxed mb-5">{article.heroLead}</p>
          <div className="text-white/45 text-sm mb-8 pb-8 border-b border-white/10">
            By {article.author} · {formatDate(article.date)} · {article.readingTime}
          </div>

          {article.body.map((block, i) => <Block key={i} block={block} />)}
        </article>

        {/* CTA into the app */}
        <div className="mt-12 rounded-xl border border-[#00D4AA]/30 bg-[#00D4AA]/[0.06] p-6 text-center">
          <h3 className="text-xl font-bold mb-2">Ready to put this into practice?</h3>
          <p className="text-white/65 mb-4 leading-relaxed">Explore the programs and start a structured study session today.</p>
          <Link to="/" className="inline-flex items-center gap-1.5 bg-gradient-to-br from-[#00D4AA] to-[#00A884] text-white font-bold px-6 py-3 rounded-lg no-underline">
            Explore programs <ArrowRight size={16} />
          </Link>
        </div>

        {/* More articles */}
        {more.length > 0 && (
          <section className="mt-14">
            <h3 className="text-lg font-bold mb-4">More articles</h3>
            <div className="grid gap-3">
              {more.map((a) => (
                <Link key={a.slug} to={`/blog/${a.slug}`} className="block rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] transition-colors p-4 no-underline">
                  <h4 className="text-white font-semibold mb-1">{a.title}</h4>
                  <p className="text-white/55 text-sm m-0">{a.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <BlogFooter />
    </div>
  )
}
