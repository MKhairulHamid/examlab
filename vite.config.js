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
      const desc = 'A verified Proficiency credential from Cloud Exam Lab — earned by completing the study program and passing the final mock exam.'
      const image = `${SITE}/og/credential.png`

      for (const { slug, name } of VERIFY_PROGRAMS) {
        const title = `${name} · Proficiency — Cloud Exam Lab`
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

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), serviceWorkerVersion(), prerenderVerifyPages()],
  base: '/',
})
