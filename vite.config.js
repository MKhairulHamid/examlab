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

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), serviceWorkerVersion()],
  base: '/',
})
