import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

// Stamp a unique id into the service worker's cache name on every build so that
// each deploy ships a byte-different sw.js. Without this, sw.js never changes,
// the browser never detects a new worker, and returning users keep running the
// previously cached (sometimes broken) JS until they manually hard-refresh.
function serviceWorkerVersion() {
  const buildId = Date.now().toString(36)
  let outDir = 'dist'
  return {
    name: 'service-worker-version',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    // closeBundle runs after the public dir (which holds sw.js) is copied.
    closeBundle() {
      const swPath = path.resolve(outDir, 'sw.js')
      if (!fs.existsSync(swPath)) return
      const src = fs.readFileSync(swPath, 'utf8')
      if (!src.includes('__BUILD_ID__')) return
      fs.writeFileSync(swPath, src.replaceAll('__BUILD_ID__', buildId))
      console.log(`[sw] cache version set to cloud-exam-lab-${buildId}`)
    },
  }
}

// Prerender one static HTML file per program at /verify/<slug>/index.html, each
// with program-correct Open Graph tags. GitHub Pages serves a static SPA with no
// SSR, so crawlers (LinkedIn, Slack, iMessage…) that don't run JS would otherwise
// only see index.html's generic tags. Putting the program in the URL path
// (/verify/<slug>?id=<code>) means we need just 5 files — NOT one per credential —
// so the link preview shows the correct certificate name (no learner name). Humans
// get the same file, which boots the SPA and renders the live, personalised page.
//
// Keep this list in sync with src/data/programs.js (slug + name only).
const VERIFY_PROGRAMS = [
  { slug: 'clf-c02', name: 'AWS Certified Cloud Practitioner' },
  { slug: 'aif-c01', name: 'AWS Certified AI Practitioner' },
  { slug: 'saa-c03', name: 'AWS Certified Solutions Architect – Associate' },
  { slug: 'dva-c02', name: 'AWS Certified Developer – Associate' },
  { slug: 'mla-c01', name: 'AWS Certified Machine Learning Engineer – Associate' },
]
const SITE = 'https://cloudexamlab.com'

function prerenderVerifyPages() {
  let outDir = 'dist'
  const esc = (s) => String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  return {
    name: 'prerender-verify-pages',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      const indexPath = path.resolve(outDir, 'index.html')
      if (!fs.existsSync(indexPath)) return
      const baseHtml = fs.readFileSync(indexPath, 'utf8')
      const desc = 'A verified Readiness credential from Cloud Exam Lab — earned by completing the study program and passing the final mock exam.'
      const image = `${SITE}/og/credential.png`

      for (const { slug, name } of VERIFY_PROGRAMS) {
        const title = `${name} · Readiness — Cloud Exam Lab`
        const url = `${SITE}/verify/${slug}`
        const tags = [
          `<meta property="og:type" content="website" />`,
          `<meta property="og:title" content="${esc(title)}" />`,
          `<meta property="og:description" content="${esc(desc)}" />`,
          `<meta property="og:url" content="${url}" />`,
          `<meta property="og:image" content="${image}" />`,
          `<meta name="twitter:card" content="summary_large_image" />`,
          `<meta name="twitter:title" content="${esc(title)}" />`,
          `<meta name="twitter:description" content="${esc(desc)}" />`,
          `<meta name="twitter:image" content="${image}" />`,
        ].join('\n    ')

        const html = baseHtml
          .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
          .replace('</head>', `    ${tags}\n  </head>`)

        const dir = path.resolve(outDir, 'verify', slug)
        fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(path.resolve(dir, 'index.html'), html)
      }
      console.log(`[prerender] wrote ${VERIFY_PROGRAMS.length} /verify/<slug> OG pages`)
    },
  }
}

// Articles meta — mirror of src/data/articles.js (slug/title/description/date only),
// kept here so the prerender runs without importing JSX-flavoured app source.
// KEEP IN SYNC with src/data/articles.js when articles are added or renamed.
const ARTICLES_META = [
  { slug: 'welcome-to-cloud-exam-lab', title: 'Welcome to Cloud Exam Lab: Learn Cloud the Way It Sticks', description: 'What Cloud Exam Lab is, who it is for, and how our structured study sessions and exam-realistic practice help you actually pass your AWS certification.', date: '2026-01-15' },
  { slug: 'teach-to-learn-method', title: 'The Teach-to-Learn Method: Why Explaining Beats Re-Reading', description: 'The Feynman-inspired Teach to Learn technique is built into every Cloud Exam Lab session. Here is why explaining a concept aloud beats re-reading it five times.', date: '2026-02-03' },
  { slug: 'how-structured-study-sessions-work', title: 'How Structured Study Sessions Work on Cloud Exam Lab', description: 'A look inside the session model: focused concepts, active recall, spaced checkpoints, and progress tracking that keeps you moving toward exam-ready.', date: '2026-02-24' },
  { slug: 'exam-realistic-practice', title: 'Exam-Realistic Practice: How Our Mock Exams Mirror the Real Test', description: 'Timed, full-length, scenario-based mock exams that match the real AWS blueprint — so exam day feels like a rehearsal you have already done.', date: '2026-03-18' },
  { slug: 'choosing-your-aws-certification-path', title: 'Choosing Your AWS Path: From Cloud Practitioner to Professional', description: 'CLF-C02, the Associate tier, and the Professional level explained — how to pick the right AWS certification for where you are in your career.', date: '2026-04-09' },
  { slug: 'study-plan-zero-to-certified', title: 'From Zero to Certified: A Realistic Study Plan You Can Keep', description: 'A week-by-week study plan using Cloud Exam Lab — built around short daily sessions, spaced review, and mock exams instead of last-minute cramming.', date: '2026-05-06' },
  { slug: 'free-access-and-promo-codes', title: 'Free Access and Promo Codes: Try a Program Without Paying', description: 'How to unlock a Cloud Exam Lab program for free with a promo code — what the code does, how to redeem it, and how long your access lasts.', date: '2026-06-02' },
  // Program guides — generated in src/data/articles.js from PROGRAMS; titles/descriptions mirror that formula.
  { slug: 'aws-cloud-practitioner-clf-c02', title: 'AWS Certified Cloud Practitioner (CLF-C02): Is It Worth It, What It Tests, and How to Prepare', description: 'Cloud Practitioner (CLF-C02) explained — why it matters for your career, the knowledge and skills the exam tests, and how Cloud Exam Lab’s structured sessions and exam-realistic practice help you pass.', date: '2026-07-02' },
  { slug: 'aws-ai-practitioner-aif-c01', title: 'AWS Certified AI Practitioner (AIF-C01): Is It Worth It, What It Tests, and How to Prepare', description: 'AI Practitioner (AIF-C01) explained — why it matters for your career, the knowledge and skills the exam tests, and how Cloud Exam Lab’s structured sessions and exam-realistic practice help you pass.', date: '2026-06-30' },
  { slug: 'aws-solutions-architect-associate-saa-c03', title: 'AWS Certified Solutions Architect – Associate (SAA-C03): Is It Worth It, What It Tests, and How to Prepare', description: 'Solutions Architect (SAA-C03) explained — why it matters for your career, the knowledge and skills the exam tests, and how Cloud Exam Lab’s structured sessions and exam-realistic practice help you pass.', date: '2026-06-27' },
  { slug: 'aws-developer-associate-dva-c02', title: 'AWS Certified Developer – Associate (DVA-C02): Is It Worth It, What It Tests, and How to Prepare', description: 'Developer (DVA-C02) explained — why it matters for your career, the knowledge and skills the exam tests, and how Cloud Exam Lab’s structured sessions and exam-realistic practice help you pass.', date: '2026-06-25' },
  { slug: 'aws-machine-learning-engineer-mla-c01', title: 'AWS Certified Machine Learning Engineer – Associate (MLA-C01): Is It Worth It, What It Tests, and How to Prepare', description: 'ML Engineer (MLA-C01) explained — why it matters for your career, the knowledge and skills the exam tests, and how Cloud Exam Lab’s structured sessions and exam-realistic practice help you pass.', date: '2026-06-23' },
  { slug: 'aws-cloudops-engineer-associate-soa-c03', title: 'AWS Certified CloudOps Engineer – Associate (SOA-C03): Is It Worth It, What It Tests, and How to Prepare', description: 'CloudOps Engineer (SOA-C03) explained — why it matters for your career, the knowledge and skills the exam tests, and how Cloud Exam Lab’s structured sessions and exam-realistic practice help you pass.', date: '2026-06-20' },
  { slug: 'aws-data-engineer-associate-dea-c01', title: 'AWS Certified Data Engineer – Associate (DEA-C01): Is It Worth It, What It Tests, and How to Prepare', description: 'Data Engineer (DEA-C01) explained — why it matters for your career, the knowledge and skills the exam tests, and how Cloud Exam Lab’s structured sessions and exam-realistic practice help you pass.', date: '2026-06-18' },
  { slug: 'aws-solutions-architect-professional-sap-c02', title: 'AWS Certified Solutions Architect – Professional (SAP-C02): Is It Worth It, What It Tests, and How to Prepare', description: 'Solutions Architect Pro (SAP-C02) explained — why it matters for your career, the knowledge and skills the exam tests, and how Cloud Exam Lab’s structured sessions and exam-realistic practice help you pass.', date: '2026-06-16' },
  { slug: 'aws-generative-ai-developer-professional-aip-c01', title: 'AWS Certified Generative AI Developer – Professional (AIP-C01): Is It Worth It, What It Tests, and How to Prepare', description: 'GenAI Developer Pro (AIP-C01) explained — why it matters for your career, the knowledge and skills the exam tests, and how Cloud Exam Lab’s structured sessions and exam-realistic practice help you pass.', date: '2026-06-13' },
  { slug: 'aws-devops-engineer-professional-dop-c02', title: 'AWS Certified DevOps Engineer – Professional (DOP-C02): Is It Worth It, What It Tests, and How to Prepare', description: 'DevOps Engineer Pro (DOP-C02) explained — why it matters for your career, the knowledge and skills the exam tests, and how Cloud Exam Lab’s structured sessions and exam-realistic practice help you pass.', date: '2026-06-11' },
  { slug: 'aws-security-specialty-scs-c03', title: 'AWS Certified Security – Specialty (SCS-C03): Is It Worth It, What It Tests, and How to Prepare', description: 'Security Specialty (SCS-C03) explained — why it matters for your career, the knowledge and skills the exam tests, and how Cloud Exam Lab’s structured sessions and exam-realistic practice help you pass.', date: '2026-06-09' },
  { slug: 'aws-advanced-networking-specialty-ans-c01', title: 'AWS Certified Advanced Networking – Specialty (ANS-C01): Is It Worth It, What It Tests, and How to Prepare', description: 'Advanced Networking Specialty (ANS-C01) explained — why it matters for your career, the knowledge and skills the exam tests, and how Cloud Exam Lab’s structured sessions and exam-realistic practice help you pass.', date: '2026-06-06' },
]

// Program landing URLs for the sitemap (the /:code route uses the uppercase code).
const PROGRAM_CODES = ['CLF-C02', 'AIF-C01', 'SAA-C03', 'DVA-C02', 'MLA-C01', 'SAP-C02']

// Prerender the blog index and one HTML file per article, each with crawler-facing
// <title>, meta description, canonical, OG/Twitter tags, and JSON-LD Article schema.
// Also writes sitemap.xml and robots.txt. Same rationale as prerenderVerifyPages:
// GitHub Pages serves a static SPA with no SSR, so non-JS crawlers need real tags
// baked into the HTML they fetch. Humans get the same file and boot the live SPA.
function prerenderArticlesAndSeo() {
  let outDir = 'dist'
  const esc = (s) => String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  return {
    name: 'prerender-articles-and-seo',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      const indexPath = path.resolve(outDir, 'index.html')
      if (!fs.existsSync(indexPath)) return
      const baseHtml = fs.readFileSync(indexPath, 'utf8')
      const image = `${SITE}/og/credential.png`
      const publisher = {
        '@type': 'Organization',
        name: 'Cloud Exam Lab',
        url: SITE,
        logo: `${SITE}/logo-cloud-exam-lab.jpg`,
      }

      const writePage = (relDir, title, description, url, headExtra) => {
        const tags = [
          `<meta name="description" content="${esc(description)}" />`,
          `<link rel="canonical" href="${url}" />`,
          `<meta property="og:type" content="${headExtra.ogType || 'website'}" />`,
          `<meta property="og:title" content="${esc(title)}" />`,
          `<meta property="og:description" content="${esc(description)}" />`,
          `<meta property="og:url" content="${url}" />`,
          `<meta property="og:image" content="${image}" />`,
          `<meta name="twitter:card" content="summary_large_image" />`,
          `<meta name="twitter:title" content="${esc(title)}" />`,
          `<meta name="twitter:description" content="${esc(description)}" />`,
          `<meta name="twitter:image" content="${image}" />`,
          headExtra.jsonLd ? `<script type="application/ld+json">${JSON.stringify(headExtra.jsonLd)}</script>` : '',
        ].filter(Boolean).join('\n    ')

        const html = baseHtml
          .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
          .replace('</head>', `    ${tags}\n  </head>`)

        const dir = path.resolve(outDir, relDir)
        fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(path.resolve(dir, 'index.html'), html)
      }

      // Blog index.
      writePage('blog',
        'Articles & Guides — Cloud Exam Lab',
        'Guides on passing your AWS certification: the Teach to Learn method, structured study sessions, exam-realistic practice, and choosing your certification path.',
        `${SITE}/blog`,
        { ogType: 'website', jsonLd: {
          '@context': 'https://schema.org', '@type': 'Blog',
          name: 'Cloud Exam Lab Articles', url: `${SITE}/blog`, publisher,
        } })

      // One file per article with Article JSON-LD.
      for (const a of ARTICLES_META) {
        const title = `${a.title} — Cloud Exam Lab`
        const url = `${SITE}/blog/${a.slug}`
        writePage(`blog/${a.slug}`, title, a.description, url, {
          ogType: 'article',
          jsonLd: {
            '@context': 'https://schema.org', '@type': 'Article',
            headline: a.title, description: a.description,
            datePublished: a.date, dateModified: a.date,
            author: { '@type': 'Organization', name: 'Cloud Exam Lab' },
            publisher, image, mainEntityOfPage: url, url,
          },
        })
      }
      console.log(`[prerender] wrote /blog + ${ARTICLES_META.length} article pages`)

      // sitemap.xml
      const urls = [
        `${SITE}/`, `${SITE}/blog`, `${SITE}/redeem`,
        ...PROGRAM_CODES.map((c) => `${SITE}/${c}`),
        ...ARTICLES_META.map((a) => `${SITE}/blog/${a.slug}`),
      ]
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n') +
        `\n</urlset>\n`
      fs.writeFileSync(path.resolve(outDir, 'sitemap.xml'), sitemap)

      // robots.txt
      fs.writeFileSync(path.resolve(outDir, 'robots.txt'),
        `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`)
      console.log('[seo] wrote sitemap.xml + robots.txt')
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), serviceWorkerVersion(), prerenderVerifyPages(), prerenderArticlesAndSeo()],
  base: '/',
})
