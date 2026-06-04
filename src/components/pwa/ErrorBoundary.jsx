import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, isChunkError: false }
  }

  static getDerivedStateFromError(error) {
    const isChunkError =
      error?.message?.includes('Failed to fetch dynamically imported module') ||
      error?.message?.includes('Importing a module script failed') ||
      error?.name === 'ChunkLoadError'
    return { hasError: true, isChunkError }
  }

  render() {
    if (!this.state.hasError) return this.props.children

    if (this.state.isChunkError) {
      // Stale chunk after a deploy — reload to get fresh assets
      window.location.reload()
      return null
    }

    return (
      <div className="min-h-screen bg-[#0A2540] flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <p className="text-white text-lg font-semibold mb-2">Something went wrong</p>
          <p className="text-white/50 text-sm mb-6">Please reload the page to continue.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#00D4AA] text-[#0A2540] font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-[#00D4AA]/90 transition-colors"
          >
            Reload
          </button>
        </div>
      </div>
    )
  }
}
