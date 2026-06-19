import { Component } from 'react'

// Detect a stale dynamically-imported chunk — the classic "we deployed while
// the PWA was open, so the hashed chunk it asks for is gone" failure. Browsers
// word this very differently (Chrome vs Safari/iOS standalone), so match broadly.
function isChunkLoadError(error) {
  const msg = (error?.message || '').toLowerCase()
  return (
    error?.name === 'ChunkLoadError' ||
    msg.includes('failed to fetch dynamically imported module') ||
    msg.includes('error loading dynamically imported module') ||
    msg.includes('importing a module script failed') ||
    msg.includes('unable to preload css') ||
    // Safari / iOS standalone surface a bare network failure for a missing chunk
    (msg.includes('load failed') && msg.includes('module')) ||
    msg === 'load failed' ||
    msg.includes('failed to fetch')
  )
}

const RELOAD_FLAG = 'cel-chunk-reloaded'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, isChunkError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, isChunkError: isChunkLoadError(error) }
  }

  componentDidCatch(error) {
    // A stale chunk self-heals with a fresh load — but only auto-reload once so
    // a genuinely broken build can't trap the user in a reload loop.
    if (isChunkLoadError(error) && !sessionStorage.getItem(RELOAD_FLAG)) {
      try { sessionStorage.setItem(RELOAD_FLAG, '1') } catch { /* ignore */ }
      window.location.reload()
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children

    // Chunk error on the first hit auto-reloads (componentDidCatch). If we still
    // land here it already reloaded once — fall through to the manual prompt.
    const alreadyReloaded = (() => {
      try { return !!sessionStorage.getItem(RELOAD_FLAG) } catch { return false }
    })()

    if (this.state.isChunkError && !alreadyReloaded) {
      return null // reload in flight
    }

    return (
      <div className="min-h-screen bg-[#0A2540] flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <p className="text-white text-lg font-semibold mb-2">Something went wrong</p>
          <p className="text-white/50 text-sm mb-6">Please reload the page to continue.</p>
          <button
            onClick={() => { try { sessionStorage.removeItem(RELOAD_FLAG) } catch { /* ignore */ } window.location.reload() }}
            className="bg-[#00D4AA] text-[#0A2540] font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-[#00D4AA]/90 transition-colors"
          >
            Reload
          </button>
        </div>
      </div>
    )
  }
}
