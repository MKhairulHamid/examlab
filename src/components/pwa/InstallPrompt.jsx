import { useState, useEffect } from 'react'
import { Download, X, Share, ArrowDown } from 'lucide-react'
import supabase from '../../services/supabase'

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
  const [iosStep, setIosStep] = useState('guide') // 'guide' | 'ready'

  useEffect(() => {
    // Never show if already installed
    if (isInStandaloneMode()) return
    if (localStorage.getItem('pwa-install-dismissed')) return

    if (isIOS()) {
      // Show iOS guide after a short delay
      const t = setTimeout(() => setShowIOS(true), 3000)
      return () => clearTimeout(t)
    }

    // Android/Chrome: wait for browser install prompt
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

  const handleIOSHandoff = async () => {
    // Encode the current Supabase session tokens into the URL fragment.
    // iOS will preserve the fragment as the PWA's start URL when added to home screen.
    // On first PWA launch, authStore reads #pwa_auth= and calls setSession().
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      const payload = btoa(JSON.stringify({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      }))
      window.history.replaceState(null, '', `/?pwa_auth=${payload}`)
    }
    setIosStep('ready')
  }

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
            <button
              onClick={dismiss}
              className="text-white/50 text-xs px-2 py-1.5 rounded-lg hover:text-white/80 transition-colors"
            >
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

  if (showIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 bg-[#0A2540] border border-[#00D4AA]/30 rounded-xl shadow-2xl p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <img src="/icons/icon-192x192.png" alt="" className="w-8 h-8 rounded-lg" />
            <p className="text-white text-sm font-semibold">Install Cloud Exam Lab</p>
          </div>
          <button onClick={dismiss} className="text-white/40 hover:text-white/70 transition-colors">
            <X size={16} />
          </button>
        </div>

        {iosStep === 'guide' ? (
          <>
            <p className="text-white/60 text-xs mb-3">
              Stay logged in after installing — tap below first, then add to your home screen.
            </p>
            <button
              onClick={handleIOSHandoff}
              className="w-full flex items-center justify-center gap-2 bg-[#00D4AA] text-[#0A2540] text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#00D4AA]/90 transition-colors mb-2"
            >
              Prepare install link
            </button>
            <p className="text-white/40 text-xs text-center">Skip this step to install without staying logged in</p>
          </>
        ) : (
          <>
            <p className="text-white/70 text-xs mb-3">
              Ready. Now tap the <strong className="text-white">Share</strong> button in Safari, then choose <strong className="text-white">Add to Home Screen</strong>.
            </p>
            <div className="flex items-center justify-center gap-6 text-white/50 text-xs">
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Share size={16} className="text-[#00D4AA]" />
                </div>
                <span>Share</span>
              </div>
              <ArrowDown size={14} className="rotate-[-90deg]" />
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Download size={16} className="text-[#00D4AA]" />
                </div>
                <span>Add to Home</span>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  return null
}
