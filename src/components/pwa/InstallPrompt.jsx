import { useState, useEffect } from 'react'
import { Download, X, Share } from 'lucide-react'

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isInStandaloneMode() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showAndroid, setShowAndroid] = useState(false)
  const [showIOS, setShowIOS] = useState(false)

  useEffect(() => {
    if (isInStandaloneMode()) return
    if (localStorage.getItem('pwa-install-dismissed')) return

    if (isIOS()) {
      const t = setTimeout(() => setShowIOS(true), 3000)
      return () => clearTimeout(t)
    }

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowAndroid(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const dismiss = () => {
    setShowAndroid(false)
    setShowIOS(false)
    localStorage.setItem('pwa-install-dismissed', '1')
  }

  const handleAndroidInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setShowAndroid(false)
    setDeferredPrompt(null)
  }

  // ── Android / Chrome ──────────────────────────────────────────────
  if (showAndroid) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 bg-[#0A2540] border border-[#00D4AA]/30 rounded-xl shadow-2xl p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
          <img src="/icons/icon-192x192.png" alt="Cloud Exam Lab" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold">Install Cloud Exam Lab</p>
          <p className="text-white/60 text-xs mt-0.5">Study offline, anytime</p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleAndroidInstall}
              className="flex items-center gap-1.5 bg-[#00D4AA] text-[#0A2540] text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#00D4AA]/90 transition-colors"
            >
              <Download size={12} />
              Install
            </button>
            <button onClick={dismiss} className="text-white/50 text-xs px-2 py-1.5 rounded-lg hover:text-white/80 transition-colors">
              Not now
            </button>
          </div>
        </div>
        <button onClick={dismiss} className="text-white/40 hover:text-white/70 transition-colors flex-shrink-0">
          <X size={16} />
        </button>
      </div>
    )
  }

  // ── iOS Safari ───────────────────────────────────────────────────
  if (showIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 bg-[#0A2540] border border-[#00D4AA]/30 rounded-xl shadow-2xl p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <img src="/icons/icon-192x192.png" alt="" className="w-8 h-8 rounded-lg" />
            <div>
              <p className="text-white text-sm font-semibold">Install Cloud Exam Lab</p>
              <p className="text-white/50 text-xs">Study offline, anytime</p>
            </div>
          </div>
          <button onClick={dismiss} className="text-white/40 hover:text-white/70 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Step-by-step install guide */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-3 text-white/70 text-xs">
            <div className="w-6 h-6 rounded-full bg-[#00D4AA]/20 text-[#00D4AA] flex items-center justify-center text-[10px] font-bold flex-shrink-0">1</div>
            <span>Tap the <Share size={11} className="inline mx-0.5 -mt-0.5" /> <strong className="text-white">Share</strong> button in Safari</span>
          </div>
          <div className="flex items-center gap-3 text-white/70 text-xs">
            <div className="w-6 h-6 rounded-full bg-[#00D4AA]/20 text-[#00D4AA] flex items-center justify-center text-[10px] font-bold flex-shrink-0">2</div>
            <span>Choose <strong className="text-white">Add to Home Screen</strong></span>
          </div>
          <div className="flex items-center gap-3 text-white/70 text-xs">
            <div className="w-6 h-6 rounded-full bg-[#00D4AA]/20 text-[#00D4AA] flex items-center justify-center text-[10px] font-bold flex-shrink-0">3</div>
            <span>Open the app and <strong className="text-white">sign in once</strong> — you'll stay logged in</span>
          </div>
        </div>

        <button onClick={dismiss} className="text-white/40 text-xs hover:text-white/60 transition-colors">
          Dismiss
        </button>
      </div>
    )
  }

  return null
}
